import { useEffect, useState, type ReactNode } from 'react'
import { HashRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { loadBrand } from './lib/db'
import { applyBrand, DEFAULT_BRAND, DEFAULT_LOGO, type BrandConfig } from './lib/theme'
import { LangProvider, useT } from './lib/LangContext'
import { LANGS, LANG_LABELS, type TKey } from './lib/i18n'
import { getSession, onAuthChange, signOut, SUPABASE_NOT_CONFIGURED } from './lib/supabase'
import Dashboard from './screens/Dashboard'
import ProductData from './screens/ProductData'
import WeeklyPlanning from './screens/WeeklyPlanning'
import LabelPrinting from './screens/LabelPrinting'
import FoamProducts from './screens/FoamProducts'
import FoamInvoice from './screens/FoamInvoice'
import FoamLabels from './screens/FoamLabels'
import Settings from './screens/Settings'
import Guide from './screens/Guide'
import Login from './screens/Login'
import ErrorBoundary from './components/ErrorBoundary'

/** Icon dạng nét, cùng bộ, 20x20 — không dùng emoji. */
const icons: Record<string, ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </>
  ),
  plan: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 10h18M8 2v4M16 2v4M9 15h2M14 15h2" />
    </>
  ),
  products: (
    <>
      <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" />
      <path d="M3 7l9 4 9-4M12 11v10" />
    </>
  ),
  labels: (
    <>
      <path d="M6 9V3h12v6" />
      <rect x="6" y="14" width="12" height="7" rx="1" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H1a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 2.6 7a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H7a1.7 1.7 0 0 0 1-1.5V1a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V7a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </>
  ),
  guide: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M9 7h7M9 11h5" />
    </>
  ),
  foamProducts: (
    <>
      <path d="M3 9l9-5 9 5-9 5-9-5z" />
      <path d="M3 9v6l9 5 9-5V9M12 14v6" />
    </>
  ),
  invoice: (
    <>
      <path d="M6 2h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
      <path d="M14 2v5h5M9 13h6M9 17h6M9 9h2" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" />
    </>
  ),
}

type NavItem = { to: string; key: TKey; icon: string }
type NavGroup = { titleKey: TKey | null; items: NavItem[] }

// Sidebar chia nhóm ngành: Nệm ở trên, Foam dưới, mục dùng chung (Cài đặt,
// Hướng dẫn) không tiêu đề ở cuối.
const NAV_GROUPS: NavGroup[] = [
  {
    titleKey: 'nav.groupMattress',
    items: [
      { to: '/dashboard', key: 'nav.dashboard', icon: 'dashboard' },
      { to: '/plan', key: 'nav.plan', icon: 'plan' },
      { to: '/products', key: 'nav.products', icon: 'products' },
      { to: '/labels', key: 'nav.labels', icon: 'labels' },
    ],
  },
  {
    titleKey: 'nav.groupFoam',
    items: [
      { to: '/foam/products', key: 'nav.foamProducts', icon: 'foamProducts' },
      { to: '/foam/invoice', key: 'nav.foamInvoice', icon: 'invoice' },
      { to: '/foam/labels', key: 'nav.foamLabels', icon: 'labels' },
    ],
  },
  {
    titleKey: null,
    items: [
      { to: '/settings', key: 'nav.settings', icon: 'settings' },
      { to: '/guide', key: 'nav.guide', icon: 'guide' },
    ],
  },
]

const COLLAPSE_KEY = 'waco-menu-collapsed'

export default function App() {
  return (
    <LangProvider>
      <AuthGate />
    </LangProvider>
  )
}

/**
 * Cổng đăng nhập: app trống rỗng cho tới khi có phiên đăng nhập hợp lệ.
 * Vì đây là database dùng chung (không còn IndexedDB riêng máy), bắt buộc
 * đăng nhập trước khi đọc/ghi bất cứ gì — khớp với RLS phía Supabase.
 */
function AuthGate() {
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (SUPABASE_NOT_CONFIGURED) {
      setChecking(false)
      return
    }
    getSession().then((s) => {
      setSession(s)
      setChecking(false)
    })
    return onAuthChange(setSession)
  }, [])

  if (checking) return null // tránh nháy màn hình Login trước khi kiểm tra xong phiên cũ
  if (!session) return <Login />
  return <Shell onLogout={() => signOut()} />
}

