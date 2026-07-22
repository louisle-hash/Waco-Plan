import { useEffect, useMemo, useState } from 'react'
import { useCloudQuery } from '../lib/useCloudQuery'
import {
  DAY_KEYS,
  DAY_LABELS,
  db,
  getOrCreateCurrentWeek,
  loadStatusLabels,
  rowTotal,
  type DayKey,
  type Week,
  type WeekRow,
} from '../lib/db'
import {
  DEFAULT_STATUS_LABELS,
  STATUS_COLORS,
  readableTextOn,
  type StatusKey,
} from '../lib/theme'
import { loadBrand } from '../lib/db'
import { DEFAULT_BRAND, type BrandConfig } from '../lib/theme'
import { LABEL_2X4, printWith } from '../lib/printing'
import { Button, Card, EmptyState } from '../components/ui'
import ConnectionBanner from '../components/ConnectionBanner'
import { useT } from '../lib/LangContext'

/** Một tem = 1 dòng kế hoạch, tuỳ chọn tách theo từng ngày. */
type LabelItem = {
  key: string
  productName: string
  sku: string
  size: string
  qty: number
  dayLabel: string | null
  pic: string
  status: StatusKey | null
  remark: string
}

export default function LabelPrinting() {
  const { t } = useT()
  const [week, setWeek] = useState<Week | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [splitByDay, setSplitByDay] = useState(false)
  const [brand, setBrand] = useState<BrandConfig>(DEFAULT_BRAND)
  const [statusLabels, setStatusLabels] = useState(DEFAULT_STATUS_LABELS)

  useEffect(() => {
    getOrCreateCurrentWeek().then(setWeek)
    loadBrand().then(setBrand)
    loadStatusLabels().then(setStatusLabels)
  }, [])

  const { data: weeks } = useCloudQuery(
    () => db.weeks.orderBy('weekNumber').toArray(),
    ['weeks'],
    [],
    [] as Week[],
  )
  const { data: rows, error: rowsError } = useCloudQuery(
    () => (week?.id ? db.weekRows.where('weekId').equals(week.id).sortBy('sortIndex') : Promise.resolve([])),
    ['week_rows'],
    [week?.id],
    [] as WeekRow[],
  )

  const planned = useMemo(() => rows.filter((r) => rowTotal(r) > 0), [rows])

  // Bỏ chọn các dòng không còn tồn tại khi đổi tuần
  useEffect(() => {
    setSelected((prev) => {
      const valid = new Set(planned.map((r) => r.id!))
      const next = new Set([...prev].filter((id) => valid.has(id)))
      return next.size === prev.size ? prev : next
    })
  }, [planned])

  const visibleDays: DayKey[] = useMemo(
    () => DAY_KEYS.slice(0, week?.visibleDays ?? 4),
    [week?.visibleDays],
  )

  /** Danh sách tem cuối cùng, giữ đúng thứ tự dòng trong bảng kế hoạch. */
  const labels: LabelItem[] = useMemo(() => {
    const out: LabelItem[] = []
    for (const r of planned) {
      if (!r.id || !selected.has(r.id)) continue

      if (splitByDay) {
        for (const d of visibleDays) {
          const c = r.days[d]
          if (!c?.qty) continue
          out.push({
            key: `${r.id}-${d}`,
            productName: r.productName,
            sku: r.sku,
            size: r.size,
            qty: c.qty,
            dayLabel: DAY_LABELS[d],
            pic: r.pic,
            status: c.status ?? r.nameColor,
            remark: r.remark,
          })
        }
      } else {
        const firstStatus = visibleDays.map((d) => r.days[d]?.status).find(Boolean) ?? r.nameColor
        out.push({
          key: `${r.id}`,
          productName: r.productName,
          sku: r.sku,
          size: r.size,
          qty: rowTotal(r),
          dayLabel: null,
          pic: r.pic,
          status: firstStatus ?? null,
          remark: r.remark,
        })
      }
    }
    return out
  }, [planned, selected, splitByDay, visibleDays])

  const allSelected = planned.length > 0 && selected.size === planned.length

  if (!week) return <p className="p-4 text-sm text-ink/60">{t('common.loading')}</p>

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="no-print">
        <ConnectionBanner error={rowsError} />
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold text-primary">{t('label.title')}</h1>
            <p className="text-xs text-ink/60">{t('label.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={week.id ?? ''}
              onChange={(e) => {
                const w = weeks.find((x) => x.id === Number(e.target.value))
                if (w) {
                  setWeek(w)
                  setSelected(new Set())
                }
              }}
              className="cursor-pointer rounded-md border border-line px-2 py-1.5 text-sm font-semibold"
            >
              {weeks.map((w) => (
                <option key={w.id} value={w.id}>
                  {t('common.week')} {w.weekNumber} {w.finalized ? `(${t('common.finalized')})` : ''}
                </option>
              ))}
            </select>
            <Button onClick={() => printWith(LABEL_2X4)} disabled={labels.length === 0}>
              {labels.length > 0 ? t('label.printN', { n: labels.length }) : t('label.print')}
            </Button>
          </div>
        </div>

        {planned.length === 0 ? (
          <EmptyState
            title={t('label.empty')}
            hint={t('label.emptyHint')}
          />
        ) : (
          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            {/* Chọn dòng */}
            <Card>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-primary">
                  {t('label.pick', { sel: selected.size, total: planned.length })}
                </h2>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={splitByDay}
                      onChange={(e) => setSplitByDay(e.target.checked)}
                      className="cursor-pointer"
                    />
                    {t('label.splitByDay')}
                  </label>
                  <button
                    onClick={() =>
                      setSelected(allSelected ? new Set() : new Set(planned.map((r) => r.id!)))
                    }
                    className="cursor-pointer text-xs font-semibold text-accent underline transition-opacity hover:opacity-75"
                  >
                    {allSelected ? t('label.deselectAll') : t('label.selectAll')}
                  </button>
                </div>
              </div>

              <div className="max-h-[420px] overflow-auto rounded border border-line">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-primary text-white">
                    <tr>
                      <th className="w-8 px-2 py-1.5" aria-label={t('common.all')} />
                      <th className="px-2 py-1.5 text-left text-xs font-semibold">{t('label.fProduct')}</th>
                      <th className="px-2 py-1.5 text-left text-xs font-semibold">SKU</th>
                      <th className="px-2 py-1.5 text-right text-xs font-semibold">{t('label.colTotal')}</th>
                      <th className="px-2 py-1.5 text-left text-xs font-semibold">PIC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planned.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => {
                          const next = new Set(selected)
                          next.has(r.id!) ? next.delete(r.id!) : next.add(r.id!)
                          setSelected(next)
                        }}
                        className="cursor-pointer border-b border-line transition-colors last:border-0 hover:bg-muted/25"
                      >
                        <td className="px-2 py-1.5">
                          <input
                            type="checkbox"
                            checked={selected.has(r.id!)}
                            onChange={() => {
                              const next = new Set(selected)
                              next.has(r.id!) ? next.delete(r.id!) : next.add(r.id!)
                              setSelected(next)
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="cursor-pointer"
                          />
                        </td>
                        <td className="px-2 py-1.5 font-semibold">
                          {r.productName}
                          {r.size ? `-${r.size}` : ''}
                        </td>
                        <td className="px-2 py-1.5 font-mono text-xs text-ink/55">{r.sku}</td>
                        <td className="num px-2 py-1.5 font-bold">{rowTotal(r)}</td>
                        <td className="px-2 py-1.5">{r.pic || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Xem trước */}
            <Card className="w-full lg:w-[460px]">
              <h2 className="mb-2 text-sm font-bold text-primary">
                {labels.length > 0 ? t('label.previewN', { n: labels.length }) : t('label.preview')}
              </h2>
              {labels.length === 0 ? (
                <p className="py-8 text-center text-sm text-ink/55">
                  {t('label.previewEmpty')}
                </p>
              ) : (
                // Tem thật rộng 4in (384px), cao 2in (192px) — phóng nhẹ cho dễ xem.
                // Bọc thêm div có chiều cao đã nhân tỉ lệ vì transform:scale
                // không làm co chỗ chiếm trong layout -> nếu thiếu sẽ dư khoảng trắng.
                <div className="flex justify-center overflow-hidden" style={{ height: 192 * 1.05 }}>
                  <div style={{ transform: 'scale(1.05)', transformOrigin: 'top center' }}>
                    <Label
                      item={labels[0]}
                      week={week}
                      brand={brand}
                      statusLabels={statusLabels}
                      preview
                    />
                  </div>
                </div>
              )}
              <p className="mt-2 text-xs text-ink/50">
                {t('label.printHint')}
              </p>
            </Card>
          </div>
        )}
      </div>

      {/* Vùng in thật — ẩn trên màn hình, chỉ hiện khi in */}
      <div className="hidden print:block">
        {labels.map((item) => (
          <Label key={item.key} item={item} week={week} brand={brand} statusLabels={statusLabels} />
        ))}
      </div>
    </div>
  )
}

// ---- Auto-fit cỡ chữ cho tem ----
// Tem 4x2in @ 96dpi = 384x192px. Đo chữ bằng canvas (không cần DOM hiển thị,
// vì vùng in đang display:none) rồi phóng to tối đa cho tên + size lấp gần kín
// phần nội dung, chỉ chừa lề an toàn nhỏ — mục tiêu: không dư khoảng trống.
const LABEL_FONT = "'Fira Sans', system-ui, sans-serif"
const BANNER_H = 34 // chiều cao cố định của dải trạng thái (px)
const CONTENT_PAD_X = 18
const CONTENT_PAD_Y = 6
const NAME_LH = 1.08
const SIZE_LH = 1.0
const BLOCK_GAP = 6 // khoảng cách tên ↔ size (px)
const NAME_SIZE_RATIO = 0.62 // tên nhỏ hơn size để size (màu đỏ) nổi bật

let _measureCanvas: HTMLCanvasElement | null = null
function measureCtx(): CanvasRenderingContext2D {
  if (!_measureCanvas) _measureCanvas = document.createElement('canvas')
  return _measureCanvas.getContext('2d')!
}

/** Ngắt dòng theo chiều rộng; từ nào dài quá thì ngắt theo ký tự (như break-word). */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string,
  maxWidth: number,
): { lineCount: number; maxLineWidth: number } {
  ctx.font = font
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let cur = ''

  const breakLongWord = (word: string) => {
    let seg = ''
    for (const ch of word) {
      if (seg && ctx.measureText(seg + ch).width > maxWidth) {
        lines.push(seg)
        seg = ch
      } else {
        seg += ch
      }
    }
    return seg
  }

  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w
    if (!cur || ctx.measureText(test).width <= maxWidth) {
      cur = test
    } else {
      lines.push(cur)
      cur = ctx.measureText(w).width > maxWidth ? breakLongWord(w) : w
    }
  }
  if (cur) lines.push(cur)

  let maxLineWidth = 0
  for (const l of lines) maxLineWidth = Math.max(maxLineWidth, ctx.measureText(l).width)
  return { lineCount: Math.max(1, lines.length), maxLineWidth }
}

