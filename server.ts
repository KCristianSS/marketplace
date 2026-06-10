import express from "express";
import path from "path";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import { setupRepository } from "./src/server/repositories/ActiveRepository.ts";

// Importación de enrutadores modulares (Módulos 3.5.1, 3.5.2, 3.5.3)
import authRouter from "./src/server/routes/auth.ts";
import usuariosRouter from "./src/server/routes/usuarios.ts";
import productosRouter from "./src/server/routes/productos.ts";
import categoriasRouter from "./src/server/routes/categorias.ts";
import comprasRouter from "./src/server/routes/compras.ts";
import reportesRouter from "./src/server/routes/reportes.ts";

// --- CONFIGURACIÓN SWAGGER (3.10 DOCUMENTACIÓN) ---
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Amazon Marketplace API - Tecnologías Web II",
      version: "1.0.0",
      description: `
### 3.3 DISEÑO DEL BACKEND - ARQUITECTURA MODULARIZADA
Documentación técnica generada con Swagger/OpenAPI siguiendo el modelo de capas modular:
Presentación -> Enrutadores/Controladores -> Servicios -> Repositorios -> Base de datos.

**Módulos Soportados:**
- Módulo 3.5.1: Usuarios, Roles y Favoritos.
- Módulo 3.5.2: Transacciones, Productos y Compras (con gestión de Stock).
- Módulo 3.5.3: Reportes Estadísticos del Sistema.
- Módulo 3.7: Seguridad perimetral (Autenticación JWT).

**Instrucción:** Inicie sesión en \`/api/login\`, copie su token Bearer, presione **Authorize** arriba a la derecha, e ingréselo para consumir de manera segura los endpoints protegidos.
      `
    },
    servers: [{ url: "/" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  // Leemos JSDocs tanto de las rutas modulares de la carpeta server/routes como de este archivo
  apis: ["./src/server/routes/*.ts", "./server.ts"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

async function startServer() {
  console.log(" Inicializando base de datos y repositorios de datos...");
  await setupRepository();

  const app = express();
  app.use(cors());
  app.use(express.json());
  const PORT = 3000;

  // Middleware de logging para depuración académica
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // UI interactiva de documentación Swagger
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // --- REGISTRO DE RUTAS MODULARES DE LA API (Módulos 3.5) ---
  app.use("/api", authRouter);       // Autenticación JWT (/api/login)
  app.use("/api", usuariosRouter);   // Gestión de Usuarios (/api/usuarios)
  app.use("/api", productosRouter);  // Transacciones de Productos (/api/productos)
  app.use("/api", categoriasRouter); // Catálogos de Categorías (/api/categorias)
  app.use("/api", comprasRouter);    // Órdenes de Compras y Ventas (/api/compras)
  app.use("/api", reportesRouter);   // Reportes Estadísticos del Negocio (/api/reportes)

  // Diagnóstico
  /**
   * @openapi
   * /api/ping:
   *   get:
   *     tags: [Diagnóstico]
   *     summary: Verificar el estado del servidor (Ping)
   *     responses:
   *       200:
   *         description: Respuesta exitosa del servidor indicando el estado y la hora actual.
   */
  app.get("/api/ping", (req, res) => {
    res.json({
      status: "OK",
      architecture: "Modular con Capas Seguras",
      server_time: new Date()
    });
  });

  // Frontend SPA fallback para Vite (Integración total Cliente-Servidor)
  if (process.env.NODE_ENV !== "production") {
    const vite = await (await import("vite")).createServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => res.sendFile(path.join(process.cwd(), "dist/index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n SERVIDOR MARKETPLACE INICIADO CORRECTAMENTE`);
    console.log(` Documentación Swagger API-Docs: http://localhost:${PORT}/api-docs`);
    console.log(` Accede a la aplicación en: http://localhost:${PORT}`);
  });
}

startServer();
