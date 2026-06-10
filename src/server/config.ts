import dotenv from "dotenv";
dotenv.config();

export const SECRET_KEY = process.env.JWT_SECRET || "CLAVE_ACADEMICA_SEGURA";
export const PORT = 3000;
