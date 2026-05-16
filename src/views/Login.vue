<template>
  <div class="max-w-md mx-auto bg-white dark:bg-neutral-900 p-10 rounded-[32px] shadow-2xl dark:shadow-none border border-neutral-200 dark:border-neutral-800 mt-20">
    <h2 class="text-4xl font-black italic uppercase tracking-tighter mb-8 text-neutral-900 dark:text-white">
      {{ isRegister ? 'Crear Cuenta' : 'Ingresar' }}
    </h2>
    
    <form @submit.prevent="isRegister ? handleRegister() : handleLogin()" class="space-y-6">
      <div v-if="isRegister">
        <label class="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">Nombre Completo</label>
        <input v-model="name" type="text" class="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium dark:text-white" placeholder="Tu nombre" required />
      </div>
 
      <div v-if="isRegister">
        <label class="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">Teléfono</label>
        <input v-model="phone" type="text" class="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium dark:text-white" placeholder="Ej: +51 999..." required />
      </div>
 
      <div>
        <label class="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">Correo Electrónico</label>
        <input v-model="email" type="email" class="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium dark:text-white" placeholder="correo@ejemplo.com" required />
      </div>
 
      <div>
        <label class="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">Contraseña</label>
        <input v-model="password" type="password" class="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium dark:text-white" placeholder="••••••••" required />
      </div>
 
      <div v-if="isRegister">
        <label class="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">Tipo de Usuario</label>
        <select v-model="role" class="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium dark:text-white">
          <option value="cliente" class="dark:bg-neutral-900">Soy Comprador</option>
          <option value="vendedor" class="dark:bg-neutral-900">Soy Vendedor</option>
        </select>
      </div>
 
      <button type="submit" class="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold py-5 rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-neutral-900/10 active:scale-95 uppercase tracking-widest text-xs">
        {{ isRegister ? 'Registrarme' : 'Entrar' }}
      </button>
    </form>
 
    <div class="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-800 text-center">
      <button @click="isRegister = !isRegister" class="text-xs font-bold text-neutral-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
        {{ isRegister ? '¿Ya tienes cuenta? Entra aquí' : '¿No tienes cuenta? Regístrate' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useAppStore } from '../store';

const router = useRouter();
const store = useAppStore();

const isRegister = ref(false);
const name = ref('');
const phone = ref('');
const email = ref('');
const password = ref('');
const role = ref('cliente');

const handleLogin = async () => {
  try {
    const response = await axios.post('/login', {
      email: email.value,
      password: password.value
    });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    store.setUser(user);
    alert('Ingreso exitoso');
    router.push('/');
  } catch (e: any) {
    alert('Error al entrar: ' + (e.response?.data?.error || e.message));
  }
};

const handleRegister = async () => {
  try {
    await axios.post('/usuarios', {
      nombre: name.value,
      correo: email.value,
      contrasena: password.value,
      telefono: phone.value,
      rol: role.value
    });
    alert('Usuario registrado con éxito. Ahora puedes entrar.');
    isRegister.value = false;
  } catch (e: any) {
    alert('Error al registrar: ' + (e.response?.data?.error || e.message));
  }
};
</script>
