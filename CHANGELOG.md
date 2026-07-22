# Lịch sử thay đổi — WACO Plan App

> Mỗi mục ghi lại **ngày** và **nội dung thay đổi**. Mục mới nhất ở trên cùng.
> Quy ước: mỗi lần sửa xong một việc → thêm 1 dòng mô tả ngắn gọn "đã đổi cái gì".

---

## 2026-07-22 (đợt 5 — dọn dẹp thư mục, gom vào github-repo/)
- Toàn bộ mã nguồn + tài liệu cần đưa lên GitHub được gom vào 1 thư mục duy nhất `github-repo/` (trước đây rải ở cấp gốc Drive). Cấu trúc bên trong giữ nguyên (app/, ban-phat-hanh/, data-goc/, design-system/, prompts/, .git, .gitignore, các file .md gốc).
- **Xoá hẳn** `Skill/` và `reference/ui-ux-pro-max-skill/` — 2 bản cài cục bộ trùng nhau của 1 skill bên thứ ba (ui-ux-pro-max), không phải mã nguồn app, tải lại miễn phí từ GitHub bất cứ lúc nào nên không cần giữ/archive.
- Cập nhật `.claude/launch.json` (ở cấp Drive, ngoài `github-repo/`) trỏ `--prefix github-repo/app` để dev server chạy đúng vị trí mới; thêm bản sao launch.json bên trong `github-repo/.claude/` (prefix `app`) để repo tự chứa, ai clone về cũng dùng được.
- Kiểm chứng: symlink `node_modules` còn nguyên, typecheck sạch, dev server khởi động lại đúng vị trí mới, Dashboard tải đủ dữ liệu không lỗi.

---

## 2026-07-22 (đợt 4 — fix TOTAL/SUBTOTAL lặp lại mỗi trang khi in invoice dài)
- Invoice nhiều dòng (VD 24 dòng, tràn 2 trang) bị lặp lại dòng **TOTAL/SUBTOTAL ở CUỐI MỖI TRANG** thay vì chỉ 1 lần ở trang cuối — do dùng `<tfoot>`, mà trình duyệt tự lặp lại `<tfoot>`/`<thead>` ở mọi trang khi bảng tràn trang lúc in.
- Sửa: tách TOTAL/SUBTOTAL ra bảng riêng (không phải `<tfoot>` của bảng dữ liệu) đặt ngay sau bảng — nó chỉ trôi tự nhiên theo nội dung, xuất hiện đúng 1 lần ở cuối. Thêm `<colgroup>` bề rộng cột dùng chung giữa 2 bảng (`table-layout: fixed`) để 2 bảng thẳng cột với nhau dù tách riêng.
  - File: `app/src/screens/FoamInvoice.tsx` (component `InvoiceColgroup`, tách TOTAL/SUBTOTAL khỏi `<tfoot>`).
- Kiểm chứng: invoice 24 dòng — DOM chỉ còn đúng 1 dòng TOTAL + 1 dòng SUBTOTAL, cột thẳng hàng với header phía trên.

## 2026-07-22 (đợt 3 — FIX LỖI NGHIÊM TRỌNG: app crash "reading 'primary'")

### Bug: bảng `settings` dùng chung app khác lưu `value` dạng TEXT chứ không phải jsonb
- **Triệu chứng:** app crash trắng màn "Cannot read properties of undefined (reading 'primary')" ngay khi tải — do `brand.colors` bị `undefined`.
- **Nguyên nhân gốc:** bảng `settings` share chung 1 project Supabase với app khác của bạn. Cột `value` thực tế trên server là kiểu **TEXT**, không phải `jsonb` như code (`db.ts`) giả định. Ghi object thẳng vào bị Postgres ép về chuỗi JSON; đọc lại nhận **string thô** thay vì object đã parse → `brand.colors.primary` sập vì `brand` lúc đó là 1 string, không phải object. Đã tự tay xác nhận bằng cách ghi thử 1 object vào bảng và đọc lại — nhận về string thay vì object, xác nhận đúng giả thuyết.
- **Sửa:** `getSetting()`/`setSetting()` trong `app/src/lib/db.ts` giờ luôn `JSON.stringify` khi ghi và `JSON.parse` khi đọc (nhận cả 2 trường hợp cũ: value đã là string hoặc lỡ là object). Áp dụng cho mọi setting dùng chung: brand, statusLabels, và `foam_process_adjust` (đã sửa từ đợt trước).
- **Bonus fix an toàn:** hàm "Xoá toàn bộ dữ liệu" (Cài đặt → vùng nguy hiểm) trước đây xoá **TOÀN BỘ bảng `settings`** (`neq('key','')`) — nếu bấm sẽ xoá luôn cấu hình của app khác đang dùng chung project! Đã sửa chỉ xoá đúng 3 key của app này (`brand`, `statusLabels`, `foam_process_adjust`).
  - File: `app/src/lib/db.ts` (getSetting/setSetting + db.delete()).
