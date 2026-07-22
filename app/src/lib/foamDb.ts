import { supabase } from './supabase'

/**
 * Tầng dữ liệu nhóm FOAM (Supabase, dùng chung). Tách hẳn khỏi db.ts của
 * nhóm Nệm — bảng riêng foam_*. Xem app/supabase/foam-schema.sql.
 *
 * Công thức invoice (giải mã từ Invoice Foam.xlsm) nằm ở cuối file dưới dạng
 * hàm thuần (pricingSize / bdft / amount) để tính lại y hệt Excel.
 */

/* ================= Kiểu dữ liệu ================= */

export type FoamProduct = {
  id?: number
  foamCode: string
  foamDh: string
  densityLb: number | null
  densityKg: number | null
  hardness: number | null
  description: string
  color: string
  baseThick: number | null
  customerUsual: string
  remark: string
  archived: boolean
}

export type FoamCustomer = { id?: number; name: string }

export type FoamPrice = {
  id?: number
  customer: string
  foamCode: string
  customerCode: string
  customerRemark: string
  price: number | null
}

export type FoamSize = {
  id?: number
  sizeBasis: string
  sizeCode: string
  width: number | null
  length: number | null
  note: string
}

export type FoamProcess = 'UNTRIM' | 'TRIM-AS' | 'TRIM-CUSTOM'

export type FoamInvoice = {
  id?: number
  invoiceNo: string
  customer: string
  invoiceDate: string | null // 'YYYY-MM-DD'
  customerPo: string
  terms: string
  note: string
  freight: number
  preparedBy: string
  loadedBy: string
  createdAt?: number
  updatedAt?: number
}

export type FoamInvoiceRow = {
  id?: number
  invoiceId: number
  sortIndex: number
  customerPart: string
  foamCode: string
  remark: string
  process: FoamProcess
  sizeCode: string
  qty: number
  note: string
  /** Kích thước nhập (inch): L, W, H. UNTRIM = kích thước thô, TRIM = đã cắt. */
  l: number | null
  w: number | null
  h: number | null
}

export const FOAM_PROCESSES: FoamProcess[] = ['UNTRIM', 'TRIM-AS', 'TRIM-CUSTOM']
export const FOAM_SIZE_CODES = ['T', 'F', 'Q', 'K', 'CK', 'S', 'W'] as const

/* ================= Ánh xạ snake_case <-> camelCase ================= */

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message)
  return res.data as T
}

const num = (v: unknown): number | null => (v === null || v === undefined || v === '' ? null : Number(v))

function productFromDb(r: Record<string, unknown>): FoamProduct {
  return {
    id: r.id as number,
    foamCode: (r.foam_code as string) ?? '',
    foamDh: (r.foam_dh as string) ?? '',
    densityLb: num(r.density_lb),
    densityKg: num(r.density_kg),
    hardness: num(r.hardness),
    description: (r.description as string) ?? '',
    color: (r.color as string) ?? '',
    baseThick: num(r.base_thick),
    customerUsual: (r.customer_usual as string) ?? '',
    remark: (r.remark as string) ?? '',
    archived: !!r.archived,
  }
}
function productToDb(p: Partial<FoamProduct>): Record<string, unknown> {
  const o: Record<string, unknown> = {}
  if (p.foamCode !== undefined) o.foam_code = p.foamCode
  if (p.foamDh !== undefined) o.foam_dh = p.foamDh
  if (p.densityLb !== undefined) o.density_lb = p.densityLb
  if (p.densityKg !== undefined) o.density_kg = p.densityKg
  if (p.hardness !== undefined) o.hardness = p.hardness
  if (p.description !== undefined) o.description = p.description
  if (p.color !== undefined) o.color = p.color
  if (p.baseThick !== undefined) o.base_thick = p.baseThick
  if (p.customerUsual !== undefined) o.customer_usual = p.customerUsual
  if (p.remark !== undefined) o.remark = p.remark
  if (p.archived !== undefined) o.archived = p.archived
  return o
}

function priceFromDb(r: Record<string, unknown>): FoamPrice {
  return {
    id: r.id as number,
    customer: (r.customer as string) ?? '',
    foamCode: (r.foam_code as string) ?? '',
    customerCode: (r.customer_code as string) ?? '',
    customerRemark: (r.customer_remark as string) ?? '',
    price: num(r.price),
  }
}

