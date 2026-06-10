import pool from "../../config/db.ts";
import { mysqlRepository } from "./MySQLRepository.ts";

export const db: any = mysqlRepository;

export async function setupRepository() {
  try {
    await pool.query("SELECT 1");
    console.log(" Conexión exitosa a la base de datos MySQL.");
  } catch (err: any) {
    console.warn(" Advertencia: No se pudo verificar la conexión con la base de datos MySQL.", err.message);
  }
}

export { pool };
