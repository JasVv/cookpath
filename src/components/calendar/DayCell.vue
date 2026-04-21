<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Dish, MenuEntry } from '@/domain/types'
import { toDateKey, isSameDay } from '@/utils/date'

const props = defineProps<{
  date: Date
  menu: MenuEntry | undefined
  isOutsideMonth?: boolean
  isToday?: boolean
  compact?: boolean
  dragSourceDate?: string | null
  dragSourceRecipeId?: string | null
  dropTargetDate?: string | null
}>()

const emit = defineEmits<{
  (e: 'click', date: Date): void
  (e: 'dragstart', date: string): void
  (e: 'dragend'): void
  (e: 'drop', payload: { fromDate: string; toDate: string }): void
  (e: 'dropRecipe', payload: { recipeId: string; toDate: string }): void
  (e: 'dragenter', date: string): void
  (e: 'dragleave', date: string): void
}>()

const dateKey = computed(() => toDateKey(props.date))
const dayNumber = computed(() => props.date.getDate())

const dishes = computed(() => props.menu?.dishes ?? [])
const hasMenu = computed(() => dishes.value.length > 0)

const isDragActive = computed(
  () => !!props.dragSourceDate || !!props.dragSourceRecipeId,
)

const isDragSource = computed(
  () => props.dragSourceDate === dateKey.value,
)

const isDropTarget = computed(() => {
  if (props.dropTargetDate !== dateKey.value) return false
  if (props.dragSourceRecipeId) return true
  if (
    props.dragSourceDate &&
    !isSameDay(new Date(props.dragSourceDate), props.date)
  ) {
    return true
  }
  return false
})

function onDragStart(ev: DragEvent) {
  if (!hasMenu.value) {
    ev.preventDefault()
    return
  }
  ev.dataTransfer?.setData('text/plain', `day:${dateKey.value}`)
  if (ev.dataTransfer) ev.dataTransfer.effectAllowed = 'copyMove'
  emit('dragstart', dateKey.value)
}

function onDragEnd() {
  emit('dragend')
}

function onDragOver(ev: DragEvent) {
  if (!isDragActive.value) return
  ev.preventDefault()
  if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'copy'
}

// 子要素（日番号や料理名）の間をポインタが移動するたびに
// dragenter/dragleave が飛ぶため、カウンタで入退場を集約する
const dragDepth = ref(0)

function onDragEnter() {
  if (!isDragActive.value) return
  dragDepth.value++
  if (dragDepth.value === 1) emit('dragenter', dateKey.value)
}

function onDragLeave() {
  if (!isDragActive.value) return
  dragDepth.value--
  if (dragDepth.value <= 0) {
    dragDepth.value = 0
    emit('dragleave', dateKey.value)
  }
}

// ドラッグが終了したらカウンタをリセット
watch(isDragActive, (v) => {
  if (!v) dragDepth.value = 0
})

function ingredientSummary(dish: Dish): string {
  const names = dish.ingredients
    .map((i) => i.name.trim())
    .filter((n) => n.length > 0)
  return names.join(', ')
}

function onDrop(ev: DragEvent) {
  if (!isDragActive.value) return
  dragDepth.value = 0
  ev.preventDefault()
  const raw = ev.dataTransfer?.getData('text/plain') ?? ''
  if (raw.startsWith('recipe:')) {
    const recipeId = raw.slice('recipe:'.length)
    if (recipeId) emit('dropRecipe', { recipeId, toDate: dateKey.value })
    return
  }
  if (raw.startsWith('day:')) {
    const fromDate = raw.slice('day:'.length)
    if (fromDate) emit('drop', { fromDate, toDate: dateKey.value })
    return
  }
  // prefix なしの古い形式は day として扱う（後方互換・保険）
  if (props.dragSourceDate) {
    emit('drop', { fromDate: props.dragSourceDate, toDate: dateKey.value })
  }
}
</script>

<template>
  <div
    class="relative flex flex-col bg-surface cursor-pointer transition-colors"
    :class="[
      compact ? 'min-h-[110px]' : 'min-h-[100px]',
      isOutsideMonth ? 'bg-bg-subtle text-text-subtle' : '',
      isToday ? 'bg-primary-soft ring-[1.5px] ring-inset ring-primary' : '',
      isDragSource ? 'opacity-40' : '',
      isDropTarget ? 'bg-accent-soft ring-[1.5px] ring-inset ring-accent' : 'hover:bg-bg-subtle',
    ]"
    :draggable="hasMenu"
    @click="emit('click', date)"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @dragover="onDragOver"
    @dragenter.prevent="onDragEnter"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div class="flex items-center justify-between px-1.5 pt-1 select-none">
      <span
        class="text-xs tabular"
        :class="isToday ? 'font-bold text-primary' : 'text-text-muted'"
      >
        {{ dayNumber }}
      </span>
    </div>
    <ul
      class="flex-1 overflow-y-auto px-1.5 pb-1 mt-0.5 text-xs leading-tight space-y-1"
    >
      <li v-for="dish in dishes" :key="dish.id" :title="dish.name">
        <div
          class="truncate"
          :class="isToday ? 'text-primary font-semibold' : 'text-text'"
        >
          {{ dish.name || '(無題)' }}
        </div>
        <div
          v-if="ingredientSummary(dish)"
          class="pl-3 truncate text-text-muted"
        >
          {{ ingredientSummary(dish) }}
        </div>
      </li>
    </ul>
  </div>
</template>
