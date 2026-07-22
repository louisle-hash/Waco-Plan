import { db, DAY_KEYS, emptyDays, type DayCell, type DayKey, type Week, type WeekRow } from './db'
import type { StatusKey } from './theme'

/**
 * Sao lưu / phục hồi MỘT tuần kế hoạch dưới dạng file .json.
 *
 * Vì sao cần: app không có server — mỗi trình duyệt là một "ổ dữ liệu" riêng.
 * ID nội bộ (weekId, productId) là số tự tăng và KHÁC NHAU giữa các trình duyệt,
 * nên không dùng ID để chuyển dữ liệu qua máy khác được. File backup vì vậy
 * quy chiếu sản phẩm bằng SKU (chuỗi ổn định) thay vì ID nội bộ.
 *
 * Dùng để: đem một tuần đã nhập ở nơi này (ví dụ khung xem trước khi làm việc
 * cùng Claude) sang trình duyệt thật của người dùng, hoặc chỉ đơn giản là
 * sao lưu/khôi phục một tuần.
 */

export const BACKUP_FORMAT = 1

export type WeekBackupRow = {
  sku: string
  productName: string
  size: string
  nameColor: StatusKey | null
  days: Record<DayKey, DayCell>
  pic: string
  remark: string
}

export type WeekBackup = {
  formatVersion: typeof BACKUP_FORMAT
  weekNumber: number
  updatedAt: number
  revised: number
  visibleDays: number
  rows: WeekBackupRow[]
}

/** Xuất một tuần đang có trong app thành đối tượng backup (quy chiếu theo SKU). */
export async function exportWeek(weekId: number): Promise<WeekBackup> {
  const week = await db.weeks.get(weekId)
  if (!week) throw new Error('WEEK_NOT_FOUND')
  const rows = await db.weekRows.where('weekId').equals(weekId).sortBy('sortIndex')

  return {
    formatVersion: BACKUP_FORMAT,
    weekNumber: week.weekNumber,
    updatedAt: week.updatedAt,
    revised: week.revised,
    visibleDays: week.visibleDays,
    rows: rows.map((r) => ({
      sku: r.sku,
      productName: r.productName,
      size: r.size,
      nameColor: r.nameColor,
      days: r.days,
      pic: r.pic,
      remark: r.remark,
    })),
  }
}

/** Kích hoạt tải file .json xuống máy. */
export function downloadWeekBackup(backup: WeekBackup): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `WACO-Tuan-${backup.weekNumber}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/** Đọc + kiểm tra sơ bộ cấu trúc file backup. */
export async function readWeekBackupFile(file: File): Promise<WeekBackup> {
  const text = await file.text()
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('INVALID_JSON')
  }
  if (
    typeof data !== 'object' ||
    data === null ||
    !('formatVersion' in data) ||
    !('rows' in data) ||
    !Array.isArray((data as WeekBackup).rows)
  ) {
    throw new Error('INVALID_SHAPE')
  }
  return data as WeekBackup
}

export type ImportPreviewRow = {
  backupRow: WeekBackupRow
  /** productId khớp được trong danh mục hiện tại, null nếu chưa có SKU này. */
  matchedProductId: number | null
}

export type ImportPreview = {
  weekNumber: number
  existingWeek: Week | null
  rows: ImportPreviewRow[]
  matchedCount: number
  unmatchedCount: number
}

/** Đối chiếu backup với danh mục sản phẩm hiện tại trước khi nạp thật. */
export async function previewImport(backup: WeekBackup): Promise<ImportPreview> {
  const products = await db.products.toArray()
  const bySku = new Map(products.map((p) => [p.sku.toLowerCase(), p]))

  const rows: ImportPreviewRow[] = backup.rows.map((r) => ({
    backupRow: r,
    matchedProductId: bySku.get(r.sku.toLowerCase())?.id ?? null,
  }))

  const existingWeek = (await db.weeks.where('weekNumber').equals(backup.weekNumber).first()) ?? null

  return {
    weekNumber: backup.weekNumber,
    existingWeek,
    rows,
    matchedCount: rows.filter((r) => r.matchedProductId != null).length,
    unmatchedCount: rows.filter((r) => r.matchedProductId == null).length,
  }
}

/**
 * Nạp backup vào app: tạo sản phẩm còn thiếu (quick-add, giống thao tác tay),
 * rồi tạo/ghi đè tuần với đúng số liệu trong file.
 * Không đụng vào tuần đã chốt.
 */
export async function importWeekBackup(
  backup: WeekBackup,
  opts: { createMissingProducts: boolean },
): Promise<{ weekId: number; createdProducts: number }> {
  return db.transaction('rw', db.weeks, db.weekRows, db.products, async () => {
    let createdProducts = 0
    const products = await db.products.toArray()
    const bySku = new Map(products.map((p) => [p.sku.toLowerCase(), p]))

    // Tạo trước những sản phẩm chưa có trong danh mục, nếu được yêu cầu
    if (opts.createMissingProducts) {
      for (const r of backup.rows) {
        if (bySku.has(r.sku.toLowerCase())) continue
        const now = Date.now()
        const id = await db.products.add({
          sku: r.sku,
          name: r.productName,
          size: r.size,
          category: '',
          defaultStatus: null,
          defaultPic: r.pic,
          notes: '',
          archived: false,
          createdAt: now,
          updatedAt: now,
        })
        bySku.set(r.sku.toLowerCase(), { id, sku: r.sku } as never)
        createdProducts++
      }
    }

    const existing = await db.weeks.where('weekNumber').equals(backup.weekNumber).first()
    if (existing?.finalized) throw new Error('WEEK_FINALIZED')

    let weekId: number
    if (existing?.id) {
      weekId = existing.id
      await db.weeks.update(weekId, {
        updatedAt: backup.updatedAt,
        revised: backup.revised,
        visibleDays: backup.visibleDays,
      })
      await db.weekRows.where('weekId').equals(weekId).delete()
    } else {
      weekId = await db.weeks.add({
        weekNumber: backup.weekNumber,
        updatedAt: backup.updatedAt,
        revised: backup.revised,
        visibleDays: backup.visibleDays,
        finalized: false,
        finalizedAt: null,
        createdAt: Date.now(),
      })
    }

    const rowsToAdd: Omit<WeekRow, 'id'>[] = []
    let idx = 0
    for (const r of backup.rows) {
      const product = bySku.get(r.sku.toLowerCase())
      if (!product?.id) continue // chưa có trong danh mục và không được tạo -> bỏ qua
      const days = { ...emptyDays() }
      for (const d of DAY_KEYS) days[d] = r.days[d] ?? { qty: null, status: null }
      rowsToAdd.push({
        weekId,
        productId: product.id,
        productName: r.productName,
        sku: r.sku,
        size: r.size,
        nameColor: r.nameColor,
        days,
        pic: r.pic,
        remark: r.remark,
        sortIndex: idx++,
      })
    }
    if (rowsToAdd.length) await db.weekRows.bulkAdd(rowsToAdd as WeekRow[])

    return { weekId, createdProducts }
  })
}
