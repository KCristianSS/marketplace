<template>
  <div class="space-y-10">
    <div class="flex justify-between items-center pb-8 border-b border-neutral-200">
      <div>
        <h2 class="text-4xl font-black italic uppercase tracking-tighter text-neutral-900">Mis Ventas</h2>
        <p class="text-neutral-500 text-sm mt-2">Gestiona tus productos publicados y ventas realizadas.</p>
      </div>
      <button 
        @click="showForm = !showForm"
        class="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-neutral-900 transition-all shadow-lg"
      >
        {{ showForm ? 'Cancelar' : 'Publicar Producto' }}
      </button>
    </div>

    <!-- Formulario de Publicación / Edición -->
    <div v-if="showForm" class="bg-white border border-neutral-200 rounded-[32px] p-8 max-w-2xl mx-auto shadow-xl">
      <h3 class="text-xl font-black italic uppercase tracking-tight mb-6">
        {{ isEditing ? 'Editar Producto' : 'Nuevo Producto' }}
      </h3>
      <form @submit.prevent="saveProduct" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1">Título</label>
            <input v-model="newProduct.titulo" type="text" class="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600" required />
          </div>
          <div>
            <label class="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1">Precio</label>
            <input v-model.number="newProduct.precio" type="number" step="0.01" class="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600" required />
          </div>
        </div>
        <div>
          <label class="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1">Descripción</label>
          <textarea v-model="newProduct.descripcion" rows="3" class="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600"></textarea>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1">Categoría</label>
            <select v-model="newProduct.categoria_id" class="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600">
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1">URL Imagen</label>
            <input v-model="newProduct.img_url" type="url" class="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600" placeholder="https://..." />
          </div>
        </div>
        <button type="submit" class="w-full bg-neutral-900 text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-all uppercase tracking-widest text-xs mt-4">
          {{ isEditing ? 'Actualizar Publicación' : 'Guardar Publicación' }}
        </button>
      </form>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="i in 3" :key="i" class="h-64 bg-white border border-neutral-100 rounded-3xl animate-pulse"></div>
    </div>

    <div v-else-if="myProducts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="product in myProducts" :key="product.id" class="bg-white border border-neutral-200 rounded-3xl p-6 hover:shadow-xl transition-all group flex flex-col">
        <div v-if="product.img_url" class="aspect-video mb-4 overflow-hidden rounded-2xl bg-neutral-100">
          <img :src="product.img_url" class="w-full h-full object-cover" />
        </div>
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="font-bold text-neutral-900 uppercase tracking-tight">{{ product.titulo }}</h3>
            <span class="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">{{ product.estado }}</span>
          </div>
          <span class="font-mono text-blue-600 font-bold">${{ product.precio }}</span>
        </div>
        <p class="text-xs text-neutral-500 line-clamp-2 mb-6 italic">{{ product.descripcion }}</p>
        <div class="flex gap-2">
          <button @click="editProduct(product)" class="flex-1 bg-neutral-100 text-neutral-600 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all">Editar</button>
          <button @click="deleteProduct(product.id)" class="flex-1 bg-red-50 text-red-500 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Eliminar</button>
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
