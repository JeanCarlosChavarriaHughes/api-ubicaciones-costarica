const fs = require("fs");
const path = require("path");

/**
 * Loads OpenAPI document from docs/openapi.json (single source of truth with repo docs).
 */
function loadOpenApiSpec() {
  const specPath = path.join(__dirname, "..", "docs", "openapi.json");
  const raw = fs.readFileSync(specPath, "utf8");
  return JSON.parse(raw);
}

module.exports = { loadOpenApiSpec };
