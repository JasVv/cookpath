<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  title: string
  widthClass?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

function onOverlay(ev: MouseEvent) {
  if (ev.target === ev.currentTarget) emit('close')
}

function onKey(ev: KeyboardEvent) {
  if (ev.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
})

const widthClass = props.widthClass ?? 'max-w-2xl'
</script>

<template>
  <div
    class="fixed inset-0 z-50 bg-slate-900/40 flex items-start justify-center overflow-y-auto py-10 px-4"
    @mousedown="onOverlay"
  >
    <div
      class="bg-white rounded-lg shadow-xl w-full"
      :class="widthClass"
      @mousedown.stop
    >
      <div class="flex items-center justify-between px-5 py-3 border-b border-slate-200">
        <h2 class="text-base font-semibold text-slate-800">{{ title }}</h2>
        <button
          type="button"
          class="text-slate-400 hover:text-slate-700 text-xl leading-none"
          @click="emit('close')"
          aria-label="閉じる"
        >
          ×
        </button>
      </div>
      <div class="px-5 py-4">
        <slot />
      </div>
      <div v-if="$slots.footer" class="px-5 py-3 border-t border-slate-200 bg-slate-50 rounded-b-lg">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
