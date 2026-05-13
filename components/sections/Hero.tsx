"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

const HERO_SLIDES = [
  { src: "/images/hero-1-w.jpg", bgColor: "#fefefe" },
  { src: "/images/hero-2-.jpg", bgColor: "#000519" },
  { src: "/images/hero-3-w.jpg", bgColor: "#fefefe" },
  { src: "/images/hero-4-w.jpg", bgColor: "#fefefe" },
  { src: "/images/hero-5-.jpg", bgColor: "#f1f4fb" },
  { src: "/images/hero-6-w.jpg", bgColor: "#ecf3fd" },
];

export function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const slides = useMemo(() => HERO_SLIDES, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!divRef.current || !sectionRef.current) return;
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateWidth = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        divRef.current!.style.width = "1905px";
        sectionRef.current!.style.width = "1905px";
      } else {
        divRef.current!.style.width = "100%";
        sectionRef.current!.style.width = "100%";
      }
    };
    updateWidth(mediaQuery);
    mediaQuery.addEventListener("change", updateWidth);
    return () => mediaQuery.removeEventListener("change", updateWidth);
  }, []);

  useEffect(() => {
    if (!mounted || slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [mounted, slides.length]);

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
    <section ref={sectionRef} className="relative overflow-hidden md:overflow-visible md:flex md:justify-end -mx-4 md:mx-0">
      <div ref={divRef} className="relative h-40 md:h-[800px] transition-colors duration-700" style={{ backgroundColor: slides[activeSlide]?.bgColor || "#fefefe" }}>
        {slides.map((slide, index) => (
          <Image
            key={`${slide.src}-${index}`}
            src={slide.src}
            alt={`DR.MAXX Hero ${index + 1}`}
            fill
            priority={index === 0}
            sizes="100vw"
            className={`object-cover object-right transition-opacity duration-700 ${
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
