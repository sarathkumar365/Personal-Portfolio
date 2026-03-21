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
const rateBuckets = new Map<string, RateBucket>();

const jsonError = (message: string, status: number) =>
  NextResponse.json({ ok: false, message }, { status });

const normalize = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const getClientKey = (request: Request) => {
  const xff = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return xff || realIp || "anonymous";
};

const isRateLimited = (key: string, now: number) => {
  const bucket = rateBuckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  bucket.count += 1;
  return false;
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

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (name.length < 2) {
    return jsonError("Please provide your name.", 400);
  }
  if (!emailPattern.test(email)) {
    return jsonError("Please provide a valid email address.", 400);
  }
  if (message.length < 10 || message.length > 4000) {
    return jsonError("Message must be between 10 and 4000 characters.", 400);
  }

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
        subject: `Portfolio contact from ${name}`,
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
