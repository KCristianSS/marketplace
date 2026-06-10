<template>
  <div :class="{ 'dark': isDarkMode }" class="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 selection:bg-blue-100 transition-colors duration-300">
    <nav class="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 h-20 flex items-center px-4 lg:px-12 justify-between">
      <div class="flex items-center gap-4 lg:gap-8">
        <router-link to="/" class="text-xl lg:text-2xl font-black italic uppercase tracking-tighter hover:text-blue-600 transition-colors">
          Marketplace
        </router-link>
        
        <div class="hidden md:flex gap-4 lg:gap-6">
          <router-link to="/products" class="text-[10px] lg:text-xs font-bold hover:text-blue-600 transition-colors uppercase tracking-widest" active-class="text-blue-600">Productos</router-link>
          <router-link v-if="store.user?.rol === 'vendedor'" to="/my-products" class="text-[10px] lg:text-xs font-bold hover:text-blue-600 transition-colors uppercase tracking-widest" active-class="text-blue-600">Mis Ventas</router-link>
          <router-link v-if="store.user" to="/historial" class="text-[10px] lg:text-xs font-bold hover:text-blue-600 transition-colors uppercase tracking-widest" active-class="text-blue-600">Historial</router-link>
          <router-link v-if="store.user?.rol === 'admin'" to="/admin" class="text-[10px] lg:text-xs font-bold hover:text-blue-600 transition-colors uppercase tracking-widest" active-class="text-blue-600">Admin</router-link>
        </div>
      </div>

      <div class="flex items-center gap-3 lg:gap-6">
        <!-- Theme Toggle -->
        <button @click="toggleDarkMode" class="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all shadow-sm">
          <span v-if="isDarkMode">☀️</span>
          <span v-else>🌙</span>
        </button>

        <div v-if="store.user?.rol !== 'vendedor' && store.user?.rol !== 'admin'" class="relative group cursor-pointer" @click="isCartOpen = !isCartOpen">
          <div class="text-right hidden sm:block">
            <span class="text-[9px] font-mono uppercase opacity-50 block">Carrito</span>
            <span class="text-sm font-bold leading-none">{{ store.cart.length }}</span>
          </div>
          <div class="absolute -top-1 -right-2 bg-blue-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-neutral-900 shadow-sm" v-if="store.cart.length > 0">
            {{ store.cart.length }}
          </div>
          <div class="sm:hidden text-xl">🛒</div>
        </div>

        <router-link v-if="!store.user" to="/login" class="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 lg:px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-sm">
          Entrar
        </router-link>
        
        <div v-else class="flex items-center gap-3 pl-3 lg:pl-4 border-l border-neutral-200 dark:border-neutral-800">
          <div class="text-right hidden lg:block">
            <span class="text-[9px] font-mono uppercase opacity-50 block">Usuario</span>
            <span class="text-xs font-bold">{{ store.user.nombre }}</span>
          </div>
          <button @click="handleLogout" title="Cerrar sesión" class="w-8 lg:w-10 h-8 lg:h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold border-2 border-white dark:border-neutral-800 shadow-sm hover:scale-110 transition-transform">
            {{ store.user.nombre[0].toUpperCase() }}
          </button>
        </div>
      </div>
    </nav>

    <!-- Cart Sidebar Overlay -->
    <Transition name="fade">
      <div v-if="isCartOpen" class="fixed inset-0 z-[60] flex justify-end">
        <div class="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" @click="isCartOpen = false"></div>
        <div class="relative w-full max-w-md bg-white dark:bg-neutral-900 h-full shadow-2xl p-8 flex flex-col border-l border-neutral-200 dark:border-neutral-800">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-2xl font-black italic uppercase tracking-tighter dark:text-white">Tu Carrito</h2>
            <button @click="isCartOpen = false" class="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors p-2">✕</button>
          </div>
          
          <div class="flex-1 overflow-y-auto pr-4 -mr-4 space-y-6">
            <div v-for="(item, idx) in store.cart" :key="idx" class="flex gap-4 group">
               <div class="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-200 dark:border-neutral-700">
                 <img v-if="item.img_url" :src="item.img_url" class="w-full h-full object-cover" />
                 <div v-else class="w-full h-full flex items-center justify-center text-neutral-300">📦</div>
               </div>
               <div class="flex-1 min-w-0">
                 <h4 class="font-bold text-sm truncate uppercase tracking-tight dark:text-white">{{ item.titulo }}</h4>
                 <p class="text-sm font-mono text-blue-600">${{ item.precio }}</p>
                 <button @click="removeItem(idx)" class="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Remover</button>
               </div>
            </div>
            
            <div v-if="store.cart.length === 0" class="text-center py-20 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700">
              <p class="text-neutral-400 text-sm italic">Tu carrito está vacío.</p>
              <router-link to="/products" @click="isCartOpen = false" class="text-xs font-bold text-blue-600 uppercase tracking-widest mt-4 inline-block hover:underline">Ir a comprar</router-link>
            </div>
          </div>

          <div class="pt-8 border-t border-neutral-200 dark:border-neutral-800 mt-8">
            <div class="flex justify-between items-end mb-6">
              <span class="text-xs font-mono uppercase opacity-50 tracking-widest dark:text-neutral-400">Total a pagar</span>
              <div class="text-right">
                <span class="text-xs font-mono text-neutral-400 block mb-1">Estimado</span>
                <span class="text-4xl font-black tracking-tighter dark:text-white">${{ cartTotal.toFixed(2) }}</span>
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
const isDarkMode = ref(localStorage.getItem('theme') === 'dark');

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Apply on mount
import { onMounted } from 'vue';
onMounted(() => {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});

const handleLogout = () => {
  if (confirm("¿Cerrar sesión?")) {
    store.user = null;
    localStorage.removeItem('token');
    window.location.href = '/';
  }
};

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
    alert("¡Pedido finalizado con éxito! El stock se ha actualizado correctamente.");
    store.cart = [];
    isCartOpen.value = false;
    setTimeout(() => {
      window.location.reload();
    }, 100);
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