/**
 * Tìm cỡ chữ lớn nhất (tên & size phóng cùng tỉ lệ) sao cho cả khối vừa khít
 * khung nội dung. Nhị phân trên cỡ size, suy ra cỡ tên theo NAME_SIZE_RATIO.
 */
function fitLabelFonts(name: string, size: string): { nameFont: number; sizeFont: number } {
  const boxW = (384 - 2 * CONTENT_PAD_X) * 0.98
  const boxH = (192 - BANNER_H - 2 * CONTENT_PAD_Y) * 0.96
  const ctx = measureCtx()

  let lo = 8
  let hi = 130
  let bestSize = 8
  for (let i = 0; i < 26; i++) {
    const sizeFont = (lo + hi) / 2
    const nameFont = sizeFont * NAME_SIZE_RATIO
    const nw = wrapText(ctx, name, `700 ${nameFont}px ${LABEL_FONT}`, boxW)
    const sw = size ? wrapText(ctx, size, `700 ${sizeFont}px ${LABEL_FONT}`, boxW) : { lineCount: 0, maxLineWidth: 0 }
    const totalH =
      nw.lineCount * nameFont * NAME_LH + (size ? BLOCK_GAP + sw.lineCount * sizeFont * SIZE_LH : 0)
    const fits = totalH <= boxH && nw.maxLineWidth <= boxW && sw.maxLineWidth <= boxW
    if (fits) {
      bestSize = sizeFont
      lo = sizeFont
    } else {
      hi = sizeFont
    }
  }
  return { nameFont: Math.round(bestSize * NAME_SIZE_RATIO), sizeFont: Math.round(bestSize) }
}

