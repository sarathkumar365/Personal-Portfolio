import { NextResponse } from "next/server";

type ContactRequestBody = {
  name?: string;
  email?: string;
  message?: string;
  honey?: string;
};

type RateBucket = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_BUCKET_MAX_ENTRIES = 10_000;
const MAX_BODY_BYTES = 16_384;
const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 254;
const rateBuckets = new Map<string, RateBucket>();

const jsonError = (message: string, status: number) =>
  NextResponse.json({ ok: false, message }, { status });

const normalize = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const getClientKey = (request: Request) => {
  // Prefer headers the platform sets and the client cannot forge. Vercel's
  // `x-vercel-forwarded-for` / `x-real-ip` are injected by the edge. Only when
  // both are absent (non-Vercel host) do we fall back to the left-most
  // x-forwarded-for hop — the conventional originating-client IP. That hop is
  // client-influenced, so this fallback is best-effort rate limiting only.
  const trusted =
    request.headers.get("x-vercel-forwarded-for")?.trim() ||
    request.headers.get("x-real-ip")?.trim();
  if (trusted) {
    return trusted;
  }
  const xff = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return xff || "anonymous";
};

// Drop expired buckets so a stream of distinct keys can't grow the Map without
// bound. (In-memory limiting is per-instance; a shared store is the real fix.)
const pruneRateBuckets = (now: number) => {
  if (rateBuckets.size < RATE_BUCKET_MAX_ENTRIES) {
    return;
  }
  for (const [key, bucket] of rateBuckets) {
    if (now > bucket.resetAt) {
      rateBuckets.delete(key);
    }
  }
};

const isRateLimited = (key: string, now: number) => {
  const bucket = rateBuckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    pruneRateBuckets(now);
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  bucket.count += 1;
  return false;
};

// Reject obvious cross-origin form submissions (CSRF). When an Origin header is
// present it must match the request host; we don't block requests that omit it
// (non-browser clients) since those are covered by rate limiting.
const isCrossOriginRequest = (request: Request) => {
  const origin = request.headers.get("origin");
  if (!origin) {
    return false;
  }
  const host = request.headers.get("host");
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
};

const buildEmailHtml = ({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) => {
  const safe = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");

  return `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; line-height: 1.5; color: #111;">
      <h2 style="margin: 0 0 12px;">New portfolio contact</h2>
      <p style="margin: 0 0 8px;"><strong>Name:</strong> ${safe(name)}</p>
      <p style="margin: 0 0 8px;"><strong>Email:</strong> ${safe(email)}</p>
      <p style="margin: 12px 0 0;"><strong>Message:</strong></p>
      <p style="white-space: pre-wrap; margin: 6px 0 0;">${safe(message)}</p>
    </div>
  `;
};

export async function POST(request: Request) {
  if (isCrossOriginRequest(request)) {
    return jsonError("Forbidden origin.", 403);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return jsonError("Request body too large.", 413);
  }

  const now = Date.now();
  const clientKey = getClientKey(request);

  if (isRateLimited(clientKey, now)) {
    return jsonError("Too many requests. Please try again in a minute.", 429);
  }

  let payload: ContactRequestBody;
  try {
    payload = (await request.json()) as ContactRequestBody;
  } catch {
    return jsonError("Invalid request payload.", 400);
  }

  const name = normalize(payload.name);
  const email = normalize(payload.email);
  const message = normalize(payload.message);
  const honey = normalize(payload.honey);

  if (honey) {
    return NextResponse.json({ ok: true });
  }

  // Disallow characters that have meaning in mail address/display-name syntax so
  // the validated email can't smuggle extra recipients/spoofing into reply_to.
  const emailPattern = /^[^\s@",;:<>()[\]\\]+@[^\s@",;:<>()[\]\\]+\.[^\s@",;:<>()[\]\\]+$/;
  if (name.length < 2 || name.length > MAX_NAME_LENGTH) {
    return jsonError("Please provide your name (2-80 characters).", 400);
  }
  if (email.length > MAX_EMAIL_LENGTH || !emailPattern.test(email)) {
    return jsonError("Please provide a valid email address.", 400);
  }
  if (message.length < 10 || message.length > 4000) {
    return jsonError("Message must be between 10 and 4000 characters.", 400);
  }

  // Strip control/newline characters before placing the name into the email
  // subject header (defense against header-context injection / spoofing).
  const subjectName = name.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();

  const resendApiKey = process.env.RESEND_API_KEY;
  const contactTo = process.env.CONTACT_TO_EMAIL;
  const contactFrom = process.env.CONTACT_FROM_EMAIL;

  if (!resendApiKey || !contactTo || !contactFrom) {
    return jsonError("Contact service is not configured.", 500);
  }

  try {
    const sendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: contactFrom,
        to: [contactTo],
        reply_to: email,
        subject: `Portfolio contact from ${subjectName}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        html: buildEmailHtml({ name, email, message }),
      }),
    });

    if (!sendResponse.ok) {
      return jsonError("Unable to send right now. Please try again shortly.", 502);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Unable to send right now. Please try again shortly.", 502);
  }
}
