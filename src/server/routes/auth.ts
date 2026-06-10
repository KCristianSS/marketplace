import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { service } from "../services/index.ts";
import { SECRET_KEY } from "../config.ts";

const router = express.Router();

/**
 * @openapi
 * /api/login:
 *   post:
 *     tags: [3.7 Seguridad del Backend]
 *     summary: Iniciar sesión (JWT)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "admin@amazon.com" }
 *               password: { type: string, example: "pass123" }
 *     responses:
 *       200:
 *         description: Token generado
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[LOGIN] Intentando entrar con: ${email}`);
    
    const foundUser = await service.usuarios.buscarPorEmail(email);

    if (foundUser) {
      console.log(`[LOGIN] Usuario encontrado, verificando contraseña...`);
      let isMatch = false;
      try {
        isMatch = await bcrypt.compare(password, foundUser.contrasena);
      } catch (err) {
        console.warn("[LOGIN] Error al comparar con bcrypt, intentando comparación directa.");
      }
      
      // Permitimos también comparación directa para facilitar pruebas con XAMPP/SQL manual
      if (isMatch || password === foundUser.contrasena) {
        console.log(`[LOGIN] Éxito para ${email}`);
        const token = jwt.sign({ id: foundUser.id, rol: foundUser.rol }, SECRET_KEY, { expiresIn: '8h' });
        return res.json({ token, user: { id: foundUser.id, nombre: foundUser.nombre, rol: foundUser.rol } });
      } else {
        console.log(`[LOGIN] Contraseña incorrecta para ${email}`);
      }
    } else {
      console.log(`[LOGIN] Usuario no encontrado: ${email}`);
    }
    res.status(401).json({ error: "Credenciales inválidas" });
  } catch (e: any) { 
    console.error(`[LOGIN ERROR]`, e);
    res.status(500).json({ error: e.message }); 
  }
});

export default router;
