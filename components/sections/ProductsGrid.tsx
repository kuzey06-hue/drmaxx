"use client";

import { Product } from "@/data/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { motion } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";

const BADGES = ["Tümü", "Çok Satan", "Yeni", "Çocuklara Özel", "Uzman Önerisi"];
const SORT_OPTIONS = [
  { label: "Önerilen", value: "default" },
  { label: "Fiyat: Düşükten Yükseğe", value: "price-asc" },
  { label: "Fiyat: Yüksekten Düşüğe", value: "price-desc" },
  { label: "En Yüksek Puan", value: "rating" },
  { label: "En Çok Değerlendirilen", value: "reviews" },
];

interface Props {
  products: Product[];
}

export function ProductsGrid({ products }: Props) {
  const categories = ["Tümü", ...Array.from(new Set(products.map((p) => p.category)))];

  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [selectedBadge, setSelectedBadge] = useState("Tümü");
  const [sort, setSort] = useState("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];
    if (selectedCategory !== "Tümü") list = list.filter((p) => p.category === selectedCategory);
    if (selectedBadge !== "Tümü") list = list.filter((p) => p.badge === selectedBadge);
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (sort === "reviews") list.sort((a, b) => b.reviewCount - a.reviewCount);
    return list;
  }, [products, selectedCategory, selectedBadge, sort]);

  const activeFilters =
    (selectedCategory !== "Tümü" ? 1 : 0) + (selectedBadge !== "Tümü" ? 1 : 0);

  const clearFilters = () => {
    setSelectedCategory("Tümü");
    setSelectedBadge("Tümü");
    setSort("default");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-8">

          {/* ── Sidebar (desktop) ── */}
          <aside className="hidden lg:block flex-shrink-0 w-56">
            <div className="sticky top-24 space-y-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Kategori</p>
                <div className="flex flex-col gap-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedCategory === cat
                          ? "bg-orange-500 text-white shadow-sm"
                          : "text-gray-600 hover:bg-white hover:text-gray-900"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Etiket</p>
                <div className="flex flex-col gap-1">
                  {BADGES.map((badge) => (
                    <button
                      key={badge}
                      onClick={() => setSelectedBadge(badge)}
                      className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedBadge === badge
                          ? "bg-orange-500 text-white shadow-sm"
                          : "text-gray-600 hover:bg-white hover:text-gray-900"
                      }`}
                    >
                      {badge}
                    </button>
                  ))}
                </div>
              </div>

              {activeFilters > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                  Filtreleri Sıfırla ({activeFilters})
                </button>
              )}
            </div>
          </aside>

          {/* ── Ana içerik ── */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6 gap-4">
              <p className="text-sm text-gray-500">
                <span className="font-bold text-gray-900">{filtered.length}</span> ürün bulundu
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-300 transition-all"
                >
                  <SlidersHorizontal size={15} />
                  Filtrele
                  {activeFilters > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white text-[10px] font-bold">
                      {activeFilters}
                    </span>
                  )}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setSortOpen((v) => !v)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-300 transition-all"
                  >
                    {SORT_OPTIONS.find((o) => o.value === sort)?.label}
                    <ChevronDown size={14} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                  </button>
                  {sortOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 z-20 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-1">
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => { setSort(opt.value); setSortOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                              sort === opt.value
                                ? "text-orange-500 font-semibold bg-orange-50"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((product, i) => (
                  <Link key={product.id} href={`/urunler/${product.slug}`}>
                    <ProductCard product={product} index={i} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-lg font-bold text-gray-800">Ürün bulunamadı</p>
                <p className="text-sm text-gray-400 mt-1">Farklı filtreler deneyin</p>
                <button onClick={clearFilters} className="mt-4 px-5 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors">
                  Filtreleri Sıfırla
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter panel */}
      {mobileFilterOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setMobileFilterOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <p className="font-bold text-gray-900">Filtrele</p>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Kategori</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                        selectedCategory === cat
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Etiket</p>
                <div className="flex flex-wrap gap-2">
                  {BADGES.map((badge) => (
                    <button
                      key={badge}
                      onClick={() => setSelectedBadge(badge)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                        selectedBadge === badge
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {badge}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="mt-8 w-full py-3 rounded-2xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors"
            >
              Uygula ({filtered.length} ürün)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
