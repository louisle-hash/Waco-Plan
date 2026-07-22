import { useMemo, useState } from 'react'
import { useCloudQuery } from '../lib/useCloudQuery'
import {
  addFoamProduct,
  deleteFoamProduct,
  listFoamProducts,
  updateFoamProduct,
  type FoamProduct,
} from '../lib/foamDb'
import { Button, Card, EmptyState, Field, Input, Modal } from '../components/ui'
import ConnectionBanner from '../components/ConnectionBanner'
import { useT } from '../lib/LangContext'

/** Nhãn song ngữ cục bộ cho nhóm Foam (khỏi phình i18n chính). */
function useFoamL() {
  const { lang } = useT()
  const vi = {
    title: 'Mã sản phẩm Foam',
    subtitle: 'Danh mục mã foam: mã ASW, mã HV/DH, tỷ trọng, độ cứng.',
    add: 'Thêm mã',
    search: 'Tìm theo mã ASW / mã HV...',
    code: 'Foam code (ASW)',
    dh: 'Foam DH (HV)',
    denLb: 'Density (lb/ft³)',
    denKg: 'kg/m³',
    hardness: 'Hardness (IFD)',
    color: 'Màu',
    thick: 'Độ dày gốc (in)',
    desc: 'Mô tả',
    customer: 'Khách thường đặt',
    remark: 'Ghi chú',
    actions: '',
    edit: 'Sửa',
    del: 'Xoá',
    empty: 'Chưa có mã foam nào',
    emptyHint: 'Bấm "Thêm mã" hoặc chạy foam-schema.sql để nạp sẵn dữ liệu.',
    newTitle: 'Thêm mã foam',
    editTitle: 'Sửa mã foam',
    save: 'Lưu',
    cancel: 'Huỷ',
    needCode: 'Bắt buộc nhập Foam code.',
    confirmDel: 'Xoá mã foam này?',
    count: (n: number, total: number) => `${n}/${total} mã`,
  }
  const en = {
    title: 'Foam Products',
    subtitle: 'Foam code catalog: ASW code, HV/DH code, density, hardness.',
    add: 'Add code',
    search: 'Search by ASW / HV code...',
    code: 'Foam code (ASW)',
    dh: 'Foam DH (HV)',
    denLb: 'Density (lb/ft³)',
    denKg: 'kg/m³',
    hardness: 'Hardness (IFD)',
    color: 'Color',
    thick: 'Base thick (in)',
    desc: 'Description',
    customer: 'Usual customer',
    remark: 'Remark',
    actions: '',
    edit: 'Edit',
    del: 'Delete',
    empty: 'No foam code yet',
    emptyHint: 'Click "Add code" or run foam-schema.sql to seed data.',
    newTitle: 'Add foam code',
    editTitle: 'Edit foam code',
    save: 'Save',
    cancel: 'Cancel',
    needCode: 'Foam code is required.',
    confirmDel: 'Delete this foam code?',
    count: (n: number, total: number) => `${n}/${total} codes`,
  }
  return lang === 'vi' ? vi : en
}

type FormState = {
  foamCode: string
  foamDh: string
  densityLb: string
  densityKg: string
  hardness: string
  color: string
  baseThick: string
  description: string
  customerUsual: string
  remark: string
}

const EMPTY: FormState = {
  foamCode: '',
  foamDh: '',
  densityLb: '',
  densityKg: '',
  hardness: '',
  color: '',
  baseThick: '',
  description: '',
  customerUsual: '',
  remark: '',
}

function toForm(p: FoamProduct): FormState {
  return {
    foamCode: p.foamCode,
    foamDh: p.foamDh,
    densityLb: p.densityLb?.toString() ?? '',
    densityKg: p.densityKg?.toString() ?? '',
    hardness: p.hardness?.toString() ?? '',
    color: p.color,
    baseThick: p.baseThick?.toString() ?? '',
    description: p.description,
    customerUsual: p.customerUsual,
    remark: p.remark,
  }
}
const nOrNull = (s: string) => (s.trim() === '' ? null : Number(s))

