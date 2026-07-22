import { useMemo, useState } from 'react'
import { useCloudQuery } from '../lib/useCloudQuery'
import { listFoamProducts, type FoamProduct } from '../lib/foamDb'
import { A4_LANDSCAPE_FULL, printWith } from '../lib/printing'
import { FoamTag, blankLabelEntry, type LabelEntry } from '../components/FoamTag'
import { Button, Card } from '../components/ui'
import ConnectionBanner from '../components/ConnectionBanner'
import { useT } from '../lib/LangContext'

function useLabL() {
  const { lang } = useT()
  const vi = {
    title: 'In tem Foam',
    subtitle: 'Tem FOAM BUNS khổ A6 ngang — in 4 tem/tờ A4 ngang.',
    add: 'Thêm tem',
    print: 'In {n} tem (A4 ngang)',
    printEmpty: 'In tem',
    code: 'Foam Code',
    dimL: 'L',
    dimW: 'W',
    dimH: 'H',
    batch: 'Batch',
    qty: 'Qty (bft)',
    order: 'Order #',
    pour: 'Pour date',
    cut: 'Date cut',
    barcode: 'Barcode',
    density: 'Density',
    hardness: 'Hardness',
    preview: 'Xem trước',
    empty: 'Chưa có tem. Bấm "Thêm tem".',
    hint: 'Khi in: chọn khổ A4 ngang, lề None, 100% (không Fit). Mỗi tờ 4 tem.',
    selectCode: '— Mã —',
  }
  const en = {
    title: 'Foam Labels',
    subtitle: 'FOAM BUNS tag, A6 landscape — 4 per A4 landscape sheet.',
    add: 'Add label',
    print: 'Print {n} labels (A4 landscape)',
    printEmpty: 'Print',
    code: 'Foam Code',
    dimL: 'L',
    dimW: 'W',
    dimH: 'H',
    batch: 'Batch',
    qty: 'Qty (bft)',
    order: 'Order #',
    pour: 'Pour date',
    cut: 'Date cut',
    barcode: 'Barcode',
    density: 'Density',
    hardness: 'Hardness',
    preview: 'Preview',
    empty: 'No labels yet. Click "Add label".',
    hint: 'When printing: A4 landscape, margins None, 100% (no Fit). 4 per sheet.',
    selectCode: '— Code —',
  }
  return lang === 'vi' ? vi : en
}

