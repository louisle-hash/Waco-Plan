import { supabase } from './supabase'
import type { BrandConfig } from './theme'
import { DEFAULT_BRAND, DEFAULT_STATUS_LABELS, type StatusKey } from './theme'

/**
 * Tầng dữ liệu — chạy trên Supabase (Postgres dùng chung), không còn là
 * IndexedDB cục bộ. Mọi máy đăng nhập cùng tài khoản đọc/ghi chung một chỗ.
 *
 * Vì sao vẫn viết theo kiểu "db.products.where(...).first()" giống Dexie cũ:
 * để các màn hình gọi vào đây gần như không phải sửa gì — chỉ đổi CÁCH lấy
 * dữ liệu (useLiveQuery -> useCloudQuery), không đổi CÚ PHÁP gọi CRUD.
 * `localDb.ts` là bản Dexie gốc, giữ lại riêng cho công cụ di chuyển dữ liệu.
 *
 * Giới hạn có chủ đích: không có transaction thật nhiều-câu-lệnh như Dexie
 * (Postgres qua REST API không hỗ trợ điều đó từ trình duyệt). Các thao tác
 * nhiều bước (nhập Excel, nhập tuần từ backup) chạy tuần tự — chấp nhận được
 * vì đây là công cụ nội bộ, ít người thao tác đồng thời, không phải hệ thống
 * giao dịch tài chính cần đảm bảo atomic tuyệt đối.
 */

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
  sku: string
  name: string
  size: string
  category: string
  defaultStatus: StatusKey | null
  defaultPic: string
  notes: string
  archived: boolean
  createdAt: number
  updatedAt: number
}

export type DayCell = {
  qty: number | null
  status: StatusKey | null
}

export type WeekRow = {
  id?: number
  weekId: number
  productId: number
  productName: string
  sku: string
  size: string
  nameColor: StatusKey | null
  days: Record<DayKey, DayCell>
  pic: string
  remark: string
  sortIndex: number
}

export type Week = {
  id?: number
  weekNumber: number
  updatedAt: number
  revised: number
  visibleDays: number
  finalized: boolean
  finalizedAt: number | null
  createdAt: number
}

export type WeekSnapshot = {
  id?: number
  weekId: number
  weekNumber: number
  productId: number
  total: number
}

export type SettingRecord = { key: string; value: unknown }

/* ---------------- ánh xạ camelCase (app) <-> snake_case (Postgres) ---------------- */

type ProductRow = {
  id: number
  sku: string
  name: string
  size: string
  category: string
  default_status: StatusKey | null
  default_pic: string
  notes: string
  archived: boolean
  created_at: string
  updated_at: string
}

function productFromDb(r: ProductRow): Product {
  return {
    id: r.id,
    sku: r.sku,
    name: r.name,
    size: r.size,
    category: r.category,
    defaultStatus: r.default_status,
    defaultPic: r.default_pic,
    notes: r.notes,
    archived: r.archived,
    createdAt: new Date(r.created_at).getTime(),
    updatedAt: new Date(r.updated_at).getTime(),
  }
}

function productToDb(p: Partial<Product>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (p.sku !== undefined) out.sku = p.sku
  if (p.name !== undefined) out.name = p.name
  if (p.size !== undefined) out.size = p.size
  if (p.category !== undefined) out.category = p.category
  if (p.defaultStatus !== undefined) out.default_status = p.defaultStatus
  if (p.defaultPic !== undefined) out.default_pic = p.defaultPic
  if (p.notes !== undefined) out.notes = p.notes
  if (p.archived !== undefined) out.archived = p.archived
  if (p.createdAt !== undefined) out.created_at = new Date(p.createdAt).toISOString()
  if (p.updatedAt !== undefined) out.updated_at = new Date(p.updatedAt).toISOString()
  return out
}

type WeekRowDb = {
  id: number
  week_number: number
  updated_at: string
  revised: number
  visible_days: number
  finalized: boolean
  finalized_at: string | null
  created_at: string
}

