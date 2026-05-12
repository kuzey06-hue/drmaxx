import { NextRequest, NextResponse } from "next/server";
import { testimonials } from "@/data/testimonials";

/**
 * GET /api/testimonials
 *
 * Query params:
 *   product – filter by product name (partial match)
 *   limit   – max results (default: all)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const product = searchParams.get("product");
  const limit = searchParams.get("limit");

  let result = [...testimonials];

  if (product) {
    result = result.filter((t) =>
      t.product.toLowerCase().includes(product.toLowerCase())
    );
  }

  if (limit) {
    result = result.slice(0, parseInt(limit, 10));
  }

  const avgRating =
    result.reduce((acc, t) => acc + t.rating, 0) / (result.length || 1);

  return NextResponse.json({
    data: result,
    total: result.length,
    averageRating: Math.round(avgRating * 10) / 10,
    timestamp: new Date().toISOString(),
  });
}
