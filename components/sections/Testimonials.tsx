"use client";

import { motion } from "framer-motion";
import { ArrowRight, Quote } from "lucide-react";
import { Star } from "lucide-react";
import { testimonials } from "@/data/testimonials";

export function Testimonials() {
  return (
    <section className="py-20 bg-white">
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
            <h2 className="text-3xl font-bold text-gray-900">Gerçek Kullanıcı Deneyimleri</h2>
            <p className="text-gray-500 mt-2">Binlerce memnun müşterimizden sadece bazıları.</p>
          </div>
          <a
            href="/yorumlar"
            className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors group"
          >
            Tüm Yorumlar
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative flex flex-col gap-4 rounded-2xl bg-gray-50 border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <Quote size={20} className="text-orange-500/40 absolute top-5 right-5" />

              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Comment */}
              <p className="text-sm text-gray-600 leading-relaxed italic">"{t.comment}"</p>

              {/* Footer */}
              <div className="flex items-center gap-3 mt-auto pt-3 border-t border-gray-100">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white text-xs font-bold"
                  style={{ background: t.avatarColor }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>

              <span className="inline-flex items-center self-start rounded-lg bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-600">
                {t.product}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
