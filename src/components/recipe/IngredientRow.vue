<script setup lang="ts">
import type { Ingredient } from '@/domain/types'

const props = defineProps<{ modelValue: Ingredient }>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Ingredient): void
  (e: 'remove'): void
}>()

function update(field: keyof Ingredient, value: string) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}
</script>

<template>
  <div class="flex gap-2 items-center">
    <input
      type="text"
      class="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
      placeholder="材料名"
      :value="modelValue.name"
      @input="update('name', ($event.target as HTMLInputElement).value)"
    />
    <input
      type="text"
      class="w-24 px-2 py-1 border border-slate-300 rounded text-sm"
      placeholder="分量"
      :value="modelValue.amount"
      @input="update('amount', ($event.target as HTMLInputElement).value)"
    />
    <input
      type="text"
      class="w-20 px-2 py-1 border border-slate-300 rounded text-sm"
      placeholder="単位"
      :value="modelValue.unit"
      @input="update('unit', ($event.target as HTMLInputElement).value)"
    />
    <button
      type="button"
      class="text-slate-400 hover:text-rose-600 text-sm"
      @click="emit('remove')"
      aria-label="削除"
    >
      🗑
    </button>
  </div>
</template>
