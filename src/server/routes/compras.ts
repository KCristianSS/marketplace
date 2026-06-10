import express from "express";
import { service } from "../services/index.ts";
import { authRequired } from "../middlewares/auth.ts";

const router = express.Router();

/**
 * @openapi
 * /api/compras:
 *   get:
 *     tags: [3.5.2 Módulo Transacciones]
 *     summary: Listar compras o ventas (dependiendo del rol)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     tags: [3.5.2 Módulo Transacciones]
 *     summary: Registrar una compra
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [producto_id, comprador_id, vendedor_id, precio]
 *             properties:
 *               producto_id: { type: integer, example: 1 }
 *               comprador_id: { type: integer, example: 2 }
 *               vendedor_id: { type: integer, example: 1 }
 *               precio: { type: number, example: 1200 }
 *     responses:
 *       201:
 *         description: OK
 */

router.get("/compras", authRequired, async (req: any, res) => {
  try {
    const user = req.user;
    if (user.rol === 'admin') {
      res.json(await service.compras.listar());
    } else if (user.rol === 'vendedor') {
      res.json(await service.compras.obtenerPorVendedor(user.id));
    } else {
      res.json(await service.compras.obtenerPorComprador(user.id));
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/compras", authRequired, async (req, res) => {
  try {
    const id = await service.compras.crear(req.body);
    res.status(201).json({ id });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/compras/:id/estado", authRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { estado } = req.body;
    await service.compras.actualizarEstado(id, estado);
    res.json({ message: "OK" });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
