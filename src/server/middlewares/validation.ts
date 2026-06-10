import { Request, Response, NextFunction } from "express";

export function validateProductData(p: any): string | null {
  if (!p.titulo || typeof p.titulo !== 'string' || p.titulo.trim() === '') {
    return "El título es obligatorio y debe ser un texto válido.";
  }
  if (p.titulo.length > 150) {
    return "El título no puede superar los 150 caracteres.";
  }
  if (p.precio === undefined || p.precio === null || isNaN(Number(p.precio))) {
    return "El precio es obligatorio y debe ser un número.";
  }
  const pr = Number(p.precio);
  if (pr <= 0) {
    return "El precio debe ser un número positivo mayor que cero.";
  }
  if (pr > 99999.00) {
    return "El precio ingresado supera el límite permitido de $99,999.00.";
  }
  if (p.cantidad === undefined || p.cantidad === null || isNaN(Number(p.cantidad))) {
    return "La cantidad es obligatoria y debe ser un número entero.";
  }
  const q = Number(p.cantidad);
  if (q < 0 || !Number.isInteger(q)) {
    return "La cantidad debe ser un número entero no negativo (mayor o igual a 0).";
  }
  if (q > 100000) {
    return "La cantidad ingresada supera el límite máximo de stock de 100,000 unidades.";
  }
  if (p.descripcion && p.descripcion.length > 1000) {
    return "La descripción no puede superar los 1000 caracteres.";
  }
  if (p.ubicacion && p.ubicacion.length > 150) {
    return "La ubicación no puede superar los 150 caracteres.";
  }
  return null;
}

export function productValidationMiddleware(req: Request, res: Response, next: NextFunction) {
  const errorMsg = validateProductData(req.body);
  if (errorMsg) {
    return res.status(400).json({ error: errorMsg });
  }
  next();
}
