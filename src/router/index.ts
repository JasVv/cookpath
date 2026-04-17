import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'calendar',
    component: () => import('@/pages/CalendarPage.vue'),
    meta: { label: 'カレンダー' },
  },
  {
    path: '/recipes',
    name: 'recipes',
    component: () => import('@/pages/RecipesPage.vue'),
    meta: { label: 'レシピ' },
  },
  {
    path: '/shopping',
    name: 'shopping',
    component: () => import('@/pages/ShoppingListPage.vue'),
    meta: { label: '買い物リスト' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/pages/SettingsPage.vue'),
    meta: { label: '設定' },
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