function sizeFromDb(r: Record<string, unknown>): FoamSize {
  return {
    id: r.id as number,
    sizeBasis: (r.size_basis as string) ?? '',
    sizeCode: (r.size_code as string) ?? '',
    width: num(r.width),
    length: num(r.length),
    note: (r.note as string) ?? '',
  }
}

function invoiceFromDb(r: Record<string, unknown>): FoamInvoice {
  return {
    id: r.id as number,
    invoiceNo: (r.invoice_no as string) ?? '',
    customer: (r.customer as string) ?? '',
    invoiceDate: (r.invoice_date as string) ?? null,
    customerPo: (r.customer_po as string) ?? '',
    terms: (r.terms as string) ?? '',
    note: (r.note as string) ?? '',
    freight: Number(r.freight ?? 0),
    preparedBy: (r.prepared_by as string) ?? '',
    loadedBy: (r.loaded_by as string) ?? '',
    createdAt: r.created_at ? new Date(r.created_at as string).getTime() : undefined,
    updatedAt: r.updated_at ? new Date(r.updated_at as string).getTime() : undefined,
  }
}
function invoiceToDb(v: Partial<FoamInvoice>): Record<string, unknown> {
  const o: Record<string, unknown> = {}
  if (v.invoiceNo !== undefined) o.invoice_no = v.invoiceNo
  if (v.customer !== undefined) o.customer = v.customer
  if (v.invoiceDate !== undefined) o.invoice_date = v.invoiceDate
  if (v.customerPo !== undefined) o.customer_po = v.customerPo
  if (v.terms !== undefined) o.terms = v.terms
  if (v.note !== undefined) o.note = v.note
  if (v.freight !== undefined) o.freight = v.freight
  if (v.preparedBy !== undefined) o.prepared_by = v.preparedBy
  if (v.loadedBy !== undefined) o.loaded_by = v.loadedBy
  return o
}

function rowFromDb(r: Record<string, unknown>): FoamInvoiceRow {
  return {
    id: r.id as number,
    invoiceId: r.invoice_id as number,
    sortIndex: Number(r.sort_index ?? 0),
    customerPart: (r.customer_part as string) ?? '',
    foamCode: (r.foam_code as string) ?? '',
    remark: (r.remark as string) ?? '',
    process: ((r.process as string) ?? 'UNTRIM') as FoamProcess,
    sizeCode: (r.size_code as string) ?? '',
    qty: Number(r.qty ?? 1),
    note: (r.note as string) ?? '',
    l: num(r.raw_l),
    w: num(r.raw_w),
    h: num(r.raw_h),
  }
}
function rowToDb(r: Partial<FoamInvoiceRow>): Record<string, unknown> {
  const o: Record<string, unknown> = {}
  if (r.invoiceId !== undefined) o.invoice_id = r.invoiceId
  if (r.sortIndex !== undefined) o.sort_index = r.sortIndex
  if (r.customerPart !== undefined) o.customer_part = r.customerPart
  if (r.foamCode !== undefined) o.foam_code = r.foamCode
  if (r.remark !== undefined) o.remark = r.remark
  if (r.process !== undefined) o.process = r.process
  if (r.sizeCode !== undefined) o.size_code = r.sizeCode
  if (r.qty !== undefined) o.qty = r.qty
  if (r.note !== undefined) o.note = r.note
  if (r.l !== undefined) o.raw_l = r.l
  if (r.w !== undefined) o.raw_w = r.w
  if (r.h !== undefined) o.raw_h = r.h
  return o
}

/* ================= Sản phẩm foam ================= */

export async function listFoamProducts(): Promise<FoamProduct[]> {
  const res = await supabase.from('foam_products').select('*').order('foam_code')
  return unwrap(res).map(productFromDb)
}
export async function addFoamProduct(p: Omit<FoamProduct, 'id'>): Promise<number> {
  const res = await supabase.from('foam_products').insert(productToDb(p)).select('id').single()
  return (unwrap(res) as { id: number }).id
}
export async function updateFoamProduct(id: number, patch: Partial<FoamProduct>): Promise<void> {
  unwrap(await supabase.from('foam_products').update(productToDb(patch)).eq('id', id))
}
export async function deleteFoamProduct(id: number): Promise<void> {
  unwrap(await supabase.from('foam_products').delete().eq('id', id))
}
export async function bulkAddFoamProducts(list: Omit<FoamProduct, 'id'>[]): Promise<void> {
  if (!list.length) return
  unwrap(await supabase.from('foam_products').insert(list.map(productToDb)))
}

