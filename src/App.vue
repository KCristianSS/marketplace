<template>
  <div class="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-blue-100">
    <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200 h-20 flex items-center px-6 lg:px-12 justify-between">
      <div class="flex items-center gap-8">
        <router-link to="/" class="text-2xl font-black italic uppercase tracking-tighter hover:text-blue-600 transition-colors">
          Marketplace
        </router-link>
        
        <div class="hidden md:flex gap-6">
          <router-link to="/products" class="text-sm font-medium hover:text-blue-600 transition-colors uppercase tracking-widest" active-class="text-blue-600">Productos</router-link>
          <router-link v-if="store.user?.rol === 'vendedor'" to="/my-products" class="text-sm font-medium hover:text-blue-600 transition-colors uppercase tracking-widest" active-class="text-blue-600">Mis Ventas</router-link>
        </div>
      </div>

      <div class="flex items-center gap-6">
        <div v-if="store.user?.rol !== 'vendedor'" class="relative group cursor-pointer" @click="isCartOpen = !isCartOpen">
          <div class="text-right">
            <span class="text-[10px] font-mono uppercase opacity-50 block">Carrito</span>
            <span class="text-lg font-bold leading-none">{{ store.cart.length }} items</span>
          </div>
          <div class="absolute -top-1 -right-4 bg-blue-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm" v-if="store.cart.length > 0">
            {{ store.cart.length }}
          </div>
        </div>

        <router-link v-if="!store.user" to="/login" class="bg-neutral-900 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-sm">
          Entrar
        </router-link>
        <div v-else class="flex items-center gap-3 pl-4 border-l border-neutral-200">
          <div class="text-right hidden sm:block">
            <span class="text-[10px] font-mono uppercase opacity-50 block">Usuario</span>
            <span class="text-sm font-bold text-neutral-700">{{ store.user.nombre }}</span>
          </div>
          <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
            {{ store.user.nombre[0] }}
          </div>
        </div>
      </div>
    </nav>

    <!-- Cart Sidebar Overlay -->
    <Transition name="fade">
      <div v-if="isCartOpen" class="fixed inset-0 z-[60] flex justify-end">
        <div class="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" @click="isCartOpen = false"></div>
        <div class="relative w-full max-w-md bg-white h-full shadow-2xl p-8 flex flex-col">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-2xl font-black italic uppercase tracking-tighter">Tu Carrito</h2>
            <button @click="isCartOpen = false" class="text-neutral-400 hover:text-neutral-900 transition-colors p-2">✕</button>
          </div>
          
          <div class="flex-1 overflow-y-auto pr-4 -mr-4 space-y-6">
            <div v-for="(item, idx) in store.cart" :key="idx" class="flex gap-4 group">
               <div class="w-16 h-16 bg-neutral-100 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-200">
                 <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
                 <div v-else class="w-full h-full flex items-center justify-center text-neutral-300">📦</div>
               </div>
               <div class="flex-1 min-w-0">
                 <h4 class="font-bold text-sm truncate uppercase tracking-tight">{{ item.titulo }}</h4>
                 <p class="text-sm font-mono text-blue-600">${{ item.precio }}</p>
                 <button @click="removeItem(idx)" class="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Remover</button>
               </div>
            </div>
            
            <div v-if="store.cart.length === 0" class="text-center py-20 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
              <p class="text-neutral-400 text-sm italic">Tu carrito está vacío.</p>
              <router-link to="/products" @click="isCartOpen = false" class="text-xs font-bold text-blue-600 uppercase tracking-widest mt-4 inline-block hover:underline">Ir a comprar</router-link>
            </div>
          </div>

          <div class="pt-8 border-t border-neutral-200 mt-8">
            <div class="flex justify-between items-end mb-6">
              <span class="text-xs font-mono uppercase opacity-50 tracking-widest">Total a pagar</span>
              <div class="text-right">
                <span class="text-xs font-mono text-neutral-400 block mb-1">Estimado</span>
                <span class="text-4xl font-black tracking-tighter">${{ cartTotal.toFixed(2) }}</span>
              </div>
            </div>
            <button 
              @click="handleCheckout"
              class="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-neutral-900 transition-all shadow-xl disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none translate-y-0 active:translate-y-1" 
              :disabled="store.cart.length === 0">
              Finalizar Pedido
            </button>
            <p class="text-[10px] text-center text-neutral-400 uppercase tracking-widest mt-4">Transacción segura de prueba</p>
          </div>
        </div>
      </div>
    </Transition>

    <main class="min-h-[calc(100vh-5rem)] container mx-auto p-6 md:p-12">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAppStore } from './store';
import axios from 'axios';

const store = useAppStore();
const isCartOpen = ref(false);

const cartTotal = computed(() => {
  return store.cart.reduce((acc, item) => acc + Number(item.precio), 0);
});

const removeItem = (idx: number) => {
  store.cart.splice(idx, 1);
};

const handleCheckout = async () => {
  if (!store.user) {
    alert("Debes iniciar sesión para finalizar tu pedido.");
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    alert("Sesión expirada. Por favor, vuelve a iniciar sesión.");
    return;
  }

  try {
    const promises = store.cart.map(item => {
      // Validamos que el producto tenga los datos necesarios
      if (!item.id || !item.vendedor_id) {
        console.error("Producto incompleto:", item);
        throw new Error(`El producto "${item.titulo}" no tiene vendedor asignado.`);
      }

      return axios.post('/compras', {
        producto_id: item.id,
        comprador_id: store.user.id,
        vendedor_id: item.vendedor_id,
        precio: item.precio,
        estado: 'pendiente'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    });

    await Promise.all(promises);
    alert("¡Pedido finalizado con éxito! Los datos se han guardado en la base de datos.");
    store.cart = [];
    isCartOpen.value = false;
  } catch (e: any) {
    console.error("Error detallado de la compra:", e);
    const mensajeError = e.response?.data?.error || e.message || "Error desconocido";
    const status = e.response?.status || "Red";
    
    alert(`Error al procesar el pedido (${status}): ${mensajeError}\n\nVerifica que estés logueado correctamente.`);
  }
};
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

h1, h2, h3 {
  font-family: 'Inter', sans-serif;
}

/* Custom scrollbar for cart */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #e5e5e5;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #d4d4d4;
}
</style>
