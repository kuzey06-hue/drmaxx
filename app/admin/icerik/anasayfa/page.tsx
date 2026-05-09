"use client";

import { useState } from "react";
import {
  Edit2,
  Upload,
  X,
  Plus,
  CheckCircle2,
  Image as ImageIcon,
  ChevronDown,
} from "lucide-react";

// ─── Reusable atoms ────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
      {children}
    </p>
  );
}

function Input({
  defaultValue,
  placeholder,
  className,
}: {
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      defaultValue={defaultValue}
      placeholder={placeholder}
      className={`h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-400 focus:bg-white focus:outline-none w-full ${className ?? ""}`}
    />
  );
}

function Select({
  options,
  className,
}: {
  options: string[];
  className?: string;
}) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <select className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-400 focus:bg-white focus:outline-none appearance-none pr-8">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
    </div>
  );
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

function SectionDivider() {
  return <div className="border-b border-gray-100 pb-6 mb-6" />;
}

function UploadButton({ label, current }: { label: string; current: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400">{current}</span>
      <button className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-dashed border-gray-300 text-xs text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors">
        <Upload className="w-3.5 h-3.5" />
        {label}
      </button>
    </div>
  );
}

// ─── Section: Hero ─────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
          <Edit2 className="w-3.5 h-3.5 text-orange-500" />
        </div>
        <h3 className="text-sm font-bold text-gray-800">Hero Bölümü</h3>
      </div>

      <SectionDivider />

      <div className="space-y-4">
        <div>
          <Label>Büyük Başlık</Label>
          <textarea
            defaultValue={"İLERİ FORMÜLLER.\nDAHA İYİ SONUÇLAR."}
            rows={3}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold focus:border-orange-400 focus:bg-white focus:outline-none resize-none"
          />
        </div>

        <div>
          <Label>Alt Başlık</Label>
          <Input defaultValue="Bilimsel olarak geliştirilmiş premium takviyeler..." />
        </div>

        <div>
          <Label>CTA Butonu Metni</Label>
          <Input defaultValue="Ürünleri Keşfet" />
        </div>

        <div>
          <Label>Hero Görseli</Label>
          <div className="flex items-center justify-between p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <ImageIcon className="w-4 h-4" />
              Mevcut: /products/hero.jpg
            </div>
            <button className="flex items-center gap-1.5 h-7 px-3 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors">
              <Upload className="w-3 h-3" />
              Değiştir
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Section: Öne Çıkan Özellikler ────────────────────────────────────────────

const ICON_OPTIONS = ["Bilimsel Formüller", "Yüksek Emilim", "Güvenilir Üretim"];
const DEFAULT_FEATURES = [
  { icon: "Bilimsel Formüller", text: "Klinik araştırmalarla kanıtlanmış formüller" },
  { icon: "Yüksek Emilim", text: "Maksimum biyoyararlanım için optimize edilmiş" },
  { icon: "Güvenilir Üretim", text: "GMP sertifikalı tesislerde üretim" },
];

