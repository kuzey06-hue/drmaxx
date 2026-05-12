import { NextResponse } from "next/server";
import { categories, ingredients } from "@/data/categories";
import { getMergedProducts } from "@/lib/getProducts";

/**
 * GET /api/categories
 *
 * Returns all categories enriched with live product counts.
 */
export async function GET() {
  const products = await getMergedProducts();
  const enriched = categories.map((cat) => ({
    ...cat,
    productCount: products.filter((p) =>
      p.category.toLowerCase().includes(cat.name.toLowerCase())
    ).length || cat.productCount,
  }));

  return NextResponse.json({
    data: enriched,
    ingredients,
    total: enriched.length,
    timestamp: new Date().toISOString(),
  });
}
