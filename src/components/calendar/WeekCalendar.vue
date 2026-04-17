<script setup lang="ts">
import { computed } from 'vue'
import type { MenuEntry } from '@/domain/types'
import DayCell from '@/components/calendar/DayCell.vue'
import { addDays, formatJpDateShort, isSameDay, toDateKey, weekDaysFrom } from '@/utils/date'

const props = defineProps<{
  anchor: Date
  today: Date
  menusByDate: Record<string, MenuEntry>
  dragSourceDate: string | null
  dropTargetDate: string | null
}>()

const emit = defineEmits<{
  (e: 'prev'): void
  (e: 'next'): void
  (e: 'cellClick', date: Date): void
  (e: 'dragstart', date: string): void
  (e: 'dragend'): void
  (e: 'drop', payload: { fromDate: string; toDate: string }): void
  (e: 'dragenter', date: string): void
  (e: 'dragleave', date: string): void
}>()

const days = computed(() => weekDaysFrom(props.anchor))
const rangeLabel = computed(() => {
  const start = formatJpDateShort(days.value[0])
  const end = formatJpDateShort(days.value[6])
  return `${start} 〜 ${end}`
})

const weekdayLabels = ['日', '月', '火', '水', '木', '金', '土']
function weekdayOf(date: Date): string {
  return weekdayLabels[date.getDay()]
}
function weekdayColor(date: Date): string {
  const d = date.getDay()
  if (d === 0) return 'text-rose-600'
  if (d === 6) return 'text-blue-600'
  return 'text-slate-600'
}

// eslint などで未使用扱い回避
void addDays
</script>

<template>
  <section>
    <div class="flex items-center gap-3 mb-2">
      <button
        type="button"
        class="px-3 py-1 rounded border border-slate-300 bg-white text-sm hover:bg-slate-100"
        @click="emit('prev')"
        aria-label="1日前"
      >
        ◀
      </button>
      <h3 class="text-base font-semibold text-slate-800 min-w-[220px] text-center">
        {{ rangeLabel }}
      </h3>
      <button
        type="button"
        class="px-3 py-1 rounded border border-slate-300 bg-white text-sm hover:bg-slate-100"
        @click="emit('next')"
        aria-label="1日後"
      >
        ▶
      </button>
    </div>
    <div class="grid grid-cols-7 bg-slate-200 gap-px rounded overflow-hidden">
      <div
        v-for="day in days"
        :key="'label-' + toDateKey(day)"
        class="bg-slate-100 text-center text-xs py-1"
        :class="weekdayColor(day)"
      >
        {{ weekdayOf(day) }} {{ day.getMonth() + 1 }}/{{ day.getDate() }}
      </div>
      <DayCell
        v-for="day in days"
        :key="toDateKey(day)"
        :date="day"
        :menu="menusByDate[toDateKey(day)]"
        :is-today="isSameDay(day, today)"
        compact
        :drag-source-date="dragSourceDate"
        :drop-target-date="dropTargetDate"
        @click="emit('cellClick', $event)"
        @dragstart="emit('dragstart', $event)"
        @dragend="emit('dragend')"
        @drop="emit('drop', $event)"
        @dragenter="emit('dragenter', $event)"
        @dragleave="emit('dragleave', $event)"
      />
    </div>
  </section>
</template>
