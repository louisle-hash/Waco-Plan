import * as XLSX from 'xlsx'
import type { Product } from './db'
import type { Lang, TKey } from './i18n'
import { STATUS_KEYS, type StatusKey } from './theme'

/** Các trường của Product mà file Excel có thể ánh xạ vào. */
export const IMPORT_FIELDS = [
  { key: 'sku', labelKey: 'imp.fieldSku', required: true },
  { key: 'name', labelKey: 'imp.fieldName', required: true },
  { key: 'size', labelKey: 'imp.fieldSize', required: false },
  { key: 'category', labelKey: 'imp.fieldCategory', required: false },
  { key: 'defaultPic', labelKey: 'imp.fieldPic', required: false },
  { key: 'defaultStatus', labelKey: 'imp.fieldStatus', required: false },
  { key: 'notes', labelKey: 'imp.fieldNotes', required: false },
] as const satisfies readonly { key: string; labelKey: TKey; required: boolean }[]

export type ImportField = (typeof IMPORT_FIELDS)[number]['key']

/** Cột nào của file Excel gán vào trường nào. '' = bỏ qua cột đó. */
export type ColumnMapping = Record<ImportField, string>

export type SheetData = {
  sheetNames: string[]
  activeSheet: string
  headers: string[]
  rows: Record<string, unknown>[]
}

/** Đọc file .xlsx/.xls/.csv thành bảng thô. */
export async function readWorkbook(file: File, sheetName?: string): Promise<SheetData> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const active = sheetName && wb.SheetNames.includes(sheetName) ? sheetName : wb.SheetNames[0]
  const ws = wb.Sheets[active]
  if (!ws) throw new Error('EMPTY_WORKBOOK')

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '', raw: false })
  const headers = rows.length ? Object.keys(rows[0]) : []
  return { sheetNames: wb.SheetNames, activeSheet: active, headers, rows }
}

/** Đoán sẵn ánh xạ cột dựa trên tên tiêu đề (hỗ trợ cả tiếng Việt lẫn tiếng Anh). */
export function guessMapping(headers: string[]): ColumnMapping {
  const norm = (s: string) => s.toLowerCase().replace(/[\s_-]/g, '')
  const find = (...cands: string[]) =>
    headers.find((h) => cands.some((c) => norm(h).includes(norm(c)))) ?? ''

  return {
    sku: find('sku', 'mã', 'macode', 'code', 'item'),
    name: find('tênsảnphẩm', 'tênsp', 'product', 'name', 'tên'),
    size: find('size', 'kíchthước', 'quycách', 'variant'),
    category: find('category', 'dòngsp', 'dòngsảnphẩm', 'nhóm', 'line'),
    defaultPic: find('pic', 'phụtrách', 'nguoiphutrach'),
    defaultStatus: find('status', 'trạngthái', 'màu', 'color'),
    notes: find('note', 'ghichú', 'remark', 'diễngiải'),
  }
}

/** Chuẩn hoá text trạng thái từ Excel về khoá trạng thái nội bộ. */
function parseStatus(raw: unknown): StatusKey | null {
  if (raw == null) return null
  const v = String(raw).toLowerCase().replace(/[\s_-]/g, '')
  if (!v) return null
  const table: Record<string, StatusKey> = {
    mattressfirm: 'mattressFirm',
    firm: 'mattressFirm',
    green: 'mattressFirm',
    xanhlá: 'mattressFirm',
    quilting: 'quilting',
    yellow: 'quilting',
    vàng: 'quilting',
    priority: 'priority',
    purple: 'priority',
    tím: 'priority',
    uutien: 'priority',
    putcover: 'putCover',
    red: 'putCover',
    đỏ: 'putCover',
  }
  if (table[v]) return table[v]
  const direct = STATUS_KEYS.find((k) => k.toLowerCase() === v)
  return direct ?? null
}

export type ParsedRow = {
  rowNumber: number
  product: Omit<Product, 'id'>
  /** Khoá dịch của lỗi, để hiển thị theo ngôn ngữ đang chọn. */
  errors: TKey[]
  /** Trùng SKU với sản phẩm đã có trong app. */
  duplicateOfExisting: boolean
  /** Trùng SKU với dòng khác trong chính file này. */
  duplicateInFile: boolean
}

/** Áp ánh xạ cột -> danh sách sản phẩm kèm lỗi từng dòng, để xem trước khi nạp. */
export function parseRows(
  rows: Record<string, unknown>[],
  mapping: ColumnMapping,
  existingSkus: Set<string>,
): ParsedRow[] {
  const seenInFile = new Set<string>()
  const now = Date.now()

  return rows.map((raw, i) => {
    const pick = (field: ImportField): string => {
      const col = mapping[field]
      if (!col) return ''
      return String(raw[col] ?? '').trim()
    }

    const sku = pick('sku')
    const name = pick('name')
    const errors: TKey[] = []
    if (!sku) errors.push('imp.fMissingSku')
    if (!name) errors.push('imp.fMissingName')

    const duplicateInFile = !!sku && seenInFile.has(sku.toLowerCase())
    if (sku) seenInFile.add(sku.toLowerCase())
    const duplicateOfExisting = !!sku && existingSkus.has(sku.toLowerCase())

    return {
      rowNumber: i + 2, // +2: bỏ hàng tiêu đề, Excel đếm từ 1
      product: {
        sku,
        name,
        size: pick('size'),
        category: pick('category'),
        defaultStatus: parseStatus(pick('defaultStatus')),
        defaultPic: pick('defaultPic'),
        notes: pick('notes'),
        archived: false,
        createdAt: now,
        updatedAt: now,
      },
      errors,
      duplicateOfExisting,
      duplicateInFile,
    }
  })
}

/**
 * Tải file Excel mẫu để người dùng điền theo đúng cột.
 * Tiêu đề cột theo ngôn ngữ đang chọn — guessMapping() nhận cả hai thứ tiếng
 * nên nạp ngược lại file nào cũng được.
 */
export function downloadTemplate(lang: Lang = 'vi'): void {
  const headers =
    lang === 'en'
      ? ['SKU', 'Product name', 'Size', 'Product line', 'PIC', 'Status', 'Remark']
      : ['SKU', 'Tên sản phẩm', 'Kích thước', 'Dòng sản phẩm', 'PIC', 'Trạng thái', 'Ghi chú']

  const sample =
    lang === 'en'
      ? [
          ['ARIA-M12-QUEEN', 'ARIA MEDIUM 12" m Mattress', 'QUEEN', 'ARIA', 'Nam', 'Quilting', 'Steady seller'],
          ['ARIA-F12-FULL', 'ARIA FIRM 12" m Mattress', 'FULL', 'ARIA', 'Hung', 'Put cover', ''],
        ]
      : [
          ['ARIA-M12-QUEEN', 'ARIA MEDIUM 12" m Mattress', 'QUEEN', 'ARIA', 'Nam', 'Quilting', 'Hàng chạy đều'],
          ['ARIA-F12-FULL', 'ARIA FIRM 12" m Mattress', 'FULL', 'ARIA', 'Hùng', 'Put cover', ''],
        ]

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sample])
  ws['!cols'] = [{ wch: 20 }, { wch: 34 }, { wch: 12 }, { wch: 16 }, { wch: 12 }, { wch: 14 }, { wch: 24 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, lang === 'en' ? 'Products' : 'San pham')
  XLSX.writeFile(wb, lang === 'en' ? 'PRODUCT-IMPORT-TEMPLATE.xlsx' : 'MAU-NHAP-SAN-PHAM.xlsx')
}
