import { useEffect, useState } from 'react'
import { db, loadBrand, setSetting, SETTING_BRAND } from '../lib/db'
import { DEFAULT_BRAND, DEFAULT_LOGO, STATUS_COLORS, STATUS_KEYS, type BrandConfig } from '../lib/theme'
import { Button, Card, Field, Input } from '../components/ui'
import { useT } from '../lib/LangContext'
import type { TKey } from '../lib/i18n'
import {
  inspectLocalData,
  migrateLocalToCloud,
  type LocalDataSummary,
} from '../lib/migrateLocalToCloud'

const COLOR_FIELDS: { key: keyof BrandConfig['colors']; labelKey: TKey; hintKey?: TKey }[] = [
  { key: 'primary', labelKey: 'set.cPrimary', hintKey: 'set.cPrimaryHint' },
  { key: 'onPrimary', labelKey: 'set.cOnPrimary', hintKey: 'set.cOnPrimaryHint' },
  { key: 'secondary', labelKey: 'set.cSecondary', hintKey: 'set.cSecondaryHint' },
  { key: 'accent', labelKey: 'set.cAccent', hintKey: 'set.cAccentHint' },
  { key: 'background', labelKey: 'set.cBackground' },
  { key: 'foreground', labelKey: 'set.cForeground' },
  { key: 'muted', labelKey: 'set.cMuted', hintKey: 'set.cMutedHint' },
  { key: 'border', labelKey: 'set.cBorder' },
  { key: 'destructive', labelKey: 'set.cDestructive', hintKey: 'set.cDestructiveHint' },
]

