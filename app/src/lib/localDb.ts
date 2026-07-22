/**
 * Module Dexie/IndexedDB GỐC — giữ nguyên không đổi.
 *
 * Sau khi chuyển sang Supabase, `lib/db.ts` đã là module MỚI (đọc/ghi cloud).
 * File này chỉ còn dùng cho MỘT việc: công cụ "Đẩy dữ liệu lên Supabase" trong
 * Settings đọc dữ liệu cũ đã nhập trước khi chuyển đổi (đọc từ đây, ghi sang cloud).
 * Không import file này ở bất kỳ đâu khác ngoài công cụ di chuyển.
 */
import Dexie, { type Table } from 'dexie'
import type { BrandConfig } from './theme'
import { DEFAULT_BRAND, DEFAULT_STATUS_LABELS, type StatusKey } from './theme'

/** Thứ tự ngày trong tuần. Mặc định hiển thị Mon-Thu, mở rộng được tới Sun. */
export const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
export type DayKey = (typeof DAY_KEYS)[number]

export const DAY_LABELS: Record<DayKey, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: "Wed'day",
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
}

export type Product = {
  id?: number
  sku: string // duy nhất
  name: string
  size: string // Twin / Full / Queen / King / ...
  category: string // dòng sản phẩm
  defaultStatus: StatusKey | null
  defaultPic: string
  notes: string
  archived: boolean // xoá mềm
  createdAt: number
  updatedAt: number
}

/** Một ô ngày: số lượng + màu nền trạng thái (độc lập nhau). */
export type DayCell = {
  qty: number | null
  status: StatusKey | null
}

export type WeekRow = {
  id?: number
  weekId: number
  productId: number
  /** Chụp lại lúc thêm dòng, để tem in và lịch sử không đổi khi sản phẩm bị sửa tên. */
  productName: string
  sku: string
  size: string
  /** Màu chữ tên sản phẩm — độc lập với màu nền ô ngày (giống Excel gốc). */
  nameColor: StatusKey | null
  days: Record<DayKey, DayCell>
  pic: string
  remark: string
  sortIndex: number
}

export type Week = {
  id?: number
  weekNumber: number
  /** Ngày cập nhật, tự set khi lưu, sửa tay được. */
  updatedAt: number
  /** Đếm số lần sửa, tự tăng, reset tay được. */
  revised: number
  /** Số cột ngày đang hiển thị (4 = Mon-Thu, 7 = Mon-Sun). */
  visibleDays: number
  /** Đã chốt tuần: khoá không cho sửa, dùng làm "Last week" cho tuần sau. */
  finalized: boolean
  finalizedAt: number | null
  createdAt: number
}

/**
 * Ảnh chụp bất biến khi chốt tuần: tổng số lượng theo từng sản phẩm.
 * Tuần sau đọc bảng này để điền cột "Last week" (chỉ đọc).
 */
export type WeekSnapshot = {
  id?: number
  weekId: number
  weekNumber: number
  productId: number
  total: number
}

export type SettingRecord = {
  key: string
  value: unknown
}

class PlanDB extends Dexie {
  products!: Table<Product, number>
  weeks!: Table<Week, number>
  weekRows!: Table<WeekRow, number>
  snapshots!: Table<WeekSnapshot, number>
  settings!: Table<SettingRecord, string>

  constructor() {
    super('waco-plan-app')
    this.version(1).stores({
      products: '++id, &sku, name, category, size',
      weeks: '++id, &weekNumber',
      weekRows: '++id, weekId, productId, [weekId+productId], sortIndex',
      snapshots: '++id, weekId, weekNumber, productId, [weekNumber+productId]',
      settings: 'key',
    })
  }
}

export const db = new PlanDB()

/* ---------------- helpers ---------------- */

export function emptyDays(): Record<DayKey, DayCell> {
  return DAY_KEYS.reduce(
    (acc, d) => {
      acc[d] = { qty: null, status: null }
      return acc
    },
    {} as Record<DayKey, DayCell>,
  )
}

/** Tổng của một dòng = cộng tất cả các ô ngày (giống công thức Total trong Excel). */
export function rowTotal(row: WeekRow): number {
  return DAY_KEYS.reduce((sum, d) => sum + (row.days[d]?.qty ?? 0), 0)
}

/* ---------------- settings ---------------- */

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const rec = await db.settings.get(key)
  return rec ? (rec.value as T) : fallback
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await db.settings.put({ key, value })
}

