import express from "express";
import { service } from "../services/index.ts";
import { authRequired, adminRequired } from "../middlewares/auth.ts";

const router = express.Router();

/**
 * @openapi
 * /api/usuarios:
 *   get:
 *     tags: [3.5.1 Módulo Usuarios]
 *     summary: Listar todos los usuarios (Admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     tags: [3.5.1 Módulo Usuarios]
 *     summary: Registrar nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, correo, contrasena]
 *             properties:
 *               nombre: { type: string, example: "Guillermo" }
 *               correo: { type: string, example: "admin@amazon.com" }
 *               contrasena: { type: string, example: "123456" }
 *               telefono: { type: string, example: "999888777" }
 *     responses:
 *       201:
 *         description: Creado
 */

// Listar usuarios (Admin only)
router.get("/usuarios", authRequired, adminRequired, async (req, res) => {
  try {
    res.json(await service.usuarios.listar());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Registrar usuario (público)
router.post("/usuarios", async (req, res) => {
  try {
    const id = await service.usuarios.registrar(req.body);
    res.status(201).json({ id });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /api/usuarios/{id}:
 *   get:
 *     tags: [3.5.1 Módulo Usuarios]
 *     summary: Consultar usuario por ID
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: OK
 *   put:
 *     tags: [3.5.1 Módulo Usuarios]
 *     summary: Actualizar usuario
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre: { type: string, example: "Guillermo Actualizado" }
 *               correo: { type: string, example: "nuevo@amazon.com" }
 *               telefono: { type: string, example: "111222333" }
 *     responses:
 *       200:
 *         description: OK
 *   delete:
 *     tags: [3.5.1 Módulo Usuarios]
 *     summary: Eliminar usuario
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: integer } }]
 *     responses:
 *       200:
 *         description: OK
 */

// Obtener usuario
router.get("/usuarios/:id", async (req, res) => {
  try {
    res.json(await service.usuarios.obtener(Number(req.params.id)));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Actualizar usuario (dueño o admin)
router.put("/usuarios/:id", authRequired, async (req, res) => {
  try {
    const currentUserId = (req as any).user.id;
    const currentUserRole = (req as any).user.rol;
    const targetUserId = Number(req.params.id);
    
    if (currentUserId !== targetUserId && currentUserRole !== 'admin') {
      return res.status(403).json({ error: "No tienes permiso para editar este perfil" });
    }
    
    await service.usuarios.actualizar(targetUserId, req.body);
    res.json({ message: "OK" });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Eliminar usuario (admin únicamente)
router.delete("/usuarios/:id", authRequired, adminRequired, async (req, res) => {
  try {
    await service.usuarios.eliminar(Number(req.params.id));
    res.json({ message: "OK" });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
