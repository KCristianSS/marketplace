<template>
  <div v-if="loading" class="animate-pulse space-y-8">
    <div class="h-96 bg-neutral-200 dark:bg-neutral-800 rounded-[40px]"></div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div class="space-y-4">
        <div class="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-xl w-3/4"></div>
        <div class="h-20 bg-neutral-200 dark:bg-neutral-800 rounded-xl"></div>
      </div>
      <div class="h-40 bg-neutral-200 dark:bg-neutral-800 rounded-xl"></div>
    </div>
  </div>

  <div v-else-if="product" class="space-y-12 pb-20">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
      <!-- Image Gallery section -->
      <div class="space-y-6">
        <div class="aspect-square bg-white dark:bg-neutral-800 rounded-[40px] overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-2xl relative group">
          <img :src="product.img_url" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div class="absolute top-6 left-6">
            <span class="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                {{ product.estado }}
            </span>
          </div>
        </div>
      </div>

      <!-- Info section -->
      <div class="flex flex-col">
        <div class="mb-8">
          <div class="flex items-center gap-2 mb-4">
            <span v-if="product.categoria_nombre" class="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">Categoría: {{ product.categoria_nombre }}</span>
            <span v-else class="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">Categoría ID: {{ product.categoria_id }}</span>
          </div>
          <h1 class="text-5xl font-black italic uppercase tracking-tighter text-neutral-900 dark:text-white leading-none mb-6">
            {{ product.titulo }}
          </h1>
          <p class="text-xl font-medium text-neutral-500 dark:text-neutral-400 italic leading-relaxed">
            {{ product.descripcion }}
          </p>
        </div>

        <div class="bg-neutral-900 dark:bg-white p-8 rounded-[32px] text-white dark:text-neutral-900 mb-8 border border-white/10 dark:border-neutral-200 shadow-xl">
           <div class="flex justify-between items-end mb-8">
             <div>
               <span class="text-[10px] font-mono opacity-50 uppercase tracking-widest block mb-2">Precio de lista</span>
               <span class="text-6xl font-black tracking-tighter">${{ product.precio }}</span>
             </div>
             <div class="text-right">
               <span class="text-[10px] font-mono opacity-50 uppercase tracking-widest block mb-1">Ubicación</span>
               <span class="font-bold italic">{{ product.ubicacion || 'Internacional' }}</span>
             </div>
           </div>

           <button 
             v-if="store.user?.rol !== 'vendedor' && store.user?.rol !== 'admin'"
             @click="addToCart"
             class="w-full bg-blue-600 dark:bg-blue-600 text-white dark:text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3">
             <span class="text-xl leading-none">🛍️</span> Añadir al Carrito
           </button>
           <p v-else-if="store.user?.rol === 'admin'" class="text-center text-xs font-bold uppercase tracking-widest opacity-50 italic">Modo Vista de Admin</p>
           <p v-else class="text-center text-xs font-bold uppercase tracking-widest opacity-50 italic">Modo Vista de Vendedor</p>
        </div>

        <!-- Vendedor Info -->
        <div class="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-8 rounded-[32px] shadow-sm">
          <h3 class="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-6">Información del Vendedor</h3>
          <div class="flex items-center gap-6">
            <div class="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-3xl">👤</div>
            <div>
              <p class="text-xl font-bold text-neutral-900 dark:text-white uppercase italic tracking-tight">{{ product.vendedor_nombre || 'Vendedor Anónimo' }}</p>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 font-medium">📞 {{ product.vendedor_telefono || 'No disponible' }}</p>
              <div class="flex gap-1 mt-2">
                <span v-for="i in 5" :key="i" class="text-amber-400 text-xs text-shadow">★</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-40">
    <h2 class="text-3xl font-black uppercase italic text-neutral-400">Producto no encontrado</h2>
    <router-link to="/products" class="text-blue-600 hover:underline font-bold mt-4 inline-block tracking-widest text-xs uppercase">Volver al catálogo</router-link>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '../store';
import axios from 'axios';

const route = useRoute();
const store = useAppStore();
const product = ref<any>(null);
const loading = ref(true);

const addToCart = () => {
  store.cart.push({ ...product.value });
  alert("Producto añadido al carrito");
};

onMounted(async () => {
  try {
    const res = await axios.get(`/productos/${route.params.id}`);
    product.value = res.data;
  } catch (e) {
    console.error("Error al cargar producto:", e);
  } finally {
    loading.value = false;
  }
});
</script>
