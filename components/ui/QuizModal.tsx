"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ArrowRight, ArrowLeft, ShoppingCart, RotateCcw } from "lucide-react";
import Image from "next/image";
import { products } from "@/data/products";
import type { Product } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { StarRating } from "./StarRating";

/* ── Quiz verisi ── */
const GOALS = [
  { id: "focus",      label: "Odaklanma & Konsantrasyon", emoji: "🧠", categories: ["Nörobilim", "Beyin Sağlığı"] },
  { id: "energy",     label: "Enerji & Vitalite",          emoji: "⚡", categories: ["Omega"] },
  { id: "immunity",   label: "Bağışıklık Güçlendirme",     emoji: "🛡️", categories: ["Antioksidan"] },
  { id: "brain",      label: "Beyin Sağlığı",              emoji: "💡", categories: ["Beyin Sağlığı", "Nörobilim"] },
  { id: "kids",       label: "Çocuk Gelişimi",             emoji: "👶", categories: ["Çocuk Sağlığı"] },
  { id: "antioxidant",label: "Antioksidan Destek",         emoji: "🌿", categories: ["Antioksidan"] },
];

const AGE_GROUPS = [
  { id: "18-30", label: "18 – 30" },
  { id: "30-45", label: "30 – 45" },
  { id: "45-60", label: "45 – 60" },
  { id: "60+",   label: "60 +"    },
];

const ACTIVITY = [
  { id: "low",    label: "Düşük",   desc: "Masa başı, az hareket"          },
  { id: "medium", label: "Orta",    desc: "Hafif egzersiz, günlük yürüyüş" },
  { id: "high",   label: "Yüksek",  desc: "Düzenli spor, aktif yaşam"      },
];

/* ── Ürün skoru ── */
function scoreProducts(goalId: string, age: string, activity: string): Product[] {
  const goal = GOALS.find((g) => g.id === goalId);
  if (!goal) return products.slice(0, 3);

  const scored = products.map((p) => {
    let score = 0;
    if (goal.categories.includes(p.category)) score += 10;
    if (p.badge === "Çok Satan") score += 3;
    if (p.badge === "Uzman Önerisi") score += 2;
    score += p.rating;
    score += p.reviewCount / 100;
    // çocuk hedefiyse kids ürünü öne çıkar
    if (goalId === "kids" && p.category === "Çocuk Sağlığı") score += 5;
    // yaşlı kullanıcılar için Omega önceliklendir
    if ((age === "45-60" || age === "60+") && p.category === "Omega") score += 2;
    return { product: p, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.product);
}

/* ── Animasyon varyantları ── */
const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 48 : -48 }),
  center: { opacity: 1, x: 0 },
  exit:   (dir: number) => ({ opacity: 0, x: dir > 0 ? -48 : 48 }),
};

/* ── Bileşen ── */
interface QuizModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function QuizModal({ open, onOpenChange }: QuizModalProps) {
  const [step, setStep]       = useState(0);   // 0,1,2,3 (3 = results)
  const [dir, setDir]         = useState(1);
  const [goal, setGoal]       = useState("");
  const [age, setAge]         = useState("");
  const [activity, setActivity] = useState("");
  const [results, setResults] = useState<Product[]>([]);

  const totalSteps = 3;
  const progress   = ((step) / totalSteps) * 100;

  function goNext() {
    setDir(1);
    if (step === 2) {
      setResults(scoreProducts(goal, age, activity));
    }
    setStep((s) => s + 1);
  }

  function goPrev() {
    setDir(-1);
    setStep((s) => s - 1);
  }

  function restart() {
    setStep(0); setDir(1);
    setGoal(""); setAge(""); setActivity(""); setResults([]);
  }

