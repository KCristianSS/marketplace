<template>
  <div class="space-y-12">
    <div class="flex justify-between items-end border-b border-neutral-200 dark:border-neutral-700 pb-8">
      <div>
        <h2 class="text-5xl font-black italic uppercase tracking-tighter text-neutral-900 dark:text-white">Panel de Control</h2>
        <p class="text-neutral-500 dark:text-neutral-400 text-sm mt-2 font-medium">Gestión administrativa de usuarios y roles de la plataforma.</p>
      </div>
      <div class="bg-blue-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg translate-y-2">
        Administrador
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div v-for="i in 3" :key="i" class="h-40 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-[32px] animate-pulse"></div>
    </div>

    <div v-else class="space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-neutral-900 dark:bg-white p-8 rounded-[32px] text-white dark:text-neutral-900 border border-white/10 dark:border-neutral-200 shadow-xl">
           <span class="text-[10px] font-mono opacity-50 uppercase tracking-widest mb-2 block">Total Usuarios</span>
           <span class="text-5xl font-black italic tracking-tighter">{{ users.length }}</span>
        </div>
        <div class="bg-white dark:bg-neutral-800 p-8 rounded-[32px] border border-neutral-200 dark:border-neutral-700 shadow-sm">
           <span class="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-2 block">Vendedores</span>
           <span class="text-5xl font-black italic tracking-tighter dark:text-white">{{ sellersCount }}</span>
        </div>
        <div class="bg-white dark:bg-neutral-800 p-8 rounded-[32px] border border-neutral-200 dark:border-neutral-700 shadow-sm">
           <span class="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-2 block">Clientes</span>
           <span class="text-5xl font-black italic tracking-tighter dark:text-white">{{ clientsCount }}</span>
        </div>
        <div class="bg-blue-600 p-8 rounded-[32px] border border-blue-500 shadow-xl text-white">
           <span class="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-2 block">Activos Hoy</span>
           <span class="text-5xl font-black italic tracking-tighter">100%</span>
        </div>
      </div>

      <div class="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-[40px] overflow-hidden shadow-2xl">
        <table class="w-full text-left">
          <thead class="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
            <tr>
              <th class="px-10 py-6 text-[10px] font-mono uppercase tracking-widest text-neutral-400">Usuario</th>
              <th class="px-10 py-6 text-[10px] font-mono uppercase tracking-widest text-neutral-400">Contacto</th>
              <th class="px-10 py-6 text-[10px] font-mono uppercase tracking-widest text-neutral-400">Rol</th>
              <th class="px-10 py-6 text-[10px] font-mono uppercase tracking-widest text-neutral-400 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100 dark:divide-neutral-700">
            <tr v-for="u in users" :key="u.id" class="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors group">
              <td class="px-10 py-8">
                 <div class="flex items-center gap-4">
                   <div class="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center font-bold text-neutral-400">
                     {{ u.nombre[0].toUpperCase() }}
                   </div>
                   <div>
                     <div class="font-bold text-neutral-900 dark:text-white uppercase tracking-tight">{{ u.nombre }}</div>
                     <div class="text-[10px] text-neutral-400 font-mono">ID: {{ u.id }}</div>
                   </div>
                 </div>
              </td>
              <td class="px-10 py-8">
                 <div class="text-sm dark:text-neutral-300">{{ u.correo }}</div>
                 <div class="text-[10px] text-neutral-400 font-medium">{{ u.telefono || 'Sin teléfono' }}</div>
              </td>
              <td class="px-10 py-8">
                <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" 
                  :class="u.rol === 'admin' ? 'bg-purple-100 text-purple-600' : (u.rol === 'vendedor' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600')">
                  {{ u.rol }}
                </span>
              </td>
              <td class="px-10 py-8 text-right flex items-center justify-end gap-3">
                <button 
                  @click="editUser(u)"
                  class="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105 active:scale-95"
                >
                  Editar
                </button>
                <button 
                  v-if="u.rol !== 'admin' && u.id !== store.user?.id"
                  @click="deleteUser(u.id)"
                  class="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 dark:bg-red-900/30 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all transform hover:scale-105 active:scale-95"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit User Modal -->
    <Teleport to="body">
      <div v-if="editingUser" class="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
        <div class="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" @click="editingUser = null"></div>
        <div class="relative bg-white dark:bg-neutral-900 w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 p-10 animate-in fade-in zoom-in duration-300">
          <h3 class="text-3xl font-black italic uppercase tracking-tighter text-neutral-900 dark:text-white mb-8">Editar Usuario</h3>
          
          <form @submit.prevent="updateUser" class="space-y-6">
            <div>
              <label class="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">Nombre</label>
              <input v-model="editForm.nombre" type="text" class="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium dark:text-white" required />
            </div>
            <div>
              <label class="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">Correo</label>
              <input v-model="editForm.correo" type="email" class="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium dark:text-white" required />
            </div>
            <div>
              <label class="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">Teléfono</label>
              <input v-model="editForm.telefono" type="text" class="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium dark:text-white" />
            </div>
            <div>
              <label class="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">Rol</label>
              <select v-model="editForm.rol" class="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium dark:text-white">
                <option value="cliente">Cliente</option>
                <option value="vendedor">Vendedor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            
            <div class="flex gap-4 pt-4">
              <button type="button" @click="editingUser = null" class="flex-1 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all">Cancelar</button>
              <button type="submit" class="flex-1 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAppStore } from '../store';
import { useRouter } from 'vue-router';
import axios from 'axios';

const store = useAppStore();
const router = useRouter();
const users = ref<any[]>([]);
const loading = ref(true);
const editingUser = ref<any>(null);
const editForm = ref({
    nombre: '',
    correo: '',
    telefono: '',
    rol: ''
});

const sellersCount = computed(() => users.value.filter(u => u.rol === 'vendedor').length);
const clientsCount = computed(() => users.value.filter(u => u.rol === 'cliente').length);

const fetchUsers = async () => {
    try {
        const res = await axios.get('/usuarios');
        users.value = res.data;
    } catch (e) {
        console.error("Error al cargar usuarios:", e);
    }
};

const editUser = (u: any) => {
    editingUser.value = u;
    editForm.value = { 
        nombre: u.nombre, 
        correo: u.correo, 
        telefono: u.telefono || '', 
        rol: u.rol 
    };
};

const updateUser = async () => {
    if (!editingUser.value) return;
    try {
        await axios.put(`/usuarios/${editingUser.value.id}`, editForm.value);
        editingUser.value = null;
        await fetchUsers();
        alert("Usuario actualizado correctamente");
    } catch (e) {
        alert("Error al actualizar usuario");
    }
};

const deleteUser = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este usuario permanentemente?')) return;
    try {
        await axios.delete(`/usuarios/${id}`);
        await fetchUsers();
    } catch (e) {
        alert("Error al eliminar usuario");
    }
};

onMounted(async () => {
  if (!store.user || store.user.rol !== 'admin') {
    router.push('/');
    return;
  }
  
  try {
    await fetchUsers();
  } catch (e) {
    console.error("Error inicial:", e);
  } finally {
    loading.value = false;
  }
});
</script>
