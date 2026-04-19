import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Creamos un Pool de conexiones (más eficiente que una conexión simple)
// como recomendó tu investigación con ChatGPT.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'amazon',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
