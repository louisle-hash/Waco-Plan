import { useEffect, useMemo, useState } from 'react'
import { useCloudQuery } from '../lib/useCloudQuery'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  DAY_KEYS,
  DAY_LABELS,
  db,
  getOrCreateCurrentWeek,
  lastWeekTotals,
  loadStatusLabels,
  rowTotal,
  type DayKey,
  type Week,
  type WeekRow,
} from '../lib/db'
import {
  ATTENTION_STATUSES,
  DEFAULT_STATUS_LABELS,
  STATUS_COLORS,
  STATUS_KEYS,
  type StatusKey,
} from '../lib/theme'
import { Card, EmptyState } from '../components/ui'
import ConnectionBanner from '../components/ConnectionBanner'
import { useT } from '../lib/LangContext'

export default function Dashboard() {
  const { t, fmtDate } = useT()
  const [week, setWeek] = useState<Week | null>(null)
  const [lastWeek, setLastWeek] = useState<Map<number, number>>(new Map())
  const [statusLabels, setStatusLabels] = useState(DEFAULT_STATUS_LABELS)

  useEffect(() => {
    getOrCreateCurrentWeek().then(setWeek)
    loadStatusLabels().then(setStatusLabels)
  }, [])

  // Đọc lại bản ghi tuần để Revised/ngày cập nhật luôn khớp màn hình kế hoạch
  // (và để thấy ngay khi MÁY KHÁC sửa tuần này — đây là điểm mấu chốt của Supabase realtime)
  const { data: liveWeek } = useCloudQuery(
    () => (week?.id ? db.weeks.get(week.id) : Promise.resolve(undefined)),
    ['weeks'],
    [week?.id],
    undefined as Week | undefined,
  )
  const { data: rows, error: rowsError } = useCloudQuery(
    () => (week?.id ? db.weekRows.where('weekId').equals(week.id).toArray() : Promise.resolve([])),
    ['week_rows'],
    [week?.id],
    [] as WeekRow[],
  )

  useEffect(() => {
    if (liveWeek?.weekNumber != null) lastWeekTotals(liveWeek.weekNumber).then(setLastWeek)
  }, [liveWeek?.weekNumber])

  const visibleDays: DayKey[] = useMemo(
    () => DAY_KEYS.slice(0, liveWeek?.visibleDays ?? 4),
    [liveWeek?.visibleDays],
  )

  const totalPlanned = useMemo(() => rows.reduce((s, r) => s + rowTotal(r), 0), [rows])

  const lastWeekTotal = useMemo(
    () => rows.reduce((s, r) => s + (lastWeek.get(r.productId) ?? 0), 0),
    [rows, lastWeek],
  )

  const delta = totalPlanned - lastWeekTotal
  const deltaPct = lastWeekTotal > 0 ? Math.round((delta / lastWeekTotal) * 100) : null

  const perDay = useMemo(
    () =>
      visibleDays.map((d) => ({
        day: DAY_LABELS[d].slice(0, 3),
        fullDay: DAY_LABELS[d],
        qty: rows.reduce((s, r) => s + (r.days[d]?.qty ?? 0), 0),
      })),
    [rows, visibleDays],
  )

  /** Gom theo màu trạng thái: đếm số ô và cộng sản lượng của các ô mang màu đó. */
  const byStatus = useMemo(() => {
    const acc: Record<StatusKey, { qty: number; cells: number; products: Set<number> }> = {
      mattressFirm: { qty: 0, cells: 0, products: new Set() },
      quilting: { qty: 0, cells: 0, products: new Set() },
      priority: { qty: 0, cells: 0, products: new Set() },
      putCover: { qty: 0, cells: 0, products: new Set() },
    }
    for (const r of rows) {
      for (const d of DAY_KEYS) {
        const c = r.days[d]
        if (c?.status) {
          acc[c.status].qty += c.qty ?? 0
          acc[c.status].cells += 1
          acc[c.status].products.add(r.productId)
        }
      }
      // màu chữ tên sản phẩm cũng tính là một đánh dấu trạng thái
      if (r.nameColor) acc[r.nameColor].products.add(r.productId)
    }
    return acc
  }, [rows])

  /** Dòng cần chú ý: có ô Priority hoặc Put cover, hoặc tên sản phẩm bị tô hai màu đó. */
  const attention = useMemo(() => {
    const out: { row: WeekRow; statuses: StatusKey[]; qty: number }[] = []
    for (const r of rows) {
      const set = new Set<StatusKey>()
      let qty = 0
      for (const d of DAY_KEYS) {
        const c = r.days[d]
        if (c?.status && ATTENTION_STATUSES.includes(c.status)) {
          set.add(c.status)
          qty += c.qty ?? 0
        }
      }
      if (r.nameColor && ATTENTION_STATUSES.includes(r.nameColor)) set.add(r.nameColor)
      if (set.size) out.push({ row: r, statuses: [...set], qty })
    }
    return out.sort((a, b) => b.qty - a.qty)
  }, [rows])

  const unscheduled = useMemo(() => rows.filter((r) => rowTotal(r) === 0).length, [rows])

  if (!liveWeek) return <p className="p-4 text-sm text-ink/60">{t('common.loading')}</p>

  return (
    <div className="mx-auto max-w-[1500px]">
      <ConnectionBanner error={rowsError} />
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold text-primary">
            {t('dash.title', { week: liveWeek.weekNumber })}
            {liveWeek.finalized && (
              <span className="ml-2 rounded bg-muted px-2 py-0.5 text-xs font-bold text-ink/70">
                {t('common.finalized')}
              </span>
            )}
          </h1>
          <p className="text-xs text-ink/60">
            {t('dash.updatedAt', { date: fmtDate(liveWeek.updatedAt) })}
            <strong className="text-accent">{liveWeek.revised}</strong>
          </p>
        </div>
        <Link
          to="/plan"
          className="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {t('dash.openPlan')}
        </Link>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={t('dash.empty')}
          hint={t('dash.emptyHint')}
        />
      ) : (
        <>
          {/* KPI */}
          <div className="mb-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label={t('dash.totalThisWeek')} value={totalPlanned} accent />
            <Stat label={t('dash.totalLastWeek')} value={lastWeekTotal || '—'} />
            <Stat
              label={t('dash.vsLastWeek')}
              value={
                lastWeekTotal === 0
                  ? '—'
                  : `${delta >= 0 ? '+' : ''}${delta}${deltaPct !== null ? ` (${deltaPct >= 0 ? '+' : ''}${deltaPct}%)` : ''}`
              }
              tone={lastWeekTotal === 0 ? undefined : delta >= 0 ? 'up' : 'down'}
            />
            <Stat
              label={t('dash.rowCount')}
              value={rows.length}
              hint={t('dash.unscheduled', { n: unscheduled })}
            />
          </div>

          <div className="mb-3 grid gap-3 lg:grid-cols-[3fr_2fr]">
            {/* Biểu đồ theo ngày */}
            <Card>
              <h2 className="mb-2 text-sm font-bold text-primary">{t('dash.perDay')}</h2>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={perDay} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-muted)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="var(--color-foreground)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="var(--color-foreground)" allowDecimals={false} />
                    <Tooltip
                      formatter={(v) => [t('dash.perDayTooltip', { n: Number(v) }), t('dash.output')]}
                      labelFormatter={(label) =>
                        perDay.find((d) => d.day === label)?.fullDay ?? String(label ?? '')
                      }
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 6,
                        border: '1px solid var(--color-border)',
                      }}
                    />
                    {/* Tắt animation: dữ liệu tới không đồng bộ từ IndexedDB khiến
                        Recharts kẹt cột ở chiều cao dở dang. Bảng số liệu vận hành
                        cũng không cần hiệu ứng. */}
                    <Bar
                      dataKey="qty"
                      radius={[3, 3, 0, 0]}
                      fill="var(--color-primary)"
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Theo màu trạng thái */}
            <Card>
              <h2 className="mb-2 text-sm font-bold text-primary">{t('dash.byStatus')}</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-xs text-ink/60">
                    <th className="py-1 text-left font-semibold">{t('dash.status')}</th>
                    <th className="py-1 text-right font-semibold">{t('dash.output')}</th>
                    <th className="py-1 text-right font-semibold">{t('dash.cells')}</th>
                    <th className="py-1 text-right font-semibold">{t('dash.products')}</th>
                  </tr>
                </thead>
                <tbody>
                  {STATUS_KEYS.map((k) => (
                    <tr key={k} className="border-b border-line last:border-0">
                      <td className="py-1.5">
                        <span className="flex items-center gap-2">
                          <span
                            className="inline-block h-3.5 w-6 shrink-0 border border-black/20"
                            style={{ background: STATUS_COLORS[k] }}
                            aria-hidden
                          />
                          <span className="font-semibold">{statusLabels[k]}</span>
                        </span>
                      </td>
                      <td className="num py-1.5 font-bold">{byStatus[k].qty || '-'}</td>
                      <td className="num py-1.5 text-ink/60">{byStatus[k].cells || '-'}</td>
                      <td className="num py-1.5 text-ink/60">{byStatus[k].products.size || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-ink/50">
                {t('dash.byStatusNote')}
              </p>
            </Card>
          </div>

          {/* Cần chú ý */}
          <Card>
            <h2 className="mb-2 text-sm font-bold text-primary">
              {t('dash.attention', { a: statusLabels.priority, b: statusLabels.putCover })}
            </h2>
            {attention.length === 0 ? (
              <p className="py-3 text-center text-sm text-ink/55">
                {t('dash.attentionEmpty', { a: statusLabels.priority, b: statusLabels.putCover })}
              </p>
            ) : (
              <div className="max-h-72 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-line text-xs text-ink/60">
                      <th className="py-1 text-left font-semibold">{t('dash.product')}</th>
                      <th className="py-1 text-left font-semibold">SKU</th>
                      <th className="py-1 text-left font-semibold">{t('dash.marks')}</th>
                      <th className="py-1 text-right font-semibold">{t('dash.relatedQty')}</th>
                      <th className="py-1 text-left font-semibold">PIC</th>
                      <th className="py-1 text-left font-semibold">{t('dash.note')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attention.map((a) => (
                      <tr key={a.row.id} className="border-b border-line last:border-0">
                        <td className="py-1.5 font-semibold">
                          {a.row.productName}
                          {a.row.size ? `-${a.row.size}` : ''}
                        </td>
                        <td className="py-1.5 font-mono text-xs text-ink/55">{a.row.sku}</td>
                        <td className="py-1.5">
                          <span className="flex flex-wrap gap-1">
                            {a.statuses.map((s) => (
                              <span
                                key={s}
                                className="rounded px-1.5 py-0.5 text-xs font-semibold"
                                style={{
                                  background: STATUS_COLORS[s],
                                  color: s === 'quilting' ? '#111' : '#fff',
                                }}
                              >
                                {statusLabels[s]}
                              </span>
                            ))}
                          </span>
                        </td>
                        <td className="num py-1.5 font-bold">{a.qty || '-'}</td>
                        <td className="py-1.5">{a.row.pic || '—'}</td>
                        <td className="py-1.5 text-ink/70">{a.row.remark || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  hint,
  accent,
  tone,
}: {
  label: string
  value: string | number
  hint?: string
  accent?: boolean
  tone?: 'up' | 'down'
}) {
  const color = tone === 'up' ? '#166534' : tone === 'down' ? 'var(--color-destructive)' : undefined
  const barColor = color ?? (accent ? 'var(--color-accent)' : 'var(--color-primary)')
  return (
    <Card className="relative overflow-hidden pl-4 transition-shadow duration-200 hover:shadow-soft-md">
      {/* Thanh nhấn màu bên trái — phân biệt nhanh chỉ số chính/tăng/giảm */}
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: barColor }} aria-hidden />
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/55">{label}</p>
      <p className="num mt-1 text-[26px] font-bold leading-none" style={{ color: barColor, textAlign: 'left' }}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-ink/50">{hint}</p>}
    </Card>
  )
}
