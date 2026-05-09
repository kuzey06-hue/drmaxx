"use client";

import { motion } from "framer-motion";
import { Ban, Droplets, Network, Award, ShieldCheck } from "lucide-react";
import Image from "next/image";

const features = [
  {
    icon: Ban,
    title: "Yüksek Biyoyararlanım",
    desc: "Üstün emilim sağlayan özel formüller",
  },
  {
    icon: Droplets,
    title: "Temiz İçerik",
    desc: "Şeker içermez, katkı maddesi içermez",
  },
  {
    icon: Network,
    title: "Bilimsel Yaklaşım",
    desc: "Klinik çalışmalarla desteklenen içerikler",
  },
  {
    icon: Award,
    title: "Premium Ham Madde",
    desc: "Dünyanın lider üreticilerinden ham madde",
  },
  {
    icon: ShieldCheck,
    title: "GMP Üretim",
    desc: "Uluslararası standartlarda üretim tesisleri",
  },
];

export function WhyDrMaxx() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Arka plan görseli */}
          <Image
            src="/images/neden.png"
            alt="DR.MAXX Laboratuvar"
            fill
            className="object-cover object-right"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />

          {/* Sol beyaz/mavi degrade — yazıları okunaklı kılar */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(to right, #EEF4FF 0%, #EEF4FF 45%, rgba(238,244,255,0.85) 60%, rgba(238,244,255,0) 80%)",
            }}
          />

          {/* İçerik */}
          <div className="relative flex flex-col justify-between gap-10 px-8 py-10 md:px-12 md:py-12 min-h-[220px]">

            {/* Başlık */}
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-[#0D1B4B] mb-2">
                Neden DR.MAXX?
              </h2>
              <p className="text-sm text-[#0D1B4B]/50">
                Sağlığınız için en iyisini sunmak bizim önceliğimiz.
              </p>
            </div>

            {/* 5 ikon — yatay, max %60 genişlikte kalır */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:max-w-[65%]">
              {features.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex flex-col items-center text-center gap-3"
                >
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ background: "rgba(59,100,220,0.12)" }}
                  >
                    <Icon size={26} className="text-[#2B5CE6]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0D1B4B] leading-snug mb-1">{title}</p>
                    <p className="text-[11px] text-[#0D1B4B]/50 leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
