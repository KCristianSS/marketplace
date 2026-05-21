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
        <div 
          class="aspect-square bg-white dark:bg-neutral-800 rounded-[40px] overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-2xl relative group/carousel cursor-zoom-in"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
          @mousemove="handleMouseMove"
        >
          <img 
            :src="activeImage" 
            :style="zoomStyle"
            class="w-full h-full object-cover transition-transform duration-100 ease-out" 
          />

          <!-- Left Arrow (Prev) -->
          <button 
            v-if="images.length > 1"
            type="button"
            @click.stop="prevImage"
            class="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 flex items-center justify-center shadow-lg cursor-pointer transform hover:scale-115 active:scale-90 z-20"
            title="Imagen Anterior"
          >
            <span class="text-lg font-bold leading-none select-none">&#10094;</span>
          </button>

          <!-- Right Arrow (Next) -->
          <button 
            v-if="images.length > 1"
            type="button"
            @click.stop="nextImage"
            class="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 flex items-center justify-center shadow-lg cursor-pointer transform hover:scale-115 active:scale-90 z-20"
            title="Imagen Siguiente"
          >
            <span class="text-lg font-bold leading-none select-none">&#10095;</span>
          </button>

          <!-- Badges Overlay -->
          <div class="absolute top-6 left-6 pointer-events-none z-10 transition-all">
            <span 
              :class="product.estado === 'disponible' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'"
              class="backdrop-blur px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md"
            >
              {{ product.estado }}
            </span>
          </div>

          <!-- Dot Indicators indexer -->
          <div v-if="images.length > 1" class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20 pointer-events-none bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-xs">
            <span 
              v-for="(img, idx) in images" 
              :key="idx"
              class="w-2 h-2 rounded-full transition-all duration-350"
              :class="activeImageIndex === idx ? 'bg-white scale-125' : 'bg-white/40'"
            ></span>
          </div>
        </div>

        <!-- Thumbnails list -->
        <div v-if="images.length > 1" class="flex gap-4 overflow-x-auto pb-2 scrollbar-none justify-center">
          <button 
            v-for="(img, idx) in images" 
            :key="idx"
            @click="activeImageIndex = idx"
            class="w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0 relative"
            :class="activeImageIndex === idx ? 'border-blue-600 scale-105 shadow-md' : 'border-transparent hover:border-neutral-300'"
          >
            <img :src="img" class="w-full h-full object-cover" />
            <div v-if="activeImageIndex !== idx" class="absolute inset-0 bg-black/5 hover:bg-transparent transition-all"></div>
          </button>
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
               <span class="font-bold italic text-sm">{{ product.ubicacion || 'Internacional' }}</span>
             </div>
           </div>

           <!-- Add to Cart or Unavailable display -->
           <template v-if="store.user?.rol !== 'vendedor' && store.user?.rol !== 'admin'">
             <button 
               v-if="product.estado === 'disponible'"
               @click="addToCart"
               class="w-full bg-blue-600 dark:bg-blue-600 text-white dark:text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3 cursor-pointer">
               <span class="text-xl leading-none font-bold">🛍️</span> Añadir al Carrito
             </button>
             <button 
               v-else
               disabled
               class="w-full bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 py-5 rounded-2xl font-black uppercase tracking-widest transition-all cursor-not-allowed flex items-center justify-center gap-3">
               <span class="text-xl leading-none">🚫</span> Producto no disponible / Agotado
             </button>
           </template>
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
              <p class="text-xs text-neutral-400 dark:text-neutral-500 font-mono uppercase mt-2">
                Miembro desde: <span class="text-neutral-600 dark:text-neutral-200 font-bold ml-1">{{ formatMemberDate(product.vendedor_fecha_creacion) }}</span>
              </p>
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
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '../store';
import axios from 'axios';

const route = useRoute();
const store = useAppStore();
const product = ref<any>(null);
const loading = ref(true);

const images = ref<string[]>([]);
const activeImageIndex = ref(0);
const activeImage = computed(() => {
  return images.value[activeImageIndex.value] || product.value?.img_url;
});

// Hover Zoom lens logic
const isZoomed = ref(false);
const zoomStyle = ref<any>({
  transformOrigin: 'center center',
  transform: 'scale(1)'
});

const handleMouseEnter = () => {
  isZoomed.value = true;
};

const handleMouseLeave = () => {
  isZoomed.value = false;
  zoomStyle.value = {
    transformOrigin: 'center center',
    transform: 'scale(1)'
  };
};

const handleMouseMove = (e: MouseEvent) => {
  const container = e.currentTarget as HTMLElement;
  const rect = container.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const xPercent = (x / rect.width) * 100;
  const yPercent = (y / rect.height) * 100;
  
  zoomStyle.value = {
    transformOrigin: `${xPercent}% ${yPercent}%`,
    transform: 'scale(2.2)' // 2.2x magnifier zoom level
  };
};

const prevImage = () => {
  if (images.value.length <= 1) return;
  activeImageIndex.value = (activeImageIndex.value - 1 + images.value.length) % images.value.length;
};

const nextImage = () => {
  if (images.value.length <= 1) return;
  activeImageIndex.value = (activeImageIndex.value + 1) % images.value.length;
};

const addToCart = () => {
  store.addToCart(product.value);
};

const formatMemberDate = (dateStr: string) => {
  if (!dateStr) return 'Abril 2026';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  try {
    return new Date(dateStr).toLocaleDateString('es-ES', options);
  } catch (err) {
    return dateStr;
  }
};

onMounted(async () => {
  try {
    const res = await axios.get(`/productos/${route.params.id}`);
    product.value = res.data;

    // Fetch additionals too
    const imagesRes = await axios.get(`/productos/${route.params.id}/imagenes`);
    const additionals = (imagesRes.data || []).map((img: any) => img.url);

    const list = [product.value.img_url, ...additionals].filter(u => u && u.trim() !== '');
    images.value = [...new Set(list)];
  } catch (e) {
    console.error("Error al cargar producto:", e);
  } finally {
    loading.value = false;
  }
});
</script>
