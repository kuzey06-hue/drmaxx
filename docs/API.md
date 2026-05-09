# DR.MAXX — API Dokümantasyonu

Base URL: `http://localhost:4001/api`

---

## Ürünler

### `GET /api/products`
Tüm ürünleri döndürür. Filtreleme ve sıralama destekler.

**Query Parametreleri**

| Parametre | Tür | Açıklama | Örnek |
|---|---|---|---|
| `category` | string | Kategori adına göre filtrele | `?category=Nörobilim` |
| `badge` | string | Rozete göre filtrele | `?badge=Çok Satan` |
| `sort` | string | Sıralama | `popular` \| `price_asc` \| `price_desc` \| `rating` |
| `limit` | number | Maksimum sonuç sayısı | `?limit=3` |
| `q` | string | Ad + açıklamada tam metin arama | `?q=omega` |

**Örnek İstek**
```
GET /api/products?sort=rating&limit=3&category=Nörobilim
```

**Başarılı Yanıt** `200 OK`
```json
{
  "data": [
    {
      "id": "3",
      "name": "NeuroDrops",
      "slug": "neurodrops",
      "price": 999,
      "rating": 4.9,
      "reviewCount": 412,
      "badge": "Çok Satan",
      "quantity": "50ml Damla",
      "category": "Nörobilim",
      "description": "Liposomal teknoloji ile üstün emilim",
      "color": "#2563EB"
    }
  ],
  "total": 1,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### `GET /api/products/:id`
Tek bir ürünü id veya slug ile getirir.

**Parametreler**

| Parametre | Açıklama |
|---|---|
| `id` | Ürün ID'si veya slug |

**Başarılı Yanıt** `200 OK`
```json
{
  "data": { ...product },
  "related": [ ...products ],
  "timestamp": "..."
}
```

**Hata Yanıtı** `404 Not Found`
```json
{
  "error": "Ürün bulunamadı.",
  "code": "NOT_FOUND"
}
```

---

## Kategoriler

### `GET /api/categories`
Tüm kategorileri ve ingredient listesini döndürür.

**Başarılı Yanıt** `200 OK`
```json
{
  "data": [
    {
      "id": "1",
      "name": "Nörobilim",
      "slug": "norobilim",
      "description": "Bilişsel destek ürünleri",
      "productCount": 2
    }
  ],
  "ingredients": ["Sitikolin", "Omega 3", "..."],
  "total": 8,
  "timestamp": "..."
}
```

---

## Yorumlar

### `GET /api/testimonials`
Kullanıcı yorumlarını döndürür.

**Query Parametreleri**

| Parametre | Tür | Açıklama |
|---|---|---|
| `product` | string | Ürün adına göre filtrele |
| `limit` | number | Maksimum sonuç |

**Başarılı Yanıt** `200 OK`
```json
{
  "data": [ ...testimonials ],
  "total": 3,
  "averageRating": 5.0,
  "timestamp": "..."
}
```

---

## Uzmanlar

### `GET /api/experts`
Uzman profillerini önerilen ürünleriyle birlikte döndürür.

**Başarılı Yanıt** `200 OK`
```json
{
  "data": [
    {
      "id": "1",
      "name": "Dr. Selim Çalışkan",
      "title": "Fonksiyonel Tıp Uzmanı",
      "recommendedProducts": [ ...products ]
    }
  ],
  "total": 1,
  "timestamp": "..."
}
```

---

## Bülten

### `POST /api/newsletter`
E-posta adresini bültene abone eder.

**Request Body**
```json
{ "email": "kullanici@ornek.com" }
```

**Başarılı Yanıt** `201 Created`
```json
{
  "message": "Bültenimize başarıyla abone oldunuz.",
  "code": "SUBSCRIBED",
  "email": "kullanici@ornek.com",
  "timestamp": "..."
}
```

**Hata Yanıtları**

| HTTP | Code | Açıklama |
|---|---|---|
| `422` | `INVALID_EMAIL` | Geçersiz e-posta formatı |
| `200` | `ALREADY_SUBSCRIBED` | Zaten abone |
| `400` | `INVALID_BODY` | Geçersiz JSON |

---

## Ürün Bulma Testi (Quiz)

### `POST /api/quiz`
Quiz yanıtlarına göre kişiselleştirilmiş ürün önerileri döndürür.

**Request Body**
```json
{
  "goal": "focus",
  "age": 32,
  "lifestyle": "active"
}
```

**Goal Değerleri**

| Değer | Açıklama |
|---|---|
| `focus` | Odaklanma & Bilişsel Destek |
| `energy` | Enerji & Vitalite |
| `immunity` | Bağışıklık Güçlendirme |
| `sleep` | Uyku & Rahatlama |
| `antiaging` | Yaşlanma Karşıtı |
| `kids` | Çocuk Sağlığı |

**Lifestyle Değerleri:** `active` | `sedentary` | `moderate`

**Başarılı Yanıt** `200 OK`
```json
{
  "goal": "focus",
  "goalLabel": "Odaklanma & Bilişsel Destek",
  "age": 32,
  "lifestyle": "active",
  "recommendations": [ ...top3Products ],
  "total": 3,
  "timestamp": "..."
}
```

**Hata Yanıtı** `422 Unprocessable`
```json
{
  "error": "Geçerli bir hedef seçin.",
  "code": "INVALID_GOAL",
  "valid": ["focus", "energy", "immunity", "sleep", "antiaging", "kids"]
}
```

---

## Hata Formatı (Genel)

Tüm endpoint'ler hata durumunda aynı yapıyı döndürür:

```json
{
  "error": "İnsan tarafından okunabilir hata mesajı",
  "code": "MAKINE_KODU"
}
```

## Client-Side Kullanım

```typescript
import { getProducts, submitQuiz, subscribeNewsletter } from "@/lib/api";

// Ürün listesi
const { data: products } = await getProducts({ sort: "rating", limit: 6 });

// Quiz sonucu
const result = await submitQuiz({ goal: "focus", lifestyle: "active" });

// Bülten aboneliği
await subscribeNewsletter("kullanici@ornek.com");
```
