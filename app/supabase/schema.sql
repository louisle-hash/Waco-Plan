-- ============================================================
-- WACO Plan App — Schema Supabase (đồng bộ dữ liệu chung)
-- ============================================================
-- Cách chạy: mở Supabase Dashboard -> SQL Editor -> New query
-- -> dán toàn bộ file này -> bấm Run. Chạy MỘT LẦN lúc thiết lập.
--
-- Mô hình bảng phản chiếu đúng schema IndexedDB hiện tại của app
-- (xem app/src/lib/db.ts) để việc chuyển đổi code không đổi ý nghĩa
-- dữ liệu, chỉ đổi nơi lưu.
-- ============================================================

create table if not exists public.products (
  id integer generated always as identity primary key,
  sku text not null unique,
  name text not null,
  size text not null default '',
  category text not null default '',
  default_status text,                    -- 'mattressFirm' | 'quilting' | 'priority' | 'putCover' | null
  default_pic text not null default '',
  notes text not null default '',
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weeks (
  id integer generated always as identity primary key,
  week_number int not null unique,
  updated_at timestamptz not null default now(),
  revised int not null default 0,
  visible_days int not null default 4,
  finalized boolean not null default false,
  finalized_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.week_rows (
  id integer generated always as identity primary key,
  week_id integer not null references public.weeks(id) on delete cascade,
  product_id integer not null references public.products(id),
  product_name text not null,             -- chụp lại lúc thêm dòng, không đổi khi sửa product sau này
  sku text not null,
  size text not null default '',
  name_color text,                        -- màu chữ tên sản phẩm, độc lập với màu ô ngày
  days jsonb not null default '{}'::jsonb, -- { mon: {qty, status}, tue: {...}, ... }
  pic text not null default '',
  remark text not null default '',
  sort_index int not null default 0
);

create table if not exists public.snapshots (
  id integer generated always as identity primary key,
  week_id integer not null references public.weeks(id) on delete cascade,
  week_number int not null,
  product_id integer not null references public.products(id),
  total int not null default 0
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null
);

-- Chỉ mục phục vụ truy vấn thường dùng
create index if not exists idx_week_rows_week_id on public.week_rows(week_id);
create index if not exists idx_week_rows_product_id on public.week_rows(product_id);
create index if not exists idx_snapshots_week_number on public.snapshots(week_number);
create index if not exists idx_products_sku on public.products(sku);

-- ============================================================
-- Bảo mật: bật Row Level Security, chỉ người ĐÃ ĐĂNG NHẬP
-- (tài khoản dùng chung cho cả xưởng) mới đọc/ghi được.
-- Người chưa đăng nhập (kể cả có được "anon key" công khai
-- trong file HTML) sẽ KHÔNG đọc/ghi được gì.
-- ============================================================

alter table public.products enable row level security;
alter table public.weeks enable row level security;
alter table public.week_rows enable row level security;
alter table public.snapshots enable row level security;
alter table public.settings enable row level security;

create policy "authenticated_full_access" on public.products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on public.weeks
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on public.week_rows
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on public.snapshots
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on public.settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================
-- Bật Realtime: để nhiều máy thấy cập nhật gần như ngay lập tức
-- khi có người khác sửa (không cần bấm tải lại trang).
-- ============================================================

alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.weeks;
alter publication supabase_realtime add table public.week_rows;
alter publication supabase_realtime add table public.snapshots;
alter publication supabase_realtime add table public.settings;