- Kiểm chứng: reload nhiều lần, Dashboard/Cài đặt tải đúng màu không crash; lưu brand → đọc lại DB đúng object; round-trip ổn định.
- **Lưu ý:** đây là lỗi ảnh hưởng toàn app (không riêng foam), có khả năng đã tồn tại từ khi bảng `settings` bị dùng chung — may mắn phát hiện sớm qua báo lỗi của người dùng.

## 2026-07-22 (đợt 2 — foam: màu invoice, tem, cài đặt process)

### 3 cải tiến nhóm Foam
- **Bản in invoice có màu + logo:** thêm logo American Star, tiêu đề INVOICE + header bảng màu navy (chữ trắng), mã foam màu navy, dòng kẻ zebra nhẹ, SUBTOTAL màu đỏ, nhãn Prepared/Loaded by màu navy. (Trình duyệt đã bật `print-color-adjust: exact` nên in ra giữ màu.)
  - File: `app/src/screens/FoamInvoice.tsx` (component InvoicePrint).
- **Thiết kế lại tem Foam:** chữ to hơn hẳn (mã foam 36px, kích thước 26px, số specs 17px), cảnh báo lấp đầy cột trái, mã vạch lớn canh giữa lấp khoảng trống dưới — hết tình trạng nhiều khoảng trắng. Không tràn ở khổ 90mm.
  - File: `app/src/components/FoamTag.tsx`.
- **Cài đặt kích thước tính giá theo Process:** thêm nút "Cài đặt Process" + modal cho phép chỉnh lượng trừ **L / W / H** cho từng process (UNTRIM / TRIM-AS / TRIM-CUSTOM). Pricing size = kích thước nhập − lượng trừ; đổi cài đặt là invoice tự tính lại. Có nút "Khôi phục mặc định".
  - Lưu ở bảng `settings` dùng chung với app khác (project Supabase chia sẻ) → cột `value` là **chuỗi JSON (text)**, nên code JSON.stringify khi ghi / JSON.parse khi đọc. Không cần chạy SQL mới.
  - File: `app/src/lib/foamDb.ts` (ProcessAdjust + load/save + pricingSize nhận cấu hình), `app/src/screens/FoamInvoice.tsx` (modal + truyền cấu hình vào mọi phép tính).
- Kiểm chứng: invoice in ra có logo + header navy + subtotal đỏ; tem chữ to không tràn; đổi UNTRIM trừ-L 1.5→2.0 thì pricing L 74.5→74.0, khôi phục mặc định về 74.5, tổng $5281.46.

## 2026-07-22 (đợt 1)

