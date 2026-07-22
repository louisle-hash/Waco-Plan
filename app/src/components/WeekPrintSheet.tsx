import { DAY_LABELS, rowTotal, type DayKey, type Week, type WeekRow } from '../lib/db'
import {
  DEFAULT_LOGO,
  STATUS_COLORS,
  STATUS_KEYS,
  readableTextOn,
  type BrandConfig,
  type StatusKey,
} from '../lib/theme'
import { useT } from '../lib/LangContext'

/**
 * Bản in kế hoạch tuần cho khổ A4 ngang.
 * Dựng riêng thay vì tái dùng lưới nhập liệu — lưới đầy input/nút bấm,
 * in ra sẽ có viền ô và mũi tên tăng giảm rất xấu.
 */
export default function WeekPrintSheet({
  week,
  rows,
  visibleDays,
  lastWeek,
  brand,
  statusLabels,
}: {
  week: Week
  rows: WeekRow[]
  visibleDays: DayKey[]
  lastWeek: Map<number, number>
  brand: BrandConfig
  statusLabels: Record<StatusKey, string>
}) {
  // Tiêu đề cột (PRODUCT/Total/Monday…) cố ý giữ tiếng Anh ở mọi ngôn ngữ:
  // đây là biểu mẫu xưởng đã quen từ file Excel gốc, đổi đi sẽ gây nhầm lẫn.
  const { t, fmtDate } = useT()
  const grandTotal = rows.reduce((s, r) => s + rowTotal(r), 0)
  const lastWeekTotal = rows.reduce((s, r) => s + (lastWeek.get(r.productId) ?? 0), 0)
  const dayTotals = visibleDays.map((d) => rows.reduce((s, r) => s + (r.days[d]?.qty ?? 0), 0))

  return (
    <div className="week-print hidden print:block">
      {/* Đầu trang — lặp lại ở mọi trang nhờ thead bên dưới, phần này chỉ ở trang đầu */}
      <header className="mb-2 flex items-start justify-between gap-4">
        <img src={brand.logoDataUrl ?? DEFAULT_LOGO} alt="" style={{ height: 30, width: 'auto' }} />

        <div className="flex-1 text-center">
          <h1 className="text-[15pt] font-bold leading-tight" style={{ color: brand.colors.primary }}>
            WEEKLY PRODUCTION SCHEDULE
          </h1>
          <p className="text-[8pt] text-black/60">{brand.brandName} — WACO</p>
        </div>

        {/* Chú thích màu */}
        <table className="border-collapse text-[7pt]">
          <tbody>
            {STATUS_KEYS.map((k) => (
              <tr key={k}>
                <td className="border border-black/40 px-2 py-[1px]" style={{ background: STATUS_COLORS[k], width: 26 }} />
                <td className="border border-black/40 px-1.5 py-[1px] font-semibold">{statusLabels[k]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </header>

      {/* Thông tin tuần */}
      <div className="mb-1.5 flex gap-6 text-[9pt]">
        <span>
          <strong>Week:</strong>{' '}
          <span className="font-bold" style={{ color: brand.colors.secondary }}>
            {week.weekNumber}
          </span>
        </span>
        <span>
          <strong>Updated:</strong>{' '}
          {fmtDate(week.updatedAt, { weekday: 'long', month: 'short', day: '2-digit' })}
        </span>
        <span>
          <strong>Revised:</strong>{' '}
          <span className="font-bold" style={{ color: brand.colors.secondary }}>
            {week.revised || '-'}
          </span>
        </span>
        <span className="ml-auto text-black/50">
          {t('sheet.printedOn', { date: fmtDate(Date.now()) })}
        </span>
      </div>

      <table className="w-full border-collapse text-[8pt]">
        {/* thead lặp lại đầu mỗi trang giấy */}
        <thead style={{ display: 'table-header-group' }}>
          <tr style={{ background: brand.colors.primary, color: brand.colors.onPrimary }}>
            <Th className="text-left" style={{ width: '30%' }}>
              PRODUCT
            </Th>
            <Th>Total</Th>
            <Th>Last week</Th>
            {visibleDays.map((d) => (
              <Th key={d}>{DAY_LABELS[d]}</Th>
            ))}
            <Th style={{ width: '7%' }}>PIC</Th>
            <Th className="text-left" style={{ width: '13%' }}>
              Remark
            </Th>
          </tr>
        </thead>

        <tbody>
          {/* Dòng tổng */}
          <tr className="font-bold">
            <Td className="text-left uppercase">{t('sheet.total')}</Td>
            <Td className="num" style={{ color: brand.colors.secondary }}>
              {grandTotal || '-'}
            </Td>
            <Td className="num">{lastWeekTotal || '-'}</Td>
            {dayTotals.map((t, i) => (
              <Td key={i} className="num" style={{ color: brand.colors.secondary }}>
                {t || '-'}
              </Td>
            ))}
            <Td />
            <Td />
          </tr>

          {rows.map((r) => {
            const total = rowTotal(r)
            const lw = lastWeek.get(r.productId) ?? 0
            return (
              <tr key={r.id} style={{ breakInside: 'avoid' }}>
                <Td
                  className="text-left font-semibold"
                  style={{ color: r.nameColor ? STATUS_COLORS[r.nameColor] : undefined }}
                >
                  {r.productName}
                  {r.size ? `-${r.size}` : ''}
                </Td>
                <Td className="num font-bold">{total || '-'}</Td>
                <Td className="num text-black/55">{lw || '-'}</Td>

                {visibleDays.map((d) => {
                  const cell = r.days[d]
                  const bg = cell?.status ? STATUS_COLORS[cell.status] : undefined
                  return (
                    <Td
                      key={d}
                      className="num font-semibold"
                      style={bg ? { background: bg, color: readableTextOn(bg) } : undefined}
                    >
                      {cell?.qty || ''}
                    </Td>
                  )
                })}

                <Td>{r.pic || ''}</Td>
                <Td className="text-left">{r.remark || ''}</Td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Th({
  children,
  className = '',
  style,
}: {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <th
      className={`border border-black/40 px-1 py-[3px] text-[7.5pt] font-bold ${className}`}
      style={style}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  className = '',
  style,
}: {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <td className={`border border-black/30 px-1 py-[2px] text-center ${className}`} style={style}>
      {children}
    </td>
  )
}
