import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    user: null as any,
    cart: [] as any[],
  }),
  actions: {
    addToCart(product: any) {
      this.cart.push(product);
    },
    setUser(user: any) {
      this.user = user;
    }
  }
});
