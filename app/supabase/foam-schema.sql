-- ============================================================
-- WACO Plan App — Schema nhóm FOAM (đồng bộ dữ liệu chung)
-- ============================================================
-- Cách chạy: Supabase Dashboard -> SQL Editor -> New query -> dán
-- toàn bộ file này -> Run. Chạy MỘT LẦN khi thiết lập nhóm Foam.
-- (Chạy SAU schema.sql của nhóm Nệm; hai nhóm dùng chung project.)
--
-- File này chỉ có cấu trúc bảng. Dữ liệu nạp sẵn (mã foam, size, khách
-- hàng, giá bán) nằm ở foam-seed-data.sql, chạy riêng sau file này lúc
-- thiết lập máy mới.
-- ============================================================

-- ---------- Bảng ----------

create table if not exists public.foam_products (
  id integer generated always as identity primary key,
  foam_code text not null,                 -- Mã ASW (chuẩn), VD CFN30100W
  foam_dh text not null default '',         -- Mã HV/DH (alias), VD NFD16-H60
  density_lb numeric,                       -- Tỷ trọng lb/ft^3 (in trên tem)
  density_kg numeric,                       -- Tỷ trọng kg/m^3
  hardness integer,                         -- IFD / độ cứng
  description text not null default '',
  color text not null default '',
  base_thick numeric,                       -- Độ dày gốc (inch)
  customer_usual text not null default '',  -- Khách thường đặt
  remark text not null default '',
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.foam_customers (
  id integer generated always as identity primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

-- Bảng giá theo Khách hàng × Mã foam (dùng để tra đơn giá lúc lập invoice)
create table if not exists public.foam_prices (
  id integer generated always as identity primary key,
  customer text not null,
  foam_code text not null,
  customer_code text not null default '',   -- mã của khách hàng cho foam này
  customer_remark text not null default '',
  price numeric,                            -- USD / board-foot
  unique (customer, foam_code)
);

-- Bảng size chuẩn: (UNTRIM/TRIM-AS/TRIM-CUSTOM) × (T/F/Q/K/CK/S/W) -> W,L
create table if not exists public.foam_sizes (
  id integer generated always as identity primary key,
  size_basis text not null,
  size_code text not null,
  width numeric,
  length numeric,
  note text not null default '',
  unique (size_basis, size_code)
);

-- Header invoice
create table if not exists public.foam_invoices (
  id integer generated always as identity primary key,
  invoice_no text not null default '',
  customer text not null default '',
  invoice_date date,
  customer_po text not null default '',
  terms text not null default '',
  note text not null default '',
  freight numeric not null default 0,
  prepared_by text not null default '',
  loaded_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Dòng invoice. BDFT / pricing size / đơn giá / thành tiền được TÍNH ở app,
-- chỉ lưu dữ liệu nhập gốc để mở lại đúng.
create table if not exists public.foam_invoice_rows (
  id integer generated always as identity primary key,
  invoice_id integer not null references public.foam_invoices(id) on delete cascade,
  sort_index integer not null default 0,
  customer_part text not null default '',
  foam_code text not null default '',
  remark text not null default '',
  process text not null default 'UNTRIM',   -- UNTRIM | TRIM-AS | TRIM-CUSTOM
  size_code text not null default '',        -- T/F/Q/K/CK/S/W
  qty integer not null default 1,
  note text not null default '',
  raw_l numeric, raw_w numeric, raw_h numeric,     -- kích thước thô (untrim) L,W,H
  trim_l numeric, trim_w numeric, trim_h numeric   -- kích thước trim (nếu TRIM)
);

create index if not exists idx_foam_invoice_rows_invoice on public.foam_invoice_rows(invoice_id);
create index if not exists idx_foam_prices_lookup on public.foam_prices(customer, foam_code);
create index if not exists idx_foam_products_code on public.foam_products(foam_code);

-- ---------- Bảo mật (RLS): chỉ tài khoản đã đăng nhập ----------

alter table public.foam_products enable row level security;
alter table public.foam_customers enable row level security;
alter table public.foam_prices enable row level security;
alter table public.foam_sizes enable row level security;
alter table public.foam_invoices enable row level security;
alter table public.foam_invoice_rows enable row level security;

create policy "authenticated_full_access" on public.foam_products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on public.foam_customers
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on public.foam_prices
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on public.foam_sizes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on public.foam_invoices
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on public.foam_invoice_rows
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------- Realtime ----------

alter publication supabase_realtime add table public.foam_products;
alter publication supabase_realtime add table public.foam_customers;
alter publication supabase_realtime add table public.foam_prices;
alter publication supabase_realtime add table public.foam_sizes;
alter publication supabase_realtime add table public.foam_invoices;
alter publication supabase_realtime add table public.foam_invoice_rows;

