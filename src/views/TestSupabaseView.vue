<template>
  <div class="test-supabase-view">
    <div class="view-header">
      <h1 class="view-title">Test de Configuration Supabase</h1>
      <p class="view-subtitle">
        Vérifiez que votre configuration Supabase fonctionne correctement
      </p>
    </div>

    <div class="view-content">
      <SupabaseTest />
    </div>
  </div>
</template>

<script setup lang="ts">
import SupabaseTest from '../components/SupabaseTest.vue'
</script>

<style scoped>
.test-supabase-view {
  min-height: 100vh;
  background: #f9fafb;
  padding: 2rem;
}

.view-header {
  text-align: center;
  margin-bottom: 3rem;
}

.view-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1rem 0;
}

.view-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
}

.view-content {
  max-width: 1000px;
  margin: 0 auto;
}
</style>
