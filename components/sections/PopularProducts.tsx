"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import type { Product } from "@/data/products";

interface Props { products: Product[]; }

export function PopularProducts({ products }: Props) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Popüler Ürünler</h2>
            <p className="text-gray-500 mt-2">En çok tercih edilen ve en yüksek puan alan ürünlerimizi keşfedin.</p>
          </div>
          <a
            href="/urunler"
            className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors group"
          >
            Tüm Ürünler
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        <div className="flex justify-center mt-8 md:hidden">
          <a
            href="/urunler"
            className="flex items-center gap-1.5 text-sm font-semibold text-orange-500"
          >
            Tüm Ürünler
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
