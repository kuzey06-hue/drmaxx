import { NextRequest, NextResponse } from "next/server";
import { products as baseProducts } from "@/data/products";
import fs from "fs/promises";
import path from "path";

const CMS_FILE = path.join(process.cwd(), "data", "cms", "products.json");

async function readCms(): Promise<Record<string, Record<string, unknown>>> {
  try {
    const raw = JSON.parse(await fs.readFile(CMS_FILE, "utf-8")) as Array<{ id: string; [key: string]: unknown }>;
    const map: Record<string, Record<string, unknown>> = {};
    raw.forEach(p => { map[p.id] = p; });
    return map;
  } catch {
    return {};
  }
}

/**
 * GET /api/products
 *
 * Query params:
 *   category  – filter by category name (case-insensitive)
 *   badge     – filter by badge label
 *   sort      – "price_asc" | "price_desc" | "rating" | "popular" (default)
 *   limit     – max number of results (default: all)
 *   q         – full-text search on name + description
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const badge = searchParams.get("badge");
  const sort = searchParams.get("sort") ?? "popular";
  const limit = searchParams.get("limit");
  const q = searchParams.get("q");

  const cmsMap = await readCms();

  // Merge CMS overrides into base products
  let result = baseProducts.map(p => ({
    ...p,
    ...(cmsMap[p.id] ?? {}),
  }));

  // Hide inactive products
  result = result.filter(p => (cmsMap[p.id]?.active as boolean | undefined) !== false);

  // Filter
  if (category) {
    result = result.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
  }
  if (badge) {
    result = result.filter(p => p.badge === badge);
  }
  if (q) {
    const query = q.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }

  // Sort
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

  // Limit
  if (limit) {
    result = result.slice(0, parseInt(limit, 10));
  }

  return NextResponse.json({
    data: result,
    total: result.length,
    timestamp: new Date().toISOString(),
  });
}
