<script setup lang="ts">
import { RouterLink } from 'vue-router'

const navItems = [
  { to: '/', label: 'カレンダー' },
  { to: '/recipes', label: 'レシピ' },
  { to: '/shopping', label: '買い物リスト' },
  { to: '/settings', label: '設定' },
]
</script>

<template>
  <header class="bg-white border-b border-slate-200 shadow-sm">
    <div class="max-w-screen-2xl mx-auto px-6 py-3 flex items-center gap-8">
      <h1 class="text-lg font-bold text-slate-800 whitespace-nowrap">
        Cookpath <span class="text-sm font-normal text-slate-500">-メニュー記録と買い物サポート-</span>
      </h1>
      <nav class="flex gap-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="px-3 py-1.5 rounded text-sm font-medium text-slate-600 hover:bg-slate-100"
          active-class="!bg-emerald-100 !text-emerald-700"
          :exact-active-class="item.to === '/' ? '!bg-emerald-100 !text-emerald-700' : ''"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
