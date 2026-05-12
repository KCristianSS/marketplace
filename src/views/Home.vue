<template>
  <div class="relative overflow-hidden">
    <!-- Decorative Elements -->
    <div class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl"></div>

    <div class="relative py-24 lg:py-40 flex flex-col items-center text-center">
      <div class="flex items-center gap-3 mb-8 animate-fade-in">
        <div class="h-[1px] w-8 bg-blue-600"></div>
        <span class="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-blue-600">Marketplace Académico v1.0</span>
        <div class="h-[1px] w-8 bg-blue-600"></div>
      </div>

      <h1 class="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] mb-8 max-w-4xl">
        Plataforma de <br />
        <span class="text-blue-600">Comercio</span>
      </h1>
      
      <p class="text-neutral-500 text-lg md:text-xl max-w-2xl leading-relaxed mb-12 px-6">
        Sistema integral de gestión de productos y transacciones. Desarrollado con tecnologías web modernas para un alto rendimiento y escalabilidad.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 items-center">
        <router-link to="/products" class="group relative bg-neutral-900 text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-widest overflow-hidden transition-all hover:pr-14 shadow-2xl shadow-neutral-900/20 active:scale-95">
          <span class="relative z-10">Ver Catálogo</span>
          <span class="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all">→</span>
        </router-link>
        
        <router-link to="/login" class="px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-all">
          Acceder al sistema
        </router-link>
      </div>

      <!-- Stats / Features Bar Removed -->
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
