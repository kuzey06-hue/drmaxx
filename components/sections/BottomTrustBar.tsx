"use client";

import { motion } from "framer-motion";
import { Package, Clock, Lock, RotateCcw, Headphones } from "lucide-react";

const items = [
  { icon: Package, title: "Ücretsiz Kargo", desc: "500 TL ve üzeri siparişlerde" },
  { icon: Clock, title: "Hızlı Teslimat", desc: "Aynı gün kargo imkânı" },
  { icon: Lock, title: "Güvenli Ödeme", desc: "256 bit SSL ile güvenli alışveriş" },
  { icon: RotateCcw, title: "30 Gün İade", desc: "Koşulsuz iade garantisi" },
  { icon: Headphones, title: "7/24 Destek", desc: "Uzman ekibimiz yanınızda" },
];

export function BottomTrustBar() {
  return (
    <section className="border-y border-gray-100 bg-white py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {items.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50">
                <Icon size={18} className="text-orange-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">{title}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
