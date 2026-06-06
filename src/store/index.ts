import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    user: null as any,
    cart: [] as any[],
  }),
  actions: {
    addToCart(product: any) {
      const stock = product.cantidad !== undefined ? Number(product.cantidad) : 0;
      if (stock <= 0) {
        alert("Este producto no está disponible para compra (sin stock).");
        return;
      }
      const countInCart = this.cart.filter((item: any) => item.id === product.id).length;
      if (countInCart >= stock) {
        alert(`No puedes agregar más unidades de este producto. El stock disponible es ${stock}.`);
        return;
      }
      this.cart.push(product);
      alert("Producto añadido al carrito");
    },
    setUser(user: any) {
      this.user = user;
    }
  }
});
