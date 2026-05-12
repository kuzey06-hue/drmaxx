"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2, Users, Megaphone, Handshake } from "lucide-react";

type FormState = {
  name: string;
  email: string;
  phone: string;
  city: string;
  instagram: string;
  website: string;
  channel: string;
  message: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  city: "",
  instagram: "",
  website: "",
  channel: "",
  message: "",
};

export default function AffiliatePage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDone(false);

    try {
      const res = await fetch("/api/cms/affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Başvuru gönderilemedi.");
        setLoading(false);
        return;
      }
      setForm(EMPTY_FORM);
      setDone(true);
    } catch {
      setError("Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <Navbar />
      <section className="bg-[#070D1A] text-white py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-orange-400 text-sm font-semibold">Affiliate Program</p>
            <h1 className="text-4xl md:text-5xl font-black mt-3 leading-tight">
              DR.MAXX ile
              <br />
              Kazanç Ortaklığı
            </h1>
            <p className="text-white/70 mt-4">
              İçerik üreticileri, eczane networkleri ve satış partnerleri için özel komisyon modeli.
            </p>
            <div className="mt-8 space-y-3">
              {[
                { icon: Users, text: "Kişiye özel referans kodu" },
                { icon: Megaphone, text: "Performansa göre komisyon artışı" },
                { icon: Handshake, text: "Marka ve içerik desteği" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-white/85">
                  <Icon size={16} className="text-orange-400" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-gray-900">
            <h2 className="text-lg font-bold">Başvuru Formu</h2>
            <p className="text-sm text-gray-500 mt-1">Formu doldurun, ekibimiz size dönüş yapsın.</p>

            {done && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
                <CheckCircle2 size={16} />
                Başvurunuz alındı.
              </div>
            )}
            {error && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <input required value={form.name} onChange={setField("name")} placeholder="Ad Soyad" className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm" />
              <input required type="email" value={form.email} onChange={setField("email")} placeholder="E-posta" className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm" />
              <input value={form.phone} onChange={setField("phone")} placeholder="Telefon" className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.city} onChange={setField("city")} placeholder="İl" className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm" />
                <input value={form.channel} onChange={setField("channel")} placeholder="Kanal Türü" className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input value={form.instagram} onChange={setField("instagram")} placeholder="Instagram" className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm" />
                <input value={form.website} onChange={setField("website")} placeholder="Web Site" className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm" />
              </div>
              <textarea value={form.message} onChange={setField("message")} placeholder="Kısaca iş modeliniz" rows={4} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
              <button disabled={loading} className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold disabled:opacity-50">
                {loading ? "Gönderiliyor..." : "Başvuruyu Gönder"}
              </button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
