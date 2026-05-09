# DR.MAXX — Premium Supplement Website

Next.js 16 + TypeScript + Tailwind CSS v4 + Framer Motion

## Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion v12
- **Icons**: Lucide React
- **UI Primitives**: Radix UI

## Getting Started

```bash
npm install
npm run dev   # http://localhost:4001
```

## Project Structure

```
drmax/
├── app/                    # Next.js App Router
│   ├── globals.css         # Tailwind v4 theme + brand tokens
│   ├── layout.tsx          # Root layout + metadata
│   └── page.tsx            # Homepage — assembles all sections
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx      # Sticky nav + ingredient ticker
│   │   └── Footer.tsx      # Full footer + payment logos
│   ├── sections/
│   │   ├── Hero.tsx        # Dark hero + product showcase
│   │   ├── TrustBar.tsx    # GMP / Klinik / Güvenli badges
│   │   ├── ProductFinder.tsx   # Quiz CTA block
│   │   ├── PopularProducts.tsx # 6-column product grid
│   │   ├── Testimonials.tsx    # 3 review cards
│   │   ├── WhyDrMaxx.tsx       # Features + lab visual
│   │   ├── ExpertRecommendations.tsx  # Doctor + product carousel
│   │   ├── BottomTrustBar.tsx  # Shipping / return guarantees
│   │   └── Newsletter.tsx      # Email signup
│   └── ui/
│       ├── Button.tsx      # CVA-based button variants
│       ├── Badge.tsx       # Product label badges
│       ├── StarRating.tsx  # Star display component
│       └── ProductCard.tsx # Full product card
├── data/
│   ├── products.ts         # 6 mock products with colors
│   ├── testimonials.ts     # 3 user reviews
│   ├── categories.ts       # 8 categories + ingredient list
│   └── experts.ts          # Expert profiles + quiz steps
└── lib/
    └── utils.ts            # cn() + formatPrice()
```

## Brand
- **Primary color**: `#F97316` (orange-500)
- **Navy**: `#070D1A` / `#0A0F1E`
- **Port**: 4001
