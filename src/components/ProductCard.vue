<template>
  <div className="bg-white rounded-2xl p-4 shadow-sm border hover:shadow-md transition cursor-pointer">
    <div className="aspect-square bg-gray-100 rounded-xl mb-4 flex items-center justify-center text-gray-300">
      <Package size={48} />
    </div>
    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{{ product.titulo }}</h3>
    <p className="text-gray-500 text-xs mb-3 line-clamp-2 h-8">{{ product.descripcion }}</p>
    <div className="flex items-center justify-between">
      <span className="font-black text-blue-600">${{ product.precio }}</span>
      <button 
        @click.stop="$emit('add-to-cart', product)"
        className="bg-black text-white p-2 rounded-lg hover:bg-gray-800"
      >
        <Plus size={18} />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Package, Plus } from 'lucide-vue-next';

defineProps<{
  product: any
}>();

defineEmits(['add-to-cart']);
</script>
