import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import pool from "./src/config/db.ts";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SECRET_KEY = process.env.JWT_SECRET || "CLAVE_ACADEMICA_SEGURA";

// =====================================================
// 3.3.2 MODELO DE CAPAS DEL BACKEND
// Presentación -> Controlador -> Servicio -> Repositorio -> Base de datos
// =====================================================

// --- CAPA 4: REPOSITORIO (Lógica SQL - IDs Numéricos Autoincrementales) ---
const repository = {
  usuarios: {
    getAll: async () => {
      const [rows] = await pool.query("SELECT * FROM usuarios_publicos");
      return rows;
    },
    getById: async (id: number) => {
      const [rows] = await pool.query("SELECT * FROM usuarios_publicos WHERE id = ?", [id]);
      return (rows as any[])[0] || null;
    },
    getByEmail: async (correo: string) => {
      const [rows] = await pool.query("SELECT * FROM usuarios WHERE correo = ?", [correo]);
      return (rows as any[])[0] || null;
    },
    create: async (u: any) => {
      const hash = await bcrypt.hash(u.contrasena, 10);
      const [result]: any = await pool.execute(
        "INSERT INTO usuarios (nombre, correo, contrasena, telefono) VALUES (?, ?, ?, ?)",
        [u.nombre, u.correo, hash, u.telefono || null]
      );
      return result.insertId;
    },
    update: async (id: number, u: any) => {
      await pool.execute(
        "UPDATE usuarios SET nombre = ?, correo = ?, telefono = ? WHERE id = ?",
        [u.nombre || null, u.correo || null, u.telefono || null, id]
      );
    },
    delete: async (id: number) => {
      await pool.execute("DELETE FROM usuarios WHERE id = ?", [id]);
    }
  },

  categorias: {
    getAll: async () => {
      const [rows] = await pool.query("SELECT * FROM categorias");
      return rows;
    },
    getById: async (id: number) => {
      const [rows] = await pool.query("SELECT * FROM categorias WHERE id = ?", [id]);
      return (rows as any[])[0] || null;
    },
    create: async (nombre: string) => {
      const [result]: any = await pool.execute("INSERT INTO categorias (nombre) VALUES (?)", [nombre]);
      return result.insertId;
    },
    update: async (id: number, nombre: string) => {
      await pool.execute("UPDATE categorias SET nombre = ? WHERE id = ?", [nombre, id]);
    },
    delete: async (id: number) => {
      await pool.execute("DELETE FROM categorias WHERE id = ?", [id]);
    }
  },

  productos: {
    getAll: async () => {
      const [rows] = await pool.query("SELECT * FROM productos");
      return rows;
    },
    getById: async (id: number) => {
      const [rows] = await pool.query("SELECT * FROM productos WHERE id = ?", [id]);
      return (rows as any[])[0] || null;
    },
    create: async (p: any) => {
      const [result]: any = await pool.execute(
        "INSERT INTO productos (titulo, descripcion, precio, vendedor_id, categoria_id, estado, ubicacion) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [p.titulo, p.descripcion || null, p.precio, p.vendedor_id, p.categoria_id, p.estado || "disponible", p.ubicacion || null]
      );
      return result.insertId;
    },
    update: async (id: number, p: any) => {
      await pool.execute(
        "UPDATE productos SET titulo = ?, descripcion = ?, precio = ?, vendedor_id = ?, categoria_id = ?, estado = ?, ubicacion = ? WHERE id = ?",
        [p.titulo, p.descripcion || null, p.precio, p.vendedor_id, p.categoria_id, p.estado || "disponible", p.ubicacion || null, id]
      );
    },
    delete: async (id: number) => {
      await pool.execute("DELETE FROM productos WHERE id = ?", [id]);
    }
  },

  imagenes_producto: {
    getByProducto: async (pid: number) => {
      const [rows] = await pool.query("SELECT * FROM imagenes_producto WHERE producto_id = ?", [pid]);
      return rows;
    },
    add: async (pid: number, url: string) => {
      const [result]: any = await pool.execute("INSERT INTO imagenes_producto (producto_id, url) VALUES (?, ?)", [pid, url]);
      return result.insertId;
    },
    delete: async (id: number) => {
      await pool.execute("DELETE FROM imagenes_producto WHERE id = ?", [id]);
    }
  },

  favoritos: {
    getByUsuario: async (uid: number) => {
      const [rows] = await pool.query("SELECT * FROM favoritos WHERE usuario_id = ?", [uid]);
      return rows;
    },
    add: async (uid: number, pid: number) => {
      await pool.execute("INSERT IGNORE INTO favoritos (usuario_id, producto_id) VALUES (?, ?)", [uid, pid]);
    },
    remove: async (uid: number, pid: number) => {
      await pool.execute("DELETE FROM favoritos WHERE usuario_id = ? AND producto_id = ?", [uid, pid]);
    }
  },

  conversaciones: {
    getAll: async (uid: number) => {
      const [rows] = await pool.query("SELECT * FROM conversaciones WHERE comprador_id = ? OR vendedor_id = ?", [uid, uid]);
      return rows;
    },
    create: async (p: any) => {
      const [result]: any = await pool.execute(
        "INSERT INTO conversaciones (producto_id, comprador_id, vendedor_id) VALUES (?, ?, ?)",
        [p.producto_id, p.comprador_id, p.vendedor_id]
      );
      return result.insertId;
    }
  },

  mensajes: {
    getByConversacion: async (cid: number) => {
      const [rows] = await pool.query("SELECT * FROM mensajes WHERE conversacion_id = ? ORDER BY fecha_envio ASC", [cid]);
      return rows;
    },
    send: async (m: any) => {
      const [result]: any = await pool.execute(
        "INSERT INTO mensajes (conversacion_id, emisor_id, contenido) VALUES (?, ?, ?)",
        [m.conversacion_id, m.emisor_id, m.contenido]
      );
      return result.insertId;
    },
    delete: async (id: number) => {
      await pool.execute("DELETE FROM mensajes WHERE id = ?", [id]);
    }
  },

  compras: {
    getAll: async () => {
      const [rows] = await pool.query("SELECT * FROM compras");
      return rows;
    },
    getByUsuario: async (uid: number) => {
      const [rows] = await pool.query("SELECT * FROM compras WHERE comprador_id = ? OR vendedor_id = ?", [uid, uid]);
      return rows;
    },
    create: async (c: any) => {
      const [result]: any = await pool.execute(
        "INSERT INTO compras (producto_id, comprador_id, vendedor_id, precio, estado) VALUES (?, ?, ?, ?, ?)",
        [c.producto_id, c.comprador_id, c.vendedor_id, c.precio, c.estado || "pendiente"]
      );
      return result.insertId;
    },
    updateEstado: async (id: number, estado: string) => {
      await pool.execute("UPDATE compras SET estado = ? WHERE id = ?", [estado, id]);
    }
  },

  reportes: {
    getStats: async () => {
      const [u] = await pool.query("SELECT COUNT(*) as total FROM usuarios");
      const [p] = await pool.query("SELECT COUNT(*) as total FROM productos");
      const [c] = await pool.query("SELECT COUNT(*) as total FROM compras");
      return {
        usuarios_registrados: (u as any)[0].total,
        productos_activos: (p as any)[0].total,
        transacciones_totales: (c as any)[0].total
      };
    }
  }
};

