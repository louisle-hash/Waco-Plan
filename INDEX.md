# INDEX — WACO Plan App

Cập nhật lần cuối: 2026-07-22

> **Cấu trúc:** thư mục này (`github-repo/`) là TOÀN BỘ nội dung đưa lên GitHub —
> mọi đường dẫn dưới đây tính từ đây. Bên ngoài `github-repo/` (ở cấp Drive)
> không còn gì khác ngoài file cấu hình dev-tool cục bộ.
> Đã dọn bỏ (2026-07-22): `Skill/`, `reference/ui-ux-pro-max-skill/` — bản cài
> cục bộ của 1 skill bên thứ ba, không phải mã nguồn của app, xoá được bất cứ
> lúc nào và tải lại free từ GitHub nếu cần.

## ✅ ĐÃ CHẠY ĐƯỢC — dữ liệu dùng chung qua Supabase

App đã nối vào project Supabase (`otdvrdcyhynbwpiiuyfm`), bảng đã tạo, tài khoản đăng nhập chung
đã có. Đã kiểm chứng thật:

- Đăng nhập bằng mật khẩu chung → vào được, dữ liệu Tuần 29 (46 dòng, tổng 278) hiển thị đúng
- **Bảo mật RLS hoạt động**: chưa đăng nhập mà cố ghi dữ liệu → bị chặn HTTP 401
- **Đồng bộ realtime hoạt động 2 chiều**: sửa ở trình duyệt này, trình duyệt kia tự cập nhật
  ngay, không cần bấm tải lại

⚠️ **Mật khẩu hiện tại là `123456`** — quá yếu cho dữ liệu sản xuất thật. Nên đổi trong
Supabase Dashboard → Authentication → Users (xem mục Lưu ý bảo mật cuối file).

## 👉 Muốn dùng app
Mở thư mục `ban-phat-hanh/` → bấm đúp **`MO-APP.command`** → đăng nhập bằng mật khẩu chung.
Đọc `ban-phat-hanh/DOC-TRUOC-KHI-DUNG.md` trước khi dùng.

## Nhóm NGÀNH FOAM (mới 2026-07-22)
App chia 2 nhóm trên sidebar: **NGÀNH NỆM** (cũ) và **NGÀNH FOAM** (mới) gồm 3 màn:
Mã sản phẩm Foam · Lập invoice (tự tính BDFT/đơn giá/thành tiền, khớp Excel) · In tem Foam (4 tem/tờ A4 ngang).
- Cần chạy **1 lần**: `app/supabase/foam-schema.sql` trên Supabase (đã có, đã chạy) — tạo bảng `foam_*` + nạp sẵn 33 mã foam, 8 khách, 27 giá, 21 size.
- File gốc: `data-goc/Invoice Foam.xlsm` (chỉ đọc, nguồn của seed).

## Root (file sống)
- `AS_logo.png` — logo American Star (navy `#041E42`, đỏ `#BF0C3E`, xám `#D9D9D6`)
- `BRAND-CONFIG.md` — cấu hình brand, là nguồn màu duy nhất của app (đã điền đầy đủ)
- `CHANGELOG.md` — lịch sử thay đổi app, mỗi mục ghi ngày + nội dung đã đổi
- `INDEX.md` — file này

## ban-phat-hanh/ (bản đóng gói, dùng ngay — KHÔNG cần cài gì)
- `MO-APP.command` — bấm đúp để chạy app qua localhost (cách khuyên dùng)
- `WACO-KeHoachSanXuat.html` — toàn bộ app trong 1 file HTML (~1.6 MB, đã gồm Supabase client)
- `DANH-MUC-SAN-PHAM-WACO.xlsx` — 423 SKU thật trích từ file Excel gốc, nạp thẳng vào app
- `WACO-Tuan-29.json` — dữ liệu Tuần 29 đã nhập sẵn (46 dòng), nạp qua nút "Nhập tuần từ file"
- `DOC-TRUOC-KHI-DUNG.md` — hướng dẫn mở app + cách nạp danh mục/tuần + trạng thái chờ Supabase

## app/supabase/ — thiết lập máy chủ dữ liệu chung
- `HUONG-DAN-THIET-LAP.md` — hướng dẫn từng bước tạo project Supabase (~10 phút)
- `schema.sql` — kịch bản tạo 5 bảng (products/weeks/week_rows/snapshots/settings) + RLS chỉ cho
  người đã đăng nhập đọc/ghi + bật Realtime

