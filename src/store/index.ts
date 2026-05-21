import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    user: null as any,
    cart: [] as any[],
  }),
  actions: {
    addToCart(product: any) {
      if (product.estado === 'no disponible') {
        alert("Este producto no está disponible para compra.");
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
