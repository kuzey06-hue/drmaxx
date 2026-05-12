"use client";

import { motion } from "framer-motion";
import { Award, FlaskConical, Leaf, Stethoscope, ShieldCheck, Truck } from "lucide-react";

const trustItems = [
  {
    icon: Award,
    label: "GMP Sertifikalı",
    desc: "Yüksek kalite standartlarında üretilir.",
    gmp: false,
  },
  {
    icon: FlaskConical,
    label: "Klinik Destekli",
    desc: "Etkinliği bilimsel çalışmalarla kanıtlanmıştır.",
    gmp: false,
  },
  {
    icon: Leaf,
    label: "Güvenli İçerik",
    desc: "Katkı maddesi içermez, şeker içermez.",
    gmp: false,
  },
  {
    icon: Stethoscope,
    label: "Doktor Onayı",
    desc: "Uzmanlar tarafından tavsiye edilir.",
    gmp: false,
  },
  {
    icon: ShieldCheck,
    label: "GMP",
    desc: "İyi Üretim Uygulamaları standardı.",
    gmp: true,
  },
  {
    icon: Truck,
    label: "Hızlı Teslimat",
    desc: "Aynı gün kargo, güvenli teslimat.",
    gmp: false,
  },
];

export function TrustBar() {
  return (
    <section className="bg-[#0A1220] border-y border-white/[0.07]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-white/[0.07]">
          {trustItems.map(({ icon: Icon, label, desc, gmp }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="flex items-center gap-3 px-4 py-5"
            >
              {/* Icon */}
              <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] ring-1 ring-white/[0.09]">
                {gmp ? (
                  <span className="text-[10px] font-black tracking-widest text-orange-400 leading-none">
                    GMP
                  </span>
                ) : (
                  <Icon size={17} className="text-orange-400" />
                )}
              </div>

              {/* Text */}
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold text-white leading-tight truncate">
                  {label}
                </p>
                <p className="text-[11px] text-white/40 mt-0.5 leading-snug line-clamp-2">
                  {desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
