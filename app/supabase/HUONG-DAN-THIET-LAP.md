# Hướng dẫn thiết lập Supabase (làm một lần)

Đây là phần **bạn tự làm** — tôi không được phép tự đăng ký tài khoản thay bạn. Làm xong bước 5, gửi
lại tôi 2 giá trị để tôi nối vào app. Mất khoảng 10 phút.

## Bước 1 — Tạo tài khoản

1. Vào [supabase.com](https://supabase.com) → bấm **Start your project**
2. Đăng ký bằng email hoặc tài khoản GitHub/Google — **miễn phí**, không cần thẻ tín dụng cho gói Free

## Bước 2 — Tạo Project

1. Bấm **New project**
2. Đặt tên: `waco-plan-app`
3. **Database Password**: đặt một mật khẩu mạnh — đây là mật khẩu quản trị database, KHÁC với mật khẩu
   đăng nhập app mà cả xưởng dùng chung ở Bước 4. Lưu mật khẩu này lại nơi an toàn (không cần nhớ,
   chỉ dùng khi cần truy cập sâu vào database).
4. Region: chọn **Southeast Asia (Singapore)** — gần Việt Nam nhất, tốc độ tốt nhất
5. Bấm **Create new project**, đợi khoảng 2 phút để khởi tạo

## Bước 3 — Chạy kịch bản tạo bảng

1. Trong project vừa tạo, vào menu bên trái → **SQL Editor**
2. Bấm **New query**
3. Mở file `schema.sql` (nằm cùng thư mục với file hướng dẫn này), copy toàn bộ nội dung, dán vào
4. Bấm **Run** (hoặc Ctrl/Cmd + Enter)
5. Thấy thông báo **Success** là xong — việc này tạo đủ 5 bảng dữ liệu + khoá bảo mật

## Bước 4 — Tạo tài khoản đăng nhập dùng chung cho cả xưởng

1. Vào menu bên trái → **Authentication** → tab **Users**
2. Bấm **Add user** → **Create new user**
3. Email: gõ bất kỳ, ví dụ `waco@noreply.local` (không cần là email thật, không gửi mail nào cả)
4. Password: đặt **mật khẩu chung cho cả xưởng dùng để mở app** — cái này mọi người sẽ gõ mỗi khi
   mở app trên máy mới. Chọn thứ dễ nhớ, dễ đọc qua điện thoại cho đồng nghiệp.
5. Tick **Auto Confirm User** (nếu có) rồi bấm **Create user**

## Bước 5 — Lấy 2 giá trị gửi lại cho tôi

1. Vào menu bên trái → **Project Settings** (biểu tượng bánh răng) → **API**
2. Copy 2 giá trị:
   - **Project URL** (dạng `https://xxxxxxxxxxxx.supabase.co`)
   - **anon public** key (chuỗi dài bắt đầu `eyJ...`)
3. Gửi 2 giá trị đó cho tôi (qua chat) để tôi nối vào app

> **An toàn khi gửi:** 2 giá trị trên **được thiết kế để công khai** — bản thân Supabase gọi đúng
> tên là "anon **public** key". KHÔNG gửi **service_role key** (một key khác cũng trong trang đó,
> có chữ "secret") và KHÔNG gửi Database Password ở Bước 2 — hai thứ đó phải giữ kín.

---

Sau khi có 2 giá trị này, tôi sẽ:
- Nối app vào Supabase, thêm màn hình đăng nhập bằng mật khẩu chung ở Bước 4
- Chuyển toàn bộ tính năng (sản phẩm, kế hoạch tuần, chốt tuần...) sang đọc/ghi trên Supabase
- Làm công cụ đẩy dữ liệu bạn đã nhập trên máy này (kể cả Tuần 29) lên Supabase, để không mất
- Kiểm tra kỹ bằng cách mở app ở 2 "trình duyệt" khác nhau, xác nhận sửa ở bên này thì bên kia thấy
