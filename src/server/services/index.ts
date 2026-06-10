import { db, pool } from "../repositories/ActiveRepository.ts";

export const service = {
  usuarios: {
    listar: () => db.usuarios.getAll(),
    obtener: (id: number) => db.usuarios.getById(id),
    buscarPorEmail: (correo: string) => db.usuarios.getByEmail(correo),
    registrar: async (data: any) => {
      const existente = await db.usuarios.getByEmail(data.correo);
      if (existente) throw new Error("Correo ya registrado");
      return await db.usuarios.create(data);
    },
    actualizar: (id: number, data: any) => db.usuarios.update(id, data),
    eliminar: (id: number) => db.usuarios.delete(id)
  },
  categorias: {
    listar: () => db.categorias.getAll(),
    crear: (nombre: string) => db.categorias.create(nombre),
    actualizar: (id: number, n: string) => db.categorias.update(id, n),
    eliminar: (id: number) => db.categorias.delete(id)
  },
  productos: {
    listar: () => db.productos.getAll(),
    obtener: (id: number) => db.productos.getById(id),
    crear: async (data: any) => {
      const { imagenes, ...prodData } = data;
      const id = await db.productos.create(prodData);
      if (imagenes && Array.isArray(imagenes)) {
        for (const url of imagenes) {
          if (url && url.trim()) {
            await db.imagenes_producto.add(id, url.trim());
          }
        }
      }
      return id;
    },
    actualizar: async (id: number, data: any) => {
      const { imagenes, ...prodData } = data;
      await db.productos.update(id, prodData);
      if (imagenes && Array.isArray(imagenes)) {
        await pool.execute("DELETE FROM imagenes_producto WHERE producto_id = ?", [id]);
        for (const url of imagenes) {
          if (url && url.trim()) {
            await db.imagenes_producto.add(id, url.trim());
          }
        }
      }
    },
    eliminar: (id: number) => db.productos.delete(id)
  },
  imagenes: {
    listar: (pid: number) => db.imagenes_producto?.getByProducto(pid) || [],
    agregar: (pid: number, url: string) => db.imagenes_producto?.add(pid, url),
    eliminar: (id: number) => db.imagenes_producto?.delete(id)
  },
  favoritos: {
    listar: (uid: number) => db.favoritos?.getByUsuario(uid) || [],
    agregar: (uid: number, pid: number) => db.favoritos?.add(uid, pid),
    quitar: (uid: number, pid: number) => db.favoritos?.remove(uid, pid)
  },
  conversaciones: {
    listar: (uid: number) => db.conversaciones?.getAll(uid) || [],
    crear: (data: any) => db.conversaciones?.create(data)
  },
  mensajes: {
    listar: (cid: number) => db.mensajes?.getByConversacion(cid) || [],
    enviar: (data: any) => db.mensajes?.send(data),
    eliminar: (id: number) => db.mensajes?.delete(id)
  },
  compras: {
    listar: () => db.compras?.getAll() || [],
    obtenerPorComprador: (uid: number) => db.compras?.getByComprador(uid) || [],
    obtenerPorVendedor: (uid: number) => db.compras?.getByVendedor(uid) || [],
    crear: async (data: any) => {
      const product = await service.productos.obtener(Number(data.producto_id));
      if (!product) {
        throw new Error("Producto no encontrado");
      }
      
      const stock = product.cantidad !== undefined ? Number(product.cantidad) : 0;
      if (stock <= 0) {
        throw new Error(`El producto "${product.titulo}" se encuentra agotado (sin stock disponible).`);
      }

      const insertId = await db.compras?.create(data);
      await pool.execute("UPDATE productos SET cantidad = cantidad - 1 WHERE id = ? AND cantidad > 0", [data.producto_id]);

      return insertId;
    },
    actualizarEstado: (id: number, e: string) => db.compras?.updateEstado(id, e)
  },
  reportes: {
    generales: () => db.reportes.getStats()
  }
};
