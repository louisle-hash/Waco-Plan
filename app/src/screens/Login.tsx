import { useState, type FormEvent } from 'react'
import { signInShared, SUPABASE_NOT_CONFIGURED } from '../lib/supabase'
import { DEFAULT_LOGO } from '../lib/theme'
import { useT } from '../lib/LangContext'
import { Button, Input } from '../components/ui'

export default function Login() {
  const { t } = useT()
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (SUPABASE_NOT_CONFIGURED) return
    setBusy(true)
    setError('')
    const { error: err } = await signInShared(password)
    setBusy(false)
    if (err) {
      // Supabase trả thông báo tiếng Anh kỹ thuật -> quy về 2 tình huống người dùng hiểu được
      setError(
        /network|fetch/i.test(err) ? t('login.networkError') : t('login.wrongPassword'),
      )
    }
    // đăng nhập thành công -> onAuthChange trong App.tsx tự chuyển màn hình
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-[#F7F8FA] p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-xl border border-line bg-white p-6 shadow-sm"
      >
        <img src={DEFAULT_LOGO} alt="" className="mx-auto mb-4 h-9 w-auto" />
        <h1 className="mb-1 text-center text-lg font-bold text-primary">{t('login.title')}</h1>
        <p className="mb-4 text-center text-xs text-ink/60">{t('login.subtitle')}</p>

        {SUPABASE_NOT_CONFIGURED ? (
          <p className="rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {t('login.notConfigured')}
          </p>
        ) : (
          <>
            <label className="mb-1 block text-xs font-semibold text-ink/80">
              {t('login.password')}
            </label>
            <Input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-3 w-full"
            />
            {error && <p className="mb-3 text-sm font-semibold text-destructive">{error}</p>}
            <Button type="submit" disabled={busy || !password} className="w-full justify-center">
              {busy ? t('login.submitting') : t('login.submit')}
            </Button>
          </>
        )}
      </form>
    </div>
  )
}