### Sửa lại layout in tem cho ĐÚNG khi in thật + mặc định in 4 tem
- **Bug thật khi in ra máy in:** bản trước đặt `.foam-page` kích thước CỐ ĐỊNH `calc(297mm−40px)`; máy in thật tự thêm lề riêng làm vùng in nhỏ hơn giả định → tem tràn, rớt sang trang 2 (đúng như ảnh người dùng gửi). Cách đo off-screen của tôi không phát hiện ra vì không mô phỏng lề máy in.
- **Sửa:** bỏ hết kích thước cố định của trang; dùng Grid `grid-template-columns: 1fr 1fr` **co giãn theo đúng bề rộng vùng in thực tế** (máy in để lề bao nhiêu cũng luôn 2 cột), tem cao cố định 90mm (2 hàng = 185mm, dư nhiều so với ~199mm vùng in A4 ngang). Đã kiểm ở nhiều bề rộng giả lập (1083/1000/900/780px) — **luôn 2×2, luôn cao 185mm, luôn gọn 1 trang**.
- **Nút In tem dòng invoice giờ mặc định in 4 tem** (đầy 1 tờ A4), hoặc bằng Qty nếu Qty>4 — thay vì in đúng 1 tem cho dòng Qty=1.
  - File: `app/src/index.css` (.foam-page/.foam-label), `app/src/components/FoamTag.tsx` (preview cố định size), `app/src/screens/FoamInvoice.tsx` (copies = max(4, qty)), `app/src/screens/FoamLabels.tsx`.

### Sửa dứt điểm layout 4 tem/trang: chuyển từ flex-wrap sang CSS Grid cố định
- Layout trước dùng `flex-wrap` + tem rộng cố định `138mm`, dựa vào trình duyệt tự tính bề rộng khả dụng của trang in để tự xuống dòng sau 2 tem — cách này **không đáng tin cậy**: có trường hợp trình duyệt tính sai bề rộng, khiến cả 4 tem rớt xuống 1 cột dọc, tràn sang 2 trang thay vì gọn 1 trang.
- Đổi sang **CSS Grid 2×2 với kích thước trang cố định tuyệt đối** — `width/height` của `.foam-page` tính thẳng từ khổ A4 ngang trừ lề (`calc(297mm − 40px)` × `calc(210mm − 40px)`), không phụ thuộc phép đo tự động của trình duyệt nữa. Đảm bảo **4 tem luôn đúng vị trí 2×2, luôn gọn 1 trang**, có gap 20px đều 2 chiều.
  - File: `app/src/index.css` (`.foam-page`, `.foam-label`).
- Kiểm chứng: trang in đo được đúng `1083×754px` (`286.4×199.4mm`, khớp công thức), 4 tem vào đúng 4 góc grid, không tem nào tràn ra ngoài trang.
- Thêm reset phòng thủ `rowLabels` khi đổi/tạo invoice mới, tránh sót dữ liệu tem của lần in trước.

### Nút In tem dòng invoice: in đúng theo Qty, xếp 4 tem/trang
- Nút "In tem dòng này" giờ in **đúng `Qty` bản** của dòng (mỗi tấm foam trong dòng có 1 tem riêng), gom 4 tem/trang A4 ngang giống màn In tem Foam — dòng Qty=5 → 2 trang (4+1). Tooltip hiện số bản khi Qty>1, VD "In tem dòng này (5)".
  - File: `app/src/screens/FoamInvoice.tsx` (state `rowLabels` là mảng thay vì 1 tem, hàm `chunk`).

### Sửa layout in tem: 4 tem/trang A4 ngang, có gap + lề 20px
- Tem foam thu nhỏ về **138×94mm**, gom **4 tem/trang** xếp 2×2 (`.foam-page` flex-wrap), **khoảng cách 20px** giữa các tem, **lề trang `@page` = 20px**. >4 tem tự sang trang mới. Đã kiểm chứng vị trí 2×2 vừa 1 trang (cao 731px ≤ 754px vùng in).
  - File: `app/src/lib/printing.ts` (A4_LANDSCAPE_FULL margin 20px), `app/src/index.css` (.foam-page/.foam-label), `app/src/screens/FoamLabels.tsx` (chia 4/trang), `app/src/screens/FoamInvoice.tsx`.
  - _Nút In tem từng dòng invoice vẫn in đúng 1 tem của dòng đó (nằm ô góc trên-trái)._

