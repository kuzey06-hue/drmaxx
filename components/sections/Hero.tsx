"use client";

import { motion } from "framer-motion";
import { ArrowRight, FlaskConical, Zap, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

const trustPoints = [
  { icon: FlaskConical, label: "Bilimsel Formüller", desc: "Klinik çalışmalarla desteklenmiştir." },
  { icon: Zap, label: "Yüksek Emilim", desc: "İleri teknoloji sağlayan içerikler." },
  { icon: ShieldCheck, label: "Güvenilir Üretim", desc: "GMP sertifikalı tesislerde üretilir." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" as const },
  }),
};

export function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#070D1A" }}
    >
      {/* ── MASAÜSTÜ LAYOUT ── */}
      <div className="hidden md:block">
        {/* Sağ taraf arka plan resmi */}
        <div
          className="absolute inset-y-0 right-0 pointer-events-none"
          style={{
            left: "30%",
            backgroundImage: "url('/products/hero.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Sol lacivert degrade */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, #070D1A 0%, #070D1A 32%, rgba(7,13,26,0.5) 45%, rgba(7,13,26,0) 60%)",
          }}
        />

        {/* İçerik */}
        <div className="relative max-w-7xl mx-auto px-6 py-16 w-full min-h-[620px] flex items-center">
          <div className="max-w-xl flex flex-col gap-8">
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold text-orange-400 mb-6">
                ✦ Premium Takviye Markası
              </span>
              <h1 className="text-5xl font-black leading-[1.08] tracking-tight text-white">
                İLERİ<br />
                FORMÜLLER.
                <br />
                <span className="text-orange-500">DAHA İYİ<br />SONUÇLAR.</span>
              </h1>
            </motion.div>

            <motion.p
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-base text-white/60 leading-relaxed"
            >
              Bilimsel olarak geliştirilmiş premium takviyeler ile potansiyelinizi üst düzeye çıkarın.
            </motion.p>

            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col gap-3">
              {trustPoints.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-orange-500/15">
                    <Icon size={15} className="text-orange-400" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white">{label}</span>
                    <span className="text-xs text-white/40 ml-2">{desc}</span>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
              <Button size="lg" className="rounded-2xl group">
                Ürünleri Keşfet
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── MOBİL LAYOUT ── */}
      <div className="md:hidden flex flex-col">
        {/* Metin alanı */}
        <div className="px-5 pt-10 pb-6 flex flex-col gap-6">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold text-orange-400 mb-4">
              ✦ Premium Takviye Markası
            </span>
            <h1 className="text-[2.2rem] font-black leading-[1.08] tracking-tight text-white">
              İLERİ<br />
              FORMÜLLER.
              <br />
              <span className="text-orange-500">DAHA İYİ<br />SONUÇLAR.</span>
            </h1>
          </motion.div>

          <motion.p
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-sm text-white/60 leading-relaxed"
          >
            Bilimsel olarak geliştirilmiş premium takviyeler ile potansiyelinizi üst düzeye çıkarın.
          </motion.p>

          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
            <Button size="lg" className="rounded-2xl group w-full justify-center">
              Ürünleri Keşfet
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          {/* Trust points — kompakt */}
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col gap-2">
            {trustPoints.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-orange-500/15">
                  <Icon size={13} className="text-orange-400" />
                </div>
                <span className="text-xs font-semibold text-white/80">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Ürün görseli — altta tam genişlik */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative w-full h-64 overflow-hidden"
          style={{
            background: "linear-gradient(to bottom, #070D1A 0%, #0d1829 100%)",
          }}
        >
          {/* Subtle üst fade */}
          <div
            className="absolute top-0 left-0 right-0 h-10 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, #070D1A, transparent)" }}
          />
          <Image
            src="/products/hero.jpg"
            alt="DR.MAXX Ürünleri"
            fill
            className="object-cover"
            style={{ objectPosition: "center 30%" }}
            priority
          />
          {/* Alt fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-16 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to top, #070D1A, transparent)" }}
          />
        </motion.div>
      </div>
    </section>
  );
}
