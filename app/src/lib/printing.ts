/**
 * Khổ giấy phải đặt qua @page, mà @page thì không đổi được bằng class CSS.
 * Mỗi màn hình có khổ riêng (tem 4x2in nằm ngang, kế hoạch A4 ngang) nên ta
 * chèn rule ngay trước khi in rồi gỡ đi sau khi in xong.
 */

const STYLE_ID = 'waco-page-size'

export type PageSetup = {
  /** Giá trị cho thuộc tính size của @page, VD: 'A4 landscape' hoặc '4in 6in' */
  size: string
  /** Lề trang, VD: '8mm' hoặc '0' */
  margin: string
}

export const A4_LANDSCAPE: PageSetup = { size: 'A4 landscape', margin: '8mm' }
/** Tem khổ 2x4in nằm ngang (rộng 4in, cao 2in). */
export const LABEL_2X4: PageSetup = { size: '4in 2in', margin: '0' }
/** Tờ A4 ngang lề 20px — xếp 4 tem foam (2×2) có khoảng cách giữa các tem. */
export const A4_LANDSCAPE_FULL: PageSetup = { size: 'A4 landscape', margin: '20px' }

/** Đặt khổ giấy rồi mở hộp thoại in; tự dọn rule sau khi in xong. */
export function printWith(setup: PageSetup): void {
  document.getElementById(STYLE_ID)?.remove()

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `@page { size: ${setup.size}; margin: ${setup.margin}; }`
  document.head.appendChild(style)

  const cleanup = () => {
    document.getElementById(STYLE_ID)?.remove()
    window.removeEventListener('afterprint', cleanup)
  }
  window.addEventListener('afterprint', cleanup)

  // Cho trình duyệt kịp áp rule mới trước khi mở hộp thoại in
  window.requestAnimationFrame(() => {
    window.print()
    // Safari không phải lúc nào cũng bắn afterprint -> dọn dự phòng
    window.setTimeout(cleanup, 3000)
  })
}
