import { NextResponse } from "next/server";

import { warmProjectsData } from "@/data/portfolio";

const WARM_COOLDOWN_MS = 15_000;
let lastWarmAt = 0;

const getOriginFromRequest = (request: Request) => {
  const origin = request.headers.get("origin");
  if (!origin) {
    return null;
  }

  try {
    return new URL(origin);
  } catch {
    return null;
  }
};

const isFirstPartyRequest = (request: Request) => {
  const host = request.headers.get("host");
  const originUrl = getOriginFromRequest(request);

  if (!host) {
    return false;
  }

  if (!originUrl) {
    // Some server-side/internal calls can omit origin; allow if referer host matches.
    const referer = request.headers.get("referer");
    if (!referer) {
      return true;
    }
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }

  return originUrl.host === host;
};

export async function POST(request: Request) {
  if (!isFirstPartyRequest(request)) {
    return NextResponse.json({ ok: false, message: "Forbidden origin." }, { status: 403 });
  }

  const now = Date.now();
  if (now - lastWarmAt < WARM_COOLDOWN_MS) {
    return NextResponse.json({ ok: true, throttled: true });
  }
  lastWarmAt = now;

  await warmProjectsData();
  return NextResponse.json({ ok: true });
}
