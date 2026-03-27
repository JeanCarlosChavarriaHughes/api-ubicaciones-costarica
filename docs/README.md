# API Ubicaciones Costa Rica

## Introduction

This project is a **REST API** built with **Express.js** and **Node.js 18+**. It exposes read-only access to Costa Rica administrative geography data stored in **PostgreSQL**: **provincias** (provinces), **cantones** (cantons), and **distritos** (districts).

The API is intended to be deployed on the **public internet**. Access to data routes is protected with a **Bearer token** (`API_TOKEN`). Clients must send `Authorization: Bearer <token>` on every request under `/api`.

Interactive **Swagger (OpenAPI)** documentation is served by the application at `/api-docs` when the server is running.

---

## How to install

### Prerequisites

- **Node.js** 18.x or newer (see `.nvmrc` for a recommended version)
- A **PostgreSQL** database containing the `provincia`, `canton`, and `distrito` tables (schema as defined for this project)

### Steps

1. Clone or copy this repository and open a terminal in the project root.

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root. You can start from `.env.example` and set:

   - **PostgreSQL**: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` (and `PGSSLMODE=require` if your host requires SSL)
   - **Security**: `API_TOKEN` — a long random secret; clients must present this value as the Bearer token
   - **Server**: `PORT` (optional; default `3000`), `LISTEN_HOST` (optional; default `0.0.0.0` for all IPv4 interfaces)
   - **HTTPS** (optional): `HTTPS_KEY_PATH` and `HTTPS_CERT_PATH` — see [HTTPS / TLS](#https-and-err_ssl_protocol_error)

4. Start the server:

   ```bash
   npm start
   ```

   For development with auto-restart (Node 18+):

   ```bash
   npm run dev
   ```

5. Run tests:

   ```bash
   npm test
   ```

---

## How to use

### Base URL

The server binds to **`0.0.0.0`** (all IPv4 interfaces) on `PORT` by default, so it can accept traffic from your LAN or the public internet if your **firewall**, **cloud security group**, and **router/NAT** allow that port. Override with **`LISTEN_HOST`** (for example `127.0.0.1` for local-only). The URL you type in the browser is your **machine’s hostname or public IP**, not necessarily `localhost`.

Replace host and port in the examples below to match how you reach the server.

### HTTPS and ERR_SSL_PROTOCOL_ERROR

**What the error means:** `ERR_SSL_PROTOCOL_ERROR` almost always means the browser is using **`https://`** but nothing on that port is speaking **TLS**. This app serves **plain HTTP** unless you configure TLS (or put a reverse proxy in front).

- If the server is HTTP-only, open Swagger with **`http://`** (for example `http://localhost:3000/api-docs`), not `https://`.
- If you **must** use `https://` (production, HSTS, or a page that only loads HTTPS), you need a **certificate** and one of the setups below.

#### Option 1 — TLS inside Node (this project)

1. Obtain a **private key** and **certificate** in PEM format (and optional CA chain).
2. In `.env`, set **both**:

   - `HTTPS_KEY_PATH` — path to the private key (`.key` / `-key.pem`)
   - `HTTPS_CERT_PATH` — path to the certificate (`.crt` / `.pem`, often `fullchain.pem` from Let’s Encrypt)

   Paths can be relative to the project root or absolute. Optional: `HTTPS_CA_PATH`, `HTTPS_KEY_PASSPHRASE`.

3. Restart with `npm start`. The log line will show `https://localhost:PORT`.

**Local trusted certificates (recommended for dev):** use [mkcert](https://github.com/FiloSottile/mkcert) so the browser trusts your cert:

```bash
mkcert -install
mkcert localhost 127.0.0.1
# Produces something like: ./localhost+1-key.pem and ./localhost+1.pem
```

Point `HTTPS_KEY_PATH` and `HTTPS_CERT_PATH` at those files.

**Production:** use certificates from your CA (e.g. Let’s Encrypt). Often you get `privkey.pem` + `fullchain.pem`; set key path and cert path accordingly (you usually do **not** need a separate `HTTPS_CA_PATH` if `fullchain.pem` already includes intermediates).

#### Option 2 — TLS on a reverse proxy (common in production)

Run the Node app on HTTP behind **nginx**, **Caddy**, **Traefik**, or a cloud load balancer that terminates HTTPS and forwards to `http://127.0.0.1:3000`. You do not need `HTTPS_*` in `.env` for that pattern; configure TLS only on the proxy.

#### Swagger “Try it out” over HTTPS

`docs/openapi.json` lists a sample server URL (often `http://localhost:3000`). If you serve the API over HTTPS, change the **`servers`** entry in that file (or your deployed copy) to your real `https://` base URL so Swagger UI calls the correct scheme and avoids mixed-content issues.

### Authentication

All routes under `/api` require:

```http
Authorization: Bearer YOUR_API_TOKEN
```

If the token is missing, invalid, or `API_TOKEN` is not set on the server, the API returns **401**, **403**, or **503** as documented in the OpenAPI specification.

### Endpoints (summary)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Liveness check (no authentication) |
| `GET` | `/api/provincias` | List all provincias |
| `GET` | `/api/provincias/:codigoProvincia/cantones` | List cantones for a provincia |
| `GET` | `/api/provincias/:codigoProvincia/cantones/:codigoIdCanton/distritos` | List distritos for a provincia and `codigo_id_canton` |

Successful responses return **HTTP 200** with a **JSON** body (array of objects). Database errors return **HTTP 500** with JSON error details.

### Example with `curl`

Replace `YOUR_TOKEN` and IDs as needed.

```bash
# Health (no token)
curl -s http://localhost:3000/health

# Provincias
curl -s -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/provincias

# Cantones in provincia 1
curl -s -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/provincias/1/cantones

# Distritos (codigoIdCanton matches distrito.codigo_id_canton)
curl -s -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/provincias/1/cantones/2/distritos
```

### Swagger / OpenAPI

- **Interactive UI**: open `http://localhost:3000/api-docs` in a browser after starting the server (Swagger UI).
- **Machine-readable spec (file)**: [`docs/openapi.json`](./openapi.json) in the repository.
- **Same spec over HTTP** (useful for tools that load a URL): `http://localhost:3000/openapi.json`

You can import `docs/openapi.json` into Postman, Insomnia, or other OpenAPI-compatible tools.
