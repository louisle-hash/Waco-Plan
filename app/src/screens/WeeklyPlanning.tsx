import { useEffect, useMemo, useState } from 'react'
import { useCloudQuery } from '../lib/useCloudQuery'
import {
  DAY_KEYS,
  DAY_LABELS,
  db,
  duplicateWeek,
  emptyDays,
  finalizeWeek,
  getOrCreateCurrentWeek,
  lastWeekTotals,
  loadStatusLabels,
  rowTotal,
  setSetting,
  touchWeek,
  SETTING_STATUS_LABELS,
  type DayKey,
  type Product,
  type Week,
  type WeekRow,
} from '../lib/db'
import {
  DEFAULT_BRAND,
  DEFAULT_STATUS_LABELS,
  STATUS_COLORS,
  STATUS_KEYS,
  readableTextOn,
  type BrandConfig,
  type StatusKey,
} from '../lib/theme'
import { loadBrand } from '../lib/db'
import { A4_LANDSCAPE, printWith } from '../lib/printing'
import { downloadWeekBackup, exportWeek } from '../lib/weekBackup'
import { Button, Card, EmptyState, Field, Input, Modal } from '../components/ui'
import WeekPrintSheet from '../components/WeekPrintSheet'
import WeekImportModal from '../components/WeekImportModal'
import ConnectionBanner from '../components/ConnectionBanner'
import { useT } from '../lib/LangContext'

