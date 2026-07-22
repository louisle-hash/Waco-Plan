import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from 'react'

/** Các mảnh UI dùng chung. Màu lấy qua token Tailwind -> CSS var -> BRAND-CONFIG. */

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
}) {
  const base =
    'inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none'
  const styles: Record<string, string> = {
    primary: 'bg-primary text-on-primary shadow-soft hover:shadow-soft-md hover:brightness-110',
    secondary: 'border border-accent text-accent hover:bg-accent hover:text-white hover:shadow-soft',
    ghost: 'border border-line text-ink hover:bg-muted/40 hover:border-ink/25',
    danger: 'bg-destructive text-white shadow-soft hover:shadow-soft-md hover:brightness-110',
  }
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
}

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm text-ink outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 ${className}`}
      {...rest}
    />
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-line/70 bg-white p-3.5 shadow-soft ${className}`}>{children}</div>
  )
}

export function Modal({
  open,
  title,
  onClose,
  children,
  wide = false,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`max-h-[90vh] w-full ${wide ? 'max-w-4xl' : 'max-w-lg'} overflow-auto rounded-2xl border border-line/60 bg-white p-5 shadow-soft-lg animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-primary">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="cursor-pointer rounded p-1 text-ink/60 transition-colors hover:bg-muted/50 hover:text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-ink/80">{label}</span>
      {children}
      {hint && <span className="mt-0.5 block text-xs text-ink/50">{hint}</span>}
    </label>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line bg-muted/10 py-10 text-center">
      <p className="text-sm font-semibold text-ink/70">{title}</p>
      {hint && <p className="text-xs text-ink/50">{hint}</p>}
    </div>
  )
}
