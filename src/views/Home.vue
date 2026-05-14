<template>
  <div class="relative overflow-hidden min-h-[80vh] flex items-center">
    <!-- Decorative Elements -->
    <div class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-600/10 dark:bg-blue-600/5 rounded-full blur-3xl"></div>

    <div class="relative py-12 lg:py-24 flex flex-col items-center text-center w-full">
      <div class="flex items-center gap-3 mb-8 animate-fade-in">
        <div class="h-[1px] w-8 bg-blue-600"></div>
        <span class="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-blue-600">Amazon Marketplace v2.0</span>
        <div class="h-[1px] w-8 bg-blue-600"></div>
      </div>

      <h1 class="text-6xl md:text-8xl lg:text-9xl font-black italic uppercase tracking-tighter leading-[0.8] mb-8 max-w-5xl dark:text-white">
        Tu mundo <br />
        de <span class="text-blue-600">Compras</span>
      </h1>
      
      <p class="text-neutral-500 dark:text-neutral-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-12 px-6 font-medium">
        La plataforma más rápida y segura para comprar y vender productos. Experimenta la nueva generación del comercio electrónico.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 items-center w-full px-6 justify-center">
        <router-link to="/products" class="w-full sm:w-auto group relative bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-12 py-6 rounded-[24px] font-bold uppercase tracking-widest overflow-hidden transition-all hover:pr-16 shadow-2xl shadow-neutral-900/20 active:scale-95">
          <span class="relative z-10 text-xs">Explorar Catálogo</span>
          <span class="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all font-mono">→</span>
        </router-link>
        
        <router-link to="/login" class="w-full sm:w-auto px-12 py-6 rounded-[24px] font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all text-xs border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700">
          Iniciar Sesión
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Homepage Logic
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.8s ease-out forwards;
}
</style>
