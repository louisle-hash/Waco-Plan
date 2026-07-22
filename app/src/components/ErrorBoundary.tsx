import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useT } from '../lib/LangContext'

/**
 * Chặn mọi lỗi không lường trước để người dùng không gặp màn hình trắng.
 * Quan trọng với app dùng ở xưởng: phải nói rõ nên làm gì, và trấn an là dữ liệu còn nguyên.
 *
 * Bắt lỗi phải dùng class component (React chưa có hook tương đương),
 * nên phần hiển thị tách ra hàm riêng để dùng được useT().
 */
export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Lỗi ứng dụng:', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    return <ErrorScreen error={error} onDismiss={() => this.setState({ error: null })} />
  }
}

function ErrorScreen({ error, onDismiss }: { error: Error; onDismiss: () => void }) {
  const { t } = useT()

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-lg border border-line bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-lg font-bold text-destructive">{t('err.title')}</h1>

        <p className="mb-3 text-sm">{t('err.intro')}</p>

        <p className="mb-2 text-sm font-semibold">{t('err.steps')}</p>
        <ol className="mb-4 ml-5 list-decimal space-y-1 text-sm">
          <li>{t('err.step1')}</li>
          <li>{t('err.step2')}</li>
          <li>{t('err.step3')}</li>
        </ol>

        <div className="mb-4 max-h-32 overflow-auto rounded border border-line bg-muted/25 p-2">
          <code className="font-mono text-xs text-destructive">{error.message || String(error)}</code>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            {t('err.reload')}
          </button>
          <button
            onClick={() => {
              window.location.hash = '#/dashboard'
              onDismiss()
            }}
            className="cursor-pointer rounded-md border border-line px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-muted/40"
          >
            {t('err.goHome')}
          </button>
        </div>
      </div>
    </div>
  )
}
