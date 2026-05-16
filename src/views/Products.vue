<template>
  <div class="space-y-12">
    <!-- Hero / Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-12 border-b border-neutral-200 dark:border-neutral-800">
      <div class="max-w-2xl">
        <h2 class="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-none mb-4 dark:text-white">
          Nuestro <span class="text-blue-600">Catálogo</span>
        </h2>
        <p class="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed max-w-lg font-medium">
          Explora nuestra selección de productos disponibles. Utiliza los filtros para encontrar lo que necesitas.
        </p>
      </div>
      
      <div class="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
        <label class="text-[10px] font-mono uppercase opacity-50 tracking-widest dark:text-neutral-500">Búsqueda rápida</label>
        <div class="relative w-full md:w-80">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="¿Qué estás buscando?" 
            class="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-6 py-4 rounded-full text-sm focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-sm dark:text-white"
          />
          <Search class="absolute right-6 top-4 text-neutral-300 dark:text-neutral-600" :size="20" />
        </div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-12">
      <!-- Sidebar Filters -->
      <aside class="w-full lg:w-64 space-y-10 flex-shrink-0">
        <div>
          <h4 class="text-[10px] font-bold uppercase tracking-widest mb-6 pb-2 border-b border-neutral-100 dark:border-neutral-800 text-neutral-400">Categorías</h4>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-3">
            <button 
              @click="selectedCategory = null"
              :class="[
                'w-full text-left px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all transform active:scale-95',
                selectedCategory === null 
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xl' 
                  : 'bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:shadow-md'
              ]"
            >
              Todos
            </button>
            <button 
              v-for="cat in categories" 
              :key="cat.id"
              @click="selectedCategory = cat.id"
              :class="[
                'w-full text-left px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all transform active:scale-95',
                selectedCategory === cat.id 
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xl' 
                  : 'bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:shadow-md'
              ]"
            >
              {{ cat.nombre }}
            </button>
          </div>
        </div>
      </aside>

      <!-- Products Grid -->
      <div class="flex-1">
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <div v-for="i in 6" :key="i" class="h-96 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 rounded-[32px] animate-pulse"></div>
        </div>
        
        <div v-else-if="filteredProducts.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <ProductCard 
            v-for="product in filteredProducts" 
            :key="product.id" 
            :product="product"
            :categories="categories"
            @add-to-cart="handleAddToCart"
          />
        </div>

        <div v-else class="text-center py-32 bg-white dark:bg-neutral-800/30 rounded-[40px] border border-dashed border-neutral-200 dark:border-neutral-700">
          <div class="w-20 h-20 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search class="text-neutral-200 dark:text-neutral-700" :size="40" stroke-width="1" />
          </div>
          <h3 class="text-xl font-black italic uppercase tracking-tighter text-neutral-900 dark:text-white">Sin resultados</h3>
          <p class="text-neutral-400 text-sm mt-2 font-medium">No hay productos que coincidan con tu búsqueda.</p>
          <button @click="resetFilters" class="mt-8 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Limpiar filtros</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { Search } from 'lucide-vue-next';
import ProductCard from '../components/ProductCard.vue';
import { useAppStore } from '../store';

const store = useAppStore();
const products = ref<any[]>([]);
const categories = ref<any[]>([]);
const loading = ref(true);

const searchQuery = ref('');
const selectedCategory = ref<number | null>(null);

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const query = searchQuery.value.toLowerCase().trim();
    if (!query) return selectedCategory.value === null || p.categoria_id === selectedCategory.value;

    // Lógica: La búsqueda debe coincidir con el inicio de alguna palabra del título
    const words = p.titulo.toLowerCase().split(' ');
    const matchesSearch = words.some(word => word.startsWith(query));
    
    const matchesCategory = selectedCategory.value === null || p.categoria_id === selectedCategory.value;
    return matchesSearch && matchesCategory;
  });
});

const handleAddToCart = (product: any) => {
  store.addToCart(product);
};

const resetFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = null;
};

onMounted(async () => {
  try {
    const [prodRes, catRes] = await Promise.all([
      axios.get('/productos'),
      axios.get('/categorias')
    ]);
    products.value = prodRes.data;
    categories.value = catRes.data;
  } catch (e) {
    console.error("Error al conectar con la API:", e);
  } finally {
    loading.value = false;
  }
});
</script>
