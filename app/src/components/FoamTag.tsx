import { DEFAULT_LOGO } from '../lib/theme'
import type { FoamProduct } from '../lib/foamDb'

/** Văn bản pháp lý cố định trên tem foam (không sửa). */
const FLAMMABLE_TEXT =
  'Urethane foam can ignite if exposed to an open flame or other sufficient heat sources. Avoid exposing urethane foam to open flames or any other direct or indirect high-temperature ignition sources, such as welding, burning cigarettes, space heaters, or naked lights. Once ignited, urethane foam will burn quickly, releasing a significant amount of heat and consuming oxygen at a high rate. In an enclosed space, this oxygen depletion can pose a serious suffocation risk to occupants. The hazardous gases emitted by burning foam can be debilitating or fatal if inhaled in sufficient quantities. Extinguishing urethane foam once ignited is challenging. Fires involving foam that appear to be extinguished may smolder and reignite. Always have fire officials verify that the fire has been completely extinguished. This underlayment should only be used beneath carpet and should not be used for any other purpose.'
const LEGAL_TEXT =
  'Certification is made by the manufacturer that the materials in this article are described in accordance with law.'

/** Dữ liệu 1 tem foam. Các trường dạng chuỗi để nhập tự do trên UI. */
export type LabelEntry = {
  foamCode: string
  l: string
  w: string
  h: string
  batch: string
  qtyBft: string
  orderNo: string
  pourDate: string
  cutDate: string
  barcode: string
}

export const blankLabelEntry = (): LabelEntry => ({
  foamCode: '',
  l: '',
  w: '',
  h: '',
  batch: '',
  qtyBft: '',
  orderNo: '',
  pourDate: '',
  cutDate: '',
  barcode: '',
})

/**
 * Tem FOAM BUNS khổ A6 ngang (148.5×105mm). Bố cục bám mẫu tem giấy:
 * đầu tem mã + kích thước lớn; giữa là cảnh báo + thông số; cuối là mã vạch,
 * logo và khối pháp lý. Dùng chung ở màn In tem Foam và nút in từng dòng invoice.
 */
export function FoamTag({
  entry,
  product,
  preview = false,
}: {
  entry: LabelEntry
  product?: FoamProduct
  preview?: boolean
}) {
  const dims = [entry.l, entry.w, entry.h].filter(Boolean).join(' x ')
  return (
    <div
      className="foam-label flex flex-col border-[2.5px] border-black bg-white text-black"
      style={preview ? { width: '138mm', height: '90mm', boxShadow: '0 2px 10px rgba(0,0,0,.15)' } : undefined}
    >
      {/* Đầu tem — mã + kích thước rất lớn để đọc từ xa */}
      <div className="flex shrink-0 border-b-[2.5px] border-black">
        <div className="flex-1 px-3 py-1.5">
          <p className="text-[14px] font-bold uppercase leading-none tracking-wide">FOAM BUNS</p>
          <p className="font-mono text-[36px] font-extrabold leading-[1.05]">{entry.foamCode || '—'}</p>
          <p className="text-[26px] font-bold leading-none">{dims || '—'}</p>
        </div>
        <div className="flex w-[32%] flex-col justify-center border-l-[2.5px] border-black">
          <div className="border-b border-black px-2 py-1.5">
            <p className="text-[10px] font-bold uppercase text-black/55">Batch</p>
            <p className="text-[15px] font-bold leading-none">{entry.batch || '—'}</p>
          </div>
          <div className="px-2 py-1.5">
            <p className="text-[10px] font-bold uppercase text-black/55">Qty</p>
            <p className="text-[15px] font-bold leading-none">
              {entry.qtyBft || '—'} <span className="text-[9px] font-semibold">bft</span>
            </p>
          </div>
        </div>
      </div>

      {/* Thân tem */}
      <div className="flex min-h-0 flex-1">
        {/* Cột trái: cảnh báo pháp lý (chữ nhỏ nhưng lấp đầy cột) */}
        <div className="flex w-[43%] flex-col border-r-[1.5px] border-black px-2 py-1.5">
          <p className="text-[10px] font-extrabold leading-tight text-orange-700">
            ⚠ WARNING — URETHANE FOAM IS FLAMMABLE!
          </p>
          <p className="mt-1 flex-1 text-[6px] leading-[1.3]">{FLAMMABLE_TEXT}</p>
          <div className="mt-1 border-t border-black/40 pt-1">
            <p className="text-[8.5px] font-bold leading-tight">⚠ WARNING: Cancer and Reproductive Harm</p>
            <p className="text-[7.5px]">www.P65Warnings.ca.gov</p>
          </div>
        </div>

        {/* Cột phải: thông số — số to, mã vạch lấp phần dưới */}
        <div className="flex flex-1 flex-col px-2 py-1.5">
          <p className="border-b-[1.5px] border-black pb-0.5 text-[11px] font-extrabold tracking-wide">
            DIMENSIONS (NET)
          </p>
          <div className="grid grid-cols-3 gap-1 pt-1">
            <Spec label="Width" val={entry.w} unit="in" />
            <Spec label="Length" val={entry.l} unit="in" />
            <Spec label="Height" val={entry.h} unit="in" />
          </div>
          <p className="mt-2 border-b-[1.5px] border-black pb-0.5 text-[11px] font-extrabold tracking-wide">
            DENSITY &amp; HARDNESS
          </p>
          <div className="grid grid-cols-3 gap-1 pt-1">
            <Spec label="Density" val={product?.densityLb?.toString() ?? ''} unit="lb/ft³" />
            <Spec label="Hardness" val={product?.hardness?.toString() ?? ''} unit="lbs" />
            <Spec label="Order" val={entry.orderNo} />
          </div>
          <div className="mt-2 flex justify-between text-[9px]">
            <span>
              <b>Pour date:</b> {entry.pourDate || '—'}
            </span>
            <span>
              <b>Date cut:</b> {entry.cutDate || '—'}
            </span>
          </div>
          {/* Mã vạch — chiếm phần trống còn lại, canh giữa */}
          <div className="mt-1 flex flex-1 items-center justify-center">
            <p className="text-center font-mono text-[26px] font-bold leading-none tracking-tight">
              {entry.barcode || '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Chân tem */}
      <div className="flex shrink-0 items-center gap-2 border-t-[2.5px] border-black px-2 py-1">
        <img src={DEFAULT_LOGO} alt="American Star" className="h-7 w-auto object-contain" />
        <div className="flex-1 text-[6.5px] leading-[1.25]">
          <p className="font-bold">
            UNDER PENALTY OF LAW — THIS TAG NOT TO BE REMOVED EXCEPT BY THE CONSUMER. ALL NEW MATERIAL consisting of
            POLYURETHANE FOAM. REG.NO. CA44096VN.
          </p>
          <p>{LEGAL_TEXT}</p>
        </div>
      </div>
    </div>
  )
}

function Spec({ label, val, unit }: { label: string; val: string; unit?: string }) {
  return (
    <div>
      <p className="text-[8px] font-semibold uppercase text-black/55">
        {label} {unit && <span className="text-[7px] normal-case">({unit})</span>}
      </p>
      <p className="text-[17px] font-extrabold leading-none">{val || '—'}</p>
    </div>
  )
}
