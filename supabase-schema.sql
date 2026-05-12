-- DRMAXX Supabase schema (idempotent)

create table if not exists products (
  id text primary key,
  name text not null,
  slug text unique not null,
  price numeric not null default 0,
  original_price numeric,
  rating numeric default 5,
  review_count integer default 0,
  badge text,
  quantity text default '',
  category text default '',
  description text default '',
  color text default '#F97316',
  image text,
  stock integer default 0,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists orders (
  id text primary key,
  order_no text unique not null,
  customer text,
  email text,
  phone text,
  address text,
  invoice_type text default 'bireysel',
  tc_kimlik text,
  vergi_no text,
  vergi_dairesi text,
  firma_adi text,
  items jsonb default '[]'::jsonb,
  total numeric default 0,
  status text default 'Beklemede',
  payment_method text,
  kupon_kod text,
  indirim numeric default 0,
  date text,
  source text,
  source_order_id text,
  created_at timestamptz default now()
);

create table if not exists cms_content (
  key text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists coupons (
  id text primary key,
  code text not null unique,
  type text not null check (type in ('percent', 'fixed')),
  value numeric not null default 0,
  min_order numeric not null default 0,
  max_uses integer,
  used_count integer not null default 0,
  expires_at text,
  active boolean not null default true,
  description text not null default '',
  created_at text not null default to_char(now(), 'YYYY-MM-DD')
);

create table if not exists affiliate_leads (
  id text primary key,
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  city text not null default '',
  instagram text not null default '',
  website text not null default '',
  channel text not null default '',
  message text not null default '',
  status text not null default 'new',
  admin_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists originality_records (
  id text primary key,
  lisans_kod text not null unique,
  qr_raw_value text not null default '',
  product_name text not null default '',
  product_slug text not null default '',
  serial_no text not null default '',
  batch_no text not null default '',
  production_date text not null default '',
  expiry_date text not null default '',
  sold_to_name text not null default '',
  sold_to_city text not null default '',
  sold_to_phone text not null default '',
  sold_at text not null default '',
  notes text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_users (
  id text primary key,
  email text not null unique,
  name text not null default '',
  image text,
  password_hash text,
  provider text not null default 'credentials' check (provider in ('google', 'credentials')),
  created_at timestamptz not null default now()
);

create table if not exists admin_users (
  id bigint generated always as identity primary key,
  name text not null default '',
  email text not null unique,
  role text not null default 'Editör',
  status text not null default 'Aktif',
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_created_at on orders(created_at desc);
create index if not exists idx_orders_order_no on orders(order_no);
create index if not exists idx_orders_kupon_kod on orders(kupon_kod);
create index if not exists idx_orders_source on orders(source);
create unique index if not exists idx_orders_source_order_unique on orders(source, source_order_id) where source is not null and source_order_id is not null;
create index if not exists idx_coupons_code on coupons(code);
create index if not exists idx_affiliate_leads_created_at on affiliate_leads(created_at desc);
create index if not exists idx_originality_lisans_kod on originality_records(lisans_kod);

alter table products disable row level security;
alter table orders disable row level security;
alter table cms_content disable row level security;
alter table coupons disable row level security;
alter table affiliate_leads disable row level security;
alter table originality_records disable row level security;
alter table app_users disable row level security;
alter table admin_users disable row level security;

insert into products (
  id, name, slug, price, original_price, rating, review_count, badge, quantity, category, description, color, image, stock, active
) values
('1', 'Sitikolin Plus+', 'sitikolin-plus', 1299, null, 4.8, 248, 'Çok Satan', '200ml', 'Beyin & Odak', 'Sitikolin, Omega-3 ve fosfatidilserin içeren sıvı takviye.', '#1D4ED8', '/products/sitikolin-plus.png', 142, true),
('2', 'Resveratrol Advance Complex', 'resveratrol-advance-complex', 1499, 1799, 4.7, 89, 'Yeni', '150ml', 'Antioksidan', 'Resveratrol, C Vitamini, Çinko ve Quercetin içeren sıvı takviye.', '#7C3AED', '/products/resveratrol-advance-complex.png', 58, true),
('3', 'NeuroDrops', 'neurodrops', 999, null, 4.9, 412, 'Çok Satan', '100ml', 'Beyin Sağlığı', 'B6 (Piridoksin) odaklı damla form takviye.', '#8B5CF6', '/products/neuro-drops.png', 307, true),
('4', 'Phospholipid Complex', 'phospholipid-complex', 1199, null, 4.6, 156, null, '200mlX2', 'Hücre Sağlığı', 'Fosfolipid, Krill Oil, Magnezyum L-Treonat ve B6 içeren formül.', '#0891B2', '/products/phospholipid-complex.png', 89, true),
('5', 'Karagen Kids', 'karagen-kids', 799, null, 4.8, 203, 'Çocuklara Özel', '150ml', 'Çocuk Sağlığı', 'Karagen içerikli çocuklara özel sıvı takviye.', '#3B82F6', '/products/karagen-kids.png', 213, true),
('6', 'Omega 3 Balık Yağı', 'omega-3-balik-yagi', 899, null, 4.7, 334, null, '30 Kapsül', 'Omega & Yağ Asitleri', 'Omega-3, sitikolin ve B vitaminleri içeren kapsül form.', '#D97706', '/products/omega-3.png', 175, true)
on conflict (id) do nothing;
