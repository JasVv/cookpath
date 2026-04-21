<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import MonthCalendar from '@/components/calendar/MonthCalendar.vue'
import WeekCalendar from '@/components/calendar/WeekCalendar.vue'
import MenuEditModal from '@/components/menu/MenuEditModal.vue'
import type { MenuEntry } from '@/domain/types'
import { useMenus } from '@/composables/useMenus'
import { lockBodyScroll, unlockBodyScroll } from '@/composables/useBodyScrollLock'
import {
  addDays,
  addMonths,
  monthGridDays,
  startOfMonth,
  toDateKey,
  weekDaysFrom,
} from '@/utils/date'
import { copyMenu, swapMenu } from '@/db/repositories/menus'

const today = new Date()
const monthAnchor = ref(startOfMonth(today))
const weekAnchor = ref(today)
const { menusByDate, loadRange, save } = useMenus()

const editingDate = ref<string | null>(null)
const dragSourceDate = ref<string | null>(null)
const dropTargetDate = ref<string | null>(null)

const dropConfirm = ref<null | { fromDate: string; toDate: string }>(null)

// dropConfirm 表示中は body のスクロールをロックする
let dropConfirmLocked = false
watch(dropConfirm, (v) => {
  if (v && !dropConfirmLocked) {
    lockBodyScroll()
    dropConfirmLocked = true
  } else if (!v && dropConfirmLocked) {
    unlockBodyScroll()
    dropConfirmLocked = false
  }
})
onBeforeUnmount(() => {
  if (dropConfirmLocked) {
    unlockBodyScroll()
    dropConfirmLocked = false
  }
})

const monthRange = computed(() => {
  const days = monthGridDays(monthAnchor.value)
  return { from: toDateKey(days[0]), to: toDateKey(days[days.length - 1]) }
})

const weekRange = computed(() => {
  const days = weekDaysFrom(weekAnchor.value)
  return { from: toDateKey(days[0]), to: toDateKey(days[6]) }
})

async function reloadAll() {
  const from = monthRange.value.from < weekRange.value.from ? monthRange.value.from : weekRange.value.from
  const to = monthRange.value.to > weekRange.value.to ? monthRange.value.to : weekRange.value.to
  await loadRange(from, to)
}

onMounted(reloadAll)

async function goPrevMonth() {
  monthAnchor.value = startOfMonth(addMonths(monthAnchor.value, -1))
  await reloadAll()
}
async function goNextMonth() {
  monthAnchor.value = startOfMonth(addMonths(monthAnchor.value, 1))
  await reloadAll()
}
async function goPrevWeek() {
  weekAnchor.value = addDays(weekAnchor.value, -1)
  await reloadAll()
}
async function goNextWeek() {
  weekAnchor.value = addDays(weekAnchor.value, 1)
  await reloadAll()
}

function openEditor(date: Date) {
  editingDate.value = toDateKey(date)
}
function closeEditor() {
  editingDate.value = null
}
async function onSaved(entry: MenuEntry) {
  await save(entry)
  editingDate.value = null
}

function onDragStart(date: string) {
  dragSourceDate.value = date
}
function onDragEnd() {
  dragSourceDate.value = null
  dropTargetDate.value = null
}
function onDragEnter(date: string) {
  dropTargetDate.value = date
}
function onDragLeave(date: string) {
  if (dropTargetDate.value === date) dropTargetDate.value = null
}

async function onDrop(payload: { fromDate: string; toDate: string }) {
  const { fromDate, toDate } = payload
  if (fromDate === toDate) {
    onDragEnd()
    return
  }
  const hasTarget = !!menusByDate.value[toDate]
  if (!hasTarget) {
    await copyMenu(fromDate, toDate)
    await reloadAll()
    onDragEnd()
    return
  }
  dropConfirm.value = { fromDate, toDate }
}

async function performOverwrite() {
  if (!dropConfirm.value) return
  const { fromDate, toDate } = dropConfirm.value
  await copyMenu(fromDate, toDate)
  dropConfirm.value = null
  await reloadAll()
  onDragEnd()
}
async function performSwap() {
  if (!dropConfirm.value) return
  const { fromDate, toDate } = dropConfirm.value
  await swapMenu(fromDate, toDate)
  dropConfirm.value = null
  await reloadAll()
  onDragEnd()
}
function cancelDrop() {
  dropConfirm.value = null
  onDragEnd()
}
</script>

<template>
  <section class="space-y-6">
    <WeekCalendar
      :anchor="weekAnchor"
      :today="today"
      :menus-by-date="menusByDate"
      :drag-source-date="dragSourceDate"
      :drop-target-date="dropTargetDate"
      @prev="goPrevWeek"
      @next="goNextWeek"
      @cell-click="openEditor"
      @dragstart="onDragStart"
      @dragend="onDragEnd"
      @drop="onDrop"
      @dragenter="onDragEnter"
      @dragleave="onDragLeave"
    />

    <MonthCalendar
      :anchor="monthAnchor"
      :today="today"
      :menus-by-date="menusByDate"
      :drag-source-date="dragSourceDate"
      :drop-target-date="dropTargetDate"
      @prev="goPrevMonth"
      @next="goNextMonth"
      @cell-click="openEditor"
      @dragstart="onDragStart"
      @dragend="onDragEnd"
      @drop="onDrop"
      @dragenter="onDragEnter"
      @dragleave="onDragLeave"
    />

    <MenuEditModal
      v-if="editingDate"
      :date="editingDate"
      @close="closeEditor"
      @saved="onSaved"
    />

    <div
      v-if="dropConfirm"
      class="fixed inset-0 z-50 bg-ink-900/50 flex items-center justify-center p-4"
      @mousedown.self="cancelDrop"
    >
      <div class="bg-surface rounded-xl shadow-raised border border-border w-full max-w-md p-5">
        <h3 class="text-base font-bold text-text mb-2">ドロップ先に既に献立があります</h3>
        <p class="text-sm text-text-muted mb-4">
          {{ dropConfirm.fromDate }} の献立を {{ dropConfirm.toDate }} にどう反映しますか？
        </p>
        <div class="flex flex-col gap-2 text-sm">
          <button
            type="button"
            class="px-4 py-2 border border-border rounded-md bg-surface hover:bg-bg-subtle text-left"
            @click="performOverwrite"
          >
            <span class="font-semibold text-text">上書き</span>
            <span class="text-text-muted ml-2">ドラッグ元はそのまま、ドロップ先を置換（コピー）</span>
          </button>
          <button
            type="button"
            class="px-4 py-2 border border-border rounded-md bg-surface hover:bg-bg-subtle text-left"
            @click="performSwap"
          >
            <span class="font-semibold text-text">入れ替え</span>
            <span class="text-text-muted ml-2">ドラッグ元とドロップ先の内容を交換</span>
          </button>
          <button
            type="button"
            class="px-4 py-2 border border-border rounded-md bg-surface hover:bg-bg-subtle text-left"
            @click="cancelDrop"
          >
            <span class="font-semibold text-text">キャンセル</span>
          </button>
        </div>
      </div>
    </div>

  </section>
</template>
