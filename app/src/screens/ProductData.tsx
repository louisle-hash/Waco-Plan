import { useMemo, useState } from 'react'
import { useCloudQuery } from '../lib/useCloudQuery'
import { db, type Product } from '../lib/db'
import { STATUS_COLORS, STATUS_KEYS, DEFAULT_STATUS_LABELS, type StatusKey } from '../lib/theme'
import { Button, Card, EmptyState, Field, Input, Modal } from '../components/ui'
import ExcelImportModal from '../components/ExcelImportModal'
import ConnectionBanner from '../components/ConnectionBanner'
import { useT } from '../lib/LangContext'

type FormState = {
  sku: string
  name: string
  size: string
  category: string
  defaultStatus: StatusKey | ''
  defaultPic: string
  notes: string
}

const EMPTY_FORM: FormState = {
  sku: '',
  name: '',
  size: '',
  category: '',
  defaultStatus: '',
  defaultPic: '',
  notes: '',
}

export default function ProductData() {
  const { t } = useT()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [importOpen, setImportOpen] = useState(false)
  const [toast, setToast] = useState('')

  const { data: products, error: productsError } = useCloudQuery(
    () => db.products.toArray(),
    ['products'],
    [],
    [] as Product[],
  )

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products],
  )

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products
      .filter((p) => (showArchived ? true : !p.archived))
      .filter((p) => (categoryFilter ? p.category === categoryFilter : true))
      .filter((p) =>
        q ? `${p.sku} ${p.name} ${p.size} ${p.category}`.toLowerCase().includes(q) : true,
      )
      .sort((a, b) => a.name.localeCompare(b.name) || a.size.localeCompare(b.size))
  }, [products, search, categoryFilter, showArchived])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setFormOpen(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({
      sku: p.sku,
      name: p.name,
      size: p.size,
      category: p.category,
      defaultStatus: p.defaultStatus ?? '',
      defaultPic: p.defaultPic,
      notes: p.notes,
    })
    setFormError('')
    setFormOpen(true)
  }

  async function save() {
    const sku = form.sku.trim()
    const name = form.name.trim()
    if (!sku) return setFormError(t('product.errSku'))
    if (!name) return setFormError(t('product.errName'))

    const clash = await db.products.where('sku').equals(sku).first()
    if (clash && clash.id !== editing?.id) {
      return setFormError(t('product.errDup', { sku }))
    }

    const payload = {
      sku,
      name,
      size: form.size.trim(),
      category: form.category.trim(),
      defaultStatus: form.defaultStatus === '' ? null : form.defaultStatus,
      defaultPic: form.defaultPic.trim(),
      notes: form.notes.trim(),
      updatedAt: Date.now(),
    }

    if (editing?.id) {
      await db.products.update(editing.id, payload)
      flash(t('product.savedEdit'))
    } else {
      await db.products.add({ ...payload, archived: false, createdAt: Date.now() } as Product)
      flash(t('product.savedNew'))
    }
    setFormOpen(false)
  }

  async function toggleArchive(p: Product) {
    if (!p.id) return
    await db.products.update(p.id, { archived: !p.archived, updatedAt: Date.now() })
    flash(p.archived ? t('product.restoredMsg') : t('product.archivedMsg'))
  }

  function flash(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2600)
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <ConnectionBanner error={productsError} />
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold text-primary">{t('product.title')}</h1>
          <p className="text-xs text-ink/60">
            {t('product.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setImportOpen(true)}>
            {t('product.import')}
          </Button>
          <Button onClick={openCreate}>{t('product.add')}</Button>
        </div>
      </div>

      {toast && (
        <div className="mb-3 rounded border border-[#22C55E]/40 bg-[#22C55E]/10 px-3 py-2 text-sm font-semibold text-[#166534]">
          {toast}
        </div>
      )}

      <Card className="mb-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <Field label={t('common.search')}>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('product.searchPlaceholder')}
                className="w-full"
              />
            </Field>
          </div>
          <Field label={t('product.line')}>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="cursor-pointer rounded-md border border-line px-2 py-1.5 text-sm"
            >
              <option value="">{t('common.all')}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <label className="mb-1.5 flex cursor-pointer items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="cursor-pointer"
            />
            {t('product.showArchived')}
          </label>
          <span className="mb-1.5 text-sm text-ink/60">
            {t('product.count', {
              shown: visible.length,
              total: products.filter((p) => !p.archived).length,
            })}
          </span>
        </div>
      </Card>

      {visible.length === 0 ? (
        <EmptyState
          title={t('product.empty')}
          hint={t('product.emptyHint')}
        />
      ) : (
        <div className="overflow-auto rounded-lg border border-line bg-white">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-primary text-white">
              <tr>
                <Th>{t('product.colSku')}</Th>
                <Th>{t('product.colName')}</Th>
                <Th>{t('product.colSize')}</Th>
                <Th>{t('product.colLine')}</Th>
                <Th>{t('product.colStatus')}</Th>
                <Th>{t('product.colPic')}</Th>
                <Th>{t('product.colNote')}</Th>
                <Th className="text-right">{t('product.colActions')}</Th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr
                  key={p.id}
                  className={`border-t border-line transition-colors hover:bg-muted/25 ${p.archived ? 'opacity-50' : ''}`}
                >
                  <td className="px-2 py-1.5 font-mono text-xs">{p.sku}</td>
                  <td className="px-2 py-1.5 font-semibold">
                    {p.name}
                    {p.archived && (
                      <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-normal">
                        {t('product.archived')}
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-1.5">{p.size || '—'}</td>
                  <td className="px-2 py-1.5">{p.category || '—'}</td>
                  <td className="px-2 py-1.5">
                    {p.defaultStatus ? <StatusPill status={p.defaultStatus} /> : '—'}
                  </td>
                  <td className="px-2 py-1.5">{p.defaultPic || '—'}</td>
                  <td className="max-w-[220px] truncate px-2 py-1.5 text-ink/70">{p.notes || '—'}</td>
                  <td className="whitespace-nowrap px-2 py-1.5 text-right">
                    <button
                      onClick={() => openEdit(p)}
                      className="cursor-pointer rounded px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => toggleArchive(p)}
                      className="cursor-pointer rounded px-2 py-1 text-xs font-semibold text-ink/70 transition-colors hover:bg-muted/50"
                    >
                      {p.archived ? t('product.restore') : t('product.archive')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form thêm/sửa */}
      <Modal
        open={formOpen}
        title={editing ? t('product.formEdit') : t('product.formAdd')}
        onClose={() => setFormOpen(false)}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('product.fSku')} hint={t('product.fSkuHint')}>
            <Input
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="w-full font-mono"
            />
          </Field>
          <Field label={t('product.fSize')}>
            <Input
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              placeholder="TWIN / FULL / QUEEN / KING"
              className="w-full"
            />
          </Field>
          <div className="col-span-2">
            <Field label={t('product.fName')}>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full"
              />
            </Field>
          </div>
          <Field label={t('product.line')}>
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="ARIA, PHANTOM…"
              className="w-full"
            />
          </Field>
          <Field label={t('product.fPic')}>
            <Input
              value={form.defaultPic}
              onChange={(e) => setForm({ ...form, defaultPic: e.target.value })}
              className="w-full"
            />
          </Field>
          <div className="col-span-2">
            <Field label={t('product.fStatus')}>
              <select
                value={form.defaultStatus}
                onChange={(e) =>
                  setForm({ ...form, defaultStatus: e.target.value as StatusKey | '' })
                }
                className="w-full cursor-pointer rounded-md border border-line px-2 py-1.5 text-sm"
              >
                <option value="">{t('common.none')}</option>
                {STATUS_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {DEFAULT_STATUS_LABELS[k]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="col-span-2">
            <Field label={t('product.fNote')}>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full rounded-md border border-line px-2 py-1.5 text-sm outline-none focus:border-primary"
              />
            </Field>
          </div>
        </div>

        {formError && <p className="mt-3 text-sm font-semibold text-destructive">{formError}</p>}

        <div className="mt-4 flex justify-end gap-2 border-t border-line pt-3">
          <Button variant="ghost" onClick={() => setFormOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={save}>{t('common.save')}</Button>
        </div>
      </Modal>

      <ExcelImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={(n) => flash(t('imp.done', { n }))}
      />
    </div>
  )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-2 py-1.5 text-left text-xs font-semibold ${className}`}>{children}</th>
}

export function StatusPill({ status }: { status: StatusKey }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span
        className="inline-block h-3 w-3 rounded-sm border border-black/15"
        style={{ background: STATUS_COLORS[status] }}
        aria-hidden
      />
      {DEFAULT_STATUS_LABELS[status]}
    </span>
  )
}
