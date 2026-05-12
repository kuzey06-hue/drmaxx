import { products as baseProducts, Product } from "@/data/products";
import { supabaseAdmin } from "@/lib/supabase";

// ── Supabase'den ürünleri al ───────────────────────────────────────
async function fetchFromSupabase(): Promise<Product[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at");

    if (error || !data || data.length === 0) return [];

    return data.map((row) => {
      const base = baseProducts.find((p) => p.slug === row.slug);
      return {
        ...(base ?? {}),
        id: String(row.id),
        name: row.name,
        slug: row.slug,
        price: row.price ?? base?.price ?? 0,
        originalPrice: row.original_price ?? undefined,
        stock: row.stock ?? 0,
        quantity: row.quantity ?? base?.quantity ?? "",
        category: row.category ?? base?.category ?? "",
        badge: (row.badge as Product["badge"]) ?? base?.badge,
        color: row.color ?? base?.color ?? "#F97316",
        description: row.description ?? base?.description ?? "",
        rating: row.rating ?? base?.rating ?? 5,
        reviewCount: row.review_count ?? base?.reviewCount ?? 0,
        image: row.image ?? base?.image,
        active: row.active,
      } as Product;
    });
  } catch {
    return [];
  }
}

// ── WordPress API (ikinci öncelik) ────────────────────────────────
const WP_API = process.env.WP_API_URL ?? "";

interface WPProduct {
  id: number;
  slug: string;
  title: { rendered: string };
  acf: {
    fiyat?: number;
    indirimli_fiyat?: number | string;
    stok?: number;
    miktar?: string;
    kategori?: string;
    badge?: string;
    renk?: string;
    aciklama?: string;
    aktif?: boolean;
  };
}

async function fetchFromWP(): Promise<Product[]> {
  try {
    const res = await fetch(
      `${WP_API}/wp-json/wp/v2/urun?_fields=id,slug,title,acf&per_page=100`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) throw new Error("WP API error");
    const items: WPProduct[] = await res.json();
    return items
      .filter((item) => item.acf?.aktif !== false)
      .map((item) => {
        const base = baseProducts.find((p) => p.slug === item.slug);
        return {
          ...(base ?? {}),
          id: String(item.id),
          name: item.title.rendered,
          slug: item.slug,
          price: item.acf.fiyat ?? base?.price ?? 0,
          originalPrice: item.acf.indirimli_fiyat ? Number(item.acf.indirimli_fiyat) : undefined,
          stock: item.acf.stok ?? 0,
          quantity: item.acf.miktar ?? base?.quantity ?? "",
          category: item.acf.kategori ?? base?.category ?? "",
          badge: (item.acf.badge as Product["badge"]) ?? base?.badge,
          color: item.acf.renk ?? base?.color ?? "#F97316",
          description: item.acf.aciklama ?? base?.description ?? "",
          rating: base?.rating ?? 5,
          reviewCount: base?.reviewCount ?? 0,
          image: base?.image,
        } as Product;
      });
  } catch {
    return [];
  }
}

// ── Ana fonksiyonlar ───────────────────────────────────────────────
export async function getMergedProducts(): Promise<Product[]> {
  // 1. Supabase (öncelik)
  const sbProducts = await fetchFromSupabase();
  if (sbProducts.length > 0) return sbProducts;

  // 2. WordPress API
  if (WP_API) {
    const wpProducts = await fetchFromWP();
    if (wpProducts.length > 0) return wpProducts;
  }

  // 3. Statik fallback
  return baseProducts;
}

export async function getMergedProduct(slug: string): Promise<Product | undefined> {
  const all = await getMergedProducts();
  return all.find((p) => p.slug === slug);
}
