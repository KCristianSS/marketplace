<template>
  <div className="min-h-screen bg-gray-50">
    <nav className="bg-white shadow-sm h-16 flex items-center px-8 justify-between">
      <router-link to="/" className="text-xl font-bold text-blue-600">Marketplace Vue</router-link>
      <div className="flex gap-4">
        <router-link to="/products" className="text-gray-600 hover:text-blue-600">Productos</router-link>
        <router-link to="/login" className="text-gray-600 hover:text-blue-600">Entrar</router-link>
        <a href="/api-docs" target="_blank" className="text-gray-400 text-xs flex items-center">Swagger API</a>
      </div>
    </nav>
    <main className="container mx-auto p-8">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
// Main App Component
</script>
