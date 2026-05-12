"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from "lucide-react";

export default function IletisimPage() {
  const [form, setForm] = useState({ ad: "", email: "", konu: "", mesaj: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setSending(false);
  };

  return (
    <main>
      <Navbar />

      {/* Header */}
      <div className="bg-[#0A0F1E] py-16 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-3">İletişim</p>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4">Bizimle İletişime Geçin</h1>
          <p className="text-white/40 max-w-lg mx-auto text-sm leading-relaxed">
            Sorularınız, önerileriniz veya sipariş desteği için buradayız.
            Ekibimiz en kısa sürede size geri dönecektir.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">

            {/* Form */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              {sent ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12 gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle size={28} className="text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Mesajınız İletildi!</h3>
                  <p className="text-gray-500 text-sm max-w-xs">
                    En kısa sürede {form.email} adresine geri döneceğiz.
                  </p>
                  <button onClick={() => { setSent(false); setForm({ ad: "", email: "", konu: "", mesaj: "" }); }}
                    className="mt-2 text-orange-500 text-sm font-semibold hover:underline">
                    Yeni mesaj gönder
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Mesaj Gönderin</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Ad Soyad</label>
                        <input value={form.ad} onChange={set("ad")} required placeholder="Adınız Soyadınız"
                          className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-400 focus:bg-white focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">E-posta</label>
                        <input value={form.email} onChange={set("email")} required type="email" placeholder="ornek@email.com"
                          className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-400 focus:bg-white focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Konu</label>
                      <select value={form.konu} onChange={set("konu")} required
                        className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-400 focus:bg-white focus:outline-none">
                        <option value="">Seçin...</option>
                        {["Ürün Bilgisi", "Sipariş Takibi", "İade & Değişim", "Kargo", "Diğer"].map(k => (
                          <option key={k}>{k}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Mesaj</label>
                      <textarea value={form.mesaj} onChange={set("mesaj")} required rows={5} placeholder="Mesajınızı buraya yazın..."
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-orange-400 focus:bg-white focus:outline-none resize-none" />
                    </div>
                    <button type="submit" disabled={sending}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors disabled:opacity-50 shadow-lg shadow-orange-500/20">
                      {sending ? "Gönderiliyor..." : <><Send size={15} /> Mesajı Gönder</>}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Info */}
            <div className="space-y-5">
              {[
                { icon: Phone, title: "Telefon", lines: ["0850 309 9489", "Pzt - Cum: 09:00 - 18:00"], color: "bg-blue-50 text-blue-500" },
                { icon: Mail, title: "E-posta", lines: ["info@drmaxx.com.tr", "Yanıt süresi: 24 saat"], color: "bg-orange-50 text-orange-500" },
                { icon: MapPin, title: "Adres", lines: ["İstanbul, Türkiye", "Merkez Ofis"], color: "bg-green-50 text-green-500" },
                { icon: Clock, title: "Çalışma Saatleri", lines: ["Pzt - Cum: 09:00 - 18:00", "Cmt: 10:00 - 14:00"], color: "bg-purple-50 text-purple-500" },
              ].map(({ icon: Icon, title, lines, color }) => (
                <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color.split(" ")[0]}`}>
                    <Icon size={20} className={color.split(" ")[1]} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{title}</p>
                    {lines.map(line => (
                      <p key={line} className="text-sm text-gray-500 mt-0.5">{line}</p>
                    ))}
                  </div>
                </div>
              ))}

              {/* SSS link */}
              <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-5 text-white">
                <h3 className="font-bold mb-1">Hızlı Cevaplar</h3>
                <p className="text-white/80 text-xs mb-3">Sık sorulan sorulara göz atın, hemen yanıt bulun.</p>
                <a href="/sss" className="inline-block px-4 py-2 rounded-xl bg-white text-orange-500 text-xs font-bold hover:bg-orange-50 transition-colors">
                  SSS&apos;ye Git →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
