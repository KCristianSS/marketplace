<template>
  <div class="group bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
    <div class="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
      <!-- Image or Placeholder -->
      <img 
        v-if="imageUrl" 
        :src="imageUrl" 
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
      />
      <div v-else class="w-full h-full flex items-center justify-center text-neutral-300">
        <Package :size="48" stroke-width="1" />
      </div>

      <!-- Category Tag -->
      <div class="absolute top-3 left-3">
        <span class="bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-neutral-900 border border-neutral-100 shadow-sm">
          {{ categoryName }}
        </span>
      </div>

      <!-- Quick Add Overlay (Optional, but looks nice) -->
      <div class="absolute inset-0 bg-neutral-900/0 group-hover:bg-neutral-900/10 transition-colors pointer-events-none"></div>
    </div>

    <div class="p-5 flex flex-col flex-1">
      <div class="flex justify-between items-start mb-2 gap-4">
        <h3 class="font-bold text-neutral-900 line-clamp-1 uppercase tracking-tight text-sm flex-1">{{ product.titulo }}</h3>
        <span class="font-mono text-blue-600 font-bold tracking-tight">${{ product.precio }}</span>
      </div>
      
      <p class="text-neutral-500 text-xs mb-4 line-clamp-2 h-8 leading-relaxed italic">{{ product.descripcion }}</p>
      
      <div class="mt-auto pt-4 border-t border-neutral-50 flex items-center justify-between">
        <div class="flex items-center gap-1 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            <span class="text-blue-500">📍</span> {{ product.ubicacion || 'Online' }}
        </div>
        
        <button 
          v-if="store.user?.rol !== 'vendedor'"
          @click.stop="$emit('add-to-cart', product)"
          class="bg-neutral-900 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-blue-600 hover:scale-110 active:scale-95 transition-all shadow-md"
          title="Añadir al carrito"
        >
          <Plus :size="18" stroke-width="3" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Package, Plus } from 'lucide-vue-next';
import axios from 'axios';
import { useAppStore } from '../store';

const store = useAppStore();

const props = defineProps<{
  product: any,
  categories: any[]
}>();

defineEmits(['add-to-cart']);

// En lugar de Fetch individual, usamos la img_url que ya viene en el objeto producto o el fetch de respaldo
const imageUrl = computed(() => {
  return props.product.img_url || backupImageUrl.value;
});

const backupImageUrl = ref('');

const categoryName = computed(() => {
  const cat = props.categories.find(c => c.id === props.product.categoria_id);
  return cat ? cat.nombre : 'General';
});

onMounted(async () => {
    // Si no tiene img_url directa, intentamos buscar en la tabla de imágenes
    if (!props.product.img_url) {
        try {
            const res = await axios.get(`/productos/${props.product.id}/imagenes`);
            if (res.data && res.data.length > 0) {
                backupImageUrl.value = res.data[0].url;
            }
        } catch (e) {
            console.warn("No images found for product", props.product.id);
        }
    }
});
</script>