export default function FoamProducts() {
  const L = useFoamL()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<FoamProduct | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState('')

  const { data: products, error, refetch } = useCloudQuery(
    () => listFoamProducts(),
    ['foam_products'],
    [],
    [] as FoamProduct[],
  )

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) =>
      `${p.foamCode} ${p.foamDh} ${p.description} ${p.color}`.toLowerCase().includes(q),
    )
  }, [products, search])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY)
    setFormError('')
    setFormOpen(true)
  }
  function openEdit(p: FoamProduct) {
    setEditing(p)
    setForm(toForm(p))
    setFormError('')
    setFormOpen(true)
  }

  async function save() {
    if (!form.foamCode.trim()) {
      setFormError(L.needCode)
      return
    }
    const payload = {
      foamCode: form.foamCode.trim(),
      foamDh: form.foamDh.trim(),
      densityLb: nOrNull(form.densityLb),
      densityKg: nOrNull(form.densityKg),
      hardness: nOrNull(form.hardness),
      color: form.color.trim(),
      baseThick: nOrNull(form.baseThick),
      description: form.description.trim(),
      customerUsual: form.customerUsual.trim(),
      remark: form.remark.trim(),
      archived: false,
    }
    if (editing?.id) await updateFoamProduct(editing.id, payload)
    else await addFoamProduct(payload)
    setFormOpen(false)
    refetch()
  }

  async function remove(p: FoamProduct) {
    if (!p.id || !window.confirm(L.confirmDel)) return
    await deleteFoamProduct(p.id)
    refetch()
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <ConnectionBanner error={error} />
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold text-primary">{L.title}</h1>
          <p className="text-xs text-ink/60">{L.subtitle}</p>
        </div>
        <Button onClick={openCreate}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          {L.add}
        </Button>
      </div>

      <Card>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={L.search}
            className="w-full sm:w-80"
          />
          <span className="text-xs font-semibold text-ink/55">{L.count(visible.length, products.length)}</span>
        </div>

        {visible.length === 0 ? (
          <EmptyState title={L.empty} hint={L.emptyHint} />
        ) : (
          <div className="max-h-[calc(100vh-220px)] overflow-auto rounded-lg border border-line">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-primary text-white">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-semibold">{L.code}</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold">{L.dh}</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold">{L.denLb}</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold">{L.denKg}</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold">{L.hardness}</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold">{L.color}</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold">{L.desc}</th>
                  <th className="w-20 px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {visible.map((p) => (
                  <tr key={p.id} className="border-b border-line transition-colors last:border-0 hover:bg-muted/20">
                    <td className="px-2 py-1.5 font-mono font-bold text-primary">{p.foamCode}</td>
                    <td className="px-2 py-1.5 font-mono text-xs text-ink/70">{p.foamDh || '—'}</td>
                    <td className="num px-2 py-1.5 font-semibold">{p.densityLb ?? '—'}</td>
                    <td className="num px-2 py-1.5 text-ink/60">{p.densityKg ?? '—'}</td>
                    <td className="num px-2 py-1.5 font-semibold">{p.hardness ?? '—'}</td>
                    <td className="px-2 py-1.5">{p.color || '—'}</td>
                    <td className="px-2 py-1.5 text-xs text-ink/70">
                      <span className="block max-w-[240px] truncate" title={p.description}>
                        {p.description || '—'}
                      </span>
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          title={L.edit}
                          aria-label={L.edit}
                          className="cursor-pointer rounded p-1 text-ink/60 transition-colors hover:bg-muted/50 hover:text-primary"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => remove(p)}
                          title={L.del}
                          aria-label={L.del}
                          className="cursor-pointer rounded p-1 text-ink/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={formOpen} title={editing ? L.editTitle : L.newTitle} onClose={() => setFormOpen(false)}>
        <div className="grid grid-cols-2 gap-3">
          <Field label={L.code}>
            <Input value={form.foamCode} onChange={(e) => setForm({ ...form, foamCode: e.target.value })} className="w-full font-mono" />
          </Field>
          <Field label={L.dh}>
            <Input value={form.foamDh} onChange={(e) => setForm({ ...form, foamDh: e.target.value })} className="w-full font-mono" />
          </Field>
          <Field label={L.denLb}>
            <Input value={form.densityLb} onChange={(e) => setForm({ ...form, densityLb: e.target.value })} className="w-full" inputMode="decimal" />
          </Field>
          <Field label={L.denKg}>
            <Input value={form.densityKg} onChange={(e) => setForm({ ...form, densityKg: e.target.value })} className="w-full" inputMode="decimal" />
          </Field>
          <Field label={L.hardness}>
            <Input value={form.hardness} onChange={(e) => setForm({ ...form, hardness: e.target.value })} className="w-full" inputMode="numeric" />
          </Field>
          <Field label={L.color}>
            <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full" />
          </Field>
          <Field label={L.thick}>
            <Input value={form.baseThick} onChange={(e) => setForm({ ...form, baseThick: e.target.value })} className="w-full" inputMode="decimal" />
          </Field>
          <Field label={L.customer}>
            <Input value={form.customerUsual} onChange={(e) => setForm({ ...form, customerUsual: e.target.value })} className="w-full" />
          </Field>
          <div className="col-span-2">
            <Field label={L.desc}>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full" />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label={L.remark}>
              <Input value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} className="w-full" />
            </Field>
          </div>
        </div>
        {formError && <p className="mt-2 text-sm text-destructive">{formError}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setFormOpen(false)}>
            {L.cancel}
          </Button>
          <Button onClick={save}>{L.save}</Button>
        </div>
      </Modal>
    </div>
  )
}
