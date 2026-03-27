require("dotenv").config();

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const { createApp } = require("./app");

const port = Number.parseInt(process.env.PORT || "3000", 10);

const keyPath = process.env.HTTPS_KEY_PATH;
const certPath = process.env.HTTPS_CERT_PATH;

function readSslFile(relativeOrAbsolute, label) {
  const resolved = path.isAbsolute(relativeOrAbsolute)
    ? relativeOrAbsolute
    : path.resolve(process.cwd(), relativeOrAbsolute);
  try {
    return fs.readFileSync(resolved);
  } catch (err) {
    console.error(`Cannot read ${label} (${resolved}): ${err.message}`);
    process.exit(1);
  }
}

const app = createApp();

if (keyPath && certPath) {
  const options = {
    key: readSslFile(keyPath, "HTTPS private key"),
    cert: readSslFile(certPath, "HTTPS certificate"),
  };
  if (process.env.HTTPS_CA_PATH) {
    options.ca = readSslFile(process.env.HTTPS_CA_PATH, "HTTPS CA chain");
  }
  if (process.env.HTTPS_KEY_PASSPHRASE) {
    options.passphrase = process.env.HTTPS_KEY_PASSPHRASE;
  }
  https.createServer(options, app).listen(port, () => {
    console.log(`API listening on https://localhost:${port}`);
  });
} else if (keyPath || certPath) {
  console.error(
    "Set both HTTPS_KEY_PATH and HTTPS_CERT_PATH to enable HTTPS, or unset both for HTTP."
  );
  process.exit(1);
} else {
  http.createServer(app).listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}