function HeroCardsSection() {
  const [items, setItems] = useState(DEFAULT_FEATURES);

  return (
    <Card>
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
          <Edit2 className="w-3.5 h-3.5 text-blue-500" />
        </div>
        <h3 className="text-sm font-bold text-gray-800">Hero Alt Metin Kartları</h3>
      </div>

      <SectionDivider />

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <Select options={ICON_OPTIONS} className="w-44 shrink-0" />
            <input
              defaultValue={item.text}
              className="h-9 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-400 focus:bg-white focus:outline-none"
            />
            <button
              onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Section: Neden DR.MAXX ────────────────────────────────────────────────────

const DEFAULT_WHY = [
  { icon: "Bilimsel Formüller", title: "Kanıtlanmış Formüller", desc: "Her ürün klinik araştırmalara dayanır." },
  { icon: "Yüksek Emilim", title: "Yüksek Emilim", desc: "Patentli teknoloji ile maksimum biyoyararlanım." },
  { icon: "Güvenilir Üretim", title: "GMP Üretim", desc: "Uluslararası standartlarda üretim tesisi." },
  { icon: "Bilimsel Formüller", title: "Uzman Desteği", desc: "Uzman ekibimiz her sorunuzda yanınızda." },
  { icon: "Güvenilir Üretim", title: "Sertifikalı Kalite", desc: "TSE ve ISO belgeli kalite güvencesi." },
];

function WhySection() {
  const [features, setFeatures] = useState(DEFAULT_WHY);

  return (
    <Card>
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
          <Edit2 className="w-3.5 h-3.5 text-green-500" />
        </div>
        <h3 className="text-sm font-bold text-gray-800">Neden DR.MAXX</h3>
      </div>

      <SectionDivider />

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <Label>Bölüm Başlığı</Label>
          <Input defaultValue="Neden DR.MAXX Seçmelisiniz?" />
        </div>
        <div>
          <Label>Açıklama</Label>
          <Input defaultValue="Bilim, kalite ve güven üzerine kurulu bir marka." />
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-4 shrink-0">{i + 1}.</span>
            <Select options={ICON_OPTIONS} className="w-40 shrink-0" />
            <input
              defaultValue={f.title}
              placeholder="Başlık"
              className="h-9 w-36 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-400 focus:bg-white focus:outline-none"
            />
            <input
              defaultValue={f.desc}
              placeholder="Açıklama"
              className="h-9 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-400 focus:bg-white focus:outline-none"
            />
            <button
              onClick={() => setFeatures(features.filter((_, idx) => idx !== i))}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() =>
          setFeatures([...features, { icon: "Bilimsel Formüller", title: "", desc: "" }])
        }
        className="flex items-center gap-2 h-9 px-4 rounded-xl border border-dashed border-orange-300 text-orange-500 text-sm hover:bg-orange-50 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Özellik Ekle
      </button>

      <div className="mt-5 pt-5 border-t border-gray-100">
        <Label>Arka Plan Görseli</Label>
        <div className="flex items-center justify-between p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ImageIcon className="w-4 h-4" />
            Mevcut: /images/neden.png
          </div>
          <button className="flex items-center gap-1.5 h-7 px-3 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors">
            <Upload className="w-3 h-3" />
            Değiştir
          </button>
        </div>
      </div>
    </Card>
  );
}

// ─── Section: Uzmanlar ────────────────────────────────────────────────────────

function ExpertSection() {
  const [active, setActive] = useState(true);

  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
            <Edit2 className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <h3 className="text-sm font-bold text-gray-800">Uzmanlar Bölümü</h3>
        </div>
        <button
          onClick={() => setActive(!active)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            active ? "bg-orange-500" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              active ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      <SectionDivider />

      <div className={`space-y-4 ${!active ? "opacity-40 pointer-events-none" : ""}`}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Bölüm Başlığı</Label>
            <Input defaultValue="Uzman Kadromuzla Tanışın" />
          </div>
          <div>
            <Label>Açıklama</Label>
            <Input defaultValue="Alanında uzman ekibimiz her adımda yanınızda." />
          </div>
        </div>

        <div>
          <Label>Uzman Fotoğrafı</Label>
          <div className="flex items-center justify-between p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <ImageIcon className="w-4 h-4" />
              Mevcut: /images/uzman.png
            </div>
            <button className="flex items-center gap-1.5 h-7 px-3 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors">
              <Upload className="w-3 h-3" />
              Değiştir
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnasayfaEditorPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anasayfa Editörü</h1>
          <p className="text-sm text-gray-400 mt-0.5">Anasayfa içeriklerini buradan düzenleyin</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 h-9 px-5 rounded-xl text-sm font-semibold transition-all ${
            saved
              ? "bg-green-500 text-white"
              : "bg-orange-500 hover:bg-orange-600 text-white"
          }`}
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Kaydedildi
            </>
          ) : (
            "Kaydet"
          )}
        </button>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        <HeroSection />
        <HeroCardsSection />
        <WhySection />
        <ExpertSection />
      </div>
    </div>
  );
}