/**
 * Tem khổ 2x4in nằm ngang (rộng 4in, cao 2in) — cố ý tối giản: chỉ dải trạng
 * thái + tên sản phẩm + size. Tên và size tự phóng to tối đa lấp kín tem để
 * công nhân đọc được từ xa; cỡ chữ tính theo độ dài từng sản phẩm.
 */
function Label({
  item,
  week,
  brand,
  statusLabels,
  preview = false,
}: {
  item: LabelItem
  week: Week
  brand: BrandConfig
  statusLabels: Record<StatusKey, string>
  preview?: boolean
}) {
  const bannerBg = item.status ? STATUS_COLORS[item.status] : brand.colors.primary
  const bannerFg = item.status ? readableTextOn(bannerBg) : brand.colors.onPrimary

  const { nameFont, sizeFont } = useMemo(
    () => fitLabelFonts(item.productName, item.size),
    [item.productName, item.size],
  )

  return (
    <div
      className="label-page flex flex-col border border-black/15 bg-white"
      style={preview ? { boxShadow: '0 2px 10px rgba(0,0,0,.15)' } : undefined}
    >
      {/* Dải màu trạng thái — nằm ngang gọn ở trên */}
      <div
        className="flex shrink-0 items-center justify-between px-4"
        style={{ height: BANNER_H, background: bannerBg, color: bannerFg }}
      >
        <span className="text-[15px] font-bold uppercase tracking-wide">
          {item.status ? statusLabels[item.status] : brand.brandName}
        </span>
        <span className="text-[15px] font-bold">Week {week.weekNumber}</span>
      </div>

      {/* Nội dung — căn giữa theo chiều dọc, tự phóng chữ lấp kín tem */}
      <div
        className="flex flex-1 flex-col justify-center"
        style={{ padding: `${CONTENT_PAD_Y}px ${CONTENT_PAD_X}px` }}
      >
        <p
          className="font-bold text-black"
          style={{ fontSize: nameFont, lineHeight: NAME_LH, wordBreak: 'break-word' }}
        >
          {item.productName}
        </p>

        {item.size && (
          <p
            className="font-bold uppercase"
            style={{
              fontSize: sizeFont,
              lineHeight: SIZE_LH,
              marginTop: BLOCK_GAP,
              color: brand.colors.secondary,
              wordBreak: 'break-word',
            }}
          >
            {item.size}
          </p>
        )}
      </div>
    </div>
  )
}
