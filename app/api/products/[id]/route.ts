import { NextRequest, NextResponse } from "next/server";
import { getMergedProducts } from "@/lib/getProducts";

/**
 * GET /api/products/:id
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const products = await getMergedProducts();

  const product = products.find((p) => p.id === id || p.slug === id);

  if (!product) {
    return NextResponse.json({ error: "Ürün bulunamadı.", code: "NOT_FOUND" }, { status: 404 });
  }

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .filter((p) => (p as { active?: boolean }).active !== false)
    .slice(0, 3);

  return NextResponse.json({
    data: product,
    related,
    timestamp: new Date().toISOString(),
  });
}
