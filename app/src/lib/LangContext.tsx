import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  DATE_LOCALE,
  loadLang,
  saveLang,
  translate,
  type Lang,
  type TKey,
} from './i18n'

type Ctx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TKey, vars?: Record<string, string | number>) => string
  /** Định dạng ngày theo ngôn ngữ đang chọn. */
  fmtDate: (d: Date | number, opts?: Intl.DateTimeFormatOptions) => string
}

const LangContext = createContext<Ctx | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => loadLang())

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    saveLang(l)
    document.documentElement.lang = l
  }, [])

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t: (key, vars) => translate(lang, key, vars),
      fmtDate: (d, opts) => new Date(d).toLocaleDateString(DATE_LOCALE[lang], opts),
    }),
    [lang, setLang],
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useT(): Ctx {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useT phải nằm trong <LangProvider>')
  return ctx
}
