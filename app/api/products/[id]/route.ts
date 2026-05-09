import { NextRequest, NextResponse } from "next/server";
import { products as baseProducts } from "@/data/products";
import fs from "fs/promises";
import path from "path";

const CMS_FILE = path.join(process.cwd(), "data", "cms", "products.json");

async function readCms(): Promise<Record<string, Record<string, unknown>>> {
  try {
    const raw = JSON.parse(await fs.readFile(CMS_FILE, "utf-8")) as Array<{ id: string }>;
    const map: Record<string, Record<string, unknown>> = {};
    raw.forEach(p => { map[p.id] = p; });
    return map;
  } catch {
    return {};
  }
}

/**
 * GET /api/products/:id
 *
 * Returns a single product by id or slug, with CMS overrides merged in.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cmsMap = await readCms();

  const base = baseProducts.find(p => p.id === id || p.slug === id);

  if (!base) {
    return NextResponse.json(
      { error: "Ürün bulunamadı.", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  // Merge CMS overrides (price, badge, stock, active) over base product detail data
  const product = { ...base, ...(cmsMap[base.id] ?? {}) };

  // Related products (same category, excluding self) — also with CMS overrides
  const related = baseProducts
    .filter(p => p.category === base.category && p.id !== base.id)
    .map(p => ({ ...p, ...(cmsMap[p.id] ?? {}) }))
    .filter(p => (p as { active?: boolean }).active !== false)
    .slice(0, 3);

  return NextResponse.json({
    data: product,
    related,
    timestamp: new Date().toISOString(),
  });
}
