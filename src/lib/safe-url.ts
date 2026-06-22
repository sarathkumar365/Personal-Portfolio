/**
 * Returns the URL only if it is an http(s) URL, else null. Blocks
 * javascript:/data:/etc. from ever becoming an anchor href. Shared by the
 * project-link and blog-source rendering paths so the allowlist lives in one
 * place. Safe to import from both server and client code (no Node built-ins).
 */
export function safeHttpUrl(raw: string | null | undefined): string | null {
  if (!raw) {
    return null;
  }
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}
