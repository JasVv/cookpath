<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import { onMounted } from 'vue'
import { requestPersistence, isPersisted } from '@/composables/usePersistentStorage'

onMounted(async () => {
  if (!(await isPersisted())) {
    await requestPersistence().catch(() => undefined)
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1 px-6 py-6 max-w-screen-2xl w-full mx-auto">
      <router-view />
    </main>
  </div>
</template>
