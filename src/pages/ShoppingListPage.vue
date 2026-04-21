<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useShoppingList } from '@/composables/useShoppingList'
import { formatJpDateShort, parseDateKey } from '@/utils/date'

const {
  fromKey,
  toKey,
  sortMode,
  rows,
  supplyRows,
  checked,
  generate,
  sortedRows,
  sortedSupplyRows,
  clearChecks,
} = useShoppingList()

onMounted(async () => {
  // 画面復帰時にカレンダーや日用品の追加・削除を反映させるため自動で再生成する
  await generate()
})

async function regenerate() {
  await generate()
}

const displayRows = computed(() => sortedRows(sortMode.value))
const displaySupplyRows = computed(() => sortedSupplyRows(sortMode.value))

function toggle(id: string) {
  checked.value = { ...checked.value, [id]: !checked.value[id] }
}

function sourceLabel(dateKey: string, dishName: string): string {
  return `${formatJpDateShort(parseDateKey(dateKey))} ${dishName || '(無題)'}`
}
</script>

<template>
  <section class="max-w-3xl">
    <h2 class="flex items-center gap-2.5 text-lg font-bold text-text mb-4">
      <span class="w-1 h-5 rounded-sm bg-accent"></span>
      買い物リスト
    </h2>

    <div class="flex flex-wrap items-center gap-3 mb-4">
      <label class="flex items-center gap-2 text-sm">
        <span class="text-text-muted">期間:</span>
        <input
          v-model="fromKey"
          type="date"
          class="px-2.5 py-1.5 border border-border rounded-md text-sm bg-surface text-text tabular focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
        <span class="text-text-muted">〜</span>
        <input
          v-model="toKey"
          type="date"
          class="px-2.5 py-1.5 border border-border rounded-md text-sm bg-surface text-text tabular focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </label>
      <button
        type="button"
        class="px-3.5 py-1.5 text-[13px] font-semibold rounded-md bg-accent text-white hover:bg-accent-hover transition-colors"
        @click="regenerate"
      >
        生成
      </button>

      <div class="flex items-center gap-3 text-sm ml-4">
        <span class="text-text-muted">並び順:</span>
        <label class="flex items-center gap-1 text-text">
          <input v-model="sortMode" type="radio" value="date" class="accent-primary" />
          日付順
        </label>
        <label class="flex items-center gap-1 text-text">
          <input v-model="sortMode" type="radio" value="name" class="accent-primary" />
          材料名順
        </label>
      </div>
    </div>

    <div v-if="rows.length === 0 && supplyRows.length === 0" class="text-sm text-text-muted py-8 text-center">
      指定期間内に材料が登録された料理がなく、日用品も登録されていません。
    </div>

    <div v-else class="space-y-6">
      <div>
        <h3 class="text-sm font-bold text-text mb-2">食材</h3>
        <div v-if="rows.length === 0" class="text-sm text-text-muted py-4 text-center bg-surface border border-border rounded-lg">
          指定期間内に材料が登録された料理がありません。
        </div>
        <ul v-else class="bg-surface border border-border rounded-lg divide-y divide-border shadow-card overflow-hidden">
          <li
            v-for="row in displayRows"
            :key="row.id"
            class="flex items-center gap-3 px-3.5 py-2 text-sm transition-colors hover:bg-bg-subtle"
            :class="checked[row.id] ? 'line-through opacity-60 text-text' : 'text-text'"
          >
            <input
              type="checkbox"
              class="w-4 h-4 accent-accent cursor-pointer"
              :checked="!!checked[row.id]"
              @change="toggle(row.id)"
            />
            <span class="flex-1 truncate">{{ row.name }}</span>
            <span class="w-32 text-right text-text-muted tabular">{{ row.amount }} {{ row.unit }}</span>
            <span class="w-48 text-xs text-text-muted text-right truncate">
              ({{ sourceLabel(row.date, row.dishName) }})
            </span>
          </li>
        </ul>
      </div>

      <div v-if="supplyRows.length > 0">
        <h3 class="text-sm font-bold text-text mb-2">日用品</h3>
        <ul class="bg-surface border border-border rounded-lg divide-y divide-border shadow-card overflow-hidden">
          <li
            v-for="row in displaySupplyRows"
            :key="row.id"
            class="flex items-center gap-3 px-3.5 py-2 text-sm transition-colors hover:bg-bg-subtle"
            :class="checked[row.id] ? 'line-through opacity-60 text-text' : 'text-text'"
          >
            <input
              type="checkbox"
              class="w-4 h-4 accent-accent cursor-pointer"
              :checked="!!checked[row.id]"
              @change="toggle(row.id)"
            />
            <span class="flex-1 truncate">{{ row.name }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div v-if="rows.length > 0 || supplyRows.length > 0" class="mt-3">
      <button
        type="button"
        class="px-3 py-1.5 text-xs font-semibold border border-border rounded-md bg-surface text-text hover:bg-bg-subtle transition-colors"
        @click="clearChecks"
      >
        すべてチェック解除
      </button>
    </div>
  </section>
</template>
