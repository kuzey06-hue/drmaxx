"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, FlaskConical, Zap, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

type HeroContent = {
  title: string;
  subtitle: string;
  ctaText: string;
  image: string;
  mobileSlides: string[];
};

const DEFAULT_HERO: HeroContent = {
  title: "İLERİ FORMÜLLER.\nDAHA İYİ SONUÇLAR.",
  subtitle:
    "Bilimsel olarak geliştirilmiş premium takviyeler ile potansiyelinizi üst düzeye çıkarın.",
  ctaText: "Ürünleri Keşfet",
  image: "/products/hero.jpg",
  mobileSlides: [
    "/products/stikolin-hero-1.jpg",
    "/products/stikolin-hero-2.jpg",
    "/products/stikolin-hero-3.jpg",
    "/products/stikolin-hero-4.jpg",
    "/products/stikolin-hero-5.jpg",
    "/products/stikolin-hero-6.jpg",
  ],
};

const DESKTOP_SLIDES_TAIL = [
  "/products/slider-hero-1.jpg",
  "/products/slider-hero-2.jpg",
  "/products/slider-hero-3.jpg",
  "/products/slider-hero-4.jpg",
  "/products/slider-hero-5.jpg",
];

const trustPoints = [
  {
    icon: FlaskConical,
    label: "Bilimsel Formüller",
    desc: "Klinik çalışmalarla desteklenmiştir.",
  },
  {
    icon: Zap,
    label: "Yüksek Emilim",
    desc: "İleri teknoloji sağlayan içerikler.",
  },
  {
    icon: ShieldCheck,
    label: "Güvenilir Üretim",
    desc: "GMP sertifikalı tesislerde üretilir.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" as const },
  }),
};

const readString = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

function normalizeHero(rawHero: unknown): HeroContent {
  if (!rawHero || typeof rawHero !== "object") return DEFAULT_HERO;

  const data = rawHero as Partial<HeroContent>;
  const image = readString(data.image, DEFAULT_HERO.image);
  const mobileSlides = Array.isArray(data.mobileSlides)
    ? data.mobileSlides.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];

  return {
    title: readString(data.title, DEFAULT_HERO.title),
    subtitle: readString(data.subtitle, DEFAULT_HERO.subtitle),
    ctaText: readString(data.ctaText, DEFAULT_HERO.ctaText),
    image,
    mobileSlides: mobileSlides.length > 0 ? mobileSlides : [image],
  };
}

export function Hero() {
  const [hero, setHero] = useState<HeroContent>(DEFAULT_HERO);
  const [activeMobileSlide, setActiveMobileSlide] = useState(0);
  const [activeDesktopSlide, setActiveDesktopSlide] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadHero = async () => {
      try {
        const res = await fetch("/api/cms/anasayfa", { cache: "no-store" });
        if (!res.ok) return;
        const data: unknown = await res.json();
        const nextHero = normalizeHero((data as { hero?: unknown })?.hero);
        if (!cancelled) setHero(nextHero);
      } catch {
        // keep default values
      }
    };

    void loadHero();
    return () => {
      cancelled = true;
    };
  }, []);

  const mobileSlides = useMemo(
    () => (hero.mobileSlides.length > 0 ? hero.mobileSlides : [hero.image]),
    [hero.mobileSlides, hero.image],
  );
  const desktopSlides = useMemo(() => [hero.image, ...DESKTOP_SLIDES_TAIL], [hero.image]);

  useEffect(() => {
    setActiveMobileSlide((prev) => Math.min(prev, mobileSlides.length - 1));
  }, [mobileSlides.length]);

  useEffect(() => {
    if (mobileSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveMobileSlide((prev) => (prev + 1) % mobileSlides.length);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [mobileSlides.length]);

  const handleMobileTouchStart = (clientX: number) => {
    touchStartXRef.current = clientX;
  };

  const handleMobileTouchEnd = (clientX: number) => {
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;
    if (startX === null) return;

    const diffX = clientX - startX;
    const threshold = 40;

    if (Math.abs(diffX) < threshold) return;
    if (diffX < 0) {
      setActiveMobileSlide((prev) => (prev + 1) % mobileSlides.length);
    } else {
      setActiveMobileSlide((prev) => (prev - 1 + mobileSlides.length) % mobileSlides.length);
    }
  };

  useEffect(() => {
    setActiveDesktopSlide((prev) => Math.min(prev, desktopSlides.length - 1));
  }, [desktopSlides.length]);

  useEffect(() => {
    if (desktopSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveDesktopSlide((prev) => (prev + 1) % desktopSlides.length);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [desktopSlides.length]);

  return (
    <section className="relative overflow-hidden" style={{ background: "#070D1A" }}>
      <div className="hidden md:block relative h-[clamp(560px,53.35vw,760px)]">
        {desktopSlides.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
              index === activeDesktopSlide ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url('${src}')`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
              backgroundRepeat: "no-repeat",
            }}
          />
        ))}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, #070D1A 0%, #070D1A 32%, rgba(7,13,26,0.5) 45%, rgba(7,13,26,0) 60%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 w-full h-full flex items-center">
          <div className="max-w-xl flex flex-col gap-8">
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold text-orange-400 mb-6">
                ✦ Premium Takviye Markası
              </span>
              <h1 className="text-5xl font-black leading-[1.08] tracking-tight text-white">
                {hero.title.split("\n").map((line, idx, arr) => (
                  <Fragment key={`${line}-${idx}`}>
                    {line}
                    {idx < arr.length - 1 && <br />}
                  </Fragment>
                ))}
              </h1>
            </motion.div>

            <motion.p
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-base text-white/60 leading-relaxed"
            >
              {hero.subtitle}
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
                {hero.ctaText}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div
          className="relative w-full aspect-[864/1326] overflow-hidden bg-[#070D1A]"
          style={{ touchAction: "pan-y" }}
          onTouchStart={(e) => handleMobileTouchStart(e.touches[0].clientX)}
          onTouchEnd={(e) => handleMobileTouchEnd(e.changedTouches[0].clientX)}
        >
          {mobileSlides.map((src, index) => (
            <Image
              key={`${src}-${index}`}
              src={src}
              alt={`DR.MAXX Mobil Hero ${index + 1}`}
              fill
              priority={index === 0}
              sizes="100vw"
              className={`object-contain object-top transition-opacity duration-500 ${
                index === activeMobileSlide ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          {mobileSlides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {mobileSlides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Slide ${index + 1}`}
                  onClick={() => setActiveMobileSlide(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === activeMobileSlide ? "w-6 bg-orange-500" : "w-2.5 bg-white/55"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
