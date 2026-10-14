const HEADER = "authorization";

export function verifyContentInjectSecret(request: Request): boolean {
  const secret = process.env.CONTENT_INJECT_SECRET;
  if (!secret) {
    return false;
  }
  const header = request.headers.get(HEADER);
  if (!header?.startsWith("Bearer ")) {
    return false;
  }
  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 && token === secret;
}

export function contentInjectUnauthorizedResponse(): Response {
  return Response.json(
    {
      error:
        "Unauthorized. Set CONTENT_INJECT_SECRET and send Authorization: Bearer <secret>.",
    },
    { status: 401 },
  );
}