/** Danh sách mã foam DUY NHẤT (gộp alias) kèm density/hardness — cho invoice & tem. */
export async function listUniqueFoamCodes(): Promise<FoamProduct[]> {
  const all = await listFoamProducts()
  const seen = new Set<string>()
  const out: FoamProduct[] = []
  for (const p of all) {
    if (seen.has(p.foamCode)) continue
    seen.add(p.foamCode)
    out.push(p)
  }
  return out
}

/* ================= Khách hàng + bảng giá ================= */

export async function listFoamCustomers(): Promise<FoamCustomer[]> {
  const res = await supabase.from('foam_customers').select('*').order('name')
  return unwrap(res).map((r: Record<string, unknown>) => ({ id: r.id as number, name: r.name as string }))
}
export async function addFoamCustomer(name: string): Promise<void> {
  unwrap(await supabase.from('foam_customers').insert({ name }))
}

export async function listFoamPrices(): Promise<FoamPrice[]> {
  const res = await supabase.from('foam_prices').select('*').order('customer')
  return unwrap(res).map(priceFromDb)
}
/** Tra đơn giá theo (khách hàng, mã foam). Trả null nếu chưa có giá. */
export async function priceFor(customer: string, foamCode: string): Promise<number | null> {
  if (!customer || !foamCode) return null
  const res = await supabase
    .from('foam_prices')
    .select('price')
    .eq('customer', customer)
    .eq('foam_code', foamCode)
    .maybeSingle()
  const row = unwrap(res) as { price: number | null } | null
  return row ? num(row.price) : null
}

/* ================= Size ================= */

export async function listFoamSizes(): Promise<FoamSize[]> {
  const res = await supabase.from('foam_sizes').select('*').order('size_basis')
  return unwrap(res).map(sizeFromDb)
}

/* ================= Invoice ================= */

export async function listFoamInvoices(): Promise<FoamInvoice[]> {
  const res = await supabase.from('foam_invoices').select('*').order('id', { ascending: false })
  return unwrap(res).map(invoiceFromDb)
}
export async function getFoamInvoice(id: number): Promise<FoamInvoice | undefined> {
  const res = await supabase.from('foam_invoices').select('*').eq('id', id).maybeSingle()
  const row = unwrap(res) as Record<string, unknown> | null
  return row ? invoiceFromDb(row) : undefined
}
export async function createFoamInvoice(v: Omit<FoamInvoice, 'id'>): Promise<number> {
  const res = await supabase.from('foam_invoices').insert(invoiceToDb(v)).select('id').single()
  return (unwrap(res) as { id: number }).id
}
export async function updateFoamInvoice(id: number, patch: Partial<FoamInvoice>): Promise<void> {
  unwrap(
    await supabase
      .from('foam_invoices')
      .update({ ...invoiceToDb(patch), updated_at: new Date().toISOString() })
      .eq('id', id),
  )
}
export async function deleteFoamInvoice(id: number): Promise<void> {
  unwrap(await supabase.from('foam_invoices').delete().eq('id', id))
}

export async function listInvoiceRows(invoiceId: number): Promise<FoamInvoiceRow[]> {
  const res = await supabase.from('foam_invoice_rows').select('*').eq('invoice_id', invoiceId).order('sort_index')
  return unwrap(res).map(rowFromDb)
}
/** Ghi đè toàn bộ dòng của 1 invoice (xoá cũ, chèn mới) — đơn giản & chắc chắn. */
export async function replaceInvoiceRows(invoiceId: number, rows: FoamInvoiceRow[]): Promise<void> {
  unwrap(await supabase.from('foam_invoice_rows').delete().eq('invoice_id', invoiceId))
  if (!rows.length) return
  const payload = rows.map((r, i) => rowToDb({ ...r, invoiceId, sortIndex: i }))
  unwrap(await supabase.from('foam_invoice_rows').insert(payload))
}

/* ================= Cấu hình pricing theo Process ================= */

/** Lượng trừ (inch) cho L, W, H khi tính kích thước tính giá của mỗi process. */
export type ProcessAdjust = { dl: number; dw: number; dh: number }
export type ProcessAdjustMap = Record<FoamProcess, ProcessAdjust>

