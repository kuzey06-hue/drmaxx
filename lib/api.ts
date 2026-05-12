/**
 * DR.MAXX — Client-side API service layer
 *
 * Wraps all /api/* routes with typed fetch helpers.
 * Use these in Client Components ("use client") or server actions.
 */

import type { Product } from "@/data/products";
import type { Testimonial } from "@/data/testimonials";
import type { Category } from "@/data/categories";
import type { Expert } from "@/data/experts";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function fetcher<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Products ────────────────────────────────────────────────────────────────

export interface ProductsResponse {
  data: Product[];
  total: number;
  timestamp: string;
}

export interface ProductResponse {
  data: Product;
  related: Product[];
  timestamp: string;
}

export type ProductSort = "popular" | "price_asc" | "price_desc" | "rating";

export interface GetProductsParams {
  category?: string;
  badge?: string;
  sort?: ProductSort;
  limit?: number;
  q?: string;
}

export function getProducts(params: GetProductsParams = {}): Promise<ProductsResponse> {
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.badge) qs.set("badge", params.badge);
  if (params.sort) qs.set("sort", params.sort);
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.q) qs.set("q", params.q);
  const query = qs.toString();
  return fetcher<ProductsResponse>(`/api/products${query ? `?${query}` : ""}`);
}

export function getProduct(id: string): Promise<ProductResponse> {
  return fetcher<ProductResponse>(`/api/products/${id}`);
}

// ─── Categories ──────────────────────────────────────────────────────────────

export interface CategoriesResponse {
  data: Category[];
  ingredients: string[];
  total: number;
  timestamp: string;
}

export function getCategories(): Promise<CategoriesResponse> {
  return fetcher<CategoriesResponse>("/api/categories");
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export interface TestimonialsResponse {
  data: Testimonial[];
  total: number;
  averageRating: number;
  timestamp: string;
}

export function getTestimonials(params?: { product?: string; limit?: number }): Promise<TestimonialsResponse> {
  const qs = new URLSearchParams();
  if (params?.product) qs.set("product", params.product);
  if (params?.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return fetcher<TestimonialsResponse>(`/api/testimonials${query ? `?${query}` : ""}`);
}

// ─── Experts ──────────────────────────────────────────────────────────────────

export interface ExpertsResponse {
  data: (Expert & { recommendedProducts: Product[] })[];
  total: number;
  timestamp: string;
}

export function getExperts(): Promise<ExpertsResponse> {
  return fetcher<ExpertsResponse>("/api/experts");
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

export interface NewsletterResponse {
  message: string;
  code: string;
  email: string;
  timestamp: string;
}

export function subscribeNewsletter(email: string): Promise<NewsletterResponse> {
  return fetcher<NewsletterResponse>("/api/newsletter", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export type QuizGoal = "focus" | "energy" | "immunity" | "sleep" | "antiaging" | "kids";

export interface QuizPayload {
  goal: QuizGoal;
  age?: number;
  lifestyle?: "active" | "sedentary" | "moderate";
}

export interface QuizResponse {
  goal: QuizGoal;
  goalLabel: string;
  age: number | null;
  lifestyle: string | null;
  recommendations: Product[];
  total: number;
  timestamp: string;
}

export function submitQuiz(payload: QuizPayload): Promise<QuizResponse> {
  return fetcher<QuizResponse>("/api/quiz", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