export const SETTING_BRAND = 'brand'
export const SETTING_STATUS_LABELS = 'statusLabels'

export async function loadBrand(): Promise<BrandConfig> {
  return getSetting<BrandConfig>(SETTING_BRAND, DEFAULT_BRAND)
}

export async function loadStatusLabels(): Promise<Record<StatusKey, string>> {
  return getSetting<Record<StatusKey, string>>(SETTING_STATUS_LABELS, DEFAULT_STATUS_LABELS)
}

/* ---------------- tuần ---------------- */

/** Lấy tuần đang mở (chưa chốt, số lớn nhất); nếu chưa có tuần nào thì tạo tuần 1. */
export async function getOrCreateCurrentWeek(): Promise<Week> {
  const all = await db.weeks.orderBy('weekNumber').toArray()
  const open = [...all].reverse().find((w) => !w.finalized)
  if (open) return open
  const lastNumber = all.length ? all[all.length - 1].weekNumber : 0
  const week: Week = {
    weekNumber: lastNumber + 1,
    updatedAt: Date.now(),
    revised: 0,
    visibleDays: 4,
    finalized: false,
    finalizedAt: null,
    createdAt: Date.now(),
  }
  const id = await db.weeks.add(week)
  return { ...week, id }
}

/** Đánh dấu tuần vừa được sửa: cập nhật ngày + tăng bộ đếm Revised. */
export async function touchWeek(weekId: number): Promise<void> {
  const w = await db.weeks.get(weekId)
  if (!w || w.finalized) return
  await db.weeks.update(weekId, { updatedAt: Date.now(), revised: (w.revised ?? 0) + 1 })
}

/**
 * Bản đồ "Last week": tổng đã chốt của tuần liền trước tuần đang xem.
 * Lấy từ snapshot bất biến, nên sửa lại tuần cũ cũng không làm sai số liệu.
 */
export async function lastWeekTotals(weekNumber: number): Promise<Map<number, number>> {
  // IndexedDB không index được giá trị boolean -> lọc trong JS
  const weeks = await db.weeks.toArray()
  const prev = weeks
    .filter((w) => w.finalized && w.weekNumber < weekNumber)
    .sort((a, b) => b.weekNumber - a.weekNumber)[0]
  if (!prev) return new Map()

  const snaps = await db.snapshots.where('weekNumber').equals(prev.weekNumber).toArray()
  return new Map(snaps.map((s) => [s.productId, s.total]))
}

/** Chốt tuần: ghi snapshot bất biến rồi khoá tuần. */
export async function finalizeWeek(weekId: number): Promise<void> {
  await db.transaction('rw', db.weeks, db.weekRows, db.snapshots, async () => {
    const week = await db.weeks.get(weekId)
    if (!week || week.finalized) return
    const rows = await db.weekRows.where('weekId').equals(weekId).toArray()

    await db.snapshots.where('weekId').equals(weekId).delete()
    await db.snapshots.bulkAdd(
      rows.map((r) => ({
        weekId,
        weekNumber: week.weekNumber,
        productId: r.productId,
        total: rowTotal(r),
      })),
    )
    await db.weeks.update(weekId, { finalized: true, finalizedAt: Date.now() })
  })
}

/** Tạo tuần mới nhân bản từ tuần cho trước (giữ sản phẩm + PIC, xoá số lượng). */
export async function duplicateWeek(sourceWeekId: number): Promise<number> {
  return db.transaction('rw', db.weeks, db.weekRows, async () => {
    const src = await db.weeks.get(sourceWeekId)
    if (!src) throw new Error('Không tìm thấy tuần nguồn')
    const all = await db.weeks.toArray()
    const nextNumber = Math.max(...all.map((w) => w.weekNumber)) + 1

    const newId = await db.weeks.add({
      weekNumber: nextNumber,
      updatedAt: Date.now(),
      revised: 0,
      visibleDays: src.visibleDays,
      finalized: false,
      finalizedAt: null,
      createdAt: Date.now(),
    })

    const rows = await db.weekRows.where('weekId').equals(sourceWeekId).toArray()
    await db.weekRows.bulkAdd(
      rows.map((r) => ({
        weekId: newId,
        productId: r.productId,
        productName: r.productName,
        sku: r.sku,
        size: r.size,
        nameColor: r.nameColor,
        days: emptyDays(), // sang tuần mới thì nhập lại số lượng
        pic: r.pic,
        remark: '',
        sortIndex: r.sortIndex,
      })),
    )
    return newId
  })
}
