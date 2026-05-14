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
  // ... (se mantiene igual, se usará si hay conexión)
  usuarios: {
    getAll: async () => {
      const [rows] = await pool.query("SELECT id, nombre, correo, telefono, rol FROM usuarios");
      return rows;
    },
    getById: async (id: number) => {
      const [rows] = await pool.query("SELECT id, nombre, correo, telefono, rol FROM usuarios WHERE id = ?", [id]);
      return (rows as any[])[0] || null;
    },
    getByEmail: async (correo: string) => {
      const [rows] = await pool.query("SELECT * FROM usuarios WHERE correo = ?", [correo]);
      return (rows as any[])[0] || null;
    },
    create: async (u: any) => {
      const hash = await bcrypt.hash(u.contrasena, 10);
      const [result]: any = await pool.execute(
        "INSERT INTO usuarios (nombre, correo, contrasena, telefono, rol) VALUES (?, ?, ?, ?, ?)",
        [u.nombre, u.correo, hash, u.telefono || null, u.rol || "cliente"]
      );
      return result.insertId;
    },
    update: async (id: number, u: any) => {
      await pool.execute(
        "UPDATE usuarios SET nombre = ?, correo = ?, telefono = ?, rol = ? WHERE id = ?",
        [u.nombre || null, u.correo || null, u.telefono || null, u.rol || "cliente", id]
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
      const [rows] = await pool.query(`
        SELECT p.*, u.nombre as vendedor_nombre, u.telefono as vendedor_telefono, c.nombre as categoria_nombre 
        FROM productos p 
        LEFT JOIN usuarios u ON p.vendedor_id = u.id 
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.id = ?
      `, [id]);
      return (rows as any[])[0] || null;
    },
    create: async (p: any) => {
      const [result]: any = await pool.execute(
        "INSERT INTO productos (titulo, descripcion, precio, vendedor_id, categoria_id, estado, ubicacion, img_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [p.titulo, p.descripcion || null, p.precio, p.vendedor_id, p.categoria_id, p.estado || "disponible", p.ubicacion || null, p.img_url || null]
      );
      return result.insertId;
    },
    update: async (id: number, p: any) => {
      await pool.execute(
        "UPDATE productos SET titulo = ?, descripcion = ?, precio = ?, vendedor_id = ?, categoria_id = ?, estado = ?, ubicacion = ?, img_url = ? WHERE id = ?",
        [p.titulo, p.descripcion || null, p.precio, p.vendedor_id, p.categoria_id, p.estado || "disponible", p.ubicacion || null, p.img_url || null, id]
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
      const [rows] = await pool.query(`
        SELECT c.fecha_compra as fecha, c.id, c.producto_id, c.comprador_id, c.vendedor_id, c.precio, c.estado,
               p.titulo as producto_titulo, u_c.nombre as comprador_nombre, u_v.nombre as vendedor_nombre 
        FROM compras c
        JOIN productos p ON c.producto_id = p.id
        JOIN usuarios u_c ON c.comprador_id = u_c.id
        JOIN usuarios u_v ON c.vendedor_id = u_v.id
        ORDER BY c.fecha_compra DESC
      `);
      return rows;
    },
    getByComprador: async (uid: number) => {
      const [rows] = await pool.query(`
        SELECT c.fecha_compra as fecha, c.id, c.producto_id, c.comprador_id, c.vendedor_id, c.precio, c.estado,
               p.titulo as producto_titulo, u_v.nombre as counterparty_name
        FROM compras c
        JOIN productos p ON c.producto_id = p.id
        JOIN usuarios u_v ON c.vendedor_id = u_v.id
        WHERE c.comprador_id = ?
        ORDER BY c.fecha_compra DESC
      `, [uid]);
      return rows;
    },
    getByVendedor: async (uid: number) => {
      const [rows] = await pool.query(`
        SELECT c.fecha_compra as fecha, c.id, c.producto_id, c.comprador_id, c.vendedor_id, c.precio, c.estado,
               p.titulo as producto_titulo, u_c.nombre as counterparty_name
        FROM compras c
        JOIN productos p ON c.producto_id = p.id
        JOIN usuarios u_c ON c.comprador_id = u_c.id
        WHERE c.vendedor_id = ?
        ORDER BY c.fecha_compra DESC
      `, [uid]);
      return rows;
    },
    create: async (c: any) => {
      const [result]: any = await pool.execute(
        "INSERT INTO compras (producto_id, comprador_id, vendedor_id, precio, estado, fecha_compra) VALUES (?, ?, ?, ?, ?, ?)",
        [c.producto_id, c.comprador_id, c.vendedor_id, c.precio, c.estado || "pendiente", new Date().toISOString()]
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

// --- MOCK REPOSITORY PARA ESTE ENTORNO (Sin MySQL) ---
const mockData: any = {
  usuarios: [],
  categorias: [
    { id: 1, nombre: "Electrónica" },
    { id: 2, nombre: "Ropa y Accesorios" },
    { id: 3, nombre: "Hogar y Cocina" },
    { id: 4, nombre: "Deportes y Aire Libre" },
    { id: 5, nombre: "Libros" }
  ],
  productos: [
    { id: 1, titulo: "Smartphone XYZ", descripcion: "Último modelo con 128GB y cámara 50MP", precio: 299.99, vendedor_id: 3, categoria_id: 1, estado: "disponible", ubicacion: "Madrid", img_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=300&auto=format" },
    { id: 2, titulo: "Auriculares Bluetooth", descripcion: "Cancelación de ruido, 20h de batería", precio: 49.99, vendedor_id: 3, categoria_id: 1, estado: "disponible", ubicacion: "Barcelona", img_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300&auto=format" },
    { id: 3, titulo: "Camiseta Deportiva", descripcion: "100% algodón, talla M", precio: 15.99, vendedor_id: 4, categoria_id: 2, estado: "disponible", ubicacion: "Valencia", img_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=300&auto=format" },
    { id: 4, titulo: "Juego de Sartenes", descripcion: "Antiaderente, 3 piezas", precio: 39.99, vendedor_id: 4, categoria_id: 3, estado: "disponible", ubicacion: "Sevilla", img_url: "https://images.unsplash.com/photo-1584947803216-233f5dfde539?q=80&w=300&auto=format" },
    { id: 5, titulo: "Bicicleta Montaña", descripcion: "Ruedas 26\", cambios Shimano", precio: 450.00, vendedor_id: 3, categoria_id: 4, estado: "vendido", ubicacion: "Bilbao", img_url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=300&auto=format" },
    { id: 6, titulo: "Libro \"Aprender SQL\"", descripcion: "Guía práctica para principiantes", precio: 29.99, vendedor_id: 4, categoria_id: 5, estado: "disponible", ubicacion: "Málaga", img_url: "https://images.unsplash.com/photo-1544383335-dee000676442?q=80&w=300&auto=format" }
  ],
  imagenes_producto: [
    { id: 1, producto_id: 1, url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=300&auto=format" },
    { id: 2, producto_id: 1, url: "https://images.unsplash.com/photo-1516542076529-1ea3854896f2?q=80&w=300&auto=format" },
    { id: 3, producto_id: 2, url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300&auto=format" },
    { id: 4, producto_id: 3, url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=300&auto=format" },
    { id: 5, producto_id: 4, url: "https://images.unsplash.com/photo-1584947803216-233f5dfde539?q=80&w=300&auto=format" },
    { id: 6, producto_id: 5, url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=300&auto=format" },
    { id: 7, producto_id: 6, url: "https://images.unsplash.com/photo-1544383335-dee000676442?q=80&w=300&auto=format" }
  ],
  compras: [
    { id: 1, producto_id: 1, comprador_id: 1, vendedor_id: 3, precio: 299.99, estado: "completado", fecha_compra: "2026-04-19 01:00:04" },
    { id: 2, producto_id: 3, comprador_id: 2, vendedor_id: 4, precio: 15.99, estado: "pendiente", fecha_compra: "2026-04-19 01:00:04" },
    { id: 3, producto_id: 5, comprador_id: 2, vendedor_id: 3, precio: 450.00, estado: "completado", fecha_compra: "2026-04-19 01:00:04" },
    { id: 4, producto_id: 6, comprador_id: 1, vendedor_id: 4, precio: 29.99, estado: "pendiente", fecha_compra: "2026-04-19 01:00:04" }
  ],
  conversaciones: [
    { id: 1, producto_id: 1, comprador_id: 1, vendedor_id: 3, fecha_inicio: "2026-04-19 01:00:04" },
    { id: 2, producto_id: 3, comprador_id: 2, vendedor_id: 4, fecha_inicio: "2026-04-19 01:00:04" },
    { id: 3, producto_id: 5, comprador_id: 2, vendedor_id: 3, fecha_inicio: "2026-04-19 01:00:04" }
  ],
  mensajes: [
    { id: 1, conversacion_id: 1, emisor_id: 1, contenido: "Hola, ¿el smartphone tiene garantía?", fecha_envio: "2026-04-19 01:00:04" },
    { id: 2, conversacion_id: 1, emisor_id: 3, contenido: "Sí, 2 años de garantía oficial.", fecha_envio: "2026-04-19 01:00:04" },
    { id: 5, conversacion_id: 2, emisor_id: 2, contenido: "¿La camiseta es de talla M?", fecha_envio: "2026-04-19 01:00:04" },
    { id: 6, conversacion_id: 2, emisor_id: 4, contenido: "Sí, exacta. Color azul marino.", fecha_envio: "2026-04-19 01:00:04" }
  ],
  favoritos: [
    { id: 1, usuario_id: 1, producto_id: 1 },
    { id: 2, usuario_id: 1, producto_id: 3 },
    { id: 3, usuario_id: 2, producto_id: 2 },
    { id: 4, usuario_id: 2, producto_id: 5 },
    { id: 5, usuario_id: 3, producto_id: 4 }
  ]
};

async function initMockData() {
  const hash = await bcrypt.hash("pass123", 10);
  mockData.usuarios = [
    { id: 1, nombre: "Carlos", correo: "carlos@email.com", contrasena: hash, telefono: "111222333", rol: "cliente" },
    { id: 2, nombre: "Ana Martínez", correo: "ana@email.com", contrasena: hash, telefono: "600333444", rol: "cliente" },
    { id: 3, nombre: "Juan Pérez", correo: "juan@email.com", contrasena: hash, telefono: "600555666", rol: "vendedor" },
    { id: 4, nombre: "María Gómez", correo: "maria@email.com", contrasena: hash, telefono: "600777888", rol: "vendedor" },
    { id: 6, nombre: "Guillermo Actualizado", correo: "nuevo@amazon.com", contrasena: hash, telefono: "111222333", rol: "cliente" },
    { id: 7, nombre: "Guillermo", correo: "admin@asdfasdf.com", contrasena: hash, telefono: "999888777", rol: "cliente" }
  ];
}

const mockRepository = {
  usuarios: {
    getAll: async () => {
      // Mock de la vista usuarios_publicos (sin contrasena)
      return mockData.usuarios.map((u: any) => {
        const { contrasena, ...publicUser } = u;
        return publicUser;
      });
    },
    getById: async (id: number) => mockData.usuarios.find((u: any) => u.id === id) || null,
    getByEmail: async (correo: string) => mockData.usuarios.find((u: any) => u.correo === correo) || null,
    create: async (u: any) => {
      const id = Math.max(0, ...mockData.usuarios.map((x: any) => x.id)) + 1;
      const hash = await bcrypt.hash(u.contrasena, 10);
      mockData.usuarios.push({ ...u, id, contrasena: hash, rol: u.rol || "cliente" });
      return id;
    },
    update: async (id: number, u: any) => {
      const idx = mockData.usuarios.findIndex((user: any) => user.id === id);
      if (idx !== -1) mockData.usuarios[idx] = { ...mockData.usuarios[idx], ...u };
    },
    delete: async (id: number) => {
      mockData.usuarios = mockData.usuarios.filter((u: any) => u.id !== id);
    }
  },
  categorias: {
    getAll: async () => mockData.categorias,
    getById: async (id: number) => mockData.categorias.find((c: any) => c.id === id) || null,
    create: async (n: string) => {
      const id = Math.max(0, ...mockData.categorias.map((x: any) => x.id)) + 1;
      mockData.categorias.push({ id, nombre: n });
      return id;
    }
  },
  productos: {
    getAll: async () => mockData.productos,
    getById: async (id: number) => mockData.productos.find((p: any) => p.id === id) || null,
    create: async (p: any) => {
      const id = Math.max(0, ...mockData.productos.map((x: any) => x.id)) + 1;
      mockData.productos.push({ ...p, id });
      return id;
    },
    update: async (id: number, p: any) => {
      const idx = mockData.productos.findIndex((prod: any) => prod.id === id);
      if (idx !== -1) mockData.productos[idx] = { ...mockData.productos[idx], ...p };
    },
    delete: async (id: number) => {
      mockData.productos = mockData.productos.filter((p: any) => p.id !== id);
    }
  },
  imagenes_producto: {
    getByProducto: async (pid: number) => mockData.imagenes_producto.filter((img: any) => img.producto_id === pid),
    add: async (pid: number, url: string) => {
      const id = Math.max(0, ...mockData.imagenes_producto.map((x: any) => x.id)) + 1;
      mockData.imagenes_producto.push({ id, producto_id: pid, url });
      return id;
    },
    delete: async (id: number) => {
      mockData.imagenes_producto = mockData.imagenes_producto.filter((img: any) => img.id !== id);
    }
  },
  favoritos: {
    getByUsuario: async (uid: number) => mockData.favoritos.filter((f: any) => f.usuario_id === uid),
    add: async (uid: number, pid: number) => {
      const exists = mockData.favoritos.some((f: any) => f.usuario_id === uid && f.producto_id === pid);
      if (!exists) {
        const id = Math.max(0, ...mockData.favoritos.map((x: any) => x.id)) + 1;
        mockData.favoritos.push({ id, usuario_id: uid, producto_id: pid });
      }
    },
    remove: async (uid: number, pid: number) => {
      mockData.favoritos = mockData.favoritos.filter((f: any) => !(f.usuario_id === uid && f.producto_id === pid));
    }
  },
  conversaciones: {
    getAll: async (uid: number) => mockData.conversaciones.filter((c: any) => c.comprador_id === uid || c.vendedor_id === uid),
    create: async (c: any) => {
      const id = Math.max(0, ...mockData.conversaciones.map((x: any) => x.id)) + 1;
      mockData.conversaciones.push({ ...c, id, fecha_inicio: new Date().toISOString() });
      return id;
    }
  },
  mensajes: {
    getByConversacion: async (cid: number) => mockData.mensajes.filter((m: any) => m.conversacion_id === cid),
    send: async (m: any) => {
      const id = Math.max(0, ...mockData.mensajes.map((x: any) => x.id)) + 1;
      mockData.mensajes.push({ ...m, id, fecha_envio: new Date().toISOString() });
      return id;
    },
    delete: async (id: number) => {
      mockData.mensajes = mockData.mensajes.filter((m: any) => m.id !== id);
    }
  },
  compras: {
    getAll: async () => {
      return mockData.compras.map((c: any) => {
        const prod = mockData.productos.find((p: any) => p.id === c.producto_id);
        const comp = mockData.usuarios.find((u: any) => u.id === c.comprador_id);
        const vend = mockData.usuarios.find((u: any) => u.id === c.vendedor_id);
        return {
          ...c,
          fecha: c.fecha_compra,
          producto_titulo: prod?.titulo,
          comprador_nombre: comp?.nombre,
          vendedor_nombre: vend?.nombre
        };
      });
    },
    getByComprador: async (uid: number) => {
      return mockData.compras
        .filter((c: any) => c.comprador_id === uid)
        .map((c: any) => {
          const prod = mockData.productos.find((p: any) => p.id === c.producto_id);
          const vend = mockData.usuarios.find((u: any) => u.id === c.vendedor_id);
          return {
            ...c,
            fecha: c.fecha_compra,
            producto_titulo: prod?.titulo,
            counterparty_name: vend?.nombre
          };
        });
    },
    getByVendedor: async (uid: number) => {
      return mockData.compras
        .filter((c: any) => c.vendedor_id === uid)
        .map((c: any) => {
          const prod = mockData.productos.find((p: any) => p.id === c.producto_id);
          const comp = mockData.usuarios.find((u: any) => u.id === c.comprador_id);
          return {
            ...c,
            fecha: c.fecha_compra,
            producto_titulo: prod?.titulo,
            counterparty_name: comp?.nombre
          };
        });
    },
    create: async (c: any) => {
      const id = Math.max(0, ...mockData.compras.map((x: any) => x.id)) + 1;
      mockData.compras.push({ ...c, id, fecha_compra: new Date().toISOString() });
      return id;
    },
    updateEstado: async (id: number, estado: string) => {
      const idx = mockData.compras.findIndex((c: any) => c.id === id);
      if (idx !== -1) mockData.compras[idx].estado = estado;
    }
  },
  reportes: {
    getStats: async () => ({
      usuarios_registrados: mockData.usuarios.length,
      productos_activos: mockData.productos.length,
      transacciones_totales: mockData.compras.length
    })
  }
};

// --- REPOSITORIO ACTIVO (MySQL o Mock) ---
let activeRepository: any = repository;

async function setupRepository() {
  try {
    // Solo intentamos MySQL si DB_HOST está definido y NO es "local_mock" (para forzar mock si se desea)
    if (!process.env.DB_HOST) {
      console.log("ℹ️ DB_HOST no definido. Usando Mock Repository (En memoria).");
      activeRepository = mockRepository;
      return;
    }

    // Intentamos una consulta simple para verificar la conexión
    await pool.query("SELECT 1");
    console.log("✅ Conexión exitosa a MySQL en " + process.env.DB_HOST);
    activeRepository = repository;
  } catch (err) {
    console.warn("⚠️ Error conectando a MySQL (" + (process.env.DB_HOST || 'localhost') + "). Usando Mock Repository de respaldo.");
    activeRepository = mockRepository;
  }
}

// --- CAPA 3: SERVICIO (Lógica de Negocio) ---
const service = {
  usuarios: {
    listar: () => activeRepository.usuarios.getAll(),
    obtener: (id: number) => activeRepository.usuarios.getById(id),
    registrar: async (data: any) => {
      const existente = await activeRepository.usuarios.getByEmail(data.correo);
      if (existente) throw new Error("Correo ya registrado");
      return await activeRepository.usuarios.create(data);
    },
    actualizar: (id: number, data: any) => activeRepository.usuarios.update(id, data),
    eliminar: (id: number) => activeRepository.usuarios.delete(id)
  },
  categorias: {
    listar: () => activeRepository.categorias.getAll(),
    crear: (nombre: string) => activeRepository.categorias.create(nombre),
    actualizar: (id: number, n: string) => activeRepository.categorias.update(id, n),
    eliminar: (id: number) => activeRepository.categorias.delete(id)
  },
  productos: {
    listar: () => activeRepository.productos.getAll(),
    obtener: (id: number) => activeRepository.productos.getById(id),
    crear: (data: any) => activeRepository.productos.create(data),
    actualizar: (id: number, data: any) => activeRepository.productos.update(id, data),
    eliminar: (id: number) => activeRepository.productos.delete(id)
  },
  imagenes: {
    listar: (pid: number) => activeRepository.imagenes_producto?.getByProducto(pid) || [],
    agregar: (pid: number, url: string) => activeRepository.imagenes_producto?.add(pid, url),
    eliminar: (id: number) => activeRepository.imagenes_producto?.delete(id)
  },
  favoritos: {
    listar: (uid: number) => activeRepository.favoritos?.getByUsuario(uid) || [],
    agregar: (uid: number, pid: number) => activeRepository.favoritos?.add(uid, pid),
    quitar: (uid: number, pid: number) => activeRepository.favoritos?.remove(uid, pid)
  },
  conversaciones: {
    listar: (uid: number) => activeRepository.conversaciones?.getAll(uid) || [],
    crear: (data: any) => activeRepository.conversaciones?.create(data)
  },
  mensajes: {
    listar: (cid: number) => activeRepository.mensajes?.getByConversacion(cid) || [],
    enviar: (data: any) => activeRepository.mensajes?.send(data),
    eliminar: (id: number) => activeRepository.mensajes?.delete(id)
  },
  compras: {
    listar: () => activeRepository.compras?.getAll() || [],
    obtenerPorComprador: (uid: number) => activeRepository.compras?.getByComprador(uid) || [],
    obtenerPorVendedor: (uid: number) => activeRepository.compras?.getByVendedor(uid) || [],
    crear: (data: any) => activeRepository.compras?.create(data),
    actualizarEstado: (id: number, e: string) => activeRepository.compras?.updateEstado(id, e)
  },
  reportes: {
    generales: () => activeRepository.reportes.getStats()
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

async function adminRequired(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = (req as any).user;
  if (!user || user.rol !== "admin") {
    // Si el JWT no tiene el rol, lo buscamos en BD
    const fullUser = await service.usuarios.obtener(user.id);
    if (fullUser && fullUser.rol === "admin") {
      next();
    } else {
      res.status(403).json({ error: "Acceso denegado: Se requiere administrador" });
    }
  } else {
    next();
  }
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
  await setupRepository();
  await initMockData();
  const app = express();
  app.use(cors());
  app.use(express.json());
  const PORT = 3000;

  // Middleware de logging para depuración
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  const apiRouter = express.Router();
  app.use("/api", apiRouter);

  // --- 3.5.1 MÓDULO DE USUARIOS ---
  /**
   * @openapi
   * /api/usuarios:
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
  apiRouter.post("/usuarios", async (req, res) => { try { const id = await service.usuarios.registrar(req.body); res.status(201).json({ id }); } catch (e: any) { res.status(500).json({ error: e.message }); } });

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
  apiRouter.get("/usuarios/:id", async (req, res) => { try { res.json(await service.usuarios.obtener(Number(req.params.id))); } catch (e: any) { res.status(500).json({ error: e.message }); } });
  apiRouter.put("/usuarios/:id", authRequired, async (req, res) => { 
    try { 
      const currentUserId = (req as any).user.id;
      const currentUserRole = (req as any).user.rol;
      const targetUserId = Number(req.params.id);
      
      // Solo el mismo usuario o un admin pueden editar
      if (currentUserId !== targetUserId && currentUserRole !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para editar este perfil" });
      }
      
      await service.usuarios.actualizar(targetUserId, req.body); 
      res.json({ message: "OK" }); 
    } catch (e: any) { 
      res.status(500).json({ error: e.message }); 
    } 
  });
  apiRouter.delete("/usuarios/:id", authRequired, async (req, res) => {
    try {
      const currentUserRole = (req as any).user.rol;
      if (currentUserRole !== 'admin') {
        return res.status(403).json({ error: "Acceso denegado: Se requiere administrador" });
      }
      await service.usuarios.eliminar(Number(req.params.id));
      res.json({ message: "OK" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- CATEGORIAS ---
  /**
   * @openapi
   * /api/categorias:
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
  apiRouter.get("/categorias", async (req, res) => { try { res.json(await service.categorias.listar()); } catch (e: any) { res.status(500).json({ error: e.message }); } });
  apiRouter.post("/categorias", authRequired, async (req, res) => { try { const id = await service.categorias.crear(req.body.nombre); res.status(201).json({ id }); } catch (e: any) { res.status(500).json({ error: e.message }); } });

  // --- FAVORITOS ---
  /**
   * @openapi
   * /api/favoritos/{uid}:
   *   get:
   *     tags: [3.5.1 Módulo Usuarios]
   *     summary: Listar favoritos de un usuario
   *     parameters: [{ name: uid, in: path, required: true, schema: { type: integer } }]
   *     responses:
   *       200:
   *         description: OK
   * /api/favoritos:
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
  apiRouter.get("/favoritos/:uid", async (req, res) => { try { res.json(await service.favoritos.listar(Number(req.params.uid))); } catch (e: any) { res.status(500).json({ error: e.message }); } });
  apiRouter.post("/favoritos", authRequired, async (req, res) => { try { await service.favoritos.agregar(req.body.usuario_id, req.body.producto_id); res.json({ message: "OK" }); } catch (e: any) { res.status(500).json({ error: e.message }); } });

  // --- 3.5.2 MÓDULO DE TRANSACCIONES (PRODUCTOS) ---
  /**
   * @openapi
   * /api/productos:
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
  apiRouter.get("/productos", async (req, res) => { try { res.json(await service.productos.listar()); } catch (e: any) { res.status(500).json({ error: e.message }); } });
  apiRouter.post("/productos", authRequired, async (req, res) => { try { const id = await service.productos.crear(req.body); res.status(201).json({ id }); } catch (e: any) { res.status(500).json({ error: e.message }); } });

  /**
   * @openapi
   * /api/productos/{id}:
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
  apiRouter.get("/productos/:id", async (req, res) => { try { res.json(await service.productos.obtener(Number(req.params.id))); } catch (e: any) { res.status(500).json({ error: e.message }); } });
  apiRouter.put("/productos/:id", authRequired, async (req, res) => { try { await service.productos.actualizar(Number(req.params.id), req.body); res.json({ message: "OK" }); } catch (e: any) { res.status(500).json({ error: e.message }); } });
  apiRouter.delete("/productos/:id", authRequired, async (req, res) => { try { await service.productos.eliminar(Number(req.params.id)); res.json({ message: "OK" }); } catch (e: any) { res.status(500).json({ error: e.message }); } });

  apiRouter.get("/usuarios", authRequired, adminRequired, async (req, res) => { try { res.json(await service.usuarios.listar()); } catch (e: any) { res.status(500).json({ error: e.message }); } });

  // --- IMAGENES ---
  /**
   * @openapi
   * /api/productos/{pid}/imagenes:
   *   get:
   *     tags: [Catálogos]
   *     summary: Obtener imágenes de un producto
   *     parameters: [{ name: pid, in: path, required: true, schema: { type: integer } }]
   *     responses:
   *       200:
   *         description: OK
   * /api/imagenes_producto:
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
  apiRouter.get("/productos/:pid/imagenes", async (req, res) => { try { res.json(await service.imagenes.listar(Number(req.params.pid))); } catch (e: any) { res.status(500).json({ error: e.message }); } });
  apiRouter.post("/imagenes_producto", authRequired, async (req, res) => { try { const id = await service.imagenes.agregar(req.body.producto_id, req.body.url); res.status(201).json({ id }); } catch (e: any) { res.status(500).json({ error: e.message }); } });

  // --- COMPRAS ---
  /**
   * @openapi
   * /api/compras:
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
  apiRouter.get("/compras", authRequired, async (req, res) => { 
    try { 
      const user = (req as any).user;
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
  apiRouter.post("/compras", authRequired, async (req, res) => { try { const id = await service.compras.crear(req.body); res.status(201).json({ id }); } catch (e: any) { res.status(500).json({ error: e.message }); } });

  // --- MENSAJERÍA ---
  /**
   * @openapi
   * /api/conversaciones/{uid}:
   *   get:
   *     tags: [Mensajería]
   *     summary: Obtener conversaciones de un usuario
   *     security: [{ bearerAuth: [] }]
   *     parameters: [{ name: uid, in: path, required: true, schema: { type: integer } }]
   *     responses:
   *       200:
   *         description: OK
   * /api/conversaciones:
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
  apiRouter.get("/conversaciones/:uid", authRequired, async (req, res) => { try { res.json(await service.conversaciones.listar(Number(req.params.uid))); } catch (e: any) { res.status(500).json({ error: e.message }); } });
  apiRouter.post("/conversaciones", authRequired, async (req, res) => { try { const id = await service.conversaciones.crear(req.body); res.status(201).json({ id }); } catch (e: any) { res.status(500).json({ error: e.message }); } });

  /**
   * @openapi
   * /api/mensajes/{cid}:
   *   get:
   *     tags: [Mensajería]
   *     summary: Listar mensajes de una conversación
   *     security: [{ bearerAuth: [] }]
   *     parameters: [{ name: cid, in: path, required: true, schema: { type: integer } }]
   *     responses:
   *       200:
   *         description: OK
   * /api/mensajes:
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
  apiRouter.get("/mensajes/:cid", authRequired, async (req, res) => { try { res.json(await service.mensajes.listar(Number(req.params.cid))); } catch (e: any) { res.status(500).json({ error: e.message }); } });
  apiRouter.post("/mensajes", authRequired, async (req, res) => { try { const id = await service.mensajes.enviar(req.body); res.status(201).json({ id }); } catch (e: any) { res.status(500).json({ error: e.message }); } });

  // --- 3.5.3 MÓDULO DE REPORTES ---
  /**
   * @openapi
   * /api/reportes:
   *   get:
   *     tags: [3.5.3 Módulo Reportes]
   *     summary: Generar estadísticas del sistema
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200:
   *         description: OK
   */
  apiRouter.get("/reportes", authRequired, async (req, res) => { try { res.json(await service.reportes.generales()); } catch (e: any) { res.status(500).json({ error: e.message }); } });

  // --- 3.7 SEGURIDAD ---
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
   *               password: { type: string, example: "123456" }
   *     responses:
   *       200:
   *         description: Token generado
   */
  apiRouter.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log(`[LOGIN] Intentando entrar con: ${email}`);
      const user = await activeRepository.usuarios.getByEmail(email);
      if (user) {
        console.log(`[LOGIN] Usuario encontrado, verificando contraseña...`);
        let isMatch = false;
        try {
          isMatch = await bcrypt.compare(password, user.contrasena);
        } catch (err) {
          console.warn("[LOGIN] Error al comparar con bcrypt, intentando comparación directa.");
        }
        
        // Permitimos también comparación directa para facilitar pruebas con XAMPP/SQL manual
        if (isMatch || password === user.contrasena) {
          console.log(`[LOGIN] Éxito para ${email}`);
          const token = jwt.sign({ id: user.id, rol: user.rol }, SECRET_KEY, { expiresIn: '8h' });
          return res.json({ token, user: { id: user.id, nombre: user.nombre, rol: user.rol } });
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

  // Diagnóstico
  apiRouter.get("/ping", (req, res) => res.json({ status: "OK", server_time: new Date() }));

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