## app/ (mã nguồn — Vite + React + TS + Tailwind + Supabase)
- `HUONG_DAN_SU_DUNG.md` / `USER_GUIDE.md` — hướng dẫn sử dụng tiếng Việt và tiếng Anh (màn hình Hướng dẫn đọc thẳng đúng file theo ngôn ngữ đang chọn)
- `src/lib/i18n.ts` — **toàn bộ chuỗi song ngữ Việt–Anh**, thêm/sửa chữ trong app là sửa ở đây
- `src/lib/LangContext.tsx` — context ngôn ngữ + hook `useT()`
- `src/lib/theme.ts` — brand + 4 màu trạng thái cố định
- `src/lib/supabaseConfig.ts` — **điền Project URL + anon key ở đây** sau khi thiết lập xong, rồi build lại
- `src/lib/supabase.ts` — client Supabase + hàm đăng nhập/đăng xuất bằng mật khẩu chung
- `src/lib/db.ts` — tầng dữ liệu MỚI, chạy trên Supabase (thay cho IndexedDB), giữ API gần giống bản cũ để screens ít phải sửa
- `src/lib/localDb.ts` — bản Dexie/IndexedDB GỐC, giữ lại chỉ để công cụ di chuyển dữ liệu đọc
- `src/lib/migrateLocalToCloud.ts` — công cụ 1 lần: đẩy dữ liệu cũ trên máy (nếu có) lên Supabase, gọi từ Cài đặt
- `src/lib/useCloudQuery.ts` — hook truy vấn + tự cập nhật realtime khi có ai sửa (thay `useLiveQuery` của Dexie)
- `src/screens/Login.tsx` — màn hình đăng nhập bằng mật khẩu chung
- `src/components/ConnectionBanner.tsx` — banner đỏ báo mất mạng/lỗi kết nối, gắn ở 4 màn hình chính
- `src/lib/excelImport.ts` — đọc & ánh xạ file Excel sang danh mục sản phẩm
- `src/lib/printing.ts` — chuyển khổ giấy theo màn hình (A4 ngang cho kế hoạch, 4×6in cho tem)
- `src/lib/weekBackup.ts` — xuất/nhập một tuần dưới dạng file .json (quy chiếu SKU)
- `src/components/WeekPrintSheet.tsx` — bản in kế hoạch tuần khổ A4 ngang
- `src/components/WeekImportModal.tsx` — modal nhập tuần từ file .json, hiện trước preview khớp/chưa khớp SKU
- `src/screens/` — Dashboard, WeeklyPlanning, ProductData, LabelPrinting, Settings, Guide, Login
- `scripts/make-single-file.mjs` — gộp bản build thành 1 file HTML
- Lệnh: `npm run dev` (chạy thử) · `npm run build:single` (tạo lại bản phát hành)
- ⚠️ `node_modules` là symlink trỏ ra `~/.local/share/waco-plan-app/node_modules` để không đồng bộ rác lên Google Drive. Chạy lại `npm install` sẽ phá symlink này — xem mục Lưu ý bên dưới.

## Skill/
- `ui-ux-pro-max-skill/` — skill thiết kế UI/UX dùng để sinh design system

## design-system/
- `waco-production-plan/MASTER.md` — design system của app (style Data-Dense Dashboard, màu đã override theo brand American Star)

## reference/ (chỉ đọc)
- `Hình file kế hoạch tuần.png` — ảnh chụp bảng Excel gốc, dùng làm mẫu layout

## prompts/done/
- `PROMPT-XAY-DUNG-APP.md` — ▶ ĐÃ CHẠY 2026-07-19, kết quả OK

## Nguồn dữ liệu gốc (ngoài thư mục này)
- `~/Downloads/WACO-ProductionSchedule-July-2026-Fixed_1.xlsx` — file Excel gốc 30 sheet (Week 1–30)

---

## Lưu ý kỹ thuật

**Node.js** đã được cài vào `~/.local/lib/node` (v22.20.0 LTS), lệnh `node`/`npm` nằm ở `~/.local/bin`.

**Nếu chạy lại `npm install`** trong `app/`, npm sẽ thay symlink `node_modules` bằng thư mục thật
(kéo theo ~20.000 file đồng bộ lên Google Drive). Khắc phục bằng 3 lệnh:

```bash
cd "app"
rm -rf ~/.local/share/waco-plan-app/node_modules
mv node_modules ~/.local/share/waco-plan-app/node_modules
ln -sfn ~/.local/share/waco-plan-app/node_modules node_modules
```

## ⚠️ Lưu ý bảo mật — nên làm sớm

**Mật khẩu chung hiện là `123456`.** Với dữ liệu kế hoạch sản xuất thật, nên đổi sang mật khẩu
mạnh hơn: Supabase Dashboard → Authentication → Users → bấm vào user `waco@noreply.local` →
Reset password. Đổi xong chỉ cần báo mọi người mật khẩu mới, **không cần build lại app**
(mật khẩu không nằm trong file HTML).

**Ai có file HTML + mật khẩu đều toàn quyền sửa/xoá dữ liệu** — app không phân quyền theo người
dùng. Cân nhắc khi gửi file ra ngoài xưởng.

**Nếu lỡ lộ mật khẩu:** đổi mật khẩu như trên là đủ, anon key trong file HTML không phải bí mật
(nó vô dụng nếu không có mật khẩu — đã kiểm chứng: ghi dữ liệu khi chưa đăng nhập bị chặn 401).

---

**Kiến trúc dữ liệu (sau khi chuyển sang Supabase):**
- Đọc/ghi qua `src/lib/db.ts` — object `db` giữ API giống Dexie cũ (`db.products.toArray()`,
  `db.weeks.where(...).first()`...) nhưng bên trong gọi Supabase, để giảm tối đa số chỗ phải sửa
  ở các màn hình.
- Không có transaction nhiều-câu-lệnh thật (Postgres qua REST API từ trình duyệt không hỗ trợ) —
  các thao tác nhiều bước (nhập Excel, nhập tuần từ backup) chạy tuần tự. Chấp nhận được vì đây
  là công cụ nội bộ, ít người thao tác đồng thời cùng một dòng dữ liệu.
- Bảo mật dựa vào Row Level Security phía Supabase (chỉ người đăng nhập mới đọc/ghi được), không
  phải giấu `anon key` — key đó vốn được thiết kế để công khai trong mã nguồn client.
