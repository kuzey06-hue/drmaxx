"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Mail, ShieldCheck } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="relative overflow-hidden bg-[#070D1A] py-20">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 rounded-full bg-orange-500/5 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 rounded-full bg-blue-600/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-white mb-3">
              Sağlıklı Yaşam İçin<br />
              <span className="text-orange-500">İlk Adımı Atın</span>
            </h2>
            <p className="text-white/50 leading-relaxed max-w-md">
              Kampanyalar, yeni ürünler ve sağlıklı yaşam ipuçları için bültenimize abone olun.
            </p>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-posta adresiniz"
                    required
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-white/30 outline-none focus:border-orange-500/60 focus:bg-white/15 transition-all"
                  />
                </div>
                <Button type="submit" size="md" className="h-12 px-6 flex-shrink-0 rounded-xl">
                  Abone Ol
                </Button>
              </form>
            ) : (
              <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-5 py-4">
                <ShieldCheck size={20} className="text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-white">Teşekkürler!</p>
                  <p className="text-xs text-white/50">Bültenimize başarıyla abone oldunuz.</p>
                </div>
              </div>
            )}
            <p className="text-xs text-white/30 mt-3 flex items-center gap-1.5">
              <ShieldCheck size={11} />
              Kişisel verileriniz güvende tutulur. İstediğiniz zaman abonelikten çıkabilirsiniz.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
