import { NextRequest, NextResponse } from "next/server";
import { products, type Product } from "@/data/products";

/**
 * POST /api/quiz
 *
 * Body:
 * {
 *   goal: "focus" | "energy" | "immunity" | "sleep" | "antiaging" | "kids"
 *   age?: number
 *   lifestyle?: "active" | "sedentary" | "moderate"
 * }
 *
 * Returns a ranked list of recommended products based on quiz answers.
 */

type Goal = "focus" | "energy" | "immunity" | "sleep" | "antiaging" | "kids";

const goalCategoryMap: Record<Goal, string[]> = {
  focus: ["Nörobilim", "Beyin Sağlığı"],
  energy: ["Antioksidan", "Omega"],
  immunity: ["Bağışıklık", "Vitaminler"],
  sleep: ["Nörobilim"],
  antiaging: ["Antioksidan"],
  kids: ["Çocuk Sağlığı"],
};

function scoreProduct(product: Product, goal: Goal, lifestyle?: string): number {
  let score = 0;
  const targetCategories = goalCategoryMap[goal] ?? [];

  if (targetCategories.includes(product.category)) score += 10;
  if (product.badge === "Çok Satan") score += 3;
  if (product.badge === "Uzman Önerisi") score += 4;
  if (goal === "kids" && product.badge === "Çocuklara Özel") score += 8;
  score += product.rating * 1.5;
  score += Math.min(product.reviewCount / 100, 3);
  if (lifestyle === "active") score += product.category === "Omega" ? 2 : 0;

  return score;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi.", code: "INVALID_BODY" },
      { status: 400 }
    );
  }

  const { goal, age, lifestyle } = body as {
    goal?: Goal;
    age?: number;
    lifestyle?: string;
  };

  const validGoals: Goal[] = ["focus", "energy", "immunity", "sleep", "antiaging", "kids"];

  if (!goal || !validGoals.includes(goal)) {
    return NextResponse.json(
      {
        error: "Geçerli bir hedef seçin.",
        code: "INVALID_GOAL",
        valid: validGoals,
      },
      { status: 422 }
    );
  }

  const scored = products
    .map((p) => ({ product: p, score: scoreProduct(p, goal, lifestyle) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ product }) => product);

  const goalLabels: Record<Goal, string> = {
    focus: "Odaklanma & Bilişsel Destek",
    energy: "Enerji & Vitalite",
    immunity: "Bağışıklık Güçlendirme",
    sleep: "Uyku & Rahatlama",
    antiaging: "Yaşlanma Karşıtı",
    kids: "Çocuk Sağlığı",
  };

  return NextResponse.json({
    goal,
    goalLabel: goalLabels[goal],
    age: age ?? null,
    lifestyle: lifestyle ?? null,
    recommendations: scored,
    total: scored.length,
    timestamp: new Date().toISOString(),
  });
}
