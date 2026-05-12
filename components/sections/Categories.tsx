"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Brain, Sparkles, Heart, Baby, Droplets, Shield, Zap, Leaf } from "lucide-react";

const categories = [
  {
    label: "Beyin & Odak",
    slug: "Nörobilim",
    icon: Brain,
    color: "#6366F1",
    bg: "#EEF2FF",
    count: 3,
  },
  {
    label: "Antioksidan",
    slug: "Antioksidan",
    icon: Sparkles,
    color: "#F97316",
    bg: "#FFF7ED",
    count: 1,
  },
  {
    label: "Beyin Sağlığı",
    slug: "Beyin Sağlığı",
    icon: Heart,
    color: "#8B5CF6",
    bg: "#F5F3FF",
    count: 1,
  },
  {
    label: "Çocuk Sağlığı",
    slug: "Çocuk Sağlığı",
    icon: Baby,
    color: "#10B981",
    bg: "#ECFDF5",
    count: 1,
  },
  {
    label: "Omega & Yağ Asitleri",
    slug: "Omega",
    icon: Droplets,
    color: "#0EA5E9",
    bg: "#F0F9FF",
    count: 1,
  },
  {
    label: "Bağışıklık",
    slug: "Bağışıklık",
    icon: Shield,
    color: "#059669",
    bg: "#ECFDF5",
    count: 0,
  },
  {
    label: "Enerji & Performans",
    slug: "Performans",
    icon: Zap,
    color: "#EAB308",
    bg: "#FEFCE8",
    count: 0,
  },
  {
    label: "Vitamin & Mineral",
    slug: "Vitamin",
    icon: Leaf,
    color: "#22C55E",
    bg: "#F0FDF4",
    count: 0,
  },
];

export function Categories() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">
              Kategoriler
            </h2>
            <p className="text-gray-400 mt-1.5 text-sm">
              Sağlık hedefinize göre doğru takviyeyi bulun.
            </p>
          </div>
          <Link
            href="/urunler"
            className="hidden md:flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
          >
            Tüm Ürünler →
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map(({ label, slug, icon: Icon, color, bg, count }, i) => (
            <motion.div
              key={slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                href={`/urunler?kategori=${encodeURIComponent(slug)}`}
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-md transition-all duration-300 text-center"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: bg }}
                >
                  <Icon size={24} style={{ color }} strokeWidth={1.8} />
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-800 leading-snug group-hover:text-gray-900 transition-colors">
                    {label}
                  </p>
                  {count > 0 && (
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {count} ürün
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
