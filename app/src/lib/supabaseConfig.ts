/**
 * Cấu hình kết nối Supabase.
 *
 * Hai giá trị dưới đây được THIẾT KẾ ĐỂ CÔNG KHAI — đây là "anon public key",
 * không phải bí mật. Bảo mật thật sự nằm ở Row Level Security phía Supabase
 * (chỉ người đã đăng nhập mới đọc/ghi được — xem supabase/schema.sql).
 * KHÔNG bao giờ đặt service_role key ở đây hay bất kỳ đâu trong mã nguồn app.
 *
 * Điền 2 giá trị lấy từ Project Settings -> API sau khi làm xong
 * supabase/HUONG-DAN-THIET-LAP.md, rồi chạy lại `npm run build:single`.
 */

export const SUPABASE_URL = 'https://otdvrdcyhynbwpiiuyfm.supabase.co'
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90ZHZyZGN5aHluYndwaWl1eWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMDAwMTMsImV4cCI6MjA5Nzg3NjAxM30.Nk9fb0oeOHGh26Ent7015YMIZFuTuskasugpNtnSPuU'

/** Chưa điền cấu hình thật -> true. Dùng để hiện cảnh báo rõ ràng thay vì lỗi khó hiểu. */
export const SUPABASE_NOT_CONFIGURED =
  SUPABASE_URL.includes('YOUR-PROJECT-REF') || SUPABASE_ANON_KEY.includes('YOUR-ANON-PUBLIC-KEY')

/**
 * Email đăng nhập dùng chung cho cả xưởng — tạo 1 lần trong Supabase
 * Authentication > Users theo đúng hướng dẫn Bước 4. Người dùng chỉ cần gõ
 * mật khẩu, không cần biết/gõ email này.
 */
export const SHARED_LOGIN_EMAIL = 'waco@noreply.local'
