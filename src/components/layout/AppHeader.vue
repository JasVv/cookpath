<script setup lang="ts">
import { RouterLink } from 'vue-router'

const navItems = [
  { to: '/', label: 'カレンダー' },
  { to: '/recipes', label: 'レシピ' },
  { to: '/supplies', label: '日用品' },
  { to: '/shopping', label: '買い物リスト' },
  { to: '/settings', label: '設定' },
]
</script>

<template>
  <header class="bg-surface border-b border-border px-7 py-3.5 flex items-center gap-8">
    <h1 class="font-bold whitespace-nowrap">
      <span class="text-primary text-lg">Cookpath</span>
      <span class="text-text-muted font-normal text-xs ml-1.5">−メニュー記録と買い物サポート−</span>
    </h1>
    <nav class="ml-auto flex gap-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="px-3.5 py-1.5 text-[13.5px] font-medium rounded-md text-text-muted border border-transparent hover:text-text hover:bg-bg-subtle transition-colors"
        active-class="!bg-primary-soft !text-primary !font-semibold !border-primary/25"
        :exact-active-class="item.to === '/' ? '!bg-primary-soft !text-primary !font-semibold !border-primary/25' : ''"
      >
        {{ item.label }}
      </RouterLink>
    </nav>
  </header>
</template>
