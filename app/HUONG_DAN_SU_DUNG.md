# Hướng dẫn sử dụng — App Kế hoạch sản xuất WACO

Tài liệu này viết cho người dùng tại xưởng, không cần biết kỹ thuật.

---

## 0. Những điều cần biết trước

- App cần **có mạng** để chạy — dữ liệu (sản phẩm, kế hoạch tuần) nằm trên máy chủ dùng chung
  (Supabase), không còn nằm riêng trên từng máy nữa.
- **Mở trên máy nào cũng thấy đúng một dữ liệu** — người khác sửa kế hoạch tuần thì bạn thấy cập
  nhật gần như ngay lập tức, không cần bấm tải lại trang.
- Lần đầu mở app (trên mỗi máy) sẽ hiện màn hình **Đăng nhập**, gõ mật khẩu dùng chung của xưởng.
  Đăng nhập một lần là máy đó nhớ, lần sau mở lại không cần gõ lại (trừ khi bấm Đăng xuất).
- Vì dữ liệu dùng chung, **ai cũng sửa được** — không có phân quyền theo người dùng ở phiên bản này.
  Cẩn thận khi sửa/xoá, đặc biệt ở màn hình Cài đặt.

Thanh menu dọc bên trái có: **Tổng quan · Kế hoạch tuần · Dữ liệu sản phẩm · In tem · Cài đặt ·
Hướng dẫn sử dụng · Đăng xuất**.

Nút **Thu gọn** ở đáy menu làm menu co lại chỉ còn icon, nhường chỗ cho bảng kế hoạch — tiện khi bạn hiện đủ 7 cột ngày.

Muốn đổi ngôn ngữ, dùng hai nút ở mục **Ngôn ngữ** gần đáy menu (Tiếng Việt / English). App nhớ lựa chọn của bạn.

Nếu thấy dòng chữ đỏ **"Không tải được dữ liệu mới nhất — kiểm tra kết nối mạng"** ở đầu trang: mạng
đang có vấn đề, số liệu hiện trên màn hình có thể chưa phải mới nhất. Kiểm tra wifi rồi thử lại.

---

## 1. Bắt đầu: nạp danh sách sản phẩm

Phải có sản phẩm trong danh mục trước, rồi mới lập kế hoạch tuần được.

### Cách A — Nhập hàng loạt từ file Excel (khuyên dùng khi mới bắt đầu)

1. Vào **Dữ liệu sản phẩm**.
2. Bấm nút **Nhập từ Excel**.
3. Nếu chưa có file đúng mẫu: bấm **Tải file Excel mẫu**, mở file vừa tải, điền danh sách sản phẩm vào, lưu lại.
4. Bấm ô chọn file, chọn file Excel của bạn.
   - Nếu file có nhiều sheet, chọn đúng sheet ở ô **Sheet cần nhập**.
5. **Bước 2 — Ghép cột**: app tự đoán cột nào ứng với thông tin nào. Kiểm tra lại:
   - Cột nào không có trong file thì chọn **— bỏ qua —**.
   - Hai mục có dấu `*` (**Mã SKU**, **Tên sản phẩm**) bắt buộc phải có.
6. **Bước 3 — Kiểm tra**: xem bảng xem trước.
   - Dòng nền **đỏ** = bị lỗi (thiếu SKU hoặc thiếu tên) → sẽ không được nạp.
   - Dòng nền **vàng** = SKU đã có sẵn trong app. Chọn một trong hai:
     - *Bỏ qua, giữ nguyên dữ liệu cũ* (mặc định, an toàn)
     - *Ghi đè bằng dữ liệu trong file*
7. Bấm nút **Nạp … sản phẩm** ở góc dưới bên phải.

> Muốn sửa file Excel rồi nạp lại cũng được — SKU trùng sẽ không bị nhân đôi.

### Cách B — Tạo từng sản phẩm trong app

