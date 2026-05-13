"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

const HERO_SLIDES = [
  "/images/hero-1.jpg",
  "/images/hero-2.jpg",
  "/images/hero-3.jpg",
  "/images/hero-4.jpg",
  "/images/hero-5.jpg",
  "/images/hero6.jpg",
];

export function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const slides = useMemo(() => HERO_SLIDES, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const handleTouchStart = (clientX: number) => {
    touchStartXRef.current = clientX;
  };

  const handleTouchEnd = (clientX: number) => {
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;
    if (startX === null) return;

    const diffX = clientX - startX;
    if (Math.abs(diffX) < 40) return;
    if (diffX < 0) {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    } else {
      setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#070D1A]">
      <div className="relative w-full h-[clamp(320px,42vw,620px)]">
        {slides.map((src, index) => (
          <Image
            key={`${src}-${index}`}
            src={src}
            alt={`DR.MAXX Hero ${index + 1}`}
            fill
            priority={index === 0}
            sizes="100vw"
            className={`object-cover object-top transition-opacity duration-700 ${
              index === activeSlide ? "opacity-100" : "opacity-0"
            }`}
            onTouchStart={(e) => handleTouchStart(e.touches[0].clientX)}
            onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0].clientX)}
          />
        ))}

        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Slide ${index + 1}`}
                onClick={() => setActiveSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeSlide ? "w-6 bg-orange-500" : "w-2.5 bg-white/55"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
