/**
 * @jest-environment node
 */

jest.mock("../src/db", () => ({
  pool: {
    query: jest.fn(),
  },
}));

const request = require("supertest");
const { pool } = require("../src/db");
const { createApp } = require("../src/app");

const API_TOKEN = "test-token-for-jest";

describe("API ubicaciones", () => {
  let app;

  beforeAll(() => {
    process.env.API_TOKEN = API_TOKEN;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    app = createApp();
  });

  describe("GET /api/provincias", () => {
    it("returns 200 and JSON rows when the query succeeds", async () => {
      const rows = [
        { id: 1, codigo_provincia: 1, nombre_provincia: "San José" },
      ];
      pool.query.mockResolvedValueOnce({ rows });

      const res = await request(app)
        .get("/api/provincias")
        .set("Authorization", `Bearer ${API_TOKEN}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(rows);
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it("returns 500 with details when the query fails", async () => {
      const logErr = jest.spyOn(console, "error").mockImplementation(() => {});
      try {
        const dbErr = new Error("relation \"provincia\" does not exist");
        dbErr.code = "42P01";
        pool.query.mockRejectedValueOnce(dbErr);

        const res = await request(app)
          .get("/api/provincias")
          .set("Authorization", `Bearer ${API_TOKEN}`);

        expect(res.status).toBe(500);
        expect(res.body).toMatchObject({
          error: dbErr.message,
          details: expect.objectContaining({
            message: dbErr.message,
            code: "42P01",
          }),
        });
      } finally {
        logErr.mockRestore();
      }
    });
  });

  describe("GET /api/provincias/:codigoProvincia/cantones", () => {
    it("returns 200 and JSON rows when the query succeeds", async () => {
      const rows = [
        { codigo_canton: 1, nombre_canton: "Central", id: 10 },
      ];
      pool.query.mockResolvedValueOnce({ rows });

      const res = await request(app)
        .get("/api/provincias/1/cantones")
        .set("Authorization", `Bearer ${API_TOKEN}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(rows);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("FROM canton c"),
        [1]
      );
    });
  });

  describe("GET /api/provincias/:codigoProvincia/cantones/:codigoIdCanton/distritos", () => {
    it("returns 200 and JSON rows when the query succeeds", async () => {
      const rows = [
        { codigo_distrito: 1, nombre_distrito: "Carmen", id: 100 },
      ];
      pool.query.mockResolvedValueOnce({ rows });

      const res = await request(app)
        .get("/api/provincias/1/cantones/2/distritos")
        .set("Authorization", `Bearer ${API_TOKEN}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(rows);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("FROM distrito d"),
        [1, 2]
      );
    });
  });
});