1. Vào **Dữ liệu sản phẩm** → bấm **Thêm sản phẩm**.
2. Điền: **Mã SKU** (không được trùng), **Tên sản phẩm** (hai ô bắt buộc), và nếu có: Kích thước, Dòng sản phẩm, PIC, Màu trạng thái mặc định, Ghi chú.
3. Bấm **Lưu**.

### Sửa, tìm và lưu trữ sản phẩm

- **Tìm**: gõ vào ô Tìm kiếm (theo tên, SKU hoặc size), hoặc lọc theo Dòng sản phẩm.
- **Sửa**: bấm **Sửa** ở cuối dòng.
- **Ngừng dùng một sản phẩm**: bấm **Lưu trữ**. Sản phẩm bị ẩn khỏi danh sách chọn nhưng **không mất**; tick "Hiện cả hàng đã lưu trữ" để xem lại và bấm **Khôi phục** khi cần.

---

## 2. Lập kế hoạch tuần (màn hình chính)

Vào **Kế hoạch tuần**. Bảng này mô phỏng đúng bảng Excel cũ.

### 2.1 Phần đầu bảng

- **Week**: số tuần. Sửa được, nhưng không được trùng số tuần đã có.
- **Updated**: ngày cập nhật, app tự điền, bạn sửa tay được.
- **Revised**: đếm số lần bảng bị sửa, **tự tăng**. Bấm **Reset** để đưa về 0.
- **Số cột ngày**: chọn Mon–Thu (mặc định) hoặc mở rộng tới Mon–Sun.

### 2.2 Chú thích màu

Khung bên phải hiện 4 màu quy ước:

| Màu | Ý nghĩa mặc định |
|-----|------------------|
| Xanh lá | Mattress Firm |
| Vàng | Quilting |
| Tím | Priority |
| Đỏ | Put cover |

Bấm **Sửa nhãn** để đổi chữ. **Màu thì cố định**, không đổi được — để mọi người trong xưởng luôn hiểu giống nhau.

### 2.3 Thêm sản phẩm vào bảng

1. Bấm **Thêm sản phẩm vào bảng** ở cuối bảng.
2. Gõ tìm, tick chọn (chọn được nhiều cùng lúc). Sản phẩm đã có trong bảng sẽ bị mờ đi.
3. Nếu sản phẩm chưa có trong danh mục: dùng khung **Thêm nhanh sản phẩm chưa có** ở dưới — điền SKU, Tên, Size rồi bấm **Tạo & chọn**.
4. Bấm **Thêm … sản phẩm**.

### 2.4 Nhập số lượng và tô màu

Trong mỗi dòng sản phẩm:

- **Nhập số**: bấm vào ô của ngày tương ứng và gõ số lượng.
- **Tô màu nền ô**: bấm vào **ô vuông nhỏ** ở góc phải trong ô đó. Mỗi lần bấm chuyển sang màu kế tiếp: không màu → xanh lá → vàng → tím → đỏ → quay lại không màu.
- **Tô màu chữ tên sản phẩm**: bấm thẳng vào **tên sản phẩm** ở cột đầu. Cũng đổi vòng như trên.
  (Màu chữ và màu nền ô là hai thứ riêng biệt, giống hệt file Excel cũ.)
- **PIC** và **Remark**: gõ trực tiếp vào ô.
- **Xoá một dòng khỏi tuần**: bấm biểu tượng thùng rác cuối dòng. (Chỉ xoá khỏi tuần này, sản phẩm vẫn còn trong danh mục.)

Các cột tự tính, không cần nhập tay:

- **Total** = tổng số lượng của tất cả các ngày trong dòng đó.
- **Last week** = tổng của chính sản phẩm đó ở **tuần trước đã chốt**.
- **Dòng Tổng cộng** ở đầu bảng cộng theo từng ngày và tổng chung.

### 2.5 In kế hoạch phát cho xưởng (A4 ngang)

Bấm nút **In / PDF (A4 ngang)** ở góc trên bên phải.

