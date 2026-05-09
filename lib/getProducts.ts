import { products as baseProducts, Product } from "@/data/products";
import fs from "fs/promises";
import path from "path";

const CMS_FILE = path.join(process.cwd(), "data", "cms", "products.json");
const WP_API = process.env.WP_API_URL ?? "";

// ── WordPress API ──────────────────────────────────────────────────
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
          originalPrice: item.acf.indirimli_fiyat
            ? Number(item.acf.indirimli_fiyat)
            : undefined,
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

// ── JSON CMS (fallback) ────────────────────────────────────────────
async function readCms(): Promise<Record<string, Record<string, unknown>>> {
  try {
    const raw = JSON.parse(
      await fs.readFile(CMS_FILE, "utf-8")
    ) as Array<{ id: string; [key: string]: unknown }>;
    const map: Record<string, Record<string, unknown>> = {};
    raw.forEach((p) => { map[p.id] = p; });
    return map;
  } catch {
    return {};
  }
}

// ── Ana fonksiyonlar ───────────────────────────────────────────────
export async function getMergedProducts(): Promise<Product[]> {
  // WordPress API varsa oradan al, yoksa JSON CMS'e dön
  if (WP_API) {
    const wpProducts = await fetchFromWP();
    if (wpProducts.length > 0) return wpProducts;
  }

  const cmsMap = await readCms();
  return baseProducts
    .map((p) => ({ ...p, ...(cmsMap[p.id] ?? {}) } as Product))
    .filter((p) => (cmsMap[p.id]?.active as boolean | undefined) !== false);
}

export async function getMergedProduct(slug: string): Promise<Product | undefined> {
  const all = await getMergedProducts();
  return all.find((p) => p.slug === slug);
}
