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
   - **Server**: `PORT` (optional; default `3000`)

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

By default the API listens on `http://localhost:3000`. Replace the host and port in the examples below if you use different values.

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