function weekFromDb(r: WeekRowDb): Week {
  return {
    id: r.id,
    weekNumber: r.week_number,
    updatedAt: new Date(r.updated_at).getTime(),
    revised: r.revised,
    visibleDays: r.visible_days,
    finalized: r.finalized,
    finalizedAt: r.finalized_at ? new Date(r.finalized_at).getTime() : null,
    createdAt: new Date(r.created_at).getTime(),
  }
}

function weekToDb(w: Partial<Week>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (w.weekNumber !== undefined) out.week_number = w.weekNumber
  if (w.updatedAt !== undefined) out.updated_at = new Date(w.updatedAt).toISOString()
  if (w.revised !== undefined) out.revised = w.revised
  if (w.visibleDays !== undefined) out.visible_days = w.visibleDays
  if (w.finalized !== undefined) out.finalized = w.finalized
  if (w.finalizedAt !== undefined) out.finalized_at = w.finalizedAt ? new Date(w.finalizedAt).toISOString() : null
  if (w.createdAt !== undefined) out.created_at = new Date(w.createdAt).toISOString()
  return out
}

type WeekRowRowDb = {
  id: number
  week_id: number
  product_id: number
  product_name: string
  sku: string
  size: string
  name_color: StatusKey | null
  days: Record<DayKey, DayCell>
  pic: string
  remark: string
  sort_index: number
}

function weekRowFromDb(r: WeekRowRowDb): WeekRow {
  return {
    id: r.id,
    weekId: r.week_id,
    productId: r.product_id,
    productName: r.product_name,
    sku: r.sku,
    size: r.size,
    nameColor: r.name_color,
    days: r.days,
    pic: r.pic,
    remark: r.remark,
    sortIndex: r.sort_index,
  }
}

function weekRowToDb(r: Partial<WeekRow>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (r.weekId !== undefined) out.week_id = r.weekId
  if (r.productId !== undefined) out.product_id = r.productId
  if (r.productName !== undefined) out.product_name = r.productName
  if (r.sku !== undefined) out.sku = r.sku
  if (r.size !== undefined) out.size = r.size
  if (r.nameColor !== undefined) out.name_color = r.nameColor
  if (r.days !== undefined) out.days = r.days
  if (r.pic !== undefined) out.pic = r.pic
  if (r.remark !== undefined) out.remark = r.remark
  if (r.sortIndex !== undefined) out.sort_index = r.sortIndex
  return out
}

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message)
  return res.data as T
}

/* ---------------- bảng products ---------------- */

const productsTable = {
  async toArray(): Promise<Product[]> {
    const res = await supabase.from('products').select('*').order('name')
    return unwrap(res).map(productFromDb)
  },
  filter(pred: (p: Product) => boolean) {
    return {
      toArray: async () => (await productsTable.toArray()).filter(pred),
    }
  },
  where(_field: 'sku') {
    return {
      equals(value: string) {
        return {
          async first(): Promise<Product | undefined> {
            const res = await supabase.from('products').select('*').eq('sku', value).maybeSingle()
            const row = unwrap(res) as ProductRow | null
            return row ? productFromDb(row) : undefined
          },
        }
      },
    }
  },
  async add(p: Omit<Product, 'id'>): Promise<number> {
    const res = await supabase.from('products').insert(productToDb(p)).select('id').single()
    return (unwrap(res) as { id: number }).id
  },
  async bulkAdd(list: Product[]): Promise<void> {
    if (!list.length) return
    const res = await supabase.from('products').insert(list.map(productToDb))
    unwrap(res)
  },
  async update(id: number, patch: Partial<Product>): Promise<void> {
    const res = await supabase.from('products').update(productToDb(patch)).eq('id', id)
    unwrap(res)
  },
}

/* ---------------- bảng weeks ---------------- */

