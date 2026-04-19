<template>
  <div>
    <div className="flex justify-between items-center mb-8">
      <div>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">Marketplace Pro</h2>
        <p className="text-gray-500">Explora la versión académica de compra/venta.</p>
      </div>
      <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
        {{ products.length }} Productos encontrados
      </div>
    </div>

    <div v-if="loading" className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div v-for="i in 4" :key="i" className="h-64 bg-gray-200 animate-pulse rounded-2xl"></div>
    </div>
    
    <div v-else className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <ProductCard 
        v-for="product in products" 
        :key="product.id" 
        :product="product"
        @add-to-cart="handleAddToCart"
      />
    </div>

    <div v-if="!loading && products.length === 0" className="text-center py-20 bg-white rounded-3xl border border-dashed">
      <p className="text-gray-400 italic">No se encontraron productos en la base de datos MySQL.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import ProductCard from '../components/ProductCard.vue';
import { useAppStore } from '../store';

const store = useAppStore();
const products = ref([]);
const loading = ref(true);

const handleAddToCart = (product: any) => {
  store.addToCart(product);
  alert(`${product.titulo} añadido al carrito.`);
};

onMounted(async () => {
  try {
    const response = await axios.get('/productos');
    products.value = response.data;
  } catch (e) {
    console.error("Error al conectar con la API:", e);
  } finally {
    loading.value = false;
  }
});
</script>
