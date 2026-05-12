import { NextRequest, NextResponse } from "next/server";
import { getMergedProducts } from "@/lib/getProducts";

/**
 * GET /api/products
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const badge = searchParams.get("badge");
  const sort = searchParams.get("sort") ?? "popular";
  const limit = searchParams.get("limit");
  const q = searchParams.get("q");

  let result = await getMergedProducts();

  result = result.filter((p) => (p as { active?: boolean }).active !== false);

  if (category) {
    result = result.filter((p) => p.category.toLowerCase().includes(category.toLowerCase()));
  }
  if (badge) {
    result = result.filter((p) => p.badge === badge);
  }
  if (q) {
    const query = q.toLowerCase();
    result = result.filter(
      (p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query),
    );
  }

  switch (sort) {
    case "price_asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      result.sort((a, b) => b.rating - a.rating);
      break;
    default:
      result.sort((a, b) => b.reviewCount - a.reviewCount);
  }

  if (limit) result = result.slice(0, parseInt(limit, 10));

  return NextResponse.json({
    data: result,
    total: result.length,
    timestamp: new Date().toISOString(),
  });
}
