import { NextResponse } from "next/server";

import { refreshProjectsFromGithub } from "@/data/portfolio";
import { isFirstPartyRequest } from "@/lib/request-origin";

const isDevMode = process.env.NODE_ENV !== "production";

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
