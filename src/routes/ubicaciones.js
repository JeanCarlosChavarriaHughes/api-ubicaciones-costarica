const express = require("express");
const { pool } = require("../db");

const router = express.Router();

const PROVINCIAS_SQL =
  "SELECT * FROM provincia ORDER BY codigo_provincia;";

const CANTONES_SQL = `
  SELECT c.codigo_canton, c.nombre_canton, c.id
  FROM canton c
  INNER JOIN provincia p ON c.codigo_provincia = p.codigo_provincia
  WHERE p.codigo_provincia = $1;
`;

const DISTRITOS_SQL = `
  SELECT d.codigo_distrito, d.nombre_distrito, d.id
  FROM distrito d
  WHERE d.codigo_provincia = $1 AND d.codigo_id_canton = $2;
`;

function parsePositiveInt(paramName, value) {
  const n = Number.parseInt(String(value), 10);
  if (!Number.isFinite(n) || n < 0) {
    const err = new Error(`Invalid ${paramName}: must be a non-negative integer`);
    err.status = 400;
    throw err;
  }
  return n;
}

router.get("/provincias", async (req, res, next) => {
  try {
    const result = await pool.query(PROVINCIAS_SQL);
    return res.status(200).json(result.rows);
  } catch (err) {
    return next(err);
  }
});

router.get("/provincias/:codigoProvincia/cantones", async (req, res, next) => {
  try {
    const codigoProvincia = parsePositiveInt(
      "codigoProvincia",
      req.params.codigoProvincia
    );
    const result = await pool.query(CANTONES_SQL, [codigoProvincia]);
    return res.status(200).json(result.rows);
  } catch (err) {
    return next(err);
  }
});

router.get(
  "/provincias/:codigoProvincia/cantones/:codigoIdCanton/distritos",
  async (req, res, next) => {
    try {
      const codigoProvincia = parsePositiveInt(
        "codigoProvincia",
        req.params.codigoProvincia
      );
      const codigoIdCanton = parsePositiveInt(
        "codigoIdCanton",
        req.params.codigoIdCanton
      );
      const result = await pool.query(DISTRITOS_SQL, [
        codigoProvincia,
        codigoIdCanton,
      ]);
      return res.status(200).json(result.rows);
    } catch (err) {
      return next(err);
    }
  }
);

router.use((err, req, res, next) => {
  if (err.status === 400) {
    return res.status(400).json({ error: err.message });
  }
  return next(err);
});

module.exports = { router };
