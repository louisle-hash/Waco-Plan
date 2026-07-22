import { useT } from '../lib/LangContext'

/** Hiện khi một truy vấn Supabase lỗi (thường là mất mạng) — thay cho im lặng thất bại. */
export default function ConnectionBanner({ error }: { error: string | null }) {
  const { t } = useT()
  if (!error) return null
  return (
    <div className="no-print mb-3 rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
      {t('common.connectionError')}
    </div>
  )
}