### Nhập invoice mẫu + nút In tem từng dòng trên màn Invoice
- **Nhập sẵn invoice COSICANA-TX0121-042** (24 dòng, CFN30100W, đúng kích thước từng dòng, header đủ) từ file Excel vào Supabase. _Lưu ý:_ tổng app $5,281.46 vs Excel $5,300.13 — chênh $18.67 do **lỗi công thức off-by-one** ở 6 dòng trong Excel gốc (lấy nhầm chiều cao dòng kế tiếp); app tính đúng `H−0.5` nhất quán.
- **Nút In tem cho từng dòng invoice:** mỗi dòng có nút máy in → bấm là in ngay 1 tem foam (khổ A6/A4 ngang) theo đúng dòng đó: mã foam, kích thước L×W×H, BATCH = Customer PO, Qty (bft) = board-feet NET (L×W×H÷144), density/hardness tự lấy từ mã. Tách `FoamTag` thành component dùng chung `components/FoamTag.tsx`.
  - File: `app/src/components/FoamTag.tsx` (mới), `app/src/screens/FoamInvoice.tsx`, `app/src/screens/FoamLabels.tsx`.

### Thêm nhóm tính năng NGÀNH FOAM (3 màn hình mới)
- **Tái cấu trúc sidebar thành 2 nhóm có tiêu đề:** **NGÀNH NỆM** (Tổng quan, Kế hoạch tuần, Dữ liệu sản phẩm, In tem) và **NGÀNH FOAM** (mới) xếp bên dưới; Cài đặt/Hướng dẫn dùng chung ở cuối.
  - File: `app/src/App.tsx` (NAV_GROUPS, render nhóm), `app/src/lib/i18n.ts` (nav keys).
- **Schema + seed Supabase cho Foam:** 6 bảng `foam_products / foam_customers / foam_prices / foam_sizes / foam_invoices / foam_invoice_rows` (RLS + realtime). Nạp sẵn **33 mã foam · 8 khách hàng · 27 dòng giá · 21 size** — trích từ `data-goc/Invoice Foam.xlsm` + bảng mã foam.
  - File: `app/supabase/foam-schema.sql` (chạy 1 lần trên Supabase), `app/src/lib/foamDb.ts` (data layer + công thức tính).
- **Màn 1 — Mã sản phẩm Foam:** danh mục mã ASW ↔ mã HV/DH, density (lb/ft³ & kg/m³), hardness (IFD), màu, mô tả; tìm kiếm, thêm/sửa/xoá.
- **Màn 2 — Lập invoice:** chọn khách → nhập dòng (mã foam, process UNTRIM/TRIM, size, qty, L×W×H) → **tự tính** Pricing size (UNTRIM: −1.5/−1.5/−0.5; TRIM: H−0.5), BDFT = pL×pW×pH÷144×qty, đơn giá tra theo khách×mã, thành tiền, tổng + freight. Lưu/mở lại/xoá invoice; in A4 ngang. **Đã kiểm khớp Excel 100%** (CFN30100W 76×55×34.5 → 74.5×53.5×34 → BDFT 941.1 → $178.33).
- **Màn 3 — In tem Foam:** tem "FOAM BUNS" khổ A6 ngang bám mẫu tem giấy (mã + kích thước lớn, BATCH, Qty bft, DIMENSIONS NET, DENSITY & HARDNESS tự điền từ mã, Pour/Cut date, barcode, logo American Star, khối cảnh báo Urethane flammable + P65 + "UNDER PENALTY OF LAW"). In **4 tem/tờ A4 ngang** (2×2, `@page A4 landscape margin 0`).
- Lưu file gốc vào `data-goc/Invoice Foam.xlsm` (chỉ đọc). Kiểm chứng end-to-end trên trình duyệt: seed hiển thị, tính tiền đúng, lưu/đọc round-trip, in tem 4-up. Build lại bản 1-file (1642 KB).

---

## 2026-07-21

### Nâng cấp giao diện toàn app theo chuẩn UX/UI Pro Max + đổi font San Francisco
- **Đổi font chữ toàn app sang San Francisco (Apple):** thân chữ dùng `-apple-system / SF Pro`, số/mã dùng `SF Mono`. Gỡ bỏ `@import` Google Fonts (Fira Sans/Fira Code) → bản 1 file HTML mở offline vẫn đúng chữ, tải nhanh hơn, không phụ thuộc mạng.
  - File: `app/src/lib/theme.ts` (DEFAULT_BRAND.fonts), `app/src/index.css` (biến `--font-body`, `--font-numeric`, bỏ dòng import).
