<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useShoppingList } from '@/composables/useShoppingList'
import { formatJpDateShort, parseDateKey } from '@/utils/date'

const { fromKey, toKey, sortMode, rows, checked, generate, sortedRows, clearChecks } =
  useShoppingList()

onMounted(async () => {
  // 画面復帰時にカレンダーの追加・削除を反映させるため自動で再生成する
  await generate()
})

async function regenerate() {
  await generate()
}

const displayRows = computed(() => sortedRows(sortMode.value))

function toggle(id: string) {
  checked.value = { ...checked.value, [id]: !checked.value[id] }
}

function sourceLabel(dateKey: string, dishName: string): string {
  return `${formatJpDateShort(parseDateKey(dateKey))} ${dishName || '(無題)'}`
}
</script>

<template>
  <section>
    <h2 class="text-lg font-semibold text-slate-700 mb-4">買い物リスト</h2>

    <div class="flex flex-wrap items-center gap-3 mb-4">
      <label class="flex items-center gap-2 text-sm">
        <span class="text-slate-600">期間:</span>
        <input
          v-model="fromKey"
          type="date"
          class="px-2 py-1 border border-slate-300 rounded text-sm"
        />
        <span class="text-slate-500">〜</span>
        <input
          v-model="toKey"
          type="date"
          class="px-2 py-1 border border-slate-300 rounded text-sm"
        />
      </label>
      <button
        type="button"
        class="px-4 py-1.5 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700"
        @click="regenerate"
      >
        生成
      </button>

      <div class="flex items-center gap-3 text-sm ml-4">
        <span class="text-slate-600">並び順:</span>
        <label class="flex items-center gap-1">
          <input v-model="sortMode" type="radio" value="date" />
          日付順
        </label>
        <label class="flex items-center gap-1">
          <input v-model="sortMode" type="radio" value="name" />
          材料名順
        </label>
      </div>
    </div>

    <div v-if="rows.length === 0" class="text-sm text-slate-500 py-8 text-center">
      指定期間内に材料が登録された料理がありません。
    </div>

    <ul v-else class="bg-white border border-slate-200 rounded divide-y divide-slate-100">
      <li
        v-for="row in displayRows"
        :key="row.id"
        class="flex items-center gap-3 px-3 py-2 text-sm"
        :class="checked[row.id] ? 'line-through text-slate-400' : 'text-slate-800'"
      >
        <input
          type="checkbox"
          class="w-4 h-4"
          :checked="!!checked[row.id]"
          @change="toggle(row.id)"
        />
        <span class="flex-1 truncate">{{ row.name }}</span>
        <span class="w-32 text-right text-slate-600">{{ row.amount }} {{ row.unit }}</span>
        <span class="w-48 text-xs text-slate-500 text-right truncate">
          ({{ sourceLabel(row.date, row.dishName) }})
        </span>
      </li>
    </ul>

    <div v-if="rows.length > 0" class="mt-3">
      <button
        type="button"
        class="px-3 py-1.5 text-sm border border-slate-300 rounded hover:bg-slate-100"
        @click="clearChecks"
      >
        すべてチェック解除
      </button>
    </div>
  </section>
</template>
