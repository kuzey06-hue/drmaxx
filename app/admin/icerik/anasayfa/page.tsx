"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Image as ImageIcon, Loader2, Plus, Save, X } from "lucide-react";

type HeroContent = {
  title: string;
  subtitle: string;
  ctaText: string;
  image: string;
  mobileSlides: string[];
};

type HomePageCms = {
  hero: HeroContent;
  [key: string]: unknown;
};

const DEFAULT_MOBILE_SLIDES = [
  "/products/stikolin-hero-1.jpg",
  "/products/stikolin-hero-2.jpg",
  "/products/stikolin-hero-3.jpg",
  "/products/stikolin-hero-4.jpg",
  "/products/stikolin-hero-5.jpg",
  "/products/stikolin-hero-6.jpg",
];

const DEFAULT_CMS: HomePageCms = {
  hero: {
    title: "İLERİ FORMÜLLER.\nDAHA İYİ SONUÇLAR.",
    subtitle:
      "Bilimsel olarak geliştirilmiş premium takviyeler ile potansiyelinizi üst düzeye çıkarın.",
    ctaText: "Ürünleri Keşfet",
    image: "/products/hero.jpg",
    mobileSlides: DEFAULT_MOBILE_SLIDES,
  },
};

const readString = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

function normalizeCms(raw: unknown): HomePageCms {
  const data = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const rawHero = data.hero && typeof data.hero === "object" ? (data.hero as Record<string, unknown>) : {};

  const image = readString(rawHero.image, DEFAULT_CMS.hero.image);
  const mobileSlides = Array.isArray(rawHero.mobileSlides)
    ? rawHero.mobileSlides.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];

  return {
    ...data,
    hero: {
      title: readString(rawHero.title, DEFAULT_CMS.hero.title),
      subtitle: readString(rawHero.subtitle, DEFAULT_CMS.hero.subtitle),
      ctaText: readString(rawHero.ctaText, DEFAULT_CMS.hero.ctaText),
      image,
      mobileSlides: mobileSlides.length > 0 ? mobileSlides : DEFAULT_MOBILE_SLIDES,
    },
  };
}

export default function AnasayfaEditorPage() {
  const [cms, setCms] = useState<HomePageCms>(DEFAULT_CMS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/cms/anasayfa", { cache: "no-store" });
        if (!res.ok) throw new Error("İçerik alınamadı.");
        const data: unknown = await res.json();
        if (!cancelled) setCms(normalizeCms(data));
      } catch {
        if (!cancelled) setError("İçerik okunamadı. Varsayılan değerler yüklendi.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const setHeroField = (field: keyof HeroContent, value: string | string[]) => {
    setCms((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value,
      },
    }));
  };

  const updateSlide = (index: number, value: string) => {
    const next = [...cms.hero.mobileSlides];
    next[index] = value;
    setHeroField("mobileSlides", next);
  };

  const addSlide = () => {
    setHeroField("mobileSlides", [...cms.hero.mobileSlides, ""]);
  };

  const removeSlide = (index: number) => {
    const next = cms.hero.mobileSlides.filter((_, i) => i !== index);
    setHeroField("mobileSlides", next.length ? next : [""]);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const cleanedSlides = cms.hero.mobileSlides.map((s) => s.trim()).filter(Boolean);
      const payload: HomePageCms = {
        ...cms,
        hero: {
          ...cms.hero,
          title: cms.hero.title.trim(),
          subtitle: cms.hero.subtitle.trim(),
          ctaText: cms.hero.ctaText.trim(),
          image: cms.hero.image.trim() || "/products/hero.jpg",
          mobileSlides: cleanedSlides.length ? cleanedSlides : DEFAULT_MOBILE_SLIDES,
        },
      };

      const res = await fetch("/api/cms/anasayfa", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Kaydetme başarısız.");

      setCms(normalizeCms(payload));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Kaydetme sırasında bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anasayfa Editörü</h1>
          <p className="text-sm text-gray-500 mt-1">Hero alanını mobil slider olarak yönetin.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading || saving}
          className={`h-10 px-5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition-colors ${
            saved ? "bg-green-500 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"
          } disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Kaydediliyor
            </>
          ) : saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Kaydedildi
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Kaydet
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-orange-500" />
          </div>
          <h2 className="text-sm font-bold text-gray-800">Hero İçeriği</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Büyük Başlık</p>
            <textarea
              rows={3}
              value={cms.hero.title}
              onChange={(e) => setHeroField("title", e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-orange-400 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Alt Başlık</p>
            <input
              value={cms.hero.subtitle}
              onChange={(e) => setHeroField("subtitle", e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-400 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">CTA Metni</p>
            <input
              value={cms.hero.ctaText}
              onChange={(e) => setHeroField("ctaText", e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-400 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Masaüstü Hero Görseli</p>
            <input
              value={cms.hero.image}
              onChange={(e) => setHeroField("image", e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-400 focus:bg-white focus:outline-none"
              placeholder="/products/hero.jpg"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mobil Hero Slider Görselleri</p>
              <p className="text-xs text-gray-400 mt-1">Sıralama slider sırası olur. Örn: /products/stikolin-hero-1.jpg</p>
            </div>
            <button
              type="button"
              onClick={addSlide}
              className="h-8 px-3 rounded-lg border border-dashed border-orange-300 text-orange-500 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-orange-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Görsel Ekle
            </button>
          </div>

          <div className="space-y-2">
            {cms.hero.mobileSlides.map((slide, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-6 text-center">{index + 1}</span>
                <input
                  value={slide}
                  onChange={(e) => updateSlide(index, e.target.value)}
                  className="h-10 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-400 focus:bg-white focus:outline-none"
                  placeholder="/products/stikolin-hero-1.jpg"
                />
                <button
                  type="button"
                  onClick={() => removeSlide(index)}
                  className="w-9 h-9 rounded-lg border border-gray-200 text-red-500 inline-flex items-center justify-center hover:bg-red-50 transition-colors"
                  aria-label={`Slide ${index + 1} sil`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="mt-5 text-sm text-gray-500 inline-flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          İçerik yükleniyor...
        </div>
      )}
    </div>
  );
}