// --- CAPA 3: SERVICIO (Lógica de Negocio) ---
const service = {
  usuarios: {
    listar: () => repository.usuarios.getAll(),
    obtener: (id: number) => repository.usuarios.getById(id),
    registrar: async (data: any) => {
      const existente = await repository.usuarios.getByEmail(data.correo);
      if (existente) throw new Error("Correo ya registrado");
      return await repository.usuarios.create(data);
    },
    actualizar: (id: number, data: any) => repository.usuarios.update(id, data),
    eliminar: (id: number) => repository.usuarios.delete(id)
  },
  categorias: {
    listar: () => repository.categorias.getAll(),
    crear: (nombre: string) => repository.categorias.create(nombre),
    actualizar: (id: number, n: string) => repository.categorias.update(id, n),
    eliminar: (id: number) => repository.categorias.delete(id)
  },
  productos: {
    listar: () => repository.productos.getAll(),
    obtener: (id: number) => repository.productos.getById(id),
    crear: (data: any) => repository.productos.create(data),
    actualizar: (id: number, data: any) => repository.productos.update(id, data),
    eliminar: (id: number) => repository.productos.delete(id)
  },
  imagenes: {
    listar: (pid: number) => repository.imagenes_producto.getByProducto(pid),
    agregar: (pid: number, url: string) => repository.imagenes_producto.add(pid, url),
    eliminar: (id: number) => repository.imagenes_producto.delete(id)
  },
  favoritos: {
    listar: (uid: number) => repository.favoritos.getByUsuario(uid),
    agregar: (uid: number, pid: number) => repository.favoritos.add(uid, pid),
    quitar: (uid: number, pid: number) => repository.favoritos.remove(uid, pid)
  },
  conversaciones: {
    listar: (uid: number) => repository.conversaciones.getAll(uid),
    crear: (data: any) => repository.conversaciones.create(data)
  },
  mensajes: {
    listar: (cid: number) => repository.mensajes.getByConversacion(cid),
    enviar: (data: any) => repository.mensajes.send(data),
    eliminar: (id: number) => repository.mensajes.delete(id)
  },
  compras: {
    listar: () => repository.compras.getAll(),
    listarPorUsuario: (uid: number) => repository.compras.getByUsuario(uid),
    crear: (data: any) => repository.compras.create(data),
    actualizarEstado: (id: number, e: string) => repository.compras.updateEstado(id, e)
  },
  reportes: {
    generales: () => repository.reportes.getStats()
  }
};

