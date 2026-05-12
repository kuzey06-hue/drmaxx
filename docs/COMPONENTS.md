# DR.MAXX — Component Referansı

## UI Bileşenleri

---

### `<Button>`
`components/ui/Button.tsx`

CVA tabanlı, Radix Slot destekli buton bileşeni.

**Props**

| Prop | Tür | Varsayılan | Açıklama |
|---|---|---|---|
| `variant` | `primary \| outline \| ghost \| dark \| white` | `primary` | Görsel varyant |
| `size` | `sm \| md \| lg \| xl` | `md` | Boyut |
| `asChild` | `boolean` | `false` | Radix Slot ile render |
| `...ButtonHTMLAttributes` | — | — | Standart HTML buton özellikleri |

**Kullanım**
```tsx
import { Button } from "@/components/ui/Button";

<Button variant="primary" size="lg">Sepete Ekle</Button>
<Button variant="outline">Detaylar</Button>
<Button asChild><a href="/urunler">Tüm Ürünler</a></Button>
```

---

### `<Badge>`
`components/ui/Badge.tsx`

Ürün etiketi rozeti. Renk, etiket metnine göre otomatik belirlenir.

**Props**

| Prop | Tür | Açıklama |
|---|---|---|
| `label` | `string` | Rozet metni |
| `className` | `string?` | Ek CSS sınıfları |

**Desteklenen Etiketler ve Renkleri**

| Etiket | Renk |
|---|---|
| `Çok Satan` | Turuncu |
| `Yeni` | Yeşil |
| `Çocuklara Özel` | Mavi |
| `Uzman Önerisi` | Mor |

```tsx
import { Badge } from "@/components/ui/Badge";

<Badge label="Çok Satan" />
```

---

### `<StarRating>`
`components/ui/StarRating.tsx`

Yıldız puanı görüntüleyici.

**Props**

| Prop | Tür | Varsayılan | Açıklama |
|---|---|---|---|
| `rating` | `number` | — | 0–5 arası puan |
| `reviewCount` | `number?` | — | Yorum sayısı (opsiyonel) |
| `size` | `"sm" \| "md"` | `"sm"` | Yıldız boyutu |
| `className` | `string?` | — | Ek sınıflar |

```tsx
<StarRating rating={4.8} reviewCount={248} />
```

---

### `<ProductCard>`
`components/ui/ProductCard.tsx`

Tam özellikli ürün kartı. Animasyonlu, favoriye ekleme destekli.

**Props**

| Prop | Tür | Varsayılan | Açıklama |
|---|---|---|---|
| `product` | `Product` | — | Ürün verisi |
| `index` | `number?` | `0` | Stagger animasyonu için sıra indeksi |

```tsx
import { ProductCard } from "@/components/ui/ProductCard";
import { products } from "@/data/products";

<ProductCard product={products[0]} index={0} />
```

---

## Layout Bileşenleri

---

### `<Navbar>`
`components/layout/Navbar.tsx`

Sticky navigasyon + alt ingredient ticker. Mobil menü içerir.

**Özellikler**
- Sticky (`position: sticky; top: 0; z-index: 50`)
- Backdrop blur ile yarı-saydam dark arka plan
- Mobil hamburger menü (AnimatePresence ile)
- Alt ticker: `data/categories.ts` → `ingredients` dizisinden beslenir
- Sepet butonu turuncu vurgulu, ürün sayacı içerir

**Özelleştirme**
Nav linklerini `Navbar.tsx` içindeki `navLinks` dizisinden düzenle.

---

### `<Footer>`
`components/layout/Footer.tsx`

4 kolonlu full footer + sosyal medya + ödeme logoları.

**Özelleştirme**
Link gruplarını `footerLinks` objesinden düzenle:
```typescript
const footerLinks = {
  "Alışveriş": ["Tüm Ürünler", "..."],
  "Hesabım": ["..."],
  "Bilgi": ["..."],
};
```

---

## Section Bileşenleri

---

### `<Hero>`
Dark navy hero section. Ürün vitrin görseli + animasyonlu başlık.

**Veri Kaynağı**: `heroProducts` — `Hero.tsx` içinde inline tanımlı.

**Özelleştirme**
- Başlık metni: `Hero.tsx` içinde direkt düzenle
- Ürün kutuları: `heroProducts` dizisini güncelle (`name`, `color`)
- CTA butonu href'i: `<Button>` → `asChild` + `<a>` olarak dönüştür

---

### `<TrustBar>`
GMP / Klinik / Güvenli rozet şeridi (6 öğe, grid layout).

**Veri Kaynağı**: `trustItems` — `TrustBar.tsx` içinde inline.

---

### `<ProductFinder>`
Quiz CTA bloğu. 3 adımlı görsel akış.

**Veri Kaynağı**: `data/experts.ts` → `quizSteps`

---

### `<PopularProducts>`
6 kolonlu ürün grid'i. `<ProductCard>` bileşenini kullanır.

**Veri Kaynağı**: `data/products.ts` → `products`

---

### `<Testimonials>`
3 kullanıcı yorum kartı.

**Veri Kaynağı**: `data/testimonials.ts` → `testimonials`

---

### `<WhyDrMaxx>`
5 özellik + lab görseli 2 kolonlu layout.

**Veri Kaynağı**: `features` — `WhyDrMaxx.tsx` içinde inline.

---

### `<ExpertRecommendations>`
Doktor profili + sürüklenebilir ürün carousel.

**Veri Kaynağı**:
- `data/experts.ts` → `experts[0]`
- `data/products.ts` → `expert.recommendedProductIds` ile filtrelenmiş

---

### `<BottomTrustBar>`
5 öğeli garanti şeridi (kargo, ödeme, iade, destek).

**Veri Kaynağı**: `items` — `BottomTrustBar.tsx` içinde inline.

---

### `<Newsletter>`
E-posta abonelik formu. Submit sonrası başarı mesajı gösterir.

**Entegrasyon**: Form submit'i şu an state ile handle ediliyor.
Production için `subscribeNewsletter()` API helper'ına bağla:

```tsx
import { subscribeNewsletter } from "@/lib/api";

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  await subscribeNewsletter(email);
  setSubmitted(true);
};
```

---

## Animasyon Şablonları

### whileInView (standart)
```tsx
<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5, delay: index * 0.08 }}
>
```

### Stagger (liste öğeleri)
```tsx
{items.map((item, i) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: i * 0.07 }}
  >
```

### Hover lift (kartlar)
```tsx
<motion.div
  whileHover={{ y: -4, scale: 1.02 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
>
```
