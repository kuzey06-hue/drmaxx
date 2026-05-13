"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/data/products";

interface Props { products: Product[]; }

export function ExpertRecommendations({ products }: Props) {
  const expertProducts = products;
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(5);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setVisible(1);
      } else if (window.innerWidth < 1024) {
        setVisible(2);
      } else {
        setVisible(5);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIdx = Math.max(0, expertProducts.length - visible);
  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min(maxIdx, i + 1));

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">

        {/* Başlık */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-black text-gray-900">
            Uzmanlarımızdan Öneriler
          </h2>
          <p className="text-gray-400 mt-1.5 text-sm">
            Alanında uzman doktorlarımızın sizin için seçtiği ürünler.
          </p>
        </motion.div>

        {/* Ürün Slider */}
        <div className="flex items-center gap-3 min-w-0">

            {/* Sol ok */}
            <button
              onClick={prev}
              disabled={idx === 0}
              className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm text-gray-400 hover:text-orange-500 hover:border-orange-300 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Kart penceresi */}
            <div className="flex-1 overflow-hidden min-w-0">
              <motion.div
                className="flex gap-3"
                animate={{ x: `calc(-${idx} * (100% / ${visible} + 3px))` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {expertProducts.map((product, i) => (
                  <Link
                    key={product.id}
                    href={`/urunler/${product.slug}`}
                    className="flex-shrink-0"
                    style={{ width: `calc(100% / ${visible} - 9px)` }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.07 }}
                      className="group flex flex-col rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                    >
                      {/* Badge */}
                      <div className="px-3 pt-3">
                        <span className="inline-flex items-center rounded-full border border-orange-400 px-2.5 py-0.5 text-[10px] font-semibold text-orange-500">
                          Uzman Önerisi
                        </span>
                      </div>

                      {/* Ürün görseli */}
                      <div
                        className="relative mx-3 mt-3 mb-3 h-32 rounded-xl overflow-hidden flex items-center justify-center"
                        style={{ background: `${product.color}10` }}
                      >
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 1024px) 25vw, 160px"
                          />
                        ) : (
                          <div
                            className="w-12 h-16 rounded-xl flex flex-col items-center justify-center text-white text-[8px] font-bold shadow"
                            style={{ background: `linear-gradient(160deg, ${product.color}, ${product.color}cc)` }}
                          >
                            <span className="opacity-60 mb-0.5">DR.MAXX</span>
                            <span className="text-center px-1 leading-tight text-[9px]">{product.name}</span>
                          </div>
                        )}
                      </div>

                      {/* İsim + fiyat */}
                      <div className="px-3 pb-4 flex flex-col gap-1">
                        <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">
                          {product.name}
                        </p>
                        <p className="text-sm font-black text-gray-900 mt-0.5">
                          {formatPrice(product.price)}
                        </p>
                        {product.originalPrice && (
                          <p className="text-[11px] text-gray-300 line-through -mt-0.5">
                            {formatPrice(product.originalPrice)}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </motion.div>
            </div>

            {/* Sağ ok */}
            <button
              onClick={next}
              disabled={idx >= maxIdx}
              className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm text-gray-400 hover:text-orange-500 hover:border-orange-300 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={18} />
            </button>

        </div>
      </div>
    </section>
  );
}
