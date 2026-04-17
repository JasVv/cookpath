<script setup lang="ts">
import { computed } from 'vue'
import type { MenuEntry } from '@/domain/types'
import DayCell from '@/components/calendar/DayCell.vue'
import { formatJpMonth, isSameDay, isSameMonth, monthGridDays, toDateKey } from '@/utils/date'

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

const days = computed(() => monthGridDays(props.anchor))

const weekdayLabels = ['日', '月', '火', '水', '木', '金', '土']
</script>

<template>
  <section>
    <div class="flex items-center gap-3 mb-2">
      <button
        type="button"
        class="px-3 py-1 rounded border border-slate-300 bg-white text-sm hover:bg-slate-100"
        @click="emit('prev')"
        aria-label="前の月"
      >
        ◀
      </button>
      <h3 class="text-base font-semibold text-slate-800 min-w-[120px] text-center">
        {{ formatJpMonth(anchor) }}
      </h3>
      <button
        type="button"
        class="px-3 py-1 rounded border border-slate-300 bg-white text-sm hover:bg-slate-100"
        @click="emit('next')"
        aria-label="次の月"
      >
        ▶
      </button>
    </div>
    <div class="grid grid-cols-7 bg-slate-200 gap-px rounded overflow-hidden">
      <div
        v-for="(label, idx) in weekdayLabels"
        :key="label"
        class="bg-slate-100 text-center text-xs font-medium py-1"
        :class="idx === 0 ? 'text-rose-600' : idx === 6 ? 'text-blue-600' : 'text-slate-600'"
      >
        {{ label }}
      </div>
      <DayCell
        v-for="day in days"
        :key="toDateKey(day)"
        :date="day"
        :menu="menusByDate[toDateKey(day)]"
        :is-outside-month="!isSameMonth(day, anchor)"
        :is-today="isSameDay(day, today)"
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
