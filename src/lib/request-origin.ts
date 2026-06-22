/**
 * Same-origin (first-party) request check used to gate the dev-only mutating
 * endpoints. Default-deny: a request is only first-party if it carries an
 * Origin (or, failing that, a Referer) whose host matches the request Host.
 * Requests missing both headers are rejected rather than waved through.
 */
export function isFirstPartyRequest(request: Request): boolean {
  const host = request.headers.get("host");
  if (!host) {
    return false;
  }

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }

  // No Origin and no Referer: cannot prove first-party → deny.
  return false;
}
