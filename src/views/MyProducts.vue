<template>
  <div class="space-y-10">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-8 border-b border-neutral-200 dark:border-neutral-800">
      <div>
        <h2 class="text-4xl font-black italic uppercase tracking-tighter text-neutral-900 dark:text-white">Mis Ventas</h2>
        <p class="text-neutral-500 dark:text-neutral-400 text-sm mt-2 font-medium">Gestiona tus productos publicados y ventas realizadas.</p>
      </div>
      <button 
        @click="showForm = !showForm"
        class="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-neutral-900 dark:hover:bg-white dark:hover:text-neutral-900 transition-all shadow-lg active:scale-95"
      >
        {{ showForm ? 'Cancelar' : 'Publicar Producto' }}
      </button>
    </div>

    <!-- Formulario de Publicación / Edición -->
    <div v-if="showForm" class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[40px] p-8 lg:p-12 max-w-2xl mx-auto shadow-2xl relative overflow-hidden transition-all duration-500">
      <div class="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
      <h3 class="text-2xl font-black italic uppercase tracking-tight mb-8 dark:text-white">
        {{ isEditing ? 'Editar Producto' : 'Publicar Nuevo' }}
      </h3>
      <form @submit.prevent="saveProduct" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">Título del anuncio</label>
            <input v-model="newProduct.titulo" type="text" class="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all dark:text-white" required />
          </div>
          <div>
            <label class="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">Precio ($)</label>
            <input v-model.number="newProduct.precio" type="number" step="0.01" class="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all dark:text-white" required />
          </div>
        </div>
        <div>
          <label class="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">Descripción detallada</label>
          <textarea v-model="newProduct.descripcion" rows="4" class="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all dark:text-white" placeholder="Describe las características principales..."></textarea>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">Categoría</label>
            <select v-model="newProduct.categoria_id" class="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all dark:text-white">
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">URL de la imagen</label>
            <input v-model="newProduct.img_url" type="url" class="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all dark:text-white" placeholder="https://unsplash.com/..." />
          </div>
        </div>
        <button type="submit" class="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-black py-5 rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-600 dark:hover:text-white transition-all uppercase tracking-[0.2em] text-[10px] shadow-xl mt-4">
          {{ isEditing ? 'Actualizar Producto' : 'Publicar Ahora' }}
        </button>
      </form>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="i in 3" :key="i" class="h-80 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 rounded-[32px] animate-pulse"></div>
    </div>

    <div v-else-if="myProducts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="product in myProducts" :key="product.id" class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[32px] p-6 hover:shadow-2xl transition-all group flex flex-col transform hover:-translate-y-1">
        <div v-if="product.img_url" class="aspect-[16/10] mb-6 overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800">
          <img :src="product.img_url" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        </div>
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="font-bold text-neutral-900 dark:text-white uppercase tracking-tighter text-xl leading-none mb-1">{{ product.titulo }}</h3>
            <span class="text-[9px] font-black bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full uppercase tracking-widest">{{ product.estado }}</span>
          </div>
          <span class="font-bold text-blue-600 tracking-tighter text-xl leading-none">${{ product.precio }}</span>
        </div>
        <p class="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-8 italic font-medium">{{ product.descripcion }}</p>
        <div class="flex gap-3 mt-auto">
          <button @click="editProduct(product)" class="flex-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all active:scale-95">Editar</button>
          <button @click="deleteProduct(product.id)" class="flex-1 bg-red-50 dark:bg-red-900/20 text-red-500 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-sm">Eliminar</button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20 bg-neutral-50 rounded-[40px] border border-dashed border-neutral-200">
      <p class="text-neutral-400 text-sm font-medium italic">No tienes productos publicados todavía.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAppStore } from '../store';
import { useRouter } from 'vue-router';

const store = useAppStore();
const router = useRouter();
const myProducts = ref<any[]>([]);
const categories = ref<any[]>([]);
const loading = ref(true);
const showForm = ref(false);
const isEditing = ref(false);
const editingId = ref<number | null>(null);

const newProduct = ref({
  titulo: '',
  descripcion: '',
  precio: 0,
  categoria_id: 1,
  img_url: '',
  estado: 'disponible',
  ubicacion: 'Online'
});

const resetForm = () => {
    console.log("Reseteando formulario");
    newProduct.value = { titulo: '', descripcion: '', precio: 0, categoria_id: 1, img_url: '', estado: 'disponible', ubicacion: 'Online' };
    showForm.value = false;
    isEditing.value = false;
    editingId.value = null;
};

const fetchMyProducts = async () => {
    try {
        console.log("Cargando mis productos...");
        const res = await axios.get('/productos');
        myProducts.value = res.data.filter((p: any) => p.vendedor_id === store.user.id);
        console.log("Productos cargados:", myProducts.value.length);
    } catch (e) {
        console.error("Error al cargar mis productos:", e);
    }
};

const editProduct = (product: any) => {
    console.log("Editando producto:", product.id);
    newProduct.value = { 
      titulo: product.titulo,
      descripcion: product.descripcion,
      precio: product.precio,
      categoria_id: product.categoria_id,
      img_url: product.img_url,
      estado: product.estado,
      ubicacion: product.ubicacion
    };
    isEditing.value = true;
    editingId.value = product.id;
    showForm.value = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const deleteProduct = async (id: number) => {
    console.log("Intentando eliminar producto:", id);
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
        await axios.delete(`/productos/${id}`);
        alert("Producto eliminado");
        await fetchMyProducts();
    } catch (e: any) {
        console.error("Error al eliminar:", e);
        alert("Error al eliminar el producto: " + (e.response?.data?.error || e.message));
    }
};

const saveProduct = async () => {
    try {
        console.log("Guardando producto. Editando:", isEditing.value);
        if (isEditing.value && editingId.value) {
            await axios.put(`/productos/${editingId.value}`, {
                ...newProduct.value,
                vendedor_id: store.user.id
            });
            alert("Producto actualizado con éxito");
        } else {
            await axios.post('/productos', {
                ...newProduct.value,
                vendedor_id: store.user.id
            });
            alert("Producto publicado con éxito");
        }
        resetForm();
        await fetchMyProducts();
    } catch (e: any) {
        console.error("Error al guardar:", e);
        alert("Error al guardar el producto: " + (e.response?.data?.error || e.message));
    }
};

const publishProduct = async () => {
  // Ahora manejado por saveProduct
};

onMounted(async () => {
  if (!store.user || store.user.rol !== 'vendedor') {
    router.push('/');
    return;
  }

  try {
    const [prodRes, catRes] = await Promise.all([
      axios.get('/productos'),
      axios.get('/categorias')
    ]);
    myProducts.value = prodRes.data.filter((p: any) => p.vendedor_id === store.user.id);
    categories.value = catRes.data;
  } catch (e) {
    console.error("Error inicial:", e);
  } finally {
    loading.value = false;
  }
});
</script>
