import express from "express";
import { service } from "../services/index.ts";
import { authRequired } from "../middlewares/auth.ts";
import { productValidationMiddleware } from "../middlewares/validation.ts";

const router = express.Router();

/**
 * @openapi
 * /api/productos:
 *   get:
 *     tags: [3.5.2 Módulo Transacciones]
 *     summary: Listar todos los productos
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     tags: [3.5.2 Módulo Transacciones]
 *     summary: Publicar nuevo producto
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo, precio, vendedor_id, categoria_id]
 *             properties:
 *               titulo: { type: string, example: "iPhone 15 Pro" }
 *               precio: { type: number, example: 1200 }
 *               vendedor_id: { type: integer, example: 1 }
 *               categoria_id: { type: integer, example: 1 }
 *               descripcion: { type: string, example: "Nuevo en caja" }
 *               ubicacion: { type: string, example: "Lima, Perú" }
 *     responses:
 *       201:
 *         description: OK
 */

// Listar productos
router.get("/productos", async (req, res) => {
  try {
    res.json(await service.productos.listar());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Crear producto
router.post("/productos", authRequired, productValidationMiddleware, async (req, res) => {
  try {
    const id = await service.productos.crear(req.body);
    res.status(201).json({ id });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /api/productos/{id}:
 *   get:
 *     tags: [3.5.2 Módulo Transacciones]
 *     summary: Ver detalle de producto
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: OK
 *   put:
 *     tags: [3.5.2 Módulo Transacciones]
 *     summary: Editar producto
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo: { type: string }
 *               precio: { type: number }
 *               estado: { type: string, example: "vendido" }
 *     responses:
 *       200:
 *         description: OK
 *   delete:
 *     tags: [3.5.2 Módulo Transacciones]
 *     summary: Eliminar producto
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: OK
 */

// Obtener producto detallado
router.get("/productos/:id", async (req, res) => {
  try {
    res.json(await service.productos.obtener(Number(req.params.id)));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Editar producto
router.put("/productos/:id", authRequired, productValidationMiddleware, async (req, res) => {
  try {
    await service.productos.actualizar(Number(req.params.id), req.body);
    res.json({ message: "OK" });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Eliminar producto
router.delete("/productos/:id", authRequired, async (req, res) => {
  try {
    await service.productos.eliminar(Number(req.params.id));
    res.json({ message: "OK" });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Obtener imagenes por producto
router.get("/productos/:pid/imagenes", async (req, res) => {
  try {
    res.json(await service.imagenes.listar(Number(req.params.pid)));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
