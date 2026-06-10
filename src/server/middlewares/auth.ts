import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config.ts";
import { service } from "../services/index.ts";

export interface AuthRequest extends Request {
  user?: any;
}

export function authRequired(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }
  
  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, SECRET_KEY);
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}

export async function adminRequired(req: AuthRequest, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: "No autorizado" });
  }

  if (user.rol !== "admin") {
    // Si el JWT no tiene el rol, lo buscamos en la base de datos a través de nuestro servicio
    try {
      const fullUser = await service.usuarios.obtener(user.id);
      if (fullUser && fullUser.rol === "admin") {
        next();
      } else {
        return res.status(403).json({ error: "Acceso denegado: Se requiere administrador" });
      }
    } catch (e) {
      return res.status(500).json({ error: "Error en validación de privilegios" });
    }
  } else {
    next();
  }
}
