import pool from "../../config/db.ts";
import bcrypt from "bcryptjs";

export const mysqlRepository = {
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
      const [rows] = await pool.query(`
        SELECT p.*, u.nombre as vendedor_nombre, u.telefono as vendedor_telefono, c.nombre as categoria_nombre 
        FROM productos p 
        LEFT JOIN usuarios u ON p.vendedor_id = u.id 
        LEFT JOIN categorias c ON p.categoria_id = c.id
        ORDER BY p.id DESC
      `);
      return rows;
    },
    getById: async (id: number) => {
      const [rows] = await pool.query(`
        SELECT p.*, u.nombre as vendedor_nombre, u.telefono as vendedor_telefono, u.fecha_creacion as vendedor_fecha_creacion, c.nombre as categoria_nombre 
        FROM productos p 
        LEFT JOIN usuarios u ON p.vendedor_id = u.id 
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.id = ?
      `, [id]);
      return (rows as any[])[0] || null;
    },
    create: async (p: any) => {
      const [result]: any = await pool.execute(
        "INSERT INTO productos (titulo, descripcion, precio, vendedor_id, categoria_id, cantidad, ubicacion, img_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [p.titulo, p.descripcion || null, p.precio, p.vendedor_id, p.categoria_id, p.cantidad !== undefined ? p.cantidad : 1, p.ubicacion || null, p.img_url || null]
      );
      return result.insertId;
    },
    update: async (id: number, p: any) => {
      await pool.execute(
        "UPDATE productos SET titulo = ?, descripcion = ?, precio = ?, vendedor_id = ?, categoria_id = ?, cantidad = ?, ubicacion = ?, img_url = ? WHERE id = ?",
        [p.titulo, p.descripcion || null, p.precio, p.vendedor_id, p.categoria_id, p.cantidad !== undefined ? p.cantidad : 1, p.ubicacion || null, p.img_url || null, id]
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