const weeksTable = {
  async get(id: number): Promise<Week | undefined> {
    const res = await supabase.from('weeks').select('*').eq('id', id).maybeSingle()
    const row = unwrap(res) as WeekRowDb | null
    return row ? weekFromDb(row) : undefined
  },
  async toArray(): Promise<Week[]> {
    const res = await supabase.from('weeks').select('*')
    return unwrap(res).map(weekFromDb)
  },
  orderBy(_field: 'weekNumber') {
    return {
      async toArray(): Promise<Week[]> {
        const res = await supabase.from('weeks').select('*').order('week_number')
        return unwrap(res).map(weekFromDb)
      },
    }
  },
  where(_field: 'weekNumber') {
    return {
      equals(value: number) {
        return {
          async first(): Promise<Week | undefined> {
            const res = await supabase.from('weeks').select('*').eq('week_number', value).maybeSingle()
            const row = unwrap(res) as WeekRowDb | null
            return row ? weekFromDb(row) : undefined
          },
        }
      },
    }
  },
  async add(w: Omit<Week, 'id'>): Promise<number> {
    const res = await supabase.from('weeks').insert(weekToDb(w)).select('id').single()
    return (unwrap(res) as { id: number }).id
  },
  async update(id: number, patch: Partial<Week>): Promise<void> {
    const res = await supabase.from('weeks').update(weekToDb(patch)).eq('id', id)
    unwrap(res)
  },
}

/* ---------------- bảng weekRows ---------------- */

const weekRowsTable = {
  where(_field: 'weekId') {
    return {
      equals(weekId: number) {
        return {
          async toArray(): Promise<WeekRow[]> {
            const res = await supabase.from('week_rows').select('*').eq('week_id', weekId)
            return unwrap(res).map(weekRowFromDb)
          },
          async sortBy(_key: 'sortIndex'): Promise<WeekRow[]> {
            const res = await supabase.from('week_rows').select('*').eq('week_id', weekId).order('sort_index')
            return unwrap(res).map(weekRowFromDb)
          },
          async delete(): Promise<void> {
            const res = await supabase.from('week_rows').delete().eq('week_id', weekId)
            unwrap(res)
          },
        }
      },
    }
  },
  async update(id: number, patch: Partial<WeekRow>): Promise<void> {
    const res = await supabase.from('week_rows').update(weekRowToDb(patch)).eq('id', id)
    unwrap(res)
  },
  async delete(id: number): Promise<void> {
    const res = await supabase.from('week_rows').delete().eq('id', id)
    unwrap(res)
  },
  async bulkAdd(list: WeekRow[]): Promise<void> {
    if (!list.length) return
    const res = await supabase.from('week_rows').insert(list.map(weekRowToDb))
    unwrap(res)
  },
}

/* ---------------- bảng snapshots ---------------- */

const snapshotsTable = {
  where(field: 'weekId' | 'weekNumber') {
    return {
      equals(value: number) {
        return {
          async delete(): Promise<void> {
            const col = field === 'weekId' ? 'week_id' : 'week_number'
            const res = await supabase.from('snapshots').delete().eq(col, value)
            unwrap(res)
          },
          async toArray(): Promise<WeekSnapshot[]> {
            const col = field === 'weekId' ? 'week_id' : 'week_number'
            const res = await supabase.from('snapshots').select('*').eq(col, value)
            const rows = unwrap(res) as {
              id: number
              week_id: number
              week_number: number
              product_id: number
              total: number
            }[]
            return rows.map((row) => ({
              id: row.id,
              weekId: row.week_id,
              weekNumber: row.week_number,
              productId: row.product_id,
              total: row.total,
            }))
          },
        }
      },
    }
  },
  async bulkAdd(list: WeekSnapshot[]): Promise<void> {
    if (!list.length) return
    const res = await supabase.from('snapshots').insert(
      list.map((s) => ({ week_id: s.weekId, week_number: s.weekNumber, product_id: s.productId, total: s.total })),
    )
    unwrap(res)
  },
}

/* ---------------- gộp lại thành đối tượng `db` giống Dexie cũ ---------------- */

