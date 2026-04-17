<script setup lang="ts">
import ModalBase from '@/components/common/ModalBase.vue'

withDefaults(
  defineProps<{
    title?: string
    message: string
    okLabel?: string
    cancelLabel?: string
    danger?: boolean
  }>(),
  {
    title: '確認',
    okLabel: 'OK',
    cancelLabel: 'キャンセル',
    danger: false,
  },
)

const emit = defineEmits<{
  (e: 'ok'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <ModalBase :title="title" width-class="max-w-md" @close="emit('cancel')">
    <p class="text-sm text-slate-700 whitespace-pre-line">{{ message }}</p>
    <template #footer>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="px-4 py-1.5 rounded border border-slate-300 bg-white text-slate-700 text-sm hover:bg-slate-100"
          @click="emit('cancel')"
        >
          {{ cancelLabel }}
        </button>
        <button
          type="button"
          class="px-4 py-1.5 rounded text-white text-sm"
          :class="danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'"
          @click="emit('ok')"
        >
          {{ okLabel }}
        </button>
      </div>
    </template>
  </ModalBase>
</template>
