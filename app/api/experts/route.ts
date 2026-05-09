import { NextRequest, NextResponse } from "next/server";
import { experts } from "@/data/experts";
import { products } from "@/data/products";

/**
 * GET /api/experts
 *
 * Returns all experts, each populated with their recommended products.
 */
export async function GET(_req: NextRequest) {
  const enriched = experts.map((expert) => ({
    ...expert,
    recommendedProducts: products.filter((p) =>
      expert.recommendedProductIds.includes(p.id)
    ),
  }));

  return NextResponse.json({
    data: enriched,
    total: enriched.length,
    timestamp: new Date().toISOString(),
  });
}
