# Bản phát hành — App Kế hoạch sản xuất WACO

## ✅ App đã dùng được — dữ liệu dùng chung nhiều máy

Mở app → gõ **mật khẩu chung** → vào thẳng. Dữ liệu (sản phẩm, kế hoạch tuần) nằm trên máy chủ
Supabase, **mọi máy đăng nhập đều thấy cùng một dữ liệu**, ai sửa thì người khác thấy ngay.

Sẵn có trên máy chủ: **423 sản phẩm** + **Tuần 29** (46 dòng, tổng 278) — không cần nạp lại.

⚠️ **Mật khẩu hiện tại là `123456`** — nên đổi sang mật khẩu mạnh hơn trước khi dùng thật.
Đổi ở Supabase Dashboard → Authentication → Users, không cần build lại app.

Toàn bộ mục hướng dẫn "Nạp Tuần 29 / Nạp danh mục" bên dưới **vẫn áp dụng y hệt** sau khi thiết
lập xong — chỉ là giờ dữ liệu nạp vào sẽ nằm trên máy chủ chung, mọi máy đăng nhập cùng mật khẩu
đều thấy.

---

Thư mục này chứa app đã đóng gói xong, **không cần cài gì thêm** (sau khi hoàn tất bước Supabase ở trên).

| File | Là gì |
|---|---|
| `MO-APP.command` | Bấm đúp để mở app — **cách khuyên dùng** |
| `WACO-KeHoachSanXuat.html` | Toàn bộ app gói trong 1 file HTML |
| `DANH-MUC-SAN-PHAM-WACO.xlsx` | **423 sản phẩm thật** trích từ file Excel kế hoạch cũ — nạp một phát là có sẵn danh mục |
| `WACO-Tuan-29.json` | Dữ liệu **Tuần 29** đã nhập sẵn (46 dòng, đủ Mon–Sun) — nạp vào bằng nút "Nhập tuần từ file" |

---

## Nạp sẵn Tuần 29

Sau khi đã nạp xong danh mục sản phẩm ở trên:

1. Vào **Kế hoạch tuần**
2. Bấm **Nhập tuần từ file**
3. Chọn file `WACO-Tuan-29.json`
4. Kiểm tra thấy "Tuần 29 — 46/46 dòng khớp sản phẩm" thì bấm **Nhập tuần 29**

App sẽ tự tạo Tuần 29 (nếu chưa có) hoặc **ghi đè** nếu Tuần 29 đã tồn tại và chưa chốt. Tổng đã đối chiếu khớp
chính xác với bảng gốc: 278 (Mon 38 · Tue 44 · Wed 98 · Thu 98 · Fri/Sat/Sun 0).

Nút **Xuất tuần (.json)** cạnh đó dùng để sao lưu bất kỳ tuần nào ra file, mang sang máy khác hoặc lưu trữ —
dùng lại được cho các tuần sau, không chỉ riêng Tuần 29.

---

## Việc đầu tiên cần làm: nạp danh mục sản phẩm

App lúc mới mở là trống. Nạp sẵn 423 SKU thật của xưởng như sau:

1. Mở app → vào **Dữ liệu sản phẩm**
2. Bấm **Nhập từ Excel**
3. Chọn file `DANH-MUC-SAN-PHAM-WACO.xlsx` (nằm ngay trong thư mục này)
4. App tự ghép cột — kiểm tra thấy “423 sản phẩm mới, 0 dòng lỗi” thì bấm **Nạp 423 sản phẩm**

File này được trích tự động từ toàn bộ 30 sheet của `WACO-ProductionSchedule-July-2026-Fixed_1.xlsx`,
tách sẵn tên sản phẩm / kích thước / dòng sản phẩm và sinh mã SKU không trùng.

**92 sản phẩm** trong đó có ghi chú *“Không còn trong kế hoạch từ sau tuần N”* — là hàng đã ngừng
xuất hiện ở các tuần gần đây. Sau khi nạp, bạn nên lọc các dòng này rồi bấm **Lưu trữ** cho gọn danh sách.
(Lưu trữ không xoá, cần lại vẫn khôi phục được.)

