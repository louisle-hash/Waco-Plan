import { useEffect, useMemo, useState } from 'react'
import { useCloudQuery } from '../lib/useCloudQuery'
import {
  FOAM_PROCESSES,
  FOAM_SIZE_CODES,
  bdft,
  createFoamInvoice,
  deleteFoamInvoice,
  listFoamCustomers,
  listFoamInvoices,
  listFoamPrices,
  listFoamProducts,
  listFoamSizes,
  listInvoiceRows,
  loadProcessAdjust,
  pricingSize,
  replaceInvoiceRows,
  rowAmount,
  saveProcessAdjust,
  updateFoamInvoice,
  DEFAULT_PROCESS_ADJUST,
  type FoamCustomer,
  type FoamInvoice,
  type FoamInvoiceRow,
  type FoamPrice,
  type FoamProduct,
  type FoamProcess,
  type FoamSize,
  type ProcessAdjustMap,
} from '../lib/foamDb'
import { A4_LANDSCAPE, A4_LANDSCAPE_FULL, printWith } from '../lib/printing'
import { FoamTag, blankLabelEntry, type LabelEntry } from '../components/FoamTag'
import { DEFAULT_LOGO } from '../lib/theme'
import { Button, Card, Modal } from '../components/ui'
import ConnectionBanner from '../components/ConnectionBanner'
import { useT } from '../lib/LangContext'

function useInvL() {
  const { lang } = useT()
  const vi = {
    title: 'Lập invoice Foam',
    subtitle: 'Chọn khách, nhập dòng — BDFT / đơn giá / thành tiền tự tính.',
    newInv: 'Invoice mới',
    save: 'Lưu',
    saved: 'Đã lưu',
    del: 'Xoá invoice',
    print: 'In / PDF (A4 ngang)',
    pick: 'Mở invoice đã lưu',
    unsaved: '(chưa lưu)',
    customer: 'Khách hàng (Bill To)',
    invNo: 'Invoice #',
    date: 'Date',
    po: 'Customer PO',
    terms: 'Terms',
    note: 'Ghi chú',
    preparedBy: 'Prepared by',
    loadedBy: 'Loaded by',
    freight: 'Freight ($)',
    addRow: 'Thêm dòng',
    no: 'No.',
    part: 'Customer Part',
    code: 'Foam Code',
    process: 'Process',
    size: 'Size',
    qty: 'Qty',
    dimL: 'L',
    dimW: 'W',
    dimH: 'H',
    price: 'Đơn giá',
    priceSize: 'Pricing L×W×H',
    bdft: 'BDFT',
    amount: 'Amount',
    remark: 'Remark',
    total: 'TOTAL',
    subtotal: 'SUBTOTAL',
    noPrice: 'chưa có giá',
    printRow: 'In tem dòng này',
    confirmDel: 'Xoá invoice này?',
    procSettings: 'Cài đặt Process',
    procTitle: 'Cài đặt kích thước tính giá theo Process',
    procDesc: 'Kích thước tính giá = kích thước nhập − lượng trừ dưới đây (đơn vị inch). VD UNTRIM trừ 1.5 mỗi cạnh L/W và 0.5 chiều cao H.',
    procMinusL: 'Trừ L',
    procMinusW: 'Trừ W',
    procMinusH: 'Trừ H',
    procReset: 'Khôi phục mặc định',
    procSave: 'Lưu cài đặt',
    cancel: 'Huỷ',
    selectCustomer: '— Chọn khách —',
    selectCode: '— Mã —',
    empty: 'Chưa có dòng nào. Bấm "Thêm dòng".',
  }
  const en = {
    title: 'Foam Invoice',
    subtitle: 'Pick a customer, enter rows — BDFT / price / amount auto-computed.',
    newInv: 'New invoice',
    save: 'Save',
    saved: 'Saved',
    del: 'Delete invoice',
    print: 'Print / PDF (A4 landscape)',
    pick: 'Open saved invoice',
    unsaved: '(unsaved)',
    customer: 'Customer (Bill To)',
    invNo: 'Invoice #',
    date: 'Date',
    po: 'Customer PO',
    terms: 'Terms',
    note: 'Note',
    preparedBy: 'Prepared by',
    loadedBy: 'Loaded by',
    freight: 'Freight ($)',
    addRow: 'Add row',
    no: 'No.',
    part: 'Customer Part',
    code: 'Foam Code',
    process: 'Process',
    size: 'Size',
    qty: 'Qty',
    dimL: 'L',
    dimW: 'W',
    dimH: 'H',
    price: 'Unit Price',
    priceSize: 'Pricing L×W×H',
    bdft: 'BDFT',
    amount: 'Amount',
    remark: 'Remark',
    total: 'TOTAL',
    subtotal: 'SUBTOTAL',
    noPrice: 'no price',
    printRow: 'Print label for this row',
    confirmDel: 'Delete this invoice?',
    procSettings: 'Process settings',
    procTitle: 'Pricing size adjustments by Process',
    procDesc: 'Pricing size = entered size − the deductions below (inches). E.g. UNTRIM deducts 1.5 from each L/W edge and 0.5 from height H.',
    procMinusL: 'Minus L',
    procMinusW: 'Minus W',
    procMinusH: 'Minus H',
    procReset: 'Reset to default',
    procSave: 'Save settings',
    cancel: 'Cancel',
    selectCustomer: '— Select customer —',
    selectCode: '— Code —',
    empty: 'No rows yet. Click "Add row".',
  }
  return lang === 'vi' ? vi : en
}

