import {
  format,
  parseISO,
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  differenceInDays,
} from 'date-fns'
import { ja } from 'date-fns/locale'

export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function parseDateKey(key: string): Date {
  return parseISO(key)
}

export function formatJpDate(date: Date): string {
  return format(date, 'yyyy年M月d日(EEEEE)', { locale: ja })
}

export function formatJpDateShort(date: Date): string {
  return format(date, 'M/d(EEEEE)', { locale: ja })
}

export function formatJpMonth(date: Date): string {
  return format(date, 'yyyy年M月', { locale: ja })
}

export function formatJpDateTime(date: Date): string {
  return format(date, 'yyyy/MM/dd HH:mm', { locale: ja })
}

export function monthGridDays(anchor: Date): Date[] {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 0 })
  const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 0 })
  return eachDayOfInterval({ start, end })
}

export function weekDaysFrom(anchor: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(anchor, i))
}

export {
  addDays,
  addMonths,
  isSameDay,
  isSameMonth,
  differenceInDays,
  startOfMonth,
  endOfMonth,
}
