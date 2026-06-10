import express from "express";
import { service } from "../services/index.ts";
import { authRequired } from "../middlewares/auth.ts";

const router = express.Router();

/**
 * @openapi
 * /api/categorias:
 *   get:
 *     tags: [Catálogos]
 *     summary: Listar todas las categorías
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     tags: [Catálogos]
 *     summary: Crear nueva categoría
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre: { type: string, example: "Electrónica" }
 *     responses:
 *       201:
 *         description: Creado
 */

router.get("/categorias", async (req, res) => {
  try {
    res.json(await service.categorias.listar());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/categorias", authRequired, async (req, res) => {
  try {
    const id = await service.categorias.crear(req.body.nombre);
    res.status(201).json({ id });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
