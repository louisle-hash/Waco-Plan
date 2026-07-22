import { useState } from 'react'
import {
  importWeekBackup,
  previewImport,
  readWeekBackupFile,
  type ImportPreview,
  type WeekBackup,
} from '../lib/weekBackup'
import { useT } from '../lib/LangContext'
import { Button, Modal } from './ui'

/** Nạp một tuần từ file .json đã xuất trước đó (xem lib/weekBackup.ts). */
export default function WeekImportModal({
  open,
  onClose,
  onImported,
}: {
  open: boolean
  onClose: () => void
  onImported: (weekNumber: number) => void
}) {
  const { t } = useT()
  const [backup, setBackup] = useState<WeekBackup | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const reset = () => {
    setBackup(null)
    setPreview(null)
    setError('')
    setBusy(false)
  }

  const close = () => {
    reset()
    onClose()
  }

  async function loadFile(file: File) {
    setError('')
    setBusy(true)
    try {
      const b = await readWeekBackupFile(file)
      const p = await previewImport(b)
      setBackup(b)
      setPreview(p)
    } catch {
      setError(t('wimp.invalidFile'))
      setBackup(null)
      setPreview(null)
    } finally {
      setBusy(false)
    }
  }

  async function confirm() {
    if (!backup) return
    setBusy(true)
    setError('')
    try {
      const result = await importWeekBackup(backup, { createMissingProducts: true })
      onImported(backup.weekNumber)
      close()
      return result
    } catch (e) {
      if (e instanceof Error && e.message === 'WEEK_FINALIZED') {
        setError(t('wimp.finalizedBlock', { week: backup.weekNumber }))
      } else {
        setError(t('wimp.readError'))
      }
      setBusy(false)
    }
  }

  return (
    <Modal open={open} title={t('wimp.title')} onClose={close}>
      <input
        type="file"
        accept=".json"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) loadFile(f)
        }}
        className="w-full cursor-pointer rounded-md border border-line p-2 text-sm file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
      />

      {error && (
        <p className="mt-3 rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {preview && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-primary">
            {t('wimp.summary', {
              week: preview.weekNumber,
              matched: preview.matchedCount,
              total: preview.rows.length,
            })}
          </p>

          {preview.unmatchedCount > 0 && (
            <p className="mt-1.5 rounded border border-line bg-muted/25 px-2 py-1.5 text-xs text-ink/70">
              {t('wimp.unmatchedNote', { n: preview.unmatchedCount })}
            </p>
          )}

          {preview.existingWeek && !preview.existingWeek.finalized && (
            <p className="mt-1.5 rounded border border-destructive/40 bg-destructive/10 px-2 py-1.5 text-xs font-semibold text-destructive">
              {t('wimp.overwriteWarning', { week: preview.weekNumber })}
            </p>
          )}

          {preview.existingWeek?.finalized && (
            <p className="mt-1.5 rounded border border-destructive/40 bg-destructive/10 px-2 py-1.5 text-xs font-semibold text-destructive">
              {t('wimp.finalizedBlock', { week: preview.weekNumber })}
            </p>
          )}

          <div className="mt-2 max-h-56 overflow-auto rounded border border-line">
            <table className="w-full text-xs">
              <tbody>
                {preview.rows.map((r, i) => (
                  <tr key={i} className={`border-b border-line last:border-0 ${r.matchedProductId ? '' : 'bg-[#FACC15]/15'}`}>
                    <td className="px-2 py-1 font-mono">{r.backupRow.sku}</td>
                    <td className="px-2 py-1">
                      {r.backupRow.productName}
                      {r.backupRow.size ? `-${r.backupRow.size}` : ''}
                    </td>
                    <td className="px-2 py-1 text-right text-ink/60">
                      {r.matchedProductId ? '✓' : '+ new'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end gap-2 border-t border-line pt-3">
        <Button variant="ghost" onClick={close} disabled={busy}>
          {t('common.cancel')}
        </Button>
        <Button onClick={confirm} disabled={busy || !preview || preview.existingWeek?.finalized === true}>
          {busy ? t('common.processing') : t('wimp.confirm', { week: preview?.weekNumber ?? '' })}
        </Button>
      </div>
    </Modal>
  )
}
