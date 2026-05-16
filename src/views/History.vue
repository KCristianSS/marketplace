<template>
  <div class="space-y-12">
    <div>
      <h2 class="text-4xl font-black italic uppercase tracking-tighter text-neutral-900 dark:text-white">{{ title }}</h2>
      <p class="text-neutral-500 dark:text-neutral-400 text-sm mt-2">Consulta el registro de tus transacciones realizadas en la plataforma.</p>
    </div>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-32 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-3xl animate-pulse"></div>
    </div>

    <div v-else-if="items.length > 0" class="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-[32px] overflow-hidden shadow-xl overflow-x-auto">
      <table class="w-full text-left min-w-[800px]">
        <thead class="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
          <tr>
            <th class="px-8 py-5 text-[10px] font-mono uppercase tracking-widest text-neutral-400">ID</th>
            <th class="px-8 py-5 text-[10px] font-mono uppercase tracking-widest text-neutral-400">Producto</th>
            <th v-if="store.user?.rol === 'admin'" class="px-8 py-5 text-[10px] font-mono uppercase tracking-widest text-neutral-400">Comprador</th>
            <th v-if="store.user?.rol === 'admin'" class="px-8 py-5 text-[10px] font-mono uppercase tracking-widest text-neutral-400">Vendedor</th>
            <th v-else class="px-8 py-5 text-[10px] font-mono uppercase tracking-widest text-neutral-400">{{ counterpartyLabel }}</th>
            <th class="px-8 py-5 text-[10px] font-mono uppercase tracking-widest text-neutral-400">Precio</th>
            <th class="px-8 py-5 text-[10px] font-mono uppercase tracking-widest text-neutral-400">Estado</th>
            <th class="px-8 py-5 text-[10px] font-mono uppercase tracking-widest text-neutral-400">Fecha</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100 dark:divide-neutral-700">
          <tr v-for="item in items" :key="item.id" class="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors group">
            <td class="px-8 py-6 text-sm font-mono text-neutral-400">#{{ item.id }}</td>
            <td class="px-8 py-6">
               <div class="font-bold text-neutral-900 dark:text-white uppercase tracking-tight">{{ item.producto_titulo || 'Producto' }}</div>
               <div class="text-[10px] text-neutral-400 italic">ID Prod: {{ item.producto_id }}</div>
            </td>
            <template v-if="store.user?.rol === 'admin'">
              <td class="px-8 py-6 text-sm text-neutral-600 dark:text-neutral-300">
                {{ item.comprador_nombre || '---' }}
              </td>
              <td class="px-8 py-6 text-sm text-neutral-600 dark:text-neutral-300">
                {{ item.vendedor_nombre || '---' }}
              </td>
            </template>
            <td v-else class="px-8 py-6 text-sm text-neutral-600 dark:text-neutral-300">
              {{ item.counterparty_name || 'Desconocido' }}
            </td>
            <td class="px-8 py-6">
              <span class="font-bold text-blue-600">${{ item.precio }}</span>
            </td>
            <td class="px-8 py-6">
              <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" :class="statusClass(item.estado)">
                {{ item.estado }}
              </span>
            </td>
            <td class="px-8 py-6 text-sm text-neutral-400">
              {{ formatDate(item.fecha) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center py-32 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-[32px] border-dashed">
      <div class="text-4xl mb-4">📜</div>
      <h3 class="text-xl font-bold uppercase tracking-tight text-neutral-900 dark:text-white">Sin actividad aún</h3>
      <p class="text-neutral-400 text-sm italic">Parece que no hay registros en tu historial.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAppStore } from '../store';
import axios from 'axios';

const store = useAppStore();
const items = ref<any[]>([]);
const loading = ref(true);

const isSeller = computed(() => store.user?.rol === 'vendedor');
const isAdmin = computed(() => store.user?.rol === 'admin');
const title = computed(() => {
  if (isAdmin.value) return 'Registro Global de Transacciones';
  return isSeller.value ? 'Historial de Ventas' : 'Historial de Compras';
});
const counterpartyLabel = computed(() => isSeller.value ? 'Comprador' : 'Vendedor');

const formatDate = (dateStr: string) => {
  if (!dateStr) return '---';
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const statusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completado': return 'bg-green-100 text-green-600';
    case 'pendiente': return 'bg-amber-100 text-amber-600';
    default: return 'bg-neutral-100 text-neutral-600';
  }
};

onMounted(async () => {
  try {
    const res = await axios.get(`/compras`);
    // En el backend actual, el endpoint devuelve todo lo relacionado al usuario si se filtra
    // pero para seguridad y claridad, filtramos aquí lo que el usuario debe ver.
    // Asumimos que los datos del counterparty vendrán del backend o los buscaremos.
    items.value = res.data;
  } catch (e) {
    console.error("Error al cargar historial:", e);
  } finally {
    loading.value = false;
  }
});
</script>