const COMPANY = ['401 PRECISION DRIVE', 'WACO, TX 76710', '(713) 802 0313']

function blankRow(): FoamInvoiceRow {
  return {
    invoiceId: 0,
    sortIndex: 0,
    customerPart: '',
    foamCode: '',
    remark: '',
    process: 'UNTRIM',
    sizeCode: '',
    qty: 1,
    note: '',
    l: null,
    w: null,
    h: null,
  }
}
function emptyHeader(): FoamInvoice {
  return {
    invoiceNo: '',
    customer: '',
    invoiceDate: null,
    customerPo: '',
    terms: '',
    note: '',
    freight: 0,
    preparedBy: '',
    loadedBy: '',
  }
}

const money = (n: number | null) => (n == null ? '' : `$${n.toFixed(2)}`)
const round2 = (n: number | null) => (n == null ? '' : n.toFixed(2))

export default function FoamInvoice() {
  const L = useInvL()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [header, setHeader] = useState<FoamInvoice>(emptyHeader)
  const [rows, setRows] = useState<FoamInvoiceRow[]>([blankRow()])
  const [toast, setToast] = useState('')
  // Tem của 1 dòng để in riêng — in đúng Qty bản (mỗi tấm foam 1 tem), null = in cả invoice
  const [rowLabels, setRowLabels] = useState<LabelEntry[] | null>(null)
  const [procOpen, setProcOpen] = useState(false)

  // Cấu hình lượng trừ pricing theo process (dùng chung, lưu ở bảng settings)
  const { data: adjust, refetch: refetchAdjust } = useCloudQuery(
    () => loadProcessAdjust(),
    ['settings'],
    [],
    DEFAULT_PROCESS_ADJUST,
  )

  const { data: invoices, error, refetch: refetchInvoices } = useCloudQuery(
    () => listFoamInvoices(),
    ['foam_invoices'],
    [],
    [] as FoamInvoice[],
  )
  const { data: customers } = useCloudQuery(() => listFoamCustomers(), ['foam_customers'], [], [] as FoamCustomer[])
  const { data: products } = useCloudQuery(() => listFoamProducts(), ['foam_products'], [], [] as FoamProduct[])
  const { data: prices } = useCloudQuery(() => listFoamPrices(), ['foam_prices'], [], [] as FoamPrice[])
  const { data: sizes } = useCloudQuery(() => listFoamSizes(), ['foam_sizes'], [], [] as FoamSize[])

  // Mã foam duy nhất cho dropdown
  const foamCodes = useMemo(() => {
    const seen = new Set<string>()
    const out: string[] = []
    for (const p of products) if (!seen.has(p.foamCode)) (seen.add(p.foamCode), out.push(p.foamCode))
    return out.sort()
  }, [products])

  // Tra sản phẩm theo mã (để lấy density/hardness khi in tem)
  const byCode = useMemo(() => {
    const m = new Map<string, FoamProduct>()
    for (const p of products) if (!m.has(p.foamCode)) m.set(p.foamCode, p)
    return m
  }, [products])

  // Tra giá: `${customer}|${code}` -> price
  const priceMap = useMemo(() => {
    const m = new Map<string, number | null>()
    for (const p of prices) m.set(`${p.customer}|${p.foamCode}`, p.price)
    return m
  }, [prices])

  // Kích thước mặc định: `${basis}|${code}` -> {w,l}
  const sizeMap = useMemo(() => {
    const m = new Map<string, { w: number | null; l: number | null }>()
    for (const s of sizes) m.set(`${s.sizeBasis}|${s.sizeCode}`, { w: s.width, l: s.length })
    return m
  }, [sizes])

  const priceOf = (code: string) => priceMap.get(`${header.customer}|${code}`) ?? null

  async function loadInvoice(id: number) {
    const inv = invoices.find((i) => i.id === id)
    if (!inv) return
    setSelectedId(id)
    setHeader(inv)
    setRowLabels(null) // đổi invoice -> huỷ tem-dòng đang chờ in (nếu có)
    const r = await listInvoiceRows(id)
    setRows(r.length ? r : [blankRow()])
  }

  function newInvoice() {
    setSelectedId(null)
    setHeader(emptyHeader())
    setRows([blankRow()])
    setRowLabels(null)
  }

  function patchRow(i: number, patch: Partial<FoamInvoiceRow>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }

  // Đổi Size (hoặc Process) -> tự điền L/W theo bảng size chuẩn (H giữ nguyên)
  function applySize(i: number, sizeCode: string, process: FoamProcess) {
    const basis = process === 'UNTRIM' ? 'UNTRIM' : process === 'TRIM-AS' ? 'TRIM-AS' : 'TRIM-CUSTOM'
    const s = sizeMap.get(`${basis}|${sizeCode}`)
    patchRow(i, { sizeCode, process, ...(s ? { l: s.l, w: s.w } : {}) })
  }

  const totals = useMemo(() => {
    let qty = 0
    let tbdft = 0
    let amt = 0
    for (const r of rows) {
      qty += r.qty || 0
      const b = bdft(r, adjust)
      if (b != null) tbdft += b
      const a = rowAmount(r, priceOf(r.foamCode), adjust)
      if (a != null) amt += a
    }
    return { qty, tbdft, amt, subtotal: amt + (header.freight || 0) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, priceMap, header.customer, header.freight, adjust])

  async function save() {
    const clean = rows.filter((r) => r.foamCode || r.qty || r.l || r.w || r.h)
    if (selectedId) {
      await updateFoamInvoice(selectedId, header)
      await replaceInvoiceRows(selectedId, clean)
    } else {
      const id = await createFoamInvoice(header)
      await replaceInvoiceRows(id, clean)
      setSelectedId(id)
    }
    refetchInvoices()
    setToast(L.saved)
    setTimeout(() => setToast(''), 1800)
  }

  async function remove() {
    if (!selectedId || !window.confirm(L.confirmDel)) return
    await deleteFoamInvoice(selectedId)
    refetchInvoices()
    newInvoice()
  }

  /** Dựng dữ liệu tem từ 1 dòng invoice: batch/order = Customer PO, Qty = board-feet NET. */
  function labelFromRow(row: FoamInvoiceRow): LabelEntry {
    const netBft = row.l != null && row.w != null && row.h != null ? Math.round((row.l * row.w * row.h) / 144) : null
    return {
      ...blankLabelEntry(),
      foamCode: row.foamCode,
      l: row.l?.toString() ?? '',
      w: row.w?.toString() ?? '',
      h: row.h?.toString() ?? '',
      batch: header.customerPo,
      qtyBft: netBft == null ? '' : String(netBft),
      orderNo: header.customerPo,
    }
  }

  /**
   * In tem của 1 dòng — mặc định 1 tờ đầy 4 tem (tối thiểu 4 bản), hoặc bằng
   * Qty nếu Qty > 4. Xếp 4 tem/trang A4 ngang giống màn In tem Foam.
   */
  function printRowLabel(row: FoamInvoiceRow) {
    const one = labelFromRow(row)
    const copies = Math.max(4, row.qty || 1)
    setRowLabels(Array.from({ length: copies }, () => one))
    // đợi React render tem vào vùng in rồi mới mở hộp thoại in
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        printWith(A4_LANDSCAPE_FULL)
        const clear = () => {
          setRowLabels(null)
          window.removeEventListener('afterprint', clear)
        }
        window.addEventListener('afterprint', clear)
        window.setTimeout(clear, 4000) // dự phòng cho trình duyệt không bắn afterprint
      }),
    )
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="no-print">
        <ConnectionBanner error={error} />
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold text-primary">{L.title}</h1>
            <p className="text-xs text-ink/60">{L.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedId ?? ''}
              onChange={(e) => (e.target.value ? loadInvoice(Number(e.target.value)) : newInvoice())}
              className="cursor-pointer rounded-lg border border-line px-2 py-1.5 text-sm font-semibold"
            >
              <option value="">{L.pick}</option>
              {invoices.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.customer || '—'} · {i.invoiceNo || i.customerPo || `#${i.id}`}
                </option>
              ))}
            </select>
            <Button variant="ghost" onClick={newInvoice}>
              {L.newInv}
            </Button>
            <Button onClick={save}>{toast || L.save}</Button>
            {selectedId && (
              <Button variant="danger" onClick={remove}>
                {L.del}
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => {
                setRowLabels(null)
                printWith(A4_LANDSCAPE)
              }}
              disabled={!rows.some((r) => r.foamCode)}
            >
              {L.print}
            </Button>
            <Button variant="ghost" onClick={() => setProcOpen(true)} title={L.procSettings}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H1a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 7a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V1a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 17 4.6a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H23a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
              </svg>
              {L.procSettings}
            </Button>
          </div>
        </div>

        {/* Header form */}
        <Card className="mb-3">
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink/80">{L.customer}</span>
              <select
                value={header.customer}
                onChange={(e) => setHeader({ ...header, customer: e.target.value })}
                className="w-full cursor-pointer rounded-lg border border-line px-2 py-1.5 text-sm"
              >
                <option value="">{L.selectCustomer}</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <HeaderField label={L.invNo} value={header.invoiceNo} onChange={(v) => setHeader({ ...header, invoiceNo: v })} />
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink/80">{L.date}</span>
              <input
                type="date"
                value={header.invoiceDate ?? ''}
                onChange={(e) => setHeader({ ...header, invoiceDate: e.target.value || null })}
                className="w-full rounded-lg border border-line px-2 py-1.5 text-sm"
              />
            </label>
            <HeaderField label={L.po} value={header.customerPo} onChange={(v) => setHeader({ ...header, customerPo: v })} />
            <HeaderField label={L.terms} value={header.terms} onChange={(v) => setHeader({ ...header, terms: v })} />
            <HeaderField label={L.preparedBy} value={header.preparedBy} onChange={(v) => setHeader({ ...header, preparedBy: v })} />
            <HeaderField label={L.loadedBy} value={header.loadedBy} onChange={(v) => setHeader({ ...header, loadedBy: v })} />
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink/80">{L.freight}</span>
              <input
                inputMode="decimal"
                value={header.freight || ''}
                onChange={(e) => setHeader({ ...header, freight: Number(e.target.value) || 0 })}
                className="w-full rounded-lg border border-line px-2 py-1.5 text-sm num"
              />
            </label>
            <div className="md:col-span-3 lg:col-span-4">
              <HeaderField label={L.note} value={header.note} onChange={(v) => setHeader({ ...header, note: v })} />
            </div>
          </div>
        </Card>

        {/* Bảng dòng */}
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setRows((rs) => [...rs, blankRow()])}>
              + {L.addRow}
            </Button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[1100px] text-sm">
              <thead className="bg-primary text-white">
                <tr className="[&>th]:px-2 [&>th]:py-2 [&>th]:text-xs [&>th]:font-semibold">
                  <th className="w-8 text-right">{L.no}</th>
                  <th className="text-left">{L.part}</th>
                  <th className="text-left">{L.code}</th>
                  <th className="text-left">{L.process}</th>
                  <th className="text-left">{L.size}</th>
                  <th className="text-right">{L.qty}</th>
                  <th className="text-right">{L.dimL}</th>
                  <th className="text-right">{L.dimW}</th>
                  <th className="text-right">{L.dimH}</th>
                  <th className="text-right">{L.priceSize}</th>
                  <th className="text-right">{L.bdft}</th>
                  <th className="text-right">{L.price}</th>
                  <th className="text-right">{L.amount}</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="py-6 text-center text-sm text-ink/50">
                      {L.empty}
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => {
                    const ps = pricingSize(r, adjust)
                    const b = bdft(r, adjust)
                    const pr = priceOf(r.foamCode)
                    const amt = rowAmount(r, pr, adjust)
                    return (
                      <tr key={i} className="border-b border-line last:border-0 hover:bg-muted/15">
                        <td className="num px-2 py-1 text-ink/50">{i + 1}</td>
                        <td className="px-1 py-1">
                          <CellInput value={r.customerPart} onChange={(v) => patchRow(i, { customerPart: v })} w="w-28" />
                        </td>
                        <td className="px-1 py-1">
                          <select
                            value={r.foamCode}
                            onChange={(e) => patchRow(i, { foamCode: e.target.value })}
                            className="w-32 cursor-pointer rounded border border-line px-1.5 py-1 font-mono text-xs"
                          >
                            <option value="">{L.selectCode}</option>
                            {foamCodes.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-1 py-1">
                          <select
                            value={r.process}
                            onChange={(e) => applySize(i, r.sizeCode, e.target.value as FoamProcess)}
                            className="w-28 cursor-pointer rounded border border-line px-1.5 py-1 text-xs"
                          >
                            {FOAM_PROCESSES.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-1 py-1">
                          <select
                            value={r.sizeCode}
                            onChange={(e) => applySize(i, e.target.value, r.process)}
                            className="w-16 cursor-pointer rounded border border-line px-1.5 py-1 text-xs"
                          >
                            <option value="">—</option>
                            {FOAM_SIZE_CODES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-1 py-1">
                          <NumCell value={r.qty} onChange={(v) => patchRow(i, { qty: v ?? 0 })} />
                        </td>
                        <td className="px-1 py-1">
                          <NumCell value={r.l} onChange={(v) => patchRow(i, { l: v })} />
                        </td>
                        <td className="px-1 py-1">
                          <NumCell value={r.w} onChange={(v) => patchRow(i, { w: v })} />
                        </td>
                        <td className="px-1 py-1">
                          <NumCell value={r.h} onChange={(v) => patchRow(i, { h: v })} />
                        </td>
                        <td className="num px-2 py-1 text-xs text-ink/60">
                          {ps.pl != null ? `${round2(ps.pl)}×${round2(ps.pw)}×${round2(ps.ph)}` : '—'}
                        </td>
                        <td className="num px-2 py-1 font-semibold">{b != null ? b.toFixed(1) : '—'}</td>
                        <td className="num px-2 py-1 text-xs">
                          {pr != null ? pr.toFixed(4) : <span className="text-destructive/70">{L.noPrice}</span>}
                        </td>
                        <td className="num px-2 py-1 font-bold text-primary">{money(amt)}</td>
                        <td className="px-1 py-1">
                          <div className="flex items-center justify-center gap-0.5">
                            <button
                              onClick={() => printRowLabel(r)}
                              disabled={!r.foamCode}
                              title={`${L.printRow} (${Math.max(4, r.qty || 1)})`}
                              aria-label={L.printRow}
                              className="cursor-pointer rounded p-1 text-ink/45 transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M6 14h12v7H6z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))}
                              className="cursor-pointer rounded p-1 text-ink/40 transition-colors hover:bg-destructive/10 hover:text-destructive"
                              aria-label="Xoá dòng"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                                <path d="M18 6 6 18M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
              <tfoot className="border-t-2 border-primary/30 bg-muted/20 font-bold">
                <tr className="[&>td]:px-2 [&>td]:py-2">
                  <td colSpan={5} className="text-right text-primary">
                    {L.total}
                  </td>
                  <td className="num text-right">{totals.qty}</td>
                  <td colSpan={4} />
                  <td className="num text-right">{totals.tbdft.toFixed(1)}</td>
                  <td />
                  <td className="num text-right text-primary">{money(totals.amt)}</td>
                  <td />
                </tr>
                <tr className="[&>td]:px-2 [&>td]:py-1 text-xs">
                  <td colSpan={12} className="text-right text-ink/70">
                    {L.subtotal} (+ Freight {money(header.freight || 0)})
                  </td>
                  <td className="num text-right text-base font-bold text-primary">{money(totals.subtotal)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>

      <ProcessSettingsModal
        open={procOpen}
        current={adjust}
        L={L}
        onClose={() => setProcOpen(false)}
        onSaved={() => {
          setProcOpen(false)
          refetchAdjust()
        }}
      />

      {/* Vùng in cả invoice — A4 ngang. Ẩn khi đang in tem 1 dòng. */}
      <div className={rowLabels ? 'hidden' : 'hidden print:block'}>
        <InvoicePrint header={header} rows={rows} priceOf={priceOf} totals={totals} adjust={adjust} L={L} />
      </div>

      {/* Vùng in tem của 1 dòng — bằng đúng Qty bản, 4 tem/trang A4 ngang */}
      {rowLabels && (
        <div className="hidden print:block">
          {chunk(rowLabels, 4).map((group, gi) => (
            <div key={gi} className="foam-page">
              {group.map((e, i) => (
                <FoamTag key={i} entry={e} product={byCode.get(e.foamCode)} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Chia mảng thành các nhóm n phần tử (mỗi nhóm = 1 trang in). */
function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
  return out
}

/** Modal cài đặt lượng trừ pricing theo từng process (L/W/H). */
function ProcessSettingsModal({
  open,
  current,
  L,
  onClose,
  onSaved,
}: {
  open: boolean
  current: ProcessAdjustMap
  L: ReturnType<typeof useInvL>
  onClose: () => void
  onSaved: () => void
}) {
  const [draft, setDraft] = useState<ProcessAdjustMap>(current)
  const [saving, setSaving] = useState(false)

  // Nạp lại giá trị hiện tại mỗi lần mở modal
  useEffect(() => {
    if (open) setDraft(current)
  }, [open, current])

  const setField = (p: FoamProcess, key: 'dl' | 'dw' | 'dh', v: string) =>
    setDraft((d) => ({ ...d, [p]: { ...d[p], [key]: Number(v) || 0 } }))

  async function save() {
    setSaving(true)
    try {
      await saveProcessAdjust(draft)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} title={L.procTitle} onClose={onClose}>
      <p className="mb-3 text-xs text-ink/65">{L.procDesc}</p>
      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead className="bg-primary text-white">
            <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-xs [&>th]:font-semibold">
              <th className="text-left">{L.process}</th>
              <th className="text-right">{L.procMinusL}</th>
              <th className="text-right">{L.procMinusW}</th>
              <th className="text-right">{L.procMinusH}</th>
            </tr>
          </thead>
          <tbody>
            {FOAM_PROCESSES.map((p) => (
              <tr key={p} className="border-b border-line last:border-0">
                <td className="px-3 py-1.5 font-semibold">{p}</td>
                {(['dl', 'dw', 'dh'] as const).map((k) => (
                  <td key={k} className="px-2 py-1.5 text-right">
                    <input
                      inputMode="decimal"
                      value={draft[p][k]}
                      onChange={(e) => setField(p, k, e.target.value)}
                      className="num w-20 rounded-md border border-line px-2 py-1 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => setDraft(DEFAULT_PROCESS_ADJUST)}>
          {L.procReset}
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>
            {L.cancel}
          </Button>
          <Button onClick={save} disabled={saving}>
            {L.procSave}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function HeaderField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-ink/80">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line px-2 py-1.5 text-sm"
      />
    </label>
  )
}

function CellInput({ value, onChange, w = 'w-24' }: { value: string; onChange: (v: string) => void; w?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${w} rounded border border-line px-1.5 py-1 text-xs`}
    />
  )
}

function NumCell({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  return (
    <input
      inputMode="decimal"
      value={value ?? ''}
      onChange={(e) => {
        const s = e.target.value.trim()
        onChange(s === '' ? null : Number(s))
      }}
      className="num w-16 rounded border border-line px-1.5 py-1 text-xs"
    />
  )
}

/* ---------------- Bản in A4 ngang ---------------- */

const NAVY = 'var(--color-primary)'
const RED = 'var(--color-secondary)'

/** Bề rộng cột dùng chung giữa bảng dữ liệu và bảng TOTAL/SUBTOTAL, để 2 bảng thẳng hàng. */
const INVOICE_COL_WIDTHS = [4, 14, 10, 9, 6, 6, 14, 9, 8, 20]
function InvoiceColgroup() {
  return (
    <colgroup>
      {INVOICE_COL_WIDTHS.map((w, i) => (
        <col key={i} style={{ width: `${w}%` }} />
      ))}
    </colgroup>
  )
}

function InvoicePrint({
  header,
  rows,
  priceOf,
  totals,
  adjust,
  L,
}: {
  header: FoamInvoice
  rows: FoamInvoiceRow[]
  priceOf: (code: string) => number | null
  totals: { qty: number; tbdft: number; amt: number; subtotal: number }
  adjust: ProcessAdjustMap
  L: ReturnType<typeof useInvL>
}) {
  const dataRows = rows.filter((r) => r.foamCode || r.qty)
  const metaRow = (label: string, value: string) => (
    <tr>
      <td className="pr-2 font-semibold" style={{ color: NAVY }}>
        {label}
      </td>
      <td className="font-bold">{value || '—'}</td>
    </tr>
  )
  return (
    <div className="p-4 text-[11px] text-black">
      {/* Đầu invoice: logo + công ty | tiêu đề + thông tin */}
      <div className="mb-3 flex items-start justify-between border-b-4 pb-2" style={{ borderColor: NAVY }}>
        <div className="flex items-center gap-3">
          <img src={DEFAULT_LOGO} alt="American Star" className="h-11 w-auto object-contain" />
          <div className="text-[10px] leading-tight text-black/75">
            {COMPANY.map((c) => (
              <p key={c}>{c}</p>
            ))}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold tracking-tight" style={{ color: NAVY }}>
            INVOICE
          </p>
          <table className="ml-auto text-[11px]">
            <tbody>
              {metaRow(L.invNo, header.invoiceNo)}
              {metaRow(L.date, header.invoiceDate ?? '')}
              {metaRow(L.po, header.customerPo)}
              {metaRow(L.terms, header.terms)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill to */}
      <div className="mb-2 flex items-baseline gap-2">
        <span
          className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
          style={{ background: NAVY }}
        >
          Bill To
        </span>
        <span className="text-sm font-bold">{header.customer || '—'}</span>
      </div>
      {header.note && <p className="mb-2 text-[10px] italic text-black/70">{header.note}</p>}

      <table className="w-full border-collapse text-[10px]" style={{ tableLayout: 'fixed' }}>
        <InvoiceColgroup />
        <thead>
          <tr
            className="[&>th]:border [&>th]:border-white/25 [&>th]:px-1 [&>th]:py-1 text-white"
            style={{ background: NAVY }}
          >
            <th>{L.no}</th>
            <th>{L.part}</th>
            <th>{L.code}</th>
            <th>{L.process}</th>
            <th>{L.size}</th>
            <th>{L.qty}</th>
            <th>{L.priceSize}</th>
            <th>{L.bdft}</th>
            <th>{L.price}</th>
            <th>{L.amount}</th>
          </tr>
        </thead>
        <tbody>
          {dataRows.map((r, i) => {
            const ps = pricingSize(r, adjust)
            const b = bdft(r, adjust)
            const pr = priceOf(r.foamCode)
            const amt = rowAmount(r, pr, adjust)
            return (
              <tr
                key={i}
                className="[&>td]:border [&>td]:border-black/20 [&>td]:px-1 [&>td]:py-0.5"
                style={i % 2 ? { background: 'rgba(4,30,66,0.04)' } : undefined}
              >
                <td className="text-right">{i + 1}</td>
                <td>{r.customerPart}</td>
                <td className="font-mono font-semibold" style={{ color: NAVY }}>
                  {r.foamCode}
                </td>
                <td>{r.process}</td>
                <td className="text-center">{r.sizeCode}</td>
                <td className="text-right">{r.qty}</td>
                <td className="text-right">
                  {ps.pl != null ? `${round2(ps.pl)}×${round2(ps.pw)}×${round2(ps.ph)}` : ''}
                </td>
                <td className="text-right">{b != null ? b.toFixed(1) : ''}</td>
                <td className="text-right">{pr != null ? pr.toFixed(4) : ''}</td>
                <td className="text-right font-semibold">{money(amt)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/*
       * TOTAL/SUBTOTAL để ở bảng RIÊNG, không phải <tfoot> của bảng dữ liệu
       * — trình duyệt tự lặp lại <tfoot> ở MỌI trang khi bảng tràn nhiều
       * trang khi in. Đặt ngoài bảng chính thì nó chỉ trôi tự nhiên tới
       * cuối, xuất hiện đúng 1 lần trên trang cuối cùng. Dùng CHUNG colgroup
       * với bảng dữ liệu ở trên để 2 bảng thẳng cột với nhau.
       */}
      <table className="w-full border-collapse text-[10px] font-bold" style={{ tableLayout: 'fixed' }}>
        <InvoiceColgroup />
        <tbody>
          <tr
            className="[&>td]:border [&>td]:border-white/25 [&>td]:px-1 [&>td]:py-1 text-white"
            style={{ background: NAVY }}
          >
            <td colSpan={5} className="text-right">
              {L.total}
            </td>
            <td className="text-right">{totals.qty}</td>
            <td />
            <td className="text-right">{totals.tbdft.toFixed(1)}</td>
            <td />
            <td className="text-right">{money(totals.amt)}</td>
          </tr>
          <tr className="[&>td]:border [&>td]:border-black/20 [&>td]:px-1 [&>td]:py-1">
            <td colSpan={9} className="text-right font-semibold">
              {L.subtotal} (+ Freight {money(header.freight || 0)})
            </td>
            <td className="text-right text-[13px] font-extrabold" style={{ color: RED }}>
              {money(totals.subtotal)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-6 flex gap-16 text-[11px]">
        <p>
          <span className="font-semibold" style={{ color: NAVY }}>
            Prepared by:
          </span>{' '}
          {header.preparedBy || '—'}
        </p>
        <p>
          <span className="font-semibold" style={{ color: NAVY }}>
            Loaded by:
          </span>{' '}
          {header.loadedBy || '—'}
        </p>
      </div>
    </div>
  )
}