export const db = {
  products: productsTable,
  weeks: weeksTable,
  weekRows: weekRowsTable,
  snapshots: snapshotsTable,
  /** Không còn transaction thật — chạy tuần tự, xem ghi chú đầu file. */
  async transaction<T>(_mode: 'rw', ..._tablesAndFn: unknown[]): Promise<T> {
    const fn = _tablesAndFn[_tablesAndFn.length - 1] as () => Promise<T>
    return fn()
  },
  /**
   * Xoá TOÀN BỘ dữ liệu DÙNG CHUNG trên Supabase — ảnh hưởng mọi người, không
   * chỉ máy này. CHỈ xoá key settings của app này (bảng `settings` dùng
   * chung project với app khác — xoá theo `neq('key','')` sẽ xoá luôn cấu
   * hình của app kia, tuyệt đối không được làm vậy).
   */
  async delete(): Promise<void> {
    await supabase.from('snapshots').delete().neq('id', -1)
    await supabase.from('week_rows').delete().neq('id', -1)
    await supabase.from('weeks').delete().neq('id', -1)
    await supabase.from('products').delete().neq('id', -1)
    await supabase.from('settings').delete().in('key', [SETTING_BRAND, SETTING_STATUS_LABELS, 'foam_process_adjust'])
  },
}

/* ---------------- helpers (giống hệt bản cũ) ---------------- */

export function emptyDays(): Record<DayKey, DayCell> {
  return DAY_KEYS.reduce(
    (acc, d) => {
      acc[d] = { qty: null, status: null }
      return acc
    },
    {} as Record<DayKey, DayCell>,
  )
}

export function rowTotal(row: WeekRow): number {
  return DAY_KEYS.reduce((sum, d) => sum + (row.days[d]?.qty ?? 0), 0)
}

/* ---------------- settings ---------------- */

/**
 * LƯU Ý: bảng `settings` này dùng chung project Supabase với một app khác,
 * và cột `value` thực tế là TEXT (không phải jsonb như phần đầu file giả
 * định) — ghi object thẳng vào sẽ bị Postgres/PostgREST ép về chuỗi JSON,
 * đọc lại nhận được string chứ không phải object (gây crash kiểu
 * "brand.colors" undefined). Nên LUÔN JSON.stringify khi ghi và JSON.parse
 * khi đọc, chấp nhận cả trường hợp giá trị cũ vô tình đã là object thật.
 */
export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const res = await supabase.from('settings').select('value').eq('key', key).maybeSingle()
  const row = unwrap(res) as { value: unknown } | null
  if (!row || row.value == null) return fallback
  try {
    return typeof row.value === 'string' ? (JSON.parse(row.value) as T) : (row.value as T)
  } catch {
    return fallback
  }
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  const res = await supabase.from('settings').upsert({ key, value: JSON.stringify(value) })
  unwrap(res)
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

export async function getOrCreateCurrentWeek(): Promise<Week> {
  const all = await db.weeks.orderBy('weekNumber').toArray()
  const open = [...all].reverse().find((w) => !w.finalized)
  if (open) return open
  const lastNumber = all.length ? all[all.length - 1].weekNumber : 0
  const week: Omit<Week, 'id'> = {
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

export async function touchWeek(weekId: number): Promise<void> {
  const w = await db.weeks.get(weekId)
  if (!w || w.finalized) return
  await db.weeks.update(weekId, { updatedAt: Date.now(), revised: (w.revised ?? 0) + 1 })
}

export async function lastWeekTotals(weekNumber: number): Promise<Map<number, number>> {
  const weeks = await db.weeks.toArray()
  const prev = weeks
    .filter((w) => w.finalized && w.weekNumber < weekNumber)
    .sort((a, b) => b.weekNumber - a.weekNumber)[0]
  if (!prev) return new Map()

  const snaps = await db.snapshots.where('weekNumber').equals(prev.weekNumber).toArray()
  return new Map(snaps.map((s) => [s.productId, s.total]))
}

export async function finalizeWeek(weekId: number): Promise<void> {
  const week = await db.weeks.get(weekId)
  if (!week || week.finalized) return
  const rows = await db.weekRows.where('weekId').equals(weekId).toArray()

  await db.snapshots.where('weekId').equals(weekId).delete()
  await db.snapshots.bulkAdd(
    rows.map((r) => ({ weekId, weekNumber: week.weekNumber, productId: r.productId, total: rowTotal(r) })),
  )
  await db.weeks.update(weekId, { finalized: true, finalizedAt: Date.now() })
}

export async function duplicateWeek(sourceWeekId: number): Promise<number> {
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
      days: emptyDays(),
      pic: r.pic,
      remark: '',
      sortIndex: r.sortIndex,
    })) as WeekRow[],
  )
  return newId
}