function Shell({ onLogout }: { onLogout: () => void }) {
  const { t, lang, setLang } = useT()
  const [brand, setBrand] = useState<BrandConfig>(DEFAULT_BRAND)
  // thu gọn còn dải icon — hữu ích khi bảng kế hoạch cần nhiều bề ngang.
  // Nhớ lựa chọn để lần mở sau không phải bấm lại.
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1')

  useEffect(() => {
    loadBrand().then((b) => {
      setBrand(b)
      applyBrand(b)
    })
  }, [])

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return (
    <HashRouter>
      <div className="app-shell flex h-full">
        <aside
          className={`no-print flex shrink-0 flex-col border-r border-black/20 bg-primary transition-[width] duration-200 ${
            collapsed ? 'w-[60px]' : 'w-[216px]'
          }`}
        >
          {/* Logo */}
          <div className={`border-b border-white/15 p-3 ${collapsed ? 'px-2' : ''}`}>
            <img
              src={brand.logoDataUrl ?? DEFAULT_LOGO}
              alt={brand.brandName}
              className="w-full rounded bg-white/95 object-contain px-1.5 py-1.5"
              style={{ height: collapsed ? 28 : 38 }}
            />
          </div>

          {/* Điều hướng — chia nhóm ngành */}
          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
            {NAV_GROUPS.map((group, gi) => (
              <div key={group.titleKey ?? `group-${gi}`} className={gi > 0 ? 'mt-2' : ''}>
                {/* Tiêu đề nhóm — ẩn khi thu gọn, thay bằng vạch ngăn */}
                {group.titleKey &&
                  (collapsed ? (
                    <div className="mx-auto my-1 h-px w-6 bg-white/15" aria-hidden />
                  ) : (
                    <p className="mb-1 px-2.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
                      {t(group.titleKey)}
                    </p>
                  ))}
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      title={collapsed ? t(item.key) : undefined}
                      className={({ isActive }: { isActive: boolean }) =>
                        `flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-semibold transition-colors duration-200 ${
                          collapsed ? 'justify-center px-0' : ''
                        } ${
                          isActive
                            ? 'bg-white text-primary shadow-soft'
                            : 'text-white/75 hover:bg-white/15 hover:text-white'
                        }`
                      }
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0"
                        aria-hidden
                      >
                        {icons[item.icon]}
                      </svg>
                      {!collapsed && <span className="truncate">{t(item.key)}</span>}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Chọn ngôn ngữ */}
          <div className="border-t border-white/15 p-2">
            {collapsed ? (
              <button
                onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
                title={`${t('nav.language')}: ${LANG_LABELS[lang]}`}
                aria-label={t('nav.language')}
                className="flex w-full cursor-pointer items-center justify-center gap-1 rounded-md py-1.5 text-[11px] font-bold text-white/70 transition-colors hover:bg-white/15 hover:text-white"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  {icons.globe}
                </svg>
                {lang.toUpperCase()}
              </button>
            ) : (
              <>
                <span className="mb-1 flex items-center gap-1.5 px-1 text-[10px] font-semibold uppercase tracking-wide text-white/45">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    {icons.globe}
                  </svg>
                  {t('nav.language')}
                </span>
                <div className="flex gap-1">
                  {LANGS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      aria-pressed={lang === l}
                      className={`flex-1 cursor-pointer rounded px-1.5 py-1 text-xs font-semibold transition-colors ${
                        lang === l
                          ? 'bg-white text-primary'
                          : 'text-white/70 hover:bg-white/15 hover:text-white'
                      }`}
                    >
                      {LANG_LABELS[l]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Đăng xuất */}
          <div className="border-t border-white/15 p-2">
            <button
              onClick={onLogout}
              title={t('nav.logout')}
              aria-label={t('nav.logout')}
              className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white/60 transition-colors hover:bg-white/15 hover:text-white ${
                collapsed ? 'justify-center px-0' : ''
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
                aria-hidden
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              {!collapsed && <span>{t('nav.logout')}</span>}
            </button>
          </div>

          {/* Nút thu gọn */}
          <div className="border-t border-white/15 p-2">
            <button
              onClick={() => setCollapsed((c) => !c)}
              title={collapsed ? t('nav.expandMenu') : t('nav.collapseMenu')}
              aria-label={collapsed ? t('nav.expandMenu') : t('nav.collapseMenu')}
              className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white/60 transition-colors hover:bg-white/15 hover:text-white ${
                collapsed ? 'justify-center px-0' : ''
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`shrink-0 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
                aria-hidden
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              {!collapsed && <span>{t('nav.collapse')}</span>}
            </button>
          </div>
        </aside>

        <main className="app-main flex-1 overflow-auto bg-[#F7F8FA] p-3">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/plan" element={<WeeklyPlanning />} />
              <Route path="/products" element={<ProductData />} />
              <Route path="/labels" element={<LabelPrinting />} />
              <Route path="/foam/products" element={<FoamProducts />} />
              <Route path="/foam/invoice" element={<FoamInvoice />} />
              <Route path="/foam/labels" element={<FoamLabels />} />
              <Route
                path="/settings"
                element={
                  <Settings
                    onBrandChange={(b) => {
                      setBrand(b)
                      applyBrand(b)
                    }}
                  />
                }
              />
              <Route path="/guide" element={<Guide />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </HashRouter>
  )
}
