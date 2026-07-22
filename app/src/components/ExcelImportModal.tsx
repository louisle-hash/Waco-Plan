import { useMemo, useState } from 'react'
import { db, type Product } from '../lib/db'
import {
  IMPORT_FIELDS,
  guessMapping,
  parseRows,
  readWorkbook,
  downloadTemplate,
  type ColumnMapping,
  type ImportField,
  type ParsedRow,
  type SheetData,
} from '../lib/excelImport'
import { Button, Field, Modal } from './ui'
import { useT } from '../lib/LangContext'

type DupMode = 'skip' | 'update'

/** Nhập sản phẩm hàng loạt từ file Excel: chọn file -> ánh xạ cột -> xem trước -> nạp. */
export default function ExcelImportModal({
  open,
  onClose,
  onImported,
}: {
  open: boolean
  onClose: () => void
  onImported: (count: number) => void
}) {
  const { t, lang } = useT()
  const [file, setFile] = useState<File | null>(null)
  const [sheet, setSheet] = useState<SheetData | null>(null)
  const [mapping, setMapping] = useState<ColumnMapping | null>(null)
  const [existingSkus, setExistingSkus] = useState<Set<string>>(new Set())
  const [dupMode, setDupMode] = useState<DupMode>('skip')
  const [error, setError] = useState<string>('')
  const [busy, setBusy] = useState(false)

  const reset = () => {
    setFile(null)
    setSheet(null)
    setMapping(null)
    setError('')
    setBusy(false)
  }

  const close = () => {
    reset()
    onClose()
  }

  async function loadFile(f: File, sheetName?: string) {
    setError('')
    setBusy(true)
    try {
      const data = await readWorkbook(f, sheetName)
      if (!data.rows.length) {
        setError(t('imp.noRows'))
        setSheet(null)
        return
      }
      const skus = new Set((await db.products.toArray()).map((p) => p.sku.toLowerCase()))
      setExistingSkus(skus)
      setFile(f)
      setSheet(data)
      setMapping(guessMapping(data.headers))
    } catch {
      setError(t('imp.readFail'))
      setSheet(null)
    } finally {
      setBusy(false)
    }
  }

  const parsed: ParsedRow[] = useMemo(() => {
    if (!sheet || !mapping) return []
    return parseRows(sheet.rows, mapping, existingSkus)
  }, [sheet, mapping, existingSkus])

  const stats = useMemo(() => {
    const invalid = parsed.filter((r) => r.errors.length)
    const dupFile = parsed.filter((r) => !r.errors.length && r.duplicateInFile)
    const dupExisting = parsed.filter((r) => !r.errors.length && !r.duplicateInFile && r.duplicateOfExisting)
    const fresh = parsed.filter(
      (r) => !r.errors.length && !r.duplicateInFile && !r.duplicateOfExisting,
    )
    return { invalid, dupFile, dupExisting, fresh }
  }, [parsed])

  const willImport = dupMode === 'update' ? stats.fresh.length + stats.dupExisting.length : stats.fresh.length

  async function runImport() {
    if (!parsed.length) return
    setBusy(true)
    setError('')
    try {
      const toAdd: Omit<Product, 'id'>[] = stats.fresh.map((r) => r.product)
      let updated = 0

      await db.transaction('rw', db.products, async () => {
        if (toAdd.length) await db.products.bulkAdd(toAdd as Product[])

        if (dupMode === 'update') {
          for (const r of stats.dupExisting) {
            const existing = await db.products.where('sku').equals(r.product.sku).first()
            if (existing?.id) {
              await db.products.update(existing.id, {
                ...r.product,
                createdAt: existing.createdAt, // giữ ngày tạo gốc
                updatedAt: Date.now(),
              })
              updated++
            }
          }
        }
      })

      onImported(toAdd.length + updated)
      close()
    } catch {
      setError(t('imp.runFail'))
      setBusy(false)
    }
  }

  return (
    <Modal open={open} title={t('imp.title')} onClose={close} wide>
      {/* Bước 1 — chọn file */}
      <section className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-primary">{t('imp.step1')}</h3>
          <button
            onClick={() => downloadTemplate(lang)}
            className="cursor-pointer text-xs font-semibold text-accent underline transition-opacity hover:opacity-75"
          >
            {t('imp.template')}
          </button>
        </div>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) loadFile(f)
          }}
          className="w-full cursor-pointer rounded-md border border-line p-2 text-sm file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
        />
        {file && sheet && sheet.sheetNames.length > 1 && (
          <div className="mt-2">
            <Field label={t('imp.sheet')}>
              <select
                value={sheet.activeSheet}
                onChange={(e) => loadFile(file, e.target.value)}
                className="w-full cursor-pointer rounded-md border border-line px-2 py-1.5 text-sm"
              >
                {sheet.sheetNames.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}
      </section>

      {error && (
        <p className="mb-3 rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {sheet && mapping && (
        <>
          {/* Bước 2 — ánh xạ cột */}
          <section className="mb-4">
            <h3 className="mb-2 text-sm font-bold text-primary">{t('imp.step2')}</h3>
            <p className="mb-2 text-xs text-ink/60">
              {t('imp.step2Hint')}
            </p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {IMPORT_FIELDS.map((f) => (
                <Field
                  key={f.key}
                  label={f.required ? `${t(f.labelKey)} *` : t(f.labelKey)}
                >
                  <select
                    value={mapping[f.key as ImportField]}
                    onChange={(e) =>
                      setMapping({ ...mapping, [f.key]: e.target.value } as ColumnMapping)
                    }
                    className="w-full cursor-pointer rounded-md border border-line px-2 py-1.5 text-sm"
                  >
                    <option value="">{t('common.skip')}</option>
                    {sheet.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </Field>
              ))}
            </div>
          </section>

          {/* Bước 3 — xem trước */}
          <section className="mb-4">
            <h3 className="mb-2 text-sm font-bold text-primary">{t('imp.step3')}</h3>

            <div className="mb-2 flex flex-wrap gap-2 text-xs">
              <Chip tone="ok" label={t('imp.newCount', { n: stats.fresh.length })} />
              <Chip tone="warn" label={t('imp.dupExisting', { n: stats.dupExisting.length })} />
              <Chip tone="warn" label={t('imp.dupFile', { n: stats.dupFile.length })} />
              <Chip tone="bad" label={t('imp.errCount', { n: stats.invalid.length })} />
            </div>

            {stats.dupExisting.length > 0 && (
              <div className="mb-2 rounded border border-line bg-muted/25 p-2">
                <p className="mb-1 text-xs font-semibold text-ink/80">
                  {t('imp.dupQuestion')}
                </p>
                <div className="flex gap-4 text-sm">
                  <label className="flex cursor-pointer items-center gap-1.5">
                    <input
                      type="radio"
                      checked={dupMode === 'skip'}
                      onChange={() => setDupMode('skip')}
                      className="cursor-pointer"
                    />
                    {t('imp.dupSkip')}
                  </label>
                  <label className="flex cursor-pointer items-center gap-1.5">
                    <input
                      type="radio"
                      checked={dupMode === 'update'}
                      onChange={() => setDupMode('update')}
                      className="cursor-pointer"
                    />
                    {t('imp.dupUpdate')}
                  </label>
                </div>
              </div>
            )}

            <div className="max-h-64 overflow-auto rounded border border-line">
              <table className="w-full border-collapse text-xs">
                <thead className="sticky top-0 bg-primary text-white">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-semibold">{t('imp.colRow')}</th>
                    <th className="px-2 py-1.5 text-left font-semibold">SKU</th>
                    <th className="px-2 py-1.5 text-left font-semibold">{t('imp.fieldName')}</th>
                    <th className="px-2 py-1.5 text-left font-semibold">{t('imp.fieldSize')}</th>
                    <th className="px-2 py-1.5 text-left font-semibold">{t('imp.colState')}</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.slice(0, 300).map((r) => {
                    const bad = r.errors.length > 0 || r.duplicateInFile
                    const dup = r.duplicateOfExisting && !r.duplicateInFile && !r.errors.length
                    return (
                      <tr
                        key={r.rowNumber}
                        className={`border-t border-line ${bad ? 'bg-destructive/10' : dup ? 'bg-[#FACC15]/20' : ''}`}
                      >
                        <td className="px-2 py-1 text-ink/60">{r.rowNumber}</td>
                        <td className="px-2 py-1 font-mono">{r.product.sku || '—'}</td>
                        <td className="px-2 py-1">{r.product.name || '—'}</td>
                        <td className="px-2 py-1">{r.product.size || '—'}</td>
                        <td className="px-2 py-1">
                          {r.errors.length > 0
                            ? r.errors.map((k) => t(k)).join(', ')
                            : r.duplicateInFile
                              ? t('imp.willSkipFileDup')
                              : r.duplicateOfExisting
                                ? dupMode === 'update'
                                  ? t('imp.willUpdate')
                                  : t('imp.willSkipExisting')
                                : t('imp.willAdd')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {parsed.length > 300 && (
              <p className="mt-1 text-xs text-ink/50">
                {t('imp.preview300', { n: parsed.length })}
              </p>
            )}
          </section>
        </>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
        <Button variant="ghost" onClick={close} disabled={busy}>
          {t('common.cancel')}
        </Button>
        <Button onClick={runImport} disabled={busy || willImport === 0}>
          {busy ? t('common.processing') : t('imp.run', { n: willImport })}
        </Button>
      </div>
    </Modal>
  )
}

function Chip({ tone, label }: { tone: 'ok' | 'warn' | 'bad'; label: string }) {
  const tones = {
    ok: 'bg-[#22C55E]/20 text-[#166534]',
    warn: 'bg-[#FACC15]/25 text-[#854D0E]',
    bad: 'bg-destructive/15 text-destructive',
  }
  return <span className={`rounded px-2 py-0.5 font-semibold ${tones[tone]}`}>{label}</span>
}
