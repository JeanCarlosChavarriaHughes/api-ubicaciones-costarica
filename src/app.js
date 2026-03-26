const express = require("express");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const { requireBearerToken } = require("./middleware/auth");
const { router: ubicacionesRouter } = require("./routes/ubicaciones");
const { serializeSqlError } = require("./utils/sqlError");
const { loadOpenApiSpec } = require("./openapiSpec");

function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "script-src": ["'self'", "'unsafe-inline'"],
          "style-src": ["'self'", "'unsafe-inline'"],
          "img-src": ["'self'", "data:", "https:"],
        },
      },
    })
  );
  app.use(express.json());

  const openApiSpec = loadOpenApiSpec();
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec, { customSiteTitle: "API Ubicaciones — Swagger" })
  );
  app.get("/openapi.json", (req, res) => {
    res.status(200).json(openApiSpec);
  });

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api", requireBearerToken, ubicacionesRouter);

  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use((err, req, res, next) => {
    console.error(err);
    return res.status(500).json({
      error: err.message || "Internal server error",
      details: serializeSqlError(err),
    });
  });

  return app;
}

module.exports = { createApp };