// --- SEGURIDAD (JWT) ---
function authRequired(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return res.status(401).json({ error: "Token no proporcionado" });
  try {
    const token = header.split(" ")[1];
    (req as any).user = jwt.verify(token, SECRET_KEY);
    next();
  } catch { res.status(401).json({ error: "Token inválido" }); }
}

// --- CONFIGURACIÓN SWAGGER (3.10 DOCUMENTACIÓN) ---
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Amazon Marketplace API - Tecnologías Web II",
      version: "1.0.0",
      description: `
### 3.3 DISEÑO DEL BACKEND
Documentación técnica generada con Swagger/OpenAPI siguiendo el modelo de capas.

**Soporte:**
- Módulo 3.5.1: Usuarios, Roles y Favoritos.
- Módulo 3.5.2: Transacciones, Productos y Compras.
- Módulo 3.5.3: Reportes Estadísticos.
- Módulo 3.7: Seguridad perimetral (JWT).

**Instrucción:** Inicie sesión en /login, copie el token y presione Authorize para usar endpoints protegidos.
      `
    },
    servers: [{ url: "/" }],
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } }
    }
  },
  apis: ["./server.ts"]
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  const PORT = 3000;

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // --- 3.5.1 MÓDULO DE USUARIOS ---
  /**
   * @openapi
   * /usuarios:
   *   get:
   *     tags: [3.5.1 Módulo Usuarios]
   *     summary: Listar todos los usuarios
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
  app.get("/usuarios", async (req, res) => { try { res.json(await service.usuarios.listar()); } catch (e: any) { res.status(500).json({ error: e.message }); } });
  app.post("/usuarios", async (req, res) => { try { const id = await service.usuarios.registrar(req.body); res.status(201).json({ id }); } catch (e: any) { res.status(500).json({ error: e.message }); } });

  /**
   * @openapi
   * /usuarios/{id}:
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
  app.get("/usuarios/:id", async (req, res) => { try { res.json(await service.usuarios.obtener(Number(req.params.id))); } catch (e: any) { res.status(500).json({ error: e.message }); } });
  app.put("/usuarios/:id", authRequired, async (req, res) => { try { await service.usuarios.actualizar(Number(req.params.id), req.body); res.json({ message: "OK" }); } catch (e: any) { res.status(500).json({ error: e.message }); } });
  app.delete("/usuarios/:id", authRequired, async (req, res) => { try { await service.usuarios.eliminar(Number(req.params.id)); res.json({ message: "OK" }); } catch (e: any) { res.status(500).json({ error: e.message }); } });

  // --- CATEGORIAS ---
  /**
   * @openapi
   * /categorias:
   *   get:
   *     tags: [Catálogos]
   *     summary: Listar todas las categorías
   *     responses:
   *       200:
   *         description: OK
   *   post:
   *     tags: [Catálogos]
   *     summary: Crear nueva categoría
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [nombre]
   *             properties:
   *               nombre: { type: string, example: "Electrónica" }
   *     responses:
   *       201:
   *         description: Creado
   */
  app.get("/categorias", async (req, res) => { try { res.json(await service.categorias.listar()); } catch (e: any) { res.status(500).json({ error: e.message }); } });
  app.post("/categorias", authRequired, async (req, res) => { try { const id = await service.categorias.crear(req.body.nombre); res.status(201).json({ id }); } catch (e: any) { res.status(500).json({ error: e.message }); } });

  // --- FAVORITOS ---
  /**
   * @openapi
   * /favoritos/{uid}:
   *   get:
   *     tags: [3.5.1 Módulo Usuarios]
   *     summary: Listar favoritos de un usuario
   *     parameters: [{ name: uid, in: path, required: true, schema: { type: integer } }]
   *     responses:
   *       200:
   *         description: OK
   * /favoritos:
   *   post:
   *     tags: [3.5.1 Módulo Usuarios]
   *     summary: Marcar producto como favorito
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [usuario_id, producto_id]
   *             properties:
   *               usuario_id: { type: integer, example: 1 }
   *               producto_id: { type: integer, example: 5 }
   *     responses:
   *       201:
   *         description: OK
   */
  app.get("/favoritos/:uid", async (req, res) => { try { res.json(await service.favoritos.listar(Number(req.params.uid))); } catch (e: any) { res.status(500).json({ error: e.message }); } });
  app.post("/favoritos", authRequired, async (req, res) => { try { await service.favoritos.agregar(req.body.usuario_id, req.body.producto_id); res.json({ message: "OK" }); } catch (e: any) { res.status(500).json({ error: e.message }); } });

  // --- 3.5.2 MÓDULO DE TRANSACCIONES (PRODUCTOS) ---
  /**
   * @openapi
   * /productos:
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
  app.get("/productos", async (req, res) => { try { res.json(await service.productos.listar()); } catch (e: any) { res.status(500).json({ error: e.message }); } });
  app.post("/productos", authRequired, async (req, res) => { try { const id = await service.productos.crear(req.body); res.status(201).json({ id }); } catch (e: any) { res.status(500).json({ error: e.message }); } });

  /**
   * @openapi
   * /productos/{id}:
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
  app.get("/productos/:id", async (req, res) => { try { res.json(await service.productos.obtener(Number(req.params.id))); } catch (e: any) { res.status(500).json({ error: e.message }); } });
  app.put("/productos/:id", authRequired, async (req, res) => { try { await service.productos.actualizar(Number(req.params.id), req.body); res.json({ message: "OK" }); } catch (e: any) { res.status(500).json({ error: e.message }); } });
  app.delete("/productos/:id", authRequired, async (req, res) => { try { await service.productos.eliminar(Number(req.params.id)); res.json({ message: "OK" }); } catch (e: any) { res.status(500).json({ error: e.message }); } });

  // --- IMAGENES ---
  /**
   * @openapi
   * /productos/{pid}/imagenes:
   *   get:
   *     tags: [Catálogos]
   *     summary: Obtener imágenes de un producto
   *     parameters: [{ name: pid, in: path, required: true, schema: { type: integer } }]
   *     responses:
   *       200:
   *         description: OK
   * /imagenes_producto:
   *   post:
   *     tags: [Catálogos]
   *     summary: Añadir imagen a producto
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [producto_id, url]
   *             properties:
   *               producto_id: { type: integer, example: 1 }
   *               url: { type: string, example: "https://ejemplo.com/foto.jpg" }
   *     responses:
   *       201:
   *         description: OK
   */
  app.get("/productos/:pid/imagenes", async (req, res) => { try { res.json(await service.imagenes.listar(Number(req.params.pid))); } catch (e: any) { res.status(500).json({ error: e.message }); } });
  app.post("/imagenes_producto", authRequired, async (req, res) => { try { const id = await service.imagenes.agregar(req.body.producto_id, req.body.url); res.status(201).json({ id }); } catch (e: any) { res.status(500).json({ error: e.message }); } });

  // --- COMPRAS ---
  /**
   * @openapi
   * /compras:
   *   get:
   *     tags: [3.5.2 Módulo Transacciones]
   *     summary: Listar todas las compras (Admin)
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
  app.get("/compras", authRequired, async (req, res) => { try { res.json(await service.compras.listar()); } catch (e: any) { res.status(500).json({ error: e.message }); } });
  app.post("/compras", authRequired, async (req, res) => { try { const id = await service.compras.crear(req.body); res.status(201).json({ id }); } catch (e: any) { res.status(500).json({ error: e.message }); } });

  // --- MENSAJERÍA ---
  /**
   * @openapi
   * /conversaciones/{uid}:
   *   get:
   *     tags: [Mensajería]
   *     summary: Obtener conversaciones de un usuario
   *     security: [{ bearerAuth: [] }]
   *     parameters: [{ name: uid, in: path, required: true, schema: { type: integer } }]
   *     responses:
   *       200:
   *         description: OK
   * /conversaciones:
   *   post:
   *     tags: [Mensajería]
   *     summary: Crear nueva conversación
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [producto_id, comprador_id, vendedor_id]
   *             properties:
   *               producto_id: { type: integer }
   *               comprador_id: { type: integer }
   *               vendedor_id: { type: integer }
   *     responses:
   *       201:
   *         description: OK
   */
  app.get("/conversaciones/:uid", authRequired, async (req, res) => { try { res.json(await service.conversaciones.listar(Number(req.params.uid))); } catch (e: any) { res.status(500).json({ error: e.message }); } });
  app.post("/conversaciones", authRequired, async (req, res) => { try { const id = await service.conversaciones.crear(req.body); res.status(201).json({ id }); } catch (e: any) { res.status(500).json({ error: e.message }); } });

  /**
   * @openapi
   * /mensajes/{cid}:
   *   get:
   *     tags: [Mensajería]
   *     summary: Listar mensajes de una conversación
   *     security: [{ bearerAuth: [] }]
   *     parameters: [{ name: cid, in: path, required: true, schema: { type: integer } }]
   *     responses:
   *       200:
   *         description: OK
   * /mensajes:
   *   post:
   *     tags: [Mensajería]
   *     summary: Enviar un mensaje
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [conversacion_id, emisor_id, contenido]
   *             properties:
   *               conversacion_id: { type: integer, example: 1 }
   *               emisor_id: { type: integer, example: 2 }
   *               contenido: { type: string, example: "Hola, ¿sigue disponible?" }
   *     responses:
   *       201:
   *         description: OK
   */
  app.get("/mensajes/:cid", authRequired, async (req, res) => { try { res.json(await service.mensajes.listar(Number(req.params.cid))); } catch (e: any) { res.status(500).json({ error: e.message }); } });
  app.post("/mensajes", authRequired, async (req, res) => { try { const id = await service.mensajes.enviar(req.body); res.status(201).json({ id }); } catch (e: any) { res.status(500).json({ error: e.message }); } });

  // --- 3.5.3 MÓDULO DE REPORTES ---
  /**
   * @openapi
   * /reportes:
   *   get:
   *     tags: [3.5.3 Módulo Reportes]
   *     summary: Generar estadísticas del sistema
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200:
   *         description: OK
   */
  app.get("/reportes", authRequired, async (req, res) => { try { res.json(await service.reportes.generales()); } catch (e: any) { res.status(500).json({ error: e.message }); } });

  // --- 3.7 SEGURIDAD ---
  /**
   * @openapi
   * /login:
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
   *               password: { type: string, example: "123456" }
   *     responses:
   *       200:
   *         description: Token generado
   */
  app.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await repository.usuarios.getByEmail(email);
      if (user && await bcrypt.compare(password, user.contrasena)) {
        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '8h' });
        return res.json({ token, user: { id: user.id, nombre: user.nombre } });
      }
      res.status(401).json({ error: "Credenciales inválidas" });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // Diagnóstico
  app.get("/api/ping", (req, res) => res.json({ status: "OK", server_time: new Date() }));

  // Frontend SPA fallback
  if (process.env.NODE_ENV !== "production") {
    const vite = await (await import("vite")).createServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => res.sendFile(path.join(process.cwd(), "dist/index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 SERVIDOR MARKETPLACE INICIADO`);
    console.log(`📡 Swagger: http://localhost:${PORT}/api-docs`);
  });
}

startServer();
