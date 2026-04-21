<script setup lang="ts">
import { onMounted, ref } from 'vue'
import QRCode from 'qrcode'
import ModalBase from '@/components/common/ModalBase.vue'

const props = defineProps<{
  text: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const dataUrl = ref<string>('')
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    dataUrl.value = await QRCode.toDataURL(props.text, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320,
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'QRコードの生成に失敗しました。'
  }
})
</script>

<template>
  <ModalBase title="QRコードで共有" width-class="max-w-md" @close="emit('close')">
    <div class="space-y-4">
      <p class="text-xs text-text-muted">
        スマホのカメラで読み取ると、買い物リストがテキストで表示されます。
      </p>

      <div v-if="error" class="text-sm text-danger bg-danger-soft border border-danger/30 rounded-md px-3 py-2">
        {{ error }}
      </div>
      <div
        v-else-if="dataUrl"
        class="flex justify-center bg-surface p-3 rounded-md border border-border"
      >
        <img
          :src="dataUrl"
          alt="買い物リストのQRコード"
          class="w-full max-w-[280px] h-auto"
        />
      </div>
      <div v-else class="text-sm text-text-muted text-center py-8">
        生成中…
      </div>

      <details class="text-xs">
        <summary class="cursor-pointer text-text-muted hover:text-text font-medium">
          テキストを表示
        </summary>
        <pre class="mt-2 p-3 bg-bg-subtle border border-border rounded-md text-text whitespace-pre-wrap font-mono text-[11px] max-h-64 overflow-auto">{{ text }}</pre>
      </details>
    </div>
  </ModalBase>
</template>