export default function FoamLabels() {
  const L = useLabL()
  const [entries, setEntries] = useState<LabelEntry[]>([blankLabelEntry()])

  const { data: products, error } = useCloudQuery(
    () => listFoamProducts(),
    ['foam_products'],
    [],
    [] as FoamProduct[],
  )

  const byCode = useMemo(() => {
    const m = new Map<string, FoamProduct>()
    for (const p of products) if (!m.has(p.foamCode)) m.set(p.foamCode, p)
    return m
  }, [products])
  const codes = useMemo(() => [...byCode.keys()].sort(), [byCode])

  const patch = (i: number, p: Partial<LabelEntry>) =>
    setEntries((es) => es.map((e, idx) => (idx === i ? { ...e, ...p } : e)))

  const filled = entries.filter((e) => e.foamCode || e.batch || e.l)

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="no-print">
        <ConnectionBanner error={error} />
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold text-primary">{L.title}</h1>
            <p className="text-xs text-ink/60">{L.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setEntries((es) => [...es, blankLabelEntry()])}>
              + {L.add}
            </Button>
            <Button onClick={() => printWith(A4_LANDSCAPE_FULL)} disabled={filled.length === 0}>
              {filled.length ? L.print.replace('{n}', String(filled.length)) : L.printEmpty}
            </Button>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          {/* Bảng nhập tem */}
          <Card>
            <div className="overflow-x-auto rounded-lg border border-line">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-primary text-white">
                  <tr className="[&>th]:px-2 [&>th]:py-2 [&>th]:text-xs [&>th]:font-semibold [&>th]:text-left">
                    <th>{L.code}</th>
                    <th className="text-right">{L.dimL}</th>
                    <th className="text-right">{L.dimW}</th>
                    <th className="text-right">{L.dimH}</th>
                    <th>{L.batch}</th>
                    <th className="text-right">{L.qty}</th>
                    <th>{L.order}</th>
                    <th>{L.pour}</th>
                    <th>{L.cut}</th>
                    <th>{L.barcode}</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, i) => {
                    const p = byCode.get(e.foamCode)
                    return (
                      <tr key={i} className="border-b border-line last:border-0 hover:bg-muted/15">
                        <td className="px-1 py-1">
                          <select
                            value={e.foamCode}
                            onChange={(ev) => patch(i, { foamCode: ev.target.value })}
                            className="w-32 cursor-pointer rounded border border-line px-1.5 py-1 font-mono text-xs"
                          >
                            <option value="">{L.selectCode}</option>
                            {codes.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          {p && (
                            <span className="mt-0.5 block text-[10px] text-ink/50">
                              {L.density} {p.densityLb ?? '—'} · {L.hardness} {p.hardness ?? '—'}
                            </span>
                          )}
                        </td>
                        <td className="px-1 py-1"><Cell v={e.l} on={(v) => patch(i, { l: v })} num /></td>
                        <td className="px-1 py-1"><Cell v={e.w} on={(v) => patch(i, { w: v })} num /></td>
                        <td className="px-1 py-1"><Cell v={e.h} on={(v) => patch(i, { h: v })} num /></td>
                        <td className="px-1 py-1"><Cell v={e.batch} on={(v) => patch(i, { batch: v })} w="w-24" /></td>
                        <td className="px-1 py-1"><Cell v={e.qtyBft} on={(v) => patch(i, { qtyBft: v })} num /></td>
                        <td className="px-1 py-1"><Cell v={e.orderNo} on={(v) => patch(i, { orderNo: v })} w="w-24" /></td>
                        <td className="px-1 py-1"><Cell v={e.pourDate} on={(v) => patch(i, { pourDate: v })} w="w-20" /></td>
                        <td className="px-1 py-1"><Cell v={e.cutDate} on={(v) => patch(i, { cutDate: v })} w="w-20" /></td>
                        <td className="px-1 py-1"><Cell v={e.barcode} on={(v) => patch(i, { barcode: v })} w="w-28" /></td>
                        <td className="px-1 py-1 text-center">
                          <button
                            onClick={() => setEntries((es) => es.filter((_, idx) => idx !== i))}
                            className="cursor-pointer rounded p-1 text-ink/40 transition-colors hover:bg-destructive/10 hover:text-destructive"
                            aria-label="Xoá"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                              <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-ink/50">{L.hint}</p>
          </Card>

          {/* Xem trước tem 1 */}
          <Card className="w-full lg:w-[500px]">
            <h2 className="mb-2 text-sm font-bold text-primary">{L.preview}</h2>
            {filled.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink/55">{L.empty}</p>
            ) : (
              <div className="flex justify-center overflow-hidden" style={{ height: 340 * 0.82 }}>
                <div style={{ transform: 'scale(0.82)', transformOrigin: 'top center' }}>
                  <FoamTag entry={filled[0]} product={byCode.get(filled[0].foamCode)} preview />
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Vùng in — gom 4 tem/trang A4 ngang (2×2, có gap 20px) */}
      <div className="hidden print:block">
        {chunk(filled, 4).map((group, gi) => (
          <div key={gi} className="foam-page">
            {group.map((e, i) => (
              <FoamTag key={i} entry={e} product={byCode.get(e.foamCode)} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Chia mảng thành các nhóm n phần tử (mỗi nhóm = 1 trang in). */
function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
  return out
}

function Cell({ v, on, w = 'w-16', num = false }: { v: string; on: (v: string) => void; w?: string; num?: boolean }) {
  return (
    <input
      value={v}
      inputMode={num ? 'decimal' : undefined}
      onChange={(e) => on(e.target.value)}
      className={`${w} rounded border border-line px-1.5 py-1 text-xs ${num ? 'num' : ''}`}
    />
  )
}
