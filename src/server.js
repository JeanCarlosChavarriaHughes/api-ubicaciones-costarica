require("dotenv").config();

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const { createApp } = require("./app");

const port = Number.parseInt(process.env.PORT || "3000", 10);
/** Bind address: 0.0.0.0 = all IPv4 interfaces (reachable from LAN/internet if firewall allows). Use 127.0.0.1 for local-only. */
const listenHost = process.env.LISTEN_HOST || "0.0.0.0";

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
  https.createServer(options, app).listen(port, listenHost, () => {
    const scheme = "https";
    console.log(
      `API listening on ${scheme}://${listenHost}:${port} (bind); clients use your server hostname or public IP with this port.`
    );
  });
} else if (keyPath || certPath) {
  console.error(
    "Set both HTTPS_KEY_PATH and HTTPS_CERT_PATH to enable HTTPS, or unset both for HTTP."
  );
  process.exit(1);
} else {
  http.createServer(app).listen(port, listenHost, () => {
    const scheme = "http";
    console.log(
      `API listening on ${scheme}://${listenHost}:${port} (bind); clients use your server hostname or public IP with this port.`
    );
  });
}
