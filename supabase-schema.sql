-- Products tablosu
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

-- Orders tablosu
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
  items jsonb default '[]',
  total numeric default 0,
  status text default 'Beklemede',
  payment_method text,
  kupon_kod text,
  indirim numeric default 0,
  date text,
  created_at timestamptz default now()
);

-- Row Level Security kapat (admin panel direkt erişim için)
alter table products disable row level security;
alter table orders disable row level security;

-- Mevcut ürünleri ekle
insert into products (id, name, slug, price, original_price, rating, review_count, badge, quantity, category, description, color, image, stock, active) values
('1', 'Sitikolin Plus+', 'sitikolin-plus', 1230, null, 4.8, 248, 'Çok Satan', '200ml', 'Nörobilim', 'Sitikolin, Fosfatidilserin, Lion''s Mane Mantar Ekstresi, B Vitamini Kompleksi içeren sıvı takviye edici gıda.', '#1D4ED8', '/products/sitikolin-plus.png', 142, true),
('2', 'Resveratrol Advance Complex', 'resveratrol-advance-complex', 675, null, 4.7, 89, 'Yeni', '150ml', 'Antioksidan', 'Resveratrol, Quercetin, Laktoferrin, Vitamin C, Çinko Pikolinat, Vitamin D3 içeren sıvı takviye edici gıda.', '#7C3AED', '/products/resveratrol-advance-complex.png', 58, true),
('3', 'NeuroDrops', 'neurodrops', 980, null, 4.9, 412, 'Çok Satan', '100ml Damla', 'Nörobilim', 'B6 Vitamini (Piridoksin) içeren damlalık formülü takviye edici gıda.', '#8B5CF6', '/products/neuro-drops.png', 307, true),
('4', 'Phospholipid Complex', 'phospholipid-complex', 1199, null, 4.6, 156, null, '200mlX2', 'Beyin Sağlığı', 'Fosfolipidler, Kril Yağı (Omega-3, EPA, DHA, Astaksantin), Keten Tohumu Yağı, Magnezyum L-Treonat ve Vitamin B6 içeren sıvı takviye edici gıda.', '#0891B2', '/products/phospholipid-complex.png', 89, true),
('5', 'Karagen Kids', 'karagen-kids', 561, null, 4.8, 203, 'Çocuklara Özel', '150ml', 'Çocuk Sağlığı', 'Karagen Ekstresi, Kekik, Hatmi ve Meyan Kökü içeren bitkisel takviye edici gıda. Tatlandırıcı içerir.', '#3B82F6', '/products/karagen-kids.png', 213, true),
('6', 'Omega 3 Balık Yağı', 'omega-3-balik-yagi', 990, null, 4.7, 334, null, '30 Kapsül', 'Omega', 'Balık Yağı (Omega-3, EPA, DHA), Fosfatidilserin, Sitikolin, Koenzim Q10 ve B Vitamini Kompleksi içeren yumuşak kapsül takviye edici gıda.', '#D97706', '/products/omega-3.png', 175, true)
on conflict (id) do nothing;
