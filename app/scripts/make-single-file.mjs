/**
 * Gộp kết quả build của Vite thành MỘT file HTML duy nhất.
 * Nhúng thẳng JS + CSS vào trang, không phụ thuộc file ngoài,
 * để có thể copy đi đâu cũng chạy.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const outDir = join(root, '..', 'ban-phat-hanh')
const outFile = join(outDir, 'WACO-KeHoachSanXuat.html')

let html = readFileSync(join(dist, 'index.html'), 'utf8')

// Nhúng CSS
html = html.replace(
  /<link[^>]+rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,
  (_m, href) => {
    const file = join(dist, href.replace(/^\.?\//, ''))
    if (!existsSync(file)) throw new Error(`Không tìm thấy CSS: ${file}`)
    return `<style>\n${readFileSync(file, 'utf8')}\n</style>`
  },
)

// Nhúng JS
html = html.replace(
  /<script[^>]*type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g,
  (_m, src) => {
    const file = join(dist, src.replace(/^\.?\//, ''))
    if (!existsSync(file)) throw new Error(`Không tìm thấy JS: ${file}`)
    const code = readFileSync(file, 'utf8')
    // </script> bên trong chuỗi JS sẽ cắt sớm thẻ script -> phải escape
    return `<script type="module">\n${code.replace(/<\/script>/gi, '<\\/script>')}\n</script>`
  },
)

// Kiểm tra không còn tham chiếu file ngoài
const leftover = html.match(/(?:src|href)="(?!data:|#|https?:)([^"]+)"/g)
if (leftover) {
  const real = leftover.filter((m) => !/\.(png|svg|ico)"/.test(m))
  if (real.length) {
    console.warn('⚠ Vẫn còn tham chiếu ngoài:', real.join(', '))
  }
}

mkdirSync(outDir, { recursive: true })
writeFileSync(outFile, html, 'utf8')

const kb = (Buffer.byteLength(html) / 1024).toFixed(0)
console.log(`✅ Đã tạo file dùng ngay: ${outFile}`)
console.log(`   Dung lượng: ${kb} KB — chỉ một file, không cần file phụ.`)