/**
 * Mặc định (khớp công thức Excel gốc):
 * - UNTRIM: trừ 1.5 mỗi cạnh L/W (cắt biên) + 0.5 chiều cao (da)
 * - TRIM-*: đã cắt sẵn nên L/W không trừ, chỉ trừ 0.5 chiều cao (da)
 * Người dùng chỉnh lại trong màn Cài đặt Process (lưu ở bảng settings dùng chung).
 */
export const DEFAULT_PROCESS_ADJUST: ProcessAdjustMap = {
  UNTRIM: { dl: 1.5, dw: 1.5, dh: 0.5 },
  'TRIM-AS': { dl: 0, dw: 0, dh: 0.5 },
  'TRIM-CUSTOM': { dl: 0, dw: 0, dh: 0.5 },
}

const SETTING_PROCESS_ADJUST = 'foam_process_adjust'

/**
 * Lưu ở bảng `settings` dùng chung. LƯU Ý: project Supabase này chia sẻ với một
 * app khác; cột settings.value ở đó lưu CHUỖI JSON (text), không phải jsonb
 * object. Vì vậy phải JSON.stringify khi ghi và JSON.parse khi đọc để không lệch
 * định dạng. Vẫn nhận cả trường hợp value đã là object (phòng khi đổi về jsonb).
 */
export async function loadProcessAdjust(): Promise<ProcessAdjustMap> {
  try {
    const res = await supabase.from('settings').select('value').eq('key', SETTING_PROCESS_ADJUST).maybeSingle()
    if (res.error) return DEFAULT_PROCESS_ADJUST
    const raw = (res.data as { value: unknown } | null)?.value
    if (raw == null) return DEFAULT_PROCESS_ADJUST
    const v = (typeof raw === 'string' ? JSON.parse(raw) : raw) as Partial<ProcessAdjustMap>
    // gộp với mặc định để thiếu process nào vẫn có giá trị
    return {
      UNTRIM: { ...DEFAULT_PROCESS_ADJUST.UNTRIM, ...v.UNTRIM },
      'TRIM-AS': { ...DEFAULT_PROCESS_ADJUST['TRIM-AS'], ...v['TRIM-AS'] },
      'TRIM-CUSTOM': { ...DEFAULT_PROCESS_ADJUST['TRIM-CUSTOM'], ...v['TRIM-CUSTOM'] },
    }
  } catch {
    return DEFAULT_PROCESS_ADJUST
  }
}

export async function saveProcessAdjust(v: ProcessAdjustMap): Promise<void> {
  unwrap(await supabase.from('settings').upsert({ key: SETTING_PROCESS_ADJUST, value: JSON.stringify(v) }))
}

/* ================= Công thức tính (thuần) ================= */

/**
 * Pricing size (kích thước tính giá) = kích thước nhập − lượng trừ của process.
 * Lượng trừ lấy từ cấu hình `adjust` (mặc định DEFAULT_PROCESS_ADJUST).
 */
export function pricingSize(
  row: Pick<FoamInvoiceRow, 'process' | 'l' | 'w' | 'h'>,
  adjust: ProcessAdjustMap = DEFAULT_PROCESS_ADJUST,
): { pl: number | null; pw: number | null; ph: number | null } {
  const { l, w, h, process } = row
  const a = adjust[process] ?? { dl: 0, dw: 0, dh: 0 }
  return {
    pl: l == null ? null : l - a.dl,
    pw: w == null ? null : w - a.dw,
    ph: h == null ? null : h - a.dh,
  }
}

/** Board feet = pL × pW × pH ÷ 144 × Qty. */
export function bdft(
  row: Pick<FoamInvoiceRow, 'process' | 'l' | 'w' | 'h' | 'qty'>,
  adjust: ProcessAdjustMap = DEFAULT_PROCESS_ADJUST,
): number | null {
  const { pl, pw, ph } = pricingSize(row, adjust)
  if (pl == null || pw == null || ph == null) return null
  const q = row.qty || 0
  return (pl * pw * ph) / 144 * q
}

/** Thành tiền = BDFT × đơn giá. */
export function rowAmount(
  row: Pick<FoamInvoiceRow, 'process' | 'l' | 'w' | 'h' | 'qty'>,
  price: number | null,
  adjust: ProcessAdjustMap = DEFAULT_PROCESS_ADJUST,
): number | null {
  const b = bdft(row, adjust)
  if (b == null || price == null) return null
  return b * price
}
