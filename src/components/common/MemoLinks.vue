<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  text: string
}>()

// http(s) で始まる URL を検出する。末尾の句読点や閉じ括弧は URL に含めない。
const URL_PATTERN = /https?:\/\/[^\s<>"']+/g
const TRAILING_TRIM = /[.,;:!?）)\]】」』}>]+$/

const links = computed<string[]>(() => {
  const matches = props.text.match(URL_PATTERN) ?? []
  const cleaned = matches.map((u) => u.replace(TRAILING_TRIM, ''))
  // 重複除去
  return Array.from(new Set(cleaned))
})
</script>

<template>
  <div v-if="links.length > 0" class="mt-1.5 text-xs">
    <span class="text-text-muted mr-1">リンク:</span>
    <ul class="inline-flex flex-wrap gap-x-2 gap-y-1 align-top">
      <li v-for="url in links" :key="url" class="min-w-0">
        <a
          :href="url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary hover:text-primary-hover underline break-all"
        >
          {{ url }}
        </a>
      </li>
    </ul>
  </div>
</template>
