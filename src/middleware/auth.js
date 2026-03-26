/**
 * Requires `Authorization: Bearer <token>` matching API_TOKEN.
 */
function requireBearerToken(req, res, next) {
  const configured = process.env.API_TOKEN;
  if (!configured || configured.length === 0) {
    return res.status(503).json({
      error: "API_TOKEN is not configured on the server",
    });
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Missing or invalid Authorization header (expected Bearer token)",
    });
  }

  const token = header.slice("Bearer ".length).trim();
  if (token !== configured) {
    return res.status(403).json({
      error: "Invalid token",
    });
  }

  next();
}

module.exports = { requireBearerToken };
