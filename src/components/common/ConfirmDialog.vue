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
    <p class="text-sm text-text whitespace-pre-line">{{ message }}</p>
    <template #footer>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="px-4 py-1.5 rounded-md border border-border bg-surface text-text text-sm font-semibold hover:bg-bg-subtle transition-colors"
          @click="emit('cancel')"
        >
          {{ cancelLabel }}
        </button>
        <button
          type="button"
          class="px-4 py-1.5 rounded-md text-white text-sm font-semibold transition-colors"
          :class="danger ? 'bg-danger hover:bg-danger/90' : 'bg-primary hover:bg-primary-hover'"
          @click="emit('ok')"
        >
          {{ okLabel }}
        </button>
      </div>
    </template>
  </ModalBase>
</template>
