import { NextResponse } from "next/server";

import { refreshProjectsFromGithub } from "@/data/portfolio";

const isDevMode = process.env.NODE_ENV !== "production";

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
  if (!isDevMode) {
    return NextResponse.json(
      { ok: false, message: "Project refresh is disabled in production." },
      { status: 403 },
    );
  }

  if (!isFirstPartyRequest(request)) {
    return NextResponse.json({ ok: false, message: "Forbidden origin." }, { status: 403 });
  }

  try {
    const result = await refreshProjectsFromGithub();
    return NextResponse.json({ ok: true, count: result.count, message: result.message });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Failed to refresh projects from GitHub." },
      { status: 500 },
    );
  }
}
