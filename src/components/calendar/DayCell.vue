<script setup lang="ts">
import { computed } from 'vue'
import type { MenuEntry } from '@/domain/types'
import { toDateKey, isSameDay } from '@/utils/date'

const props = defineProps<{
  date: Date
  menu: MenuEntry | undefined
  isOutsideMonth?: boolean
  isToday?: boolean
  compact?: boolean
  dragSourceDate?: string | null
  dropTargetDate?: string | null
}>()

const emit = defineEmits<{
  (e: 'click', date: Date): void
  (e: 'dragstart', date: string): void
  (e: 'dragend'): void
  (e: 'drop', payload: { fromDate: string; toDate: string }): void
  (e: 'dragenter', date: string): void
  (e: 'dragleave', date: string): void
}>()

const dateKey = computed(() => toDateKey(props.date))
const dayNumber = computed(() => props.date.getDate())

const dishes = computed(() => props.menu?.dishes ?? [])
const hasMenu = computed(() => dishes.value.length > 0)

const isDragSource = computed(
  () => props.dragSourceDate === dateKey.value,
)
const isDropTarget = computed(
  () => props.dropTargetDate === dateKey.value &&
    props.dragSourceDate !== null &&
    props.dragSourceDate !== undefined &&
    !isSameDay(new Date(props.dragSourceDate), props.date),
)

function onDragStart(ev: DragEvent) {
  if (!hasMenu.value) {
    ev.preventDefault()
    return
  }
  ev.dataTransfer?.setData('text/plain', dateKey.value)
  if (ev.dataTransfer) ev.dataTransfer.effectAllowed = 'copyMove'
  emit('dragstart', dateKey.value)
}

function onDragEnd() {
  emit('dragend')
}

function onDragOver(ev: DragEvent) {
  if (!props.dragSourceDate) return
  ev.preventDefault()
  if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'copy'
}

function onDragEnter() {
  if (!props.dragSourceDate) return
  emit('dragenter', dateKey.value)
}

function onDragLeave() {
  if (!props.dragSourceDate) return
  emit('dragleave', dateKey.value)
}

function onDrop(ev: DragEvent) {
  if (!props.dragSourceDate) return
  ev.preventDefault()
  const fromDate = ev.dataTransfer?.getData('text/plain') ?? props.dragSourceDate
  if (!fromDate) return
  emit('drop', { fromDate, toDate: dateKey.value })
}
</script>

<template>
  <div
    class="relative flex flex-col border border-slate-200 bg-white cursor-pointer transition-colors"
    :class="[
      compact ? 'min-h-[110px]' : 'min-h-[100px]',
      isOutsideMonth ? 'bg-slate-50 text-slate-400' : '',
      isToday ? 'ring-2 ring-emerald-400 ring-inset' : '',
      isDragSource ? 'opacity-40' : '',
      isDropTarget ? 'bg-emerald-50 border-emerald-400' : 'hover:bg-slate-50',
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
        class="text-xs"
        :class="isToday ? 'font-bold text-emerald-700' : 'text-slate-500'"
      >
        {{ dayNumber }}
      </span>
    </div>
    <ul
      class="flex-1 overflow-y-auto px-1.5 pb-1 mt-0.5 text-xs leading-tight space-y-0.5"
    >
      <li
        v-for="dish in dishes"
        :key="dish.id"
        class="truncate text-slate-700"
        :title="dish.name"
      >
        {{ dish.name || '(無題)' }}
      </li>
    </ul>
  </div>
</template>