Bản in ra là một bảng sạch — không có ô nhập liệu, không có nút bấm — gồm: logo, tiêu đề
WEEKLY PRODUCTION SCHEDULE, chú thích 4 màu, dòng Week/Updated/Revised, toàn bộ bảng kế hoạch
kèm màu ô, và dòng Tổng cộng.

Trong hộp thoại in, đặt:

- Khổ giấy (Paper size): **A4**
- Hướng (Layout / Orientation): **Ngang (Landscape)**
- Tỷ lệ (Scale): **100%** hoặc *Default* — không chọn "Fit to page"
- Bật **Background graphics** — nếu tắt, các ô màu trạng thái sẽ in ra trắng trơn và mất hết ý nghĩa

**Lưu file PDF thay vì in giấy:** trong hộp thoại in, ở mục máy in chọn **Save as PDF**
(macOS) hoặc **Microsoft Print to PDF** (Windows), rồi bấm Save.

> Nếu bảng dài hơn một trang, dòng tiêu đề (PRODUCT / Total / Monday…) sẽ tự lặp lại ở đầu mỗi
> trang, và không có sản phẩm nào bị cắt đôi giữa hai trang.

### 2.6 Chốt tuần và mở tuần mới

- **Chốt tuần**: khi kế hoạch đã xong. App hỏi xác nhận, sau đó:
  - Bảng bị **khoá**, không sửa được nữa (tránh sửa nhầm số liệu đã phát đi xưởng).
  - Tổng của tuần này trở thành cột **Last week** của tuần kế tiếp.
- **Nhân bản tuần này**: tạo tuần mới giữ nguyên danh sách sản phẩm và PIC, **xoá hết số lượng** để nhập mới. Dùng cách này cho nhanh hằng tuần.
- **Tuần mới trống**: tạo tuần trắng hoàn toàn.
- Muốn xem lại tuần cũ: chọn ở ô thả xuống cạnh tiêu đề.

---

## 3. Xem Tổng quan

Vào **Tổng quan**. Màn hình này **tự tính lại** từ bảng kế hoạch, không phải nhập lại gì cả.

Bạn thấy được:

- **Tổng kế hoạch tuần này** và **Tổng tuần trước**.
- **So với tuần trước**: chênh lệch số lượng và phần trăm (xanh = tăng, đỏ = giảm).
- **Sản lượng theo ngày**: biểu đồ cột. Rê chuột lên cột để xem con số.
- **Theo nhóm trạng thái**: mỗi màu có bao nhiêu sản lượng, bao nhiêu ô, bao nhiêu sản phẩm.
- **Cần chú ý**: danh sách các mục được đánh dấu **Priority** hoặc **Put cover** — nên xem mục này mỗi sáng.
- **Số lần sửa (Revised)** của tuần.

---

## 4. In tem 4×2 inch (nằm ngang)

Vào **In tem**.

1. Chọn tuần ở ô thả xuống góc phải.
2. Tick chọn các dòng cần in (hoặc bấm **Chọn tất cả**). Chỉ những dòng **đã có số lượng** mới hiện ra ở đây.
3. Tuỳ chọn **Tách tem theo từng ngày**:
   - **Không tick**: mỗi sản phẩm 1 tem, số lượng = tổng cả tuần.
   - **Có tick**: mỗi sản phẩm mỗi ngày 1 tem riêng.
4. Xem khung **Xem trước** bên phải để kiểm tra tem.
5. Bấm nút **In …** → hộp thoại in của trình duyệt mở ra.

**Quan trọng — đặt đúng thông số in:**

- Khổ giấy (Paper size): **4 × 2 inch** (hướng **Ngang / Landscape**)
- Lề (Margins): **None / Không lề**
- Tỷ lệ (Scale): **100%**, KHÔNG chọn "Fit to page"
- Nếu muốn in cả màu dải trạng thái: bật **Background graphics**

Mỗi tem in ra đúng 1 trang, theo thứ tự dòng trong bảng kế hoạch.