- **Áp phong cách "Soft UI Evolution":** thêm bộ token bóng đổ mềm phủ sắc navy (`--shadow-soft / -md / -lg`) và class Tailwind `shadow-soft*`. Card bo góc `rounded-xl`, viền nhạt hơn, bóng mềm thay bóng phẳng.
  - File: `app/tailwind.config.js`, `app/src/index.css`, `app/src/components/ui.tsx`.
- **Nút bấm:** bo `rounded-lg`, thêm bóng mềm + hover sáng nhẹ + hiệu ứng nhấn (`active:scale`), trạng thái disabled gọn hơn.
- **Ô nhập liệu:** focus có viền + quầng sáng (`ring`) màu thương hiệu, dễ thấy khi dùng bàn phím.
- **Hộp thoại (Modal):** nền phủ mờ theo màu navy, bo `rounded-2xl`, bóng sâu, có hiệu ứng hiện vào nhẹ (fade + scale ~150–200ms, tôn trọng `prefers-reduced-motion`).
- **Dashboard — thẻ KPI:** thêm thanh nhấn màu bên trái (đỏ = chỉ số chính, xanh/đỏ = tăng/giảm), số to rõ hơn, hover nâng bóng.
- **Sidebar:** mục đang chọn có thêm chiều sâu (bóng mềm) cho nổi bật.
- Kiểm chứng: typecheck sạch, không lỗi console; xem thực tế Dashboard + Kế hoạch tuần trên trình duyệt — font SF hiển thị đúng, card/nút nhất quán, màu trạng thái nghiệp vụ giữ nguyên.
- _Lưu ý:_ hệ màu thương hiệu American Star (navy/đỏ) và 4 màu trạng thái **giữ nguyên** — chỉ nâng cấp typography, độ sâu, tương tác.

### Tem in — đổi khổ và tự canh cỡ chữ
- Đổi khổ tem từ **6×4in ngang** → **4×2in ngang** (rộng 4in, cao 2in). Cập nhật `@page`, CSS `.label-page`, khung xem trước, chuỗi i18n và 3 tài liệu hướng dẫn.
  - File: `app/src/lib/printing.ts`, `app/src/index.css`, `app/src/screens/LabelPrinting.tsx`, `app/src/lib/i18n.ts`, `app/HUONG_DAN_SU_DUNG.md`, `app/USER_GUIDE.md`, `ban-phat-hanh/DOC-TRUOC-KHI-DUNG.md`.
- **Tự canh cỡ chữ (auto-fit) cho tem:** đo chữ bằng canvas rồi nhị phân tìm cỡ lớn nhất để tên sản phẩm + size lấp gần kín tem, chỉ chừa lề an toàn nhỏ — hết tình trạng chữ nhỏ và dư khoảng trống. Tên và size phóng cùng tỉ lệ để size (màu đỏ) luôn nổi bật; tự ngắt dòng, từ dài ngắt theo ký tự để không tràn.
  - File: `app/src/screens/LabelPrinting.tsx`.
- Tem tối giản: chỉ còn dải trạng thái + Week N + tên sản phẩm + size (đã bỏ logo, SKU, ngày, số lượng, PIC, ghi chú).

---

## Trước 2026-07-21 (tóm tắt nền tảng)

- Chuyển lưu trữ từ IndexedDB (chỉ trên 1 máy) sang **Supabase** (Postgres + Auth + Realtime) để nhiều máy dùng chung dữ liệu, có đăng nhập bằng mật khẩu chung và đồng bộ thời gian thực.
- Hoàn thiện các màn hình: Tổng quan, Kế hoạch tuần (lưới màu theo trạng thái, in A4 ngang), Dữ liệu sản phẩm (nhập Excel), In tem, Cài đặt, Hướng dẫn.
- Hỗ trợ song ngữ Việt/Anh; đóng gói thành **1 file HTML** dùng ngay (`ban-phat-hanh/WACO-KeHoachSanXuat.html`).
