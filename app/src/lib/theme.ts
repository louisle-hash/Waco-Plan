/**
 * Nguồn màu/thương hiệu duy nhất của app.
 *
 * Giá trị mặc định dưới đây phản chiếu BRAND-CONFIG.md ở thư mục gốc dự án.
 * Người dùng sửa qua màn hình Cài đặt -> lưu vào IndexedDB -> ghi đè lên đây lúc chạy.
 * KHÔNG hardcode màu thương hiệu ở bất kỳ file nào khác.
 */

// Import dạng module -> Vite nhúng thành data URI khi build,
// nhờ vậy bản 1 file HTML mở bằng file:// vẫn thấy logo.
import defaultLogo from '../assets/logo.png'

/** Logo mặc định dùng khi người dùng chưa tải logo riêng lên. */
export const DEFAULT_LOGO = defaultLogo

export type BrandConfig = {
  brandName: string
  logoDataUrl: string | null // null = dùng /brand/logo.png mặc định
  colors: {
    primary: string
    onPrimary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    muted: string
    border: string
    destructive: string
  }
  fonts: {
    body: string
    numeric: string
  }
}

/** Khớp BRAND-CONFIG.md mục 3 + 4 (lấy từ pixel của AS_logo.png). */
export const DEFAULT_BRAND: BrandConfig = {
  brandName: 'American Star',
  logoDataUrl: null,
  colors: {
    primary: '#041E42',
    onPrimary: '#FFFFFF',
    secondary: '#BF0C3E',
    accent: '#BF0C3E',
    background: '#FFFFFF',
    foreground: '#041E42',
    muted: '#D9D9D6',
    border: '#D9D9D6',
    destructive: '#DC2626',
  },
  fonts: {
    // Font hệ thống San Francisco (Apple). Không tải web-font ngoài -> bản 1
    // file HTML mở offline vẫn đúng chữ; máy Apple hiển thị SF Pro, máy khác
    // rơi về font hệ thống tương đương.
    body: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", "Segoe UI", Roboto, Arial, sans-serif',
    numeric: 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace',
  },
}

/**
 * Màu trạng thái nghiệp vụ — BRAND-CONFIG.md mục 5.
 * CỐ ĐỊNH: đổi màu thương hiệu không được làm đổi 4 màu này.
 * Chỉ NHÃN (label) là sửa được, lưu trong bảng settings.
 */
export const STATUS_KEYS = ['mattressFirm', 'quilting', 'priority', 'putCover'] as const
export type StatusKey = (typeof STATUS_KEYS)[number]

export const STATUS_COLORS: Record<StatusKey, string> = {
  mattressFirm: '#22C55E',
  quilting: '#FACC15',
  priority: '#C084FC',
  putCover: '#EF4444',
}

export const DEFAULT_STATUS_LABELS: Record<StatusKey, string> = {
  mattressFirm: 'Mattress Firm',
  quilting: 'Quilting',
  priority: 'Priority',
  putCover: 'Put cover',
}

/** Các trạng thái cần chú ý trên Dashboard. */
export const ATTENTION_STATUSES: StatusKey[] = ['priority', 'putCover']

/**
 * Chọn màu chữ (đen/trắng) tương phản đủ trên nền màu bất kỳ.
 * Dùng cho ô có nền màu trạng thái — bảo đảm chữ luôn đọc được (WCAG).
 */
export function readableTextOn(hex: string): string {
  const h = hex.replace('#', '')
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h
  const r = parseInt(full.slice(0, 2), 16) / 255
  const g = parseInt(full.slice(2, 4), 16) / 255
  const b = parseInt(full.slice(4, 6), 16) / 255
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
  // Tương phản với trắng vs với đen — chọn bên cao hơn
  const contrastWhite = 1.05 / (L + 0.05)
  const contrastBlack = (L + 0.05) / 0.05
  return contrastWhite >= contrastBlack ? '#FFFFFF' : '#111111'
}

/** Áp brand config lên CSS variables ở :root. Tailwind đọc qua các biến này. */
export function applyBrand(brand: BrandConfig): void {
  const r = document.documentElement.style
  r.setProperty('--color-primary', brand.colors.primary)
  r.setProperty('--color-on-primary', brand.colors.onPrimary)
  r.setProperty('--color-secondary', brand.colors.secondary)
  r.setProperty('--color-accent', brand.colors.accent)
  r.setProperty('--color-background', brand.colors.background)
  r.setProperty('--color-foreground', brand.colors.foreground)
  r.setProperty('--color-muted', brand.colors.muted)
  r.setProperty('--color-border', brand.colors.border)
  r.setProperty('--color-destructive', brand.colors.destructive)
  r.setProperty('--font-body', brand.fonts.body)
  r.setProperty('--font-numeric', brand.fonts.numeric)

  // Màu trạng thái là hằng số nghiệp vụ, vẫn expose để CSS dùng được
  r.setProperty('--status-mattress-firm', STATUS_COLORS.mattressFirm)
  r.setProperty('--status-quilting', STATUS_COLORS.quilting)
  r.setProperty('--status-priority', STATUS_COLORS.priority)
  r.setProperty('--status-put-cover', STATUS_COLORS.putCover)
}
