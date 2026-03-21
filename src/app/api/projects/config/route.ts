import { NextResponse } from "next/server";

import {
  getProjectCurationConfig,
  saveProjectCurationConfig,
} from "@/data/portfolio";

type CurationPayload = {
  visibility?: Record<string, boolean>;
  order?: string[];
  overrides?: Record<
    string,
    Partial<{
      title: string;
      year: string;
      stack: string;
      description: string;
      highlights: string[];
    }>
  >;
};

const isDevMode = process.env.NODE_ENV !== "production";

export async function GET() {
  const config = await getProjectCurationConfig();
  return NextResponse.json({ ok: true, config });
}

export async function POST(request: Request) {
  if (!isDevMode) {
    return NextResponse.json(
      { ok: false, message: "Project curation updates are disabled in production." },
      { status: 403 },
    );
  }

  let payload: CurationPayload;
  try {
    payload = (await request.json()) as CurationPayload;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid payload." },
      { status: 400 },
    );
  }

  const visibility = payload.visibility ?? {};
  const order = payload.order ?? [];
  const overrides = payload.overrides ?? {};

  await saveProjectCurationConfig({ visibility, order, overrides });

  return NextResponse.json({ ok: true });
}
