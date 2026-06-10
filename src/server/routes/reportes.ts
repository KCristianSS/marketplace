import express from "express";
import { service } from "../services/index.ts";
import { authRequired } from "../middlewares/auth.ts";

const router = express.Router();

/**
 * @openapi
 * /api/reportes:
 *   get:
 *     tags: [3.5.3 Módulo Reportes]
 *     summary: Generar estadísticas del sistema
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/reportes", authRequired, async (req, res) => {
  try {
    res.json(await service.reportes.generales());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
