// モーダル等で body のスクロールを止める。複数モーダルの入れ子に対応するためカウンタで管理する。
let lockCount = 0
let originalOverflow: string | null = null

export function lockBodyScroll(): void {
  if (lockCount === 0) {
    originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  lockCount++
}

export function unlockBodyScroll(): void {
  if (lockCount === 0) return
  lockCount--
  if (lockCount === 0) {
    document.body.style.overflow = originalOverflow ?? ''
    originalOverflow = null
  }
}
