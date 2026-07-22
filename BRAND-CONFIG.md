# Brand Config — Daily/Weekly Planning App

File này là **nguồn màu duy nhất** của app. Sửa giá trị ở đây (hoặc qua màn hình Cài đặt trong app) — không sửa màu rải rác trong code.

Giá trị brand bên dưới được lấy trực tiếp từ pixel của `AS_logo.png`.

## 1. Brand
- Brand name: American Star
- Tagline (nếu có): (bỏ trống)

## 2. Logo
- File logo: `AS_logo.png` (đặt cùng thư mục này; app copy vào `app/public/brand/`)
- Logo dùng ở đâu: thanh điều hướng (nav bar) trên cùng + màn hình in tem (góc trên label)

## 3. Màu thương hiệu (frontend bám theo các màu này)
- Primary (màu chủ đạo — nút bấm, thanh nav, tiêu đề): `#041E42`  (navy American Star)
- Secondary (màu phụ — nền phần section, badge): `#BF0C3E`  (đỏ crimson American Star)
- Accent (màu nhấn — số liệu nổi bật trên Dashboard): `#BF0C3E`
- Text màu chính: `#041E42`
- Nền tổng thể: `#FFFFFF`
- Muted / viền bảng: `#D9D9D6`  (xám bạc trong logo)
- Destructive (lỗi hệ thống — KHÁC màu trạng thái "Put cover"): `#DC2626`

## 4. Font chữ
- Font chính (body): `Fira Sans`
- Font số liệu (bảng, cột số): `Fira Code`

## 5. Màu trạng thái (status colors) — theo đúng bảng chú thích trong file kế hoạch tuần, GIỮ NGUYÊN, không đổi theo brand
- Mattress Firm: xanh lá `#22C55E`
- Quilting: vàng `#FACC15`
- Priority: tím/hồng `#C084FC`
- Put cover: đỏ `#EF4444`

> 4 màu này mang ý nghĩa nghiệp vụ (khớp bảng Excel gốc), không phải màu thương hiệu.
> Đổi màu brand ở mục 3 KHÔNG được làm đổi 4 màu này.
> Nhãn (label) của từng màu có thể sửa trong app ở panel chú thích màn hình Kế hoạch tuần.