Cột **PIC** và **Trạng thái** trong file để trống — hai thứ này thay đổi theo tuần nên bạn tự điền
trong app, hoặc điền sẵn vào file Excel trước khi nạp cũng được.

---

## Ngôn ngữ / Language

App có **song ngữ Việt – Anh**. Đổi bằng hai nút ở đáy thanh menu bên trái
(**Tiếng Việt** / **English**). App nhớ lựa chọn, lần mở sau giữ nguyên.

> The app is **bilingual (Vietnamese / English)**. Switch with the two buttons at the bottom of the
> left sidebar. Your choice is remembered.

Riêng bản in kế hoạch tuần giữ tiêu đề cột bằng tiếng Anh (PRODUCT, Total, Monday…) ở cả hai ngôn
ngữ — đúng như biểu mẫu Excel mà xưởng đang dùng.

---

## Cách dùng (khuyên dùng)

Bấm đúp vào **`MO-APP.command`**.

- Một cửa sổ Terminal đen hiện ra, rồi trình duyệt tự mở app.
- **Đừng đóng cửa sổ Terminal** trong lúc đang dùng app. Đóng nó = tắt app.
- Xong việc thì đóng cửa sổ Terminal lại.

> Lần đầu bấm đúp, macOS có thể chặn và báo *"không mở được vì từ nhà phát triển không xác định"*.
> Cách xử lý: bấm chuột phải vào file → chọn **Open** → bấm **Open** lần nữa. Chỉ cần làm một lần.

## Cách 2 — mở thẳng file HTML

Bấm đúp vào `WACO-KeHoachSanXuat.html`, hoặc kéo thả nó vào trình duyệt. Kể từ khi chuyển sang
Supabase, cách này **an toàn như Cách 1** — dữ liệu không còn nằm trong trình duyệt nữa (nằm trên
máy chủ chung), nên mở bằng `file://` hay qua `MO-APP.command` đều thấy **cùng một dữ liệu**,
không còn khái niệm "hai ngăn lưu trữ khác nhau" như bản cũ.

Vẫn nên ưu tiên Cách 1 (`MO-APP.command`) cho quen thuộc, nhưng nếu ai đó lỡ mở Cách 2 cũng không
sao — chỉ cần đăng nhập đúng mật khẩu chung là thấy đúng dữ liệu.

---

## Những điều cần nhớ về dữ liệu

- Dữ liệu nằm **trên máy chủ Supabase dùng chung**, không nằm trong file HTML và không nằm riêng
  trên máy nào. Gửi file HTML cho người khác = họ đăng nhập bằng mật khẩu chung là thấy đúng dữ
  liệu hiện tại, không phải app trắng.
- App **cần có mạng** để hoạt động. Mất mạng = không đọc/ghi được cho tới khi có mạng lại (xem
  banner đỏ báo lỗi kết nối nếu xảy ra).
- Đăng nhập một lần trên một trình duyệt là trình duyệt đó nhớ — không cần đăng nhập lại mỗi lần
  mở, trừ khi bấm **Đăng xuất** hoặc dọn dữ liệu trình duyệt.
- Vì dữ liệu dùng chung không phân quyền, tránh hai người sửa **cùng một dòng** cùng lúc — xem
  mục 7 trong Hướng dẫn sử dụng (trong app).

## In tem

Khổ tem cố định **4 × 2 inch** (nằm ngang). Khi hộp thoại in mở ra, đặt:

- Khổ giấy: **4 × 2 inch** (hướng **Ngang / Landscape**)
- Lề (Margins): **None**
- Tỷ lệ (Scale): **100%** — không chọn "Fit to page"
- Bật **Background graphics** để in được dải màu trạng thái

---

Hướng dẫn sử dụng đầy đủ nằm ngay trong app: mở app → bấm mục **Hướng dẫn sử dụng** trên thanh trên cùng.
