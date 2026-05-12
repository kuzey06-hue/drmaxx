"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Target, ClipboardList, Pill } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { QuizModal } from "@/components/ui/QuizModal";

const steps = [
  {
    step: "01",
    icon: Target,
    title: "Hedefinizi seçin",
  },
  {
    step: "02",
    icon: ClipboardList,
    title: "İhtiyaçlarınızı belirtin",
  },
  {
    step: "03",
    icon: Pill,
    title: "Size özel önerileri alın",
  },
];

export function ProductFinder() {
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <>
    <QuizModal open={quizOpen} onOpenChange={setQuizOpen} />
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="grid md:grid-cols-[1fr_auto_1.6fr]">

            {/* Sol — başlık + CTA */}
            <div className="flex flex-col justify-center gap-5 px-8 py-10 md:px-10 md:py-12">
              <div>
                <h2 className="text-2xl md:text-[1.65rem] font-bold text-gray-900 leading-snug mb-2">
                  Size En Uygun Ürünü Bulun
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[260px]">
                  Kısa bir testle hedefinize, ihtiyaçlarınıza en uygun ürünleri birlikte belirleyelim.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button size="lg" className="rounded-2xl group w-fit" onClick={() => setQuizOpen(true)}>
                  Teste Başla
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Clock size={11} />
                  Sadece 1 dakika sürer.
                </p>
              </div>
            </div>

            {/* Dikey ayraç */}
            <div className="hidden md:block w-px bg-gray-100 my-8" />

            {/* Sağ — adımlar */}
            <div className="flex items-center justify-center gap-0 px-8 py-10 md:px-10">
              {steps.map(({ step, icon: Icon, title }, i) => (
                <div key={step} className="flex items-center">
                  {/* Adım */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.12 }}
                    className="flex flex-col items-center gap-3 text-center w-32 md:w-36"
                  >
                    {/* İkon dairesi */}
                    <div
                      className="flex h-[72px] w-[72px] md:h-20 md:w-20 items-center justify-center rounded-full"
                      style={{ background: "linear-gradient(135deg, #e8f4fd 0%, #dbeeff 100%)" }}
                    >
                      <Icon size={28} className="text-[#3b9eda]" strokeWidth={1.6} />
                    </div>
                    {/* Numara */}
                    <span className="text-[11px] font-bold text-[#3b9eda] tracking-widest">
                      {step}
                    </span>
                    {/* Başlık */}
                    <p className="text-xs font-semibold text-gray-700 leading-tight">
                      {title}
                    </p>
                  </motion.div>

                  {/* Bağlantı noktaları */}
                  {i < steps.length - 1 && (
                    <div className="flex gap-[3px] mb-10 mx-1 md:mx-2">
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          className="block h-[5px] w-[5px] rounded-full bg-gray-200"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </motion.div>
      </div>
    </section>
    </>
  );
}