export default function WeeklyPlanning() {
  const { t } = useT()
  const [weekId, setWeekId] = useState<number | null>(null)
  const [lastWeek, setLastWeek] = useState<Map<number, number>>(new Map())
  const [statusLabels, setStatusLabels] = useState(DEFAULT_STATUS_LABELS)
  const [brand, setBrand] = useState<BrandConfig>(DEFAULT_BRAND)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [legendOpen, setLegendOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [toast, setToast] = useState('')

  const { data: weeks } = useCloudQuery(
    () => db.weeks.orderBy('weekNumber').toArray(),
    ['weeks'],
    [],
    [] as Week[],
  )
  const { data: week } = useCloudQuery(
    () => (weekId ? db.weeks.get(weekId) : Promise.resolve(undefined)),
    ['weeks'],
    [weekId],
    undefined as Week | undefined,
  )
  const { data: rows, error: rowsError } = useCloudQuery(
    () => (weekId ? db.weekRows.where('weekId').equals(weekId).sortBy('sortIndex') : Promise.resolve([])),
    ['week_rows'],
    [weekId],
    [] as WeekRow[],
  )

  useEffect(() => {
    getOrCreateCurrentWeek().then((w) => setWeekId(w.id!))
    loadStatusLabels().then(setStatusLabels)
    loadBrand().then(setBrand)
  }, [])

  useEffect(() => {
    if (week?.weekNumber != null) lastWeekTotals(week.weekNumber).then(setLastWeek)
  }, [week?.weekNumber])

  const visibleDays: DayKey[] = useMemo(
    () => DAY_KEYS.slice(0, week?.visibleDays ?? 4),
    [week?.visibleDays],
  )

  const locked = !!week?.finalized

  const dayTotals = useMemo(() => {
    const t: Record<string, number> = {}
    for (const d of visibleDays) t[d] = rows.reduce((s, r) => s + (r.days[d]?.qty ?? 0), 0)
    return t
  }, [rows, visibleDays])

  const grandTotal = useMemo(() => rows.reduce((s, r) => s + rowTotal(r), 0), [rows])
  const lastWeekTotal = useMemo(
    () => rows.reduce((s, r) => s + (lastWeek.get(r.productId) ?? 0), 0),
    [rows, lastWeek],
  )

  function flash(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2800)
  }

  async function updateCell(row: WeekRow, day: DayKey, patch: Partial<{ qty: number | null; status: StatusKey | null }>) {
    if (locked || !row.id || !weekId) return
    const days = { ...row.days, [day]: { ...row.days[day], ...patch } }
    await db.weekRows.update(row.id, { days })
    await touchWeek(weekId)
  }

  async function updateRow(row: WeekRow, patch: Partial<WeekRow>) {
    if (locked || !row.id || !weekId) return
    await db.weekRows.update(row.id, patch)
    await touchWeek(weekId)
  }

  async function removeRow(row: WeekRow) {
    if (locked || !row.id || !weekId) return
    await db.weekRows.delete(row.id)
    await touchWeek(weekId)
  }

  async function addProducts(products: Product[]) {
    if (!weekId || locked) return
    const existing = new Set(rows.map((r) => r.productId))
    const fresh = products.filter((p) => p.id && !existing.has(p.id))
    if (!fresh.length) {
      flash(t('plan.alreadyIn'))
      return
    }
    let idx = rows.length
    await db.weekRows.bulkAdd(
      fresh.map((p) => ({
        weekId,
        productId: p.id!,
        productName: p.name,
        sku: p.sku,
        size: p.size,
        nameColor: null,
        days: emptyDays(),
        pic: p.defaultPic,
        remark: '',
        sortIndex: idx++,
      })),
    )
    await touchWeek(weekId)
    flash(t('plan.addedN', { n: fresh.length }))
  }

  async function onFinalize() {
    if (!weekId || !week) return
    if (!rows.length) return flash(t('plan.nothingToFinalize'))
    const ok = window.confirm(t('plan.confirmFinalize', { week: week.weekNumber }))
    if (!ok) return
    await finalizeWeek(weekId)
    flash(t('plan.finalized', { week: week.weekNumber }))
  }

  async function onDuplicate() {
    if (!weekId) return
    const newId = await duplicateWeek(weekId)
    setWeekId(newId)
    flash(t('plan.duplicated'))
  }

  async function onNewEmptyWeek() {
    const all = await db.weeks.toArray()
    const next = all.length ? Math.max(...all.map((w) => w.weekNumber)) + 1 : 1
    const id = await db.weeks.add({
      weekNumber: next,
      updatedAt: Date.now(),
      revised: 0,
      visibleDays: 4,
      finalized: false,
      finalizedAt: null,
      createdAt: Date.now(),
    })
    setWeekId(id)
    flash(t('plan.createdEmpty', { week: next }))
  }

  if (!week) return <p className="p-4 text-sm text-ink/60">{t('common.loading')}</p>

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* Bản in A4 ngang — ẩn trên màn hình, chỉ hiện khi in */}
      <WeekPrintSheet
        week={week}
        rows={rows}
        visibleDays={visibleDays}
        lastWeek={lastWeek}
        brand={brand}
        statusLabels={statusLabels}
      />

      {/* Toàn bộ giao diện nhập liệu — ẩn khi in */}
      <div className="no-print">
      <ConnectionBanner error={rowsError} />
      {/* Thanh tiêu đề tuần */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-primary">{t('plan.title')}</h1>
          <select
            value={weekId ?? ''}
            onChange={(e) => setWeekId(Number(e.target.value))}
            className="cursor-pointer rounded-md border border-line px-2 py-1.5 text-sm font-semibold"
          >
            {weeks.map((w) => (
              <option key={w.id} value={w.id}>
                {t('common.week')} {w.weekNumber} {w.finalized ? `(${t('common.finalized')})` : ''}
              </option>
            ))}
          </select>
          {locked && (
            <span className="rounded bg-muted px-2 py-1 text-xs font-bold text-ink/70">
              {t('plan.lockedBadge')}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={onNewEmptyWeek}>
            {t('plan.newEmpty')}
          </Button>
          <Button variant="ghost" onClick={onDuplicate}>
            {t('plan.duplicate')}
          </Button>
          <Button
            onClick={() => {
              if (!rows.length) return flash(t('plan.nothingToPrint'))
              printWith(A4_LANDSCAPE)
            }}
            title={t('plan.printTitle')}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="7" rx="1" />
            </svg>
            {t('plan.print')}
          </Button>
          <Button
            variant="ghost"
            onClick={async () => {
              if (!weekId || !rows.length) return flash(t('plan.nothingToPrint'))
              downloadWeekBackup(await exportWeek(weekId))
            }}
            title={t('plan.exportTitle')}
          >
            {t('plan.export')}
          </Button>
          <Button variant="ghost" onClick={() => setImportOpen(true)} title={t('plan.importTitle')}>
            {t('plan.import')}
          </Button>
          <Button variant="secondary" onClick={onFinalize} disabled={locked}>
            {t('plan.finalize')}
          </Button>
        </div>
      </div>

      {toast && (
        <div className="mb-3 rounded border border-[#22C55E]/40 bg-[#22C55E]/10 px-3 py-2 text-sm font-semibold text-[#166534]">
          {toast}
        </div>
      )}

      {/* Header + chú thích màu */}
      <div className="mb-3 grid gap-3 md:grid-cols-[1fr_auto]">
        <Card>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Week">
              <Input
                type="number"
                value={week.weekNumber}
                disabled={locked}
                onChange={async (e) => {
                  const n = Number(e.target.value)
                  if (!Number.isFinite(n) || n < 1) return
                  const clash = await db.weeks.where('weekNumber').equals(n).first()
                  if (clash && clash.id !== week.id) return flash(t('plan.weekExists', { n }))
                  await db.weeks.update(week.id!, { weekNumber: n })
                }}
                className="w-full num font-bold text-accent"
              />
            </Field>
            <Field label="Updated">
              <Input
                type="date"
                disabled={locked}
                value={new Date(week.updatedAt).toISOString().slice(0, 10)}
                onChange={(e) =>
                  db.weeks.update(week.id!, { updatedAt: new Date(e.target.value).getTime() })
                }
                className="w-full"
              />
            </Field>
            <Field label="Revised" hint={t('plan.revisedHint')}>
              <div className="flex gap-1">
                <Input value={week.revised} readOnly className="w-full num font-bold text-accent" />
                <Button
                  variant="ghost"
                  disabled={locked}
                  onClick={() => db.weeks.update(week.id!, { revised: 0 })}
                  title={t('plan.resetTitle')}
                >
                  {t('plan.reset')}
                </Button>
              </div>
            </Field>
          </div>
          <div className="mt-2 flex items-center gap-3 border-t border-line pt-2">
            <span className="text-xs font-semibold text-ink/70">{t('plan.dayCols')}</span>
            {[4, 5, 6, 7].map((n) => (
              <label key={n} className="flex cursor-pointer items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="visibleDays"
                  checked={week.visibleDays === n}
                  disabled={locked}
                  onChange={() => db.weeks.update(week.id!, { visibleDays: n })}
                  className="cursor-pointer"
                />
                {n === 4
                  ? t('plan.dayColsMonThu')
                  : n === 7
                    ? t('plan.dayColsMonSun')
                    : t('plan.dayColsN', { n })}
              </label>
            ))}
          </div>
        </Card>

        <Card className="min-w-[260px]">
          <div className="mb-1.5 flex items-center justify-between">
            <h2 className="text-xs font-bold text-primary">{t('plan.legend')}</h2>
            <button
              onClick={() => setLegendOpen(true)}
              className="cursor-pointer text-xs font-semibold text-accent underline transition-opacity hover:opacity-75"
            >
              {t('plan.editLabels')}
            </button>
          </div>
          <table className="w-full text-xs">
            <tbody>
              {STATUS_KEYS.map((k) => (
                <tr key={k}>
                  <td className="w-14 py-0.5">
                    <span
                      className="block h-4 w-12 border border-black/20"
                      style={{ background: STATUS_COLORS[k] }}
                      aria-hidden
                    />
                  </td>
                  <td className="py-0.5 font-semibold">{statusLabels[k]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Bảng kế hoạch */}
      {rows.length === 0 ? (
        <EmptyState
          title={t('plan.empty')}
          hint={t('plan.emptyHint')}
        />
      ) : (
        <div className="overflow-auto rounded-lg border border-line bg-white">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-primary text-white">
              <tr>
                <th className="min-w-[260px] px-2 py-2 text-left text-xs font-bold">PRODUCT</th>
                <th className="w-20 px-2 py-2 text-xs font-bold">Total</th>
                <th className="w-20 px-2 py-2 text-xs font-bold">Last week</th>
                {visibleDays.map((d) => (
                  <th key={d} className="w-24 px-2 py-2 text-xs font-bold">
                    {DAY_LABELS[d]}
                  </th>
                ))}
                <th className="w-24 px-2 py-2 text-xs font-bold">PIC</th>
                <th className="min-w-[140px] px-2 py-2 text-xs font-bold">Remark</th>
                <th className="w-10 px-1 py-2" aria-label={t('product.colActions')} />
              </tr>
            </thead>

            {/* Dòng tổng — giống hàng tổng màu đỏ trong Excel */}
            <tbody>
              <tr className="border-b-2 border-primary bg-muted/40 font-bold">
                <td className="px-2 py-1.5 text-xs uppercase text-ink/70">{t('plan.totalRow')}</td>
                <td className="num px-2 py-1.5 text-accent">{grandTotal || '-'}</td>
                <td className="num px-2 py-1.5 text-ink/60">{lastWeekTotal || '-'}</td>
                {visibleDays.map((d) => (
                  <td key={d} className="num px-2 py-1.5 text-accent">
                    {dayTotals[d] || '-'}
                  </td>
                ))}
                <td colSpan={3} />
              </tr>

              {rows.map((row) => {
                const total = rowTotal(row)
                const lw = lastWeek.get(row.productId) ?? 0
                return (
                  <tr key={row.id} className="border-t border-line transition-colors hover:bg-muted/20">
                    <td className="px-2 py-1">
                      <button
                        onClick={() => {
                          if (locked) return
                          const order: (StatusKey | null)[] = [null, ...STATUS_KEYS]
                          const next = order[(order.indexOf(row.nameColor) + 1) % order.length]
                          updateRow(row, { nameColor: next })
                        }}
                        disabled={locked}
                        title={t('plan.nameColorTitle')}
                        className="cursor-pointer text-left text-sm font-semibold leading-tight transition-opacity hover:opacity-70 disabled:cursor-default"
                        style={{ color: row.nameColor ? STATUS_COLORS[row.nameColor] : undefined }}
                      >
                        {row.productName}
                        {row.size ? `-${row.size}` : ''}
                      </button>
                      <div className="font-mono text-[10px] text-ink/45">{row.sku}</div>
                    </td>

                    <td className="num px-2 py-1 font-bold text-primary">{total || '-'}</td>
                    <td className="num px-2 py-1 text-ink/55" title={t('plan.lastWeekTitle')}>
                      {lw || '-'}
                    </td>

                    {visibleDays.map((d) => {
                      const cell = row.days[d] ?? { qty: null, status: null }
                      const bg = cell.status ? STATUS_COLORS[cell.status] : undefined
                      return (
                        <td key={d} className="p-0" style={{ background: bg }}>
                          <div className="flex items-center">
                            <input
                              type="number"
                              min={0}
                              value={cell.qty ?? ''}
                              disabled={locked}
                              onChange={(e) => {
                                const v = e.target.value
                                updateCell(row, d, { qty: v === '' ? null : Math.max(0, Number(v)) })
                              }}
                              className="num w-full bg-transparent px-1.5 py-1 text-sm font-semibold outline-none focus:bg-white/70"
                              style={{ color: bg ? readableTextOn(bg) : undefined }}
                              aria-label={`${row.productName} ${DAY_LABELS[d]}`}
                            />
                            <button
                              onClick={() => {
                                if (locked) return
                                const order: (StatusKey | null)[] = [null, ...STATUS_KEYS]
                                const next = order[(order.indexOf(cell.status) + 1) % order.length]
                                updateCell(row, d, { status: next })
                              }}
                              disabled={locked}
                              title={t('plan.cellColorTitle')}
                              aria-label={t('plan.cellColorAria')}
                              className="mr-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer rounded-sm border border-black/25 transition-transform hover:scale-110 disabled:cursor-default"
                              style={{ background: bg ?? 'transparent' }}
                            />
                          </div>
                        </td>
                      )
                    })}

                    <td className="p-0">
                      <input
                        value={row.pic}
                        disabled={locked}
                        onChange={(e) => updateRow(row, { pic: e.target.value })}
                        className="w-full bg-transparent px-1.5 py-1 text-sm outline-none focus:bg-muted/30"
                        aria-label="PIC"
                      />
                    </td>
                    <td className="p-0">
                      <input
                        value={row.remark}
                        disabled={locked}
                        onChange={(e) => updateRow(row, { remark: e.target.value })}
                        className="w-full bg-transparent px-1.5 py-1 text-sm outline-none focus:bg-muted/30"
                        aria-label="Remark"
                      />
                    </td>
                    <td className="px-1 py-1 text-center">
                      <button
                        onClick={() => removeRow(row)}
                        disabled={locked}
                        aria-label={t('plan.deleteRow')}
                        title={t('plan.deleteRowTitle')}
                        className="cursor-pointer rounded p-1 text-ink/35 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-default disabled:opacity-30"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3">
        <Button onClick={() => setPickerOpen(true)} disabled={locked}>
          {t('plan.addProducts')}
        </Button>
      </div>

      <ProductPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={addProducts}
        alreadyIn={new Set(rows.map((r) => r.productId))}
      />

      <LegendEditor
        open={legendOpen}
        labels={statusLabels}
        onClose={() => setLegendOpen(false)}
        onSave={async (l) => {
          setStatusLabels(l)
          await setSetting(SETTING_STATUS_LABELS, l)
          setLegendOpen(false)
          flash(t('legend.saved'))
        }}
      />

      <WeekImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={async (weekNumber) => {
          const w = await db.weeks.where('weekNumber').equals(weekNumber).first()
          if (w?.id) setWeekId(w.id)
          flash(t('wimp.doneShort', { week: weekNumber }))
        }}
      />
      </div>
    </div>
  )
}

/* ---------- chọn sản phẩm ---------- */

function ProductPicker({
  open,
  onClose,
  onPick,
  alreadyIn,
}: {
  open: boolean
  onClose: () => void
  onPick: (products: Product[]) => void
  alreadyIn: Set<number>
}) {
  const { t } = useT()
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [quickName, setQuickName] = useState('')
  const [quickSku, setQuickSku] = useState('')
  const [quickSize, setQuickSize] = useState('')
  const [err, setErr] = useState('')

  const { data: products } = useCloudQuery(
    () => db.products.filter((p) => !p.archived).toArray(),
    ['products'],
    [],
    [] as Product[],
  )

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return products
      .filter((p) => (s ? `${p.sku} ${p.name} ${p.size} ${p.category}`.toLowerCase().includes(s) : true))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 400)
  }, [products, q])

  function toggle(id: number) {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  async function quickAdd() {
    setErr('')
    const sku = quickSku.trim()
    const name = quickName.trim()
    if (!sku || !name) return setErr(t('picker.needBoth'))
    if (await db.products.where('sku').equals(sku).first()) return setErr(t('picker.skuExists'))
    const id = await db.products.add({
      sku,
      name,
      size: quickSize.trim(),
      category: '',
      defaultStatus: null,
      defaultPic: '',
      notes: '',
      archived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as Product)
    setSelected(new Set([...selected, id]))
    setQuickName('')
    setQuickSku('')
    setQuickSize('')
  }

  function confirm() {
    onPick(products.filter((p) => p.id && selected.has(p.id)))
    setSelected(new Set())
    setQ('')
    onClose()
  }

  return (
    <Modal open={open} title={t('picker.title')} onClose={onClose} wide>
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('picker.searchPlaceholder')}
        className="mb-2 w-full"
        autoFocus
      />

      <div className="mb-3 max-h-72 overflow-auto rounded border border-line">
        {filtered.length === 0 ? (
          <p className="p-4 text-center text-sm text-ink/55">
            {t('picker.noResult')}
          </p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {filtered.map((p) => {
                const already = p.id ? alreadyIn.has(p.id) : false
                return (
                  <tr
                    key={p.id}
                    className={`border-b border-line last:border-0 ${already ? 'opacity-45' : 'cursor-pointer hover:bg-muted/25'}`}
                    onClick={() => !already && p.id && toggle(p.id)}
                  >
                    <td className="w-8 px-2 py-1.5">
                      <input
                        type="checkbox"
                        checked={p.id ? selected.has(p.id) : false}
                        disabled={already}
                        onChange={() => p.id && toggle(p.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-2 py-1.5 font-semibold">
                      {p.name}
                      {p.size ? `-${p.size}` : ''}
                    </td>
                    <td className="px-2 py-1.5 font-mono text-xs text-ink/55">{p.sku}</td>
                    <td className="px-2 py-1.5 text-xs text-ink/55">
                      {already ? t('picker.inTable') : ''}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="rounded border border-dashed border-line p-2">
        <p className="mb-1.5 text-xs font-bold text-primary">{t('picker.quickAdd')}</p>
        <div className="flex flex-wrap items-end gap-2">
          <Field label={t('product.colSku')}>
            <Input value={quickSku} onChange={(e) => setQuickSku(e.target.value)} className="w-36 font-mono" />
          </Field>
          <Field label={t('imp.fieldName')}>
            <Input value={quickName} onChange={(e) => setQuickName(e.target.value)} className="w-64" />
          </Field>
          <Field label={t('product.colSize')}>
            <Input value={quickSize} onChange={(e) => setQuickSize(e.target.value)} className="w-28" />
          </Field>
          <Button variant="ghost" onClick={quickAdd} className="mb-0.5">
            {t('picker.create')}
          </Button>
        </div>
        {err && <p className="mt-1 text-xs font-semibold text-destructive">{err}</p>}
      </div>

      <div className="mt-4 flex justify-end gap-2 border-t border-line pt-3">
        <Button variant="ghost" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button onClick={confirm} disabled={selected.size === 0}>
          {t('picker.confirm', { n: selected.size })}
        </Button>
      </div>
    </Modal>
  )
}

/* ---------- sửa nhãn chú thích ---------- */

function LegendEditor({
  open,
  labels,
  onClose,
  onSave,
}: {
  open: boolean
  labels: Record<StatusKey, string>
  onClose: () => void
  onSave: (l: Record<StatusKey, string>) => void
}) {
  const { t } = useT()
  const [draft, setDraft] = useState(labels)
  useEffect(() => setDraft(labels), [labels, open])

  return (
    <Modal open={open} title={t('legend.title')} onClose={onClose}>
      <p className="mb-3 text-xs text-ink/60">
        {t('legend.note')}
      </p>
      {STATUS_KEYS.map((k) => (
        <div key={k} className="mb-2 flex items-center gap-2">
          <span
            className="h-6 w-10 shrink-0 border border-black/20"
            style={{ background: STATUS_COLORS[k] }}
            aria-hidden
          />
          <Input
            value={draft[k]}
            onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
            className="w-full"
            aria-label={t('legend.labelFor', { k })}
          />
        </div>
      ))}
      <div className="mt-4 flex justify-end gap-2 border-t border-line pt-3">
        <Button variant="ghost" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button onClick={() => onSave(draft)}>{t('common.save')}</Button>
      </div>
    </Modal>
  )
}
