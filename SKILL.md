# DR.MAXX — Site Skill

## Amaç
DR.MAXX premium takviye e-ticaret web sitesini Next.js 16 + Tailwind CSS v4 + Framer Motion ile oluşturmak ve geliştirmek için rehber skill dosyası.

## Proje Özeti
| Özellik | Değer |
|---|---|
| Framework | Next.js 16 (App Router) |
| Dil | TypeScript (strict) |
| Stil | Tailwind CSS v4 |
| Animasyon | Framer Motion v12 |
| İkonlar | Lucide React |
| Port | 4001 |
| Marka Rengi | `#F97316` (orange-500) |
| Arka Plan | `#070D1A` / `#0A0F1E` |

## Hızlı Başlangıç

```bash
cd C:\claude\drmax
npm install
npm run dev        # http://localhost:4001
npm run build      # production build kontrolü
```

## Proje Yapısı

```
drmax/
├── app/
│   ├── api/                  # Next.js App Router API routes
│   │   ├── products/
│   │   │   ├── route.ts      # GET /api/products
│   │   │   └── [id]/
│   │   │       └── route.ts  # GET /api/products/:id
│   │   ├── categories/
│   │   │   └── route.ts      # GET /api/categories
│   │   ├── testimonials/
│   │   │   └── route.ts      # GET /api/testimonials
│   │   ├── experts/
│   │   │   └── route.ts      # GET /api/experts
│   │   ├── newsletter/
│   │   │   └── route.ts      # POST /api/newsletter
│   │   └── quiz/
│   │       └── route.ts      # POST /api/quiz
│   ├── globals.css           # Tailwind v4 + brand token'ları
│   ├── layout.tsx            # Root layout + SEO metadata
│   └── page.tsx              # Anasayfa — tüm section'ları birleştirir
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx        # Sticky nav + ingredient ticker
│   │   └── Footer.tsx        # Full footer + ödeme logoları
│   ├── sections/
│   │   ├── Hero.tsx          # Dark hero + ürün vitrini
│   │   ├── TrustBar.tsx      # GMP / Klinik / Güvenli rozetleri
│   │   ├── ProductFinder.tsx # Quiz CTA bloğu
│   │   ├── PopularProducts.tsx   # 6-kolonlu ürün grid
│   │   ├── Testimonials.tsx  # 3 kullanıcı yorumu
│   │   ├── WhyDrMaxx.tsx     # Özellikler + lab görseli
│   │   ├── ExpertRecommendations.tsx  # Doktor + ürün carousel
│   │   ├── BottomTrustBar.tsx # Kargo / iade garantileri
│   │   └── Newsletter.tsx    # E-posta aboneliği
│   └── ui/
│       ├── Button.tsx        # CVA tabanlı buton varyantları
│       ├── Badge.tsx         # Ürün etiketi rozetleri
│       ├── StarRating.tsx    # Yıldız görüntüleme
│       └── ProductCard.tsx   # Tam ürün kartı
│
├── data/                     # Mock veri (prod'da DB/CMS ile değiştirilir)
│   ├── products.ts           # 6 ürün + tip tanımları
│   ├── testimonials.ts       # 3 kullanıcı yorumu
│   ├── categories.ts         # 8 kategori + ingredient listesi
│   └── experts.ts            # Uzman profilleri + quiz adımları
│
├── lib/
│   ├── utils.ts              # cn() + formatPrice()
│   └── api.ts                # Typed client-side API servis katmanı
│
└── docs/
    ├── API.md                # Tüm endpoint'lerin dokümantasyonu
    └── COMPONENTS.md         # Component API referansı
```

## Geliştirme Kuralları

### Yeni Section Eklemek
1. `components/sections/YeniSection.tsx` oluştur
2. `"use client"` yalnızca interaktif bileşenler için ekle
3. `motion.div` ile `whileInView + viewport={{ once: true }}` kullan
4. `app/page.tsx` içine import edip yerleştir

### Yeni API Endpoint Eklemek
1. `app/api/<endpoint>/route.ts` oluştur
2. `NextRequest` / `NextResponse` kullan
3. Hata yanıtlarında `{ error, code }` formatını koru
4. `lib/api.ts` içine typed helper ekle

### Yeni Ürün Eklemek
`data/products.ts` içindeki `products` dizisine ekle:
```typescript
{
  id: "7",
  name: "Ürün Adı",
  slug: "urun-adi",
  price: 999,
  rating: 4.5,
  reviewCount: 0,
  quantity: "30 Kapsül",
  category: "Kategori",
  description: "Kısa açıklama",
  color: "#HEX",  // kart gradient rengi
}
```

## Design Token'ları

| Token | Değer | Kullanım |
|---|---|---|
| Brand Orange | `#F97316` | CTA, vurgu, ikonlar |
| Brand Dark | `#EA580C` | Hover durumları |
| Navy BG | `#070D1A` | Hero, footer, dark section'lar |
| Navy Light | `#0A0F1E` | Navbar |
| Border Subtle | `rgba(255,255,255,0.1)` | Dark section kenarları |

## Tailwind v4 Notları
- Config: `@theme {}` bloğu `app/globals.css` içinde
- PostCSS plugin: `@tailwindcss/postcss` (`tailwindcss` değil)
- Keyframe `marquee` animasyonu globals.css içinde tanımlı

## Animasyon Standartları
```tsx
// Standart whileInView pattern
<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5, delay: index * 0.08 }}
>

// Hover lift
whileHover={{ y: -4, scale: 1.02 }}
transition={{ type: "spring", stiffness: 400, damping: 25 }}
```

## Üretim Notları

### Mock → Gerçek Veri Geçişi
| Dosya | Prod Karşılığı |
|---|---|
| `data/products.ts` | Shopify / WooCommerce API |
| `data/testimonials.ts` | Yotpo / Judge.me API |
| `data/experts.ts` | Headless CMS (Sanity, Contentful) |
| `app/api/newsletter/route.ts` | Klaviyo / Mailchimp API |

### Ortam Değişkenleri (.env.local)
```env
NEXT_PUBLIC_API_URL=          # boş bırakılırsa relative URL kullanılır
KLAVIYO_API_KEY=              # newsletter entegrasyonu
SHOPIFY_STOREFRONT_TOKEN=     # ürün verisi
```
