export interface Ingredient {
  name: string
  amount: string
  unit: string
}

export interface Recipe {
  id: string
  name: string
  ingredients: Ingredient[]
  procedureMemo: string
  createdAt: Date
  updatedAt: Date
}

export interface Dish {
  id: string
  name: string
  recipeId: string | null
  ingredients: Ingredient[]
  procedureMemo: string
}

export interface MenuEntry {
  date: string
  dishes: Dish[]
}

export interface AppMeta {
  id: 'singleton'
  lastExportedAt: Date | null
}