export default function Settings({ onBrandChange }: { onBrandChange: (b: BrandConfig) => void }) {
  const { t } = useT()
  const [brand, setBrand] = useState<BrandConfig>(DEFAULT_BRAND)
  const [toast, setToast] = useState('')
  const [danger, setDanger] = useState('')
  const [localSummary, setLocalSummary] = useState<LocalDataSummary | null>(null)
  const [migrating, setMigrating] = useState(false)

  useEffect(() => {
    loadBrand().then(setBrand)
    inspectLocalData().then(setLocalSummary)
  }, [])

  function patch(next: Partial<BrandConfig>) {
    const merged = { ...brand, ...next }
    setBrand(merged)
    onBrandChange(merged) // xem trước ngay lập tức
  }

  async function save() {
    await setSetting(SETTING_BRAND, brand)
    onBrandChange(brand)
    flash(t('set.saved'))
  }

  async function resetBrand() {
    setBrand(DEFAULT_BRAND)
    onBrandChange(DEFAULT_BRAND)
    await setSetting(SETTING_BRAND, DEFAULT_BRAND)
    flash(t('set.resetDone'))
  }

  function onLogo(file: File) {
    if (file.size > 1_500_000) return flash(t('set.logoTooBig'))
    const reader = new FileReader()
    reader.onload = () => patch({ logoDataUrl: String(reader.result) })
    reader.readAsDataURL(file)
  }

  function flash(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(''), 3000)
  }

  async function wipeAll() {
    if (danger !== t('set.dangerWord')) return
    await db.delete()
    window.location.reload()
  }

  async function runMigration() {
    if (!localSummary) return
    const ok = window.confirm(
      t('set.migrationConfirm', { products: localSummary.productCount, weeks: localSummary.weekCount }),
    )
    if (!ok) return
    setMigrating(true)
    try {
      const res = await migrateLocalToCloud()
      flash(t('set.migrationDone', { products: res.productsAdded, weeks: res.weeksAdded }))
      inspectLocalData().then(setLocalSummary)
    } finally {
      setMigrating(false)
    }
  }

  return (
    <div className="mx-auto max-w-[900px]">
      <h1 className="mb-1 text-lg font-bold text-primary">{t('set.title')}</h1>
      <p className="mb-3 text-xs text-ink/60">
        {t('set.subtitle')}
      </p>

      {toast && (
        <div className="mb-3 rounded border border-[#22C55E]/40 bg-[#22C55E]/10 px-3 py-2 text-sm font-semibold text-[#166534]">
          {toast}
        </div>
      )}

      <Card className="mb-3">
        <h2 className="mb-2 text-sm font-bold text-primary">{t('set.brand')}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t('set.brandName')}>
            <Input
              value={brand.brandName}
              onChange={(e) => patch({ brandName: e.target.value })}
              className="w-full"
            />
          </Field>
          <Field label={t('set.logo')} hint={t('set.logoHint')}>
            <div className="flex items-center gap-2">
              <img
                src={brand.logoDataUrl ?? DEFAULT_LOGO}
                alt={t('set.logo')}
                className="h-8 w-auto border border-line bg-white px-1"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) onLogo(f)
                }}
                className="cursor-pointer text-xs file:mr-2 file:cursor-pointer file:rounded file:border-0 file:bg-primary file:px-2 file:py-1 file:text-xs file:font-semibold file:text-white"
              />
              {brand.logoDataUrl && (
                <button
                  onClick={() => patch({ logoDataUrl: null })}
                  className="cursor-pointer text-xs font-semibold text-accent underline"
                >
                  {t('set.logoDefault')}
                </button>
              )}
            </div>
          </Field>
        </div>
      </Card>

      <Card className="mb-3">
        <h2 className="mb-2 text-sm font-bold text-primary">{t('set.colors')}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COLOR_FIELDS.map((f) => (
            <Field key={f.key} label={t(f.labelKey)} hint={f.hintKey ? t(f.hintKey) : undefined}>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={brand.colors[f.key]}
                  onChange={(e) => patch({ colors: { ...brand.colors, [f.key]: e.target.value } })}
                  className="h-8 w-10 cursor-pointer rounded border border-line"
                  aria-label={t(f.labelKey)}
                />
                <Input
                  value={brand.colors[f.key]}
                  onChange={(e) => patch({ colors: { ...brand.colors, [f.key]: e.target.value } })}
                  className="w-full font-mono text-xs uppercase"
                />
              </div>
            </Field>
          ))}
        </div>
      </Card>

      <Card className="mb-3">
        <h2 className="mb-2 text-sm font-bold text-primary">{t('set.fonts')}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t('set.fontBody')} hint={t('set.fontBodyHint')}>
            <Input
              value={brand.fonts.body}
              onChange={(e) => patch({ fonts: { ...brand.fonts, body: e.target.value } })}
              className="w-full text-xs"
            />
          </Field>
          <Field label={t('set.fontNum')} hint={t('set.fontNumHint')}>
            <Input
              value={brand.fonts.numeric}
              onChange={(e) => patch({ fonts: { ...brand.fonts, numeric: e.target.value } })}
              className="w-full text-xs"
            />
          </Field>
        </div>
      </Card>

      <Card className="mb-3">
        <h2 className="mb-1 text-sm font-bold text-primary">{t('set.statusColors')}</h2>
        <p className="mb-2 text-xs text-ink/60">
          {t('set.statusNote')}
        </p>
        <div className="flex flex-wrap gap-3">
          {STATUS_KEYS.map((k) => (
            <span key={k} className="flex items-center gap-1.5 text-xs">
              <span
                className="h-5 w-9 border border-black/20"
                style={{ background: STATUS_COLORS[k] }}
                aria-hidden
              />
              <code className="text-ink/70">{STATUS_COLORS[k]}</code>
            </span>
          ))}
        </div>
      </Card>

      <div className="mb-6 flex gap-2">
        <Button onClick={save}>{t('set.saveBtn')}</Button>
        <Button variant="ghost" onClick={resetBrand}>
          {t('set.resetBtn')}
        </Button>
      </div>

      {localSummary?.hasLocalData && (
        <Card className="mb-3 border-[#0EA5E9]/40 bg-[#0EA5E9]/5">
          <h2 className="mb-1 text-sm font-bold text-[#0369A1]">{t('set.migration')}</h2>
          <p className="mb-2 text-xs text-ink/70">{t('set.migrationNote')}</p>
          <p className="mb-2 text-xs font-semibold text-ink/70">
            {localSummary.productCount} {t('product.title').toLowerCase()} · {localSummary.weekCount}{' '}
            {t('common.week').toLowerCase()}
          </p>
          <Button onClick={runMigration} disabled={migrating}>
            {migrating ? t('set.migrationRunning') : t('set.migrationRun')}
          </Button>
        </Card>
      )}

      <Card className="border-destructive/40">
        <h2 className="mb-1 text-sm font-bold text-destructive">{t('set.danger')}</h2>
        <p className="mb-2 text-xs text-ink/70">
          {t('set.dangerNote')}
        </p>
        <div className="flex items-end gap-2">
          <Field label={t('set.dangerConfirm')}>
            <Input value={danger} onChange={(e) => setDanger(e.target.value)} className="w-48" />
          </Field>
          <Button variant="danger" onClick={wipeAll} disabled={danger !== t('set.dangerWord')}>
            {t('set.dangerBtn')}
          </Button>
        </div>
      </Card>
    </div>
  )
}