  const canNext =
    (step === 0 && !!goal) ||
    (step === 1 && !!age)  ||
    (step === 2 && !!activity);

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) restart(); }}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Modal */}
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 overflow-hidden">

          {/* Üst bar */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] font-semibold text-orange-500 uppercase tracking-widest">
                  {step < 3 ? `Adım ${step + 1} / ${totalSteps}` : "Sonuçlarınız Hazır!"}
                </p>
                <Dialog.Title className="text-lg font-bold text-gray-900 mt-0.5">
                  {step === 0 && "Hedefinizi seçin"}
                  {step === 1 && "Yaş grubunuz nedir?"}
                  {step === 2 && "Aktivite seviyeniz?"}
                  {step === 3 && "Size Özel Öneriler"}
                </Dialog.Title>
              </div>
              <Dialog.Close className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X size={16} />
              </Dialog.Close>
            </div>

            {/* Progress bar */}
            {step < 3 && (
              <div className="h-1.5 w-full rounded-full bg-gray-100">
                <motion.div
                  className="h-full rounded-full bg-orange-500"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            )}
          </div>

          {/* İçerik */}
          <div className="relative overflow-hidden min-h-[280px] px-6">
            <AnimatePresence custom={dir} mode="wait">
              <motion.div
                key={step}
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: "easeInOut" }}
              >

                {/* Adım 0 — Hedef */}
                {step === 0 && (
                  <div className="grid grid-cols-2 gap-2.5 pb-2">
                    {GOALS.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setGoal(g.id)}
                        className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all ${
                          goal === g.id
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-100 bg-gray-50 text-gray-700 hover:border-orange-200 hover:bg-orange-50/50"
                        }`}
                      >
                        <span className="text-xl">{g.emoji}</span>
                        <span className="text-xs font-semibold leading-tight">{g.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Adım 1 — Yaş */}
                {step === 1 && (
                  <div className="grid grid-cols-2 gap-2.5 pb-2">
                    {AGE_GROUPS.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setAge(a.id)}
                        className={`rounded-2xl border-2 py-5 text-center font-bold text-lg transition-all ${
                          age === a.id
                            ? "border-orange-500 bg-orange-50 text-orange-600"
                            : "border-gray-100 bg-gray-50 text-gray-700 hover:border-orange-200 hover:bg-orange-50/50"
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Adım 2 — Aktivite */}
                {step === 2 && (
                  <div className="flex flex-col gap-2.5 pb-2">
                    {ACTIVITY.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setActivity(a.id)}
                        className={`flex items-center justify-between rounded-2xl border-2 px-5 py-4 text-left transition-all ${
                          activity === a.id
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-100 bg-gray-50 hover:border-orange-200 hover:bg-orange-50/50"
                        }`}
                      >
                        <div>
                          <p className={`font-semibold text-sm ${activity === a.id ? "text-orange-700" : "text-gray-800"}`}>
                            {a.label}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
                        </div>
                        <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                          activity === a.id ? "border-orange-500 bg-orange-500" : "border-gray-200"
                        }`}>
                          {activity === a.id && <span className="block h-2 w-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Adım 3 — Sonuçlar */}
                {step === 3 && (
                  <div className="flex flex-col gap-3 pb-2">
                    <p className="text-xs text-gray-400 mb-1">
                      Cevaplarınıza göre en uygun 3 ürün:
                    </p>
                    {results.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-3"
                      >
                        {/* Ürün görseli */}
                        <div
                          className="relative h-14 w-14 flex-shrink-0 rounded-xl overflow-hidden"
                          style={{ background: `${p.color}18` }}
                        >
                          {p.image ? (
                            <Image src={p.image} alt={p.name} fill className="object-contain p-1" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <span className="text-[8px] font-bold text-center px-1" style={{ color: p.color }}>
                                {p.name}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Bilgi */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-bold text-orange-500">#{i + 1}</span>
                            <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                          </div>
                          <StarRating rating={p.rating} reviewCount={p.reviewCount} />
                          <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(p.price)}</p>
                        </div>

                        {/* Sepet */}
                        <button className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors">
                          <ShoppingCart size={15} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Alt butonlar */}
          <div className="flex items-center justify-between gap-3 px-6 py-5 border-t border-gray-100">
            {step === 3 ? (
              <>
                <button
                  onClick={restart}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <RotateCcw size={13} />
                  Yeniden Başla
                </button>
                <button
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
                >
                  Tüm Ürünleri Gör
                  <ArrowRight size={14} />
                </button>
              </>
            ) : (
              <>
                {step > 0 ? (
                  <button
                    onClick={goPrev}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ArrowLeft size={14} />
                    Geri
                  </button>
                ) : (
                  <div />
                )}
                <button
                  onClick={goNext}
                  disabled={!canNext}
                  className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {step === 2 ? "Sonuçları Gör" : "Devam Et"}
                  <ArrowRight size={14} />
                </button>
              </>
            )}
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