Tem cố tình để tối giản, chỉ gồm: **dải màu trạng thái + số tuần** ở trên, rồi **tên sản phẩm và
size cỡ lớn** — để công nhân đọc được từ xa khi tem đã dán lên nệm. Không có logo, SKU, số lượng,
PIC hay ghi chú.

> Tên sản phẩm dài sẽ tự động thu nhỏ cỡ chữ để không tràn ra ngoài tem.

---

## 5. Cài đặt

Vào **Cài đặt** để đổi nhận diện thương hiệu:

- **Tên thương hiệu** và **Logo** (ảnh PNG, tối đa 1.5MB) — logo hiện ở thanh trên và trên tem in.
- **Màu thương hiệu**: bấm ô màu để chọn, hoặc gõ mã màu dạng `#041E42`. Giao diện đổi ngay để bạn xem trước.
- **Font chữ**.
- Bấm **Lưu cài đặt** để giữ lại. Bấm **Khôi phục mặc định** để quay về màu chuẩn American Star.

> **4 màu trạng thái sản xuất không đổi được** ở đây — đó là quy ước nghiệp vụ dùng chung, cố tình khoá lại để không ai sửa nhầm.

**Vùng nguy hiểm** ở cuối trang xoá sạch mọi dữ liệu (sản phẩm + tất cả các tuần). Phải gõ đúng chữ `XOA TAT CA` mới bấm được. **Không khôi phục lại được.**

---

## 6. Xử lý sự cố thường gặp

| Hiện tượng | Cách xử lý |
|---|---|
| Mở app không thấy dữ liệu | Kiểm tra kết nối mạng. Nếu vẫn không thấy, thử đăng xuất rồi đăng nhập lại. |
| Không đăng nhập được | Kiểm tra gõ đúng mật khẩu dùng chung (phân biệt hoa/thường). Hỏi người quản trị nếu quên. |
| Sửa xong không thấy máy khác cập nhật | Kiểm tra mạng ở cả hai máy. App tự cập nhật khi có mạng, không cần bấm tải lại. |
| Cột "Last week" trống trơn | Cột này chỉ có số khi tuần trước **đã được bấm Chốt tuần**. |
| Không sửa được bảng kế hoạch | Tuần đó đã chốt (có chữ "ĐÃ CHỐT — chỉ xem"). Tạo tuần mới bằng **Nhân bản tuần này**. |
| Tem in ra bị nhỏ / lệch | Xem lại mục 4: khổ 4×2 inch (hướng Ngang), lề None, tỷ lệ 100%, không chọn Fit to page. |
| Tem in ra bị dọc thay vì ngang | Trong hộp thoại in chọn hướng **Landscape / Ngang**. |
| Tem in ra mất màu dải trạng thái | Bật **Background graphics** trong hộp thoại in. |
| Bản kế hoạch in ra bị dọc, cắt mất cột bên phải | Trong hộp thoại in chọn hướng **Landscape (ngang)**. |
| Bản kế hoạch in ra mất màu các ô | Bật **Background graphics** trong hộp thoại in. |
| Nhập Excel báo dòng đỏ | Dòng đó thiếu Mã SKU hoặc Tên sản phẩm. Bổ sung trong file Excel rồi nạp lại. |
| Nhập Excel nhưng không thấy sản phẩm mới | Có thể SKU đã tồn tại và bạn chọn "Bỏ qua". Chọn "Ghi đè bằng dữ liệu trong file" rồi nạp lại. |

---

## 7. Khuyến nghị vận hành

- Chốt tuần **ngay khi kế hoạch đã phát cho xưởng**, để số liệu tuần trước luôn chính xác.
- Xem mục **Cần chú ý** trên Tổng quan mỗi đầu ca.
- Vì nhiều máy có thể cùng sửa một lúc mà không có cảnh báo xung đột, nên tránh hai người cùng sửa
  **cùng một dòng** trong cùng một lúc — ai lưu sau sẽ ghi đè người lưu trước.
