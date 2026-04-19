<template>
  <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm border mt-10">
    <h2 className="text-2xl font-bold mb-6">Iniciar Sesión</h2>
    <form @submit.prevent="handleLogin" className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Correo</label>
        <input v-model="email" type="email" className="w-full border rounded-lg px-4 py-2" required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Contraseña</label>
        <input v-model="password" type="password" className="w-full border rounded-lg px-4 py-2" required />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition">
        Entrar
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useAppStore } from '../store';

const router = useRouter();
const store = useAppStore();
const email = ref('');
const password = ref('');

const handleLogin = async () => {
  try {
    const response = await axios.post('/api/login', {
      email: email.value,
      password: password.value
    });
    const { token } = response.data;
    localStorage.setItem('token', token);
    store.setUser({ email: email.value });
    alert('Ingreso exitoso');
    router.push('/');
  } catch (e: any) {
    alert('Error al entrar: ' + (e.response?.data?.error || e.message));
  }
};
</script>
