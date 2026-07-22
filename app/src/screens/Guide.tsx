import { useMemo, type ReactNode } from 'react'
// Đọc thẳng file hướng dẫn ở gốc app -> chỉ có MỘT bản nội dung duy nhất.
import guideVi from '../../HUONG_DAN_SU_DUNG.md?raw'
import guideEn from '../../USER_GUIDE.md?raw'
import { useT } from '../lib/LangContext'

export default function Guide() {
  const { t, lang } = useT()
  const file = lang === 'en' ? 'USER_GUIDE.md' : 'HUONG_DAN_SU_DUNG.md'
  const blocks = useMemo(() => renderMarkdown(lang === 'en' ? guideEn : guideVi), [lang])
  return (
    <div className="mx-auto max-w-[900px]">
      <article className="rounded-lg border border-line bg-white p-6 leading-relaxed">{blocks}</article>
      <p className="mt-2 text-center text-xs text-ink/50">
        {t('guide.source', { file })}
      </p>
    </div>
  )
}

/** Chuyển chuỗi in-line (đậm, code, link) thành React nodes. */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const tok = m[0]
    if (tok.startsWith('**')) {
      out.push(
        <strong key={`${keyPrefix}-b${i++}`} className="font-bold text-primary">
          {tok.slice(2, -2)}
        </strong>,
      )
    } else if (tok.startsWith('`')) {
      out.push(
        <code key={`${keyPrefix}-c${i++}`} className="rounded bg-muted/50 px-1 font-mono text-[13px]">
          {tok.slice(1, -1)}
        </code>,
      )
    } else {
      const label = tok.slice(1, tok.indexOf(']'))
      out.push(<span key={`${keyPrefix}-l${i++}`}>{label}</span>)
    }
    last = m.index + tok.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

/** Bộ render Markdown tối giản, đủ cho cấu trúc của file hướng dẫn. */
function renderMarkdown(md: string): ReactNode[] {
  const lines = md.split('\n')
  const out: ReactNode[] = []
  let i = 0
  let key = 0

  const flushList = (ordered: boolean, items: string[]) => {
    const Tag = ordered ? 'ol' : 'ul'
    out.push(
      <Tag
        key={`list-${key++}`}
        className={`mb-3 ml-5 space-y-1 text-sm ${ordered ? 'list-decimal' : 'list-disc'}`}
      >
        {items.map((it, n) => (
          <li key={n}>{inline(it, `li-${key}-${n}`)}</li>
        ))}
      </Tag>,
    )
  }

  while (i < lines.length) {
    const line = lines[i]

    // ngăn cách
    if (/^---+$/.test(line.trim())) {
      out.push(<hr key={`hr-${key++}`} className="my-5 border-line" />)
      i++
      continue
    }

    // tiêu đề
    const h = /^(#{1,4})\s+(.*)$/.exec(line)
    if (h) {
      const level = h[1].length
      const text = h[2]
      const cls =
        level === 1
          ? 'mb-3 text-2xl font-bold text-primary'
          : level === 2
            ? 'mb-2 mt-6 border-b border-line pb-1 text-lg font-bold text-primary'
            : 'mb-1.5 mt-4 text-base font-bold text-ink'
      const Tag = (level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3') as 'h1' | 'h2' | 'h3'
      out.push(
        <Tag key={`h-${key++}`} className={cls}>
          {inline(text, `h${key}`)}
        </Tag>,
      )
      i++
      continue
    }

    // bảng
    if (line.trim().startsWith('|') && lines[i + 1]?.includes('---')) {
      const header = splitRow(line)
      i += 2
      const body: string[][] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        body.push(splitRow(lines[i]))
        i++
      }
      out.push(
        <div key={`tbl-${key++}`} className="mb-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-primary text-white">
                {header.map((c, n) => (
                  <th key={n} className="border border-line px-2 py-1.5 text-left text-xs font-semibold">
                    {inline(c, `th-${key}-${n}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, rn) => (
                <tr key={rn} className="odd:bg-muted/15">
                  {row.map((c, cn) => (
                    <td key={cn} className="border border-line px-2 py-1.5 align-top">
                      {inline(c, `td-${key}-${rn}-${cn}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }

    // trích dẫn
    if (line.trim().startsWith('>')) {
      const quote: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quote.push(lines[i].replace(/^\s*>\s?/, ''))
        i++
      }
      out.push(
        <blockquote
          key={`q-${key++}`}
          className="mb-3 border-l-4 border-accent bg-muted/20 px-3 py-2 text-sm"
        >
          {inline(quote.join(' '), `q${key}`)}
        </blockquote>,
      )
      continue
    }

    // danh sách có số
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''))
        i++
        // gộp dòng con thụt lề vào mục hiện tại
        while (i < lines.length && /^\s{2,}[-*]\s+/.test(lines[i])) {
          items[items.length - 1] += ` — ${lines[i].replace(/^\s*[-*]\s+/, '')}`
          i++
        }
      }
      flushList(true, items)
      continue
    }

    // danh sách gạch đầu dòng
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''))
        i++
      }
      flushList(false, items)
      continue
    }

    // đoạn văn
    if (line.trim()) {
      const para: string[] = []
      while (
        i < lines.length &&
        lines[i].trim() &&
        !/^(#{1,4}\s|\s*[-*]\s|\s*\d+\.\s|>|\||---+$)/.test(lines[i])
      ) {
        para.push(lines[i].trim())
        i++
      }
      out.push(
        <p key={`p-${key++}`} className="mb-3 text-sm">
          {inline(para.join(' '), `p${key}`)}
        </p>,
      )
      continue
    }

    i++
  }

  return out
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim())
}
