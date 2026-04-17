import { exportAll, importAll, type BackupFile } from '@/db/backup'
import { touchExportedAt } from '@/db/repositories/meta'
import { format } from 'date-fns'

export async function runExport(): Promise<void> {
  const data: BackupFile = await exportAll()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cookpath-backup-${format(new Date(), 'yyyyMMdd-HHmm')}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  await touchExportedAt()
}

export async function runImportFromFile(file: File): Promise<void> {
  const text = await file.text()
  const raw = JSON.parse(text)
  await importAll(raw)
}
