"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Sparkles } from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function GirisForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/hesabim";

  const [mode, setMode] = useState<"giris" | "kayit">("giris");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError(null);
    await signIn("google", { callbackUrl: from });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "kayit") {
      // Kayıt ol
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }

      // Başarılı kayıt → giriş yap
      const result = await signIn("credentials", {
        email: form.email, password: form.password, redirect: false,
      });
      if (result?.error) { setError("Giriş yapılamadı."); setLoading(false); return; }
      router.push(from);
    } else {
      // Giriş yap
      const result = await signIn("credentials", {
        email: form.email, password: form.password, redirect: false,
      });
      if (result?.error) {
        setError("E-posta veya şifre hatalı.");
        setLoading(false);
        return;
      }
      router.push(from);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sol panel — marka */}
      <div className="hidden lg:flex w-[480px] flex-shrink-0 bg-[#0A0F1E] flex-col justify-between p-12">
        <Link href="/">
          <span className="text-2xl font-black">
            <span className="text-orange-500">DR.</span>
            <span className="text-white">MAXX</span>
          </span>
        </Link>

        <div>
          <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mb-6">
            <Sparkles size={24} className="text-orange-400" />
          </div>
          <h2 className="text-3xl font-black text-white leading-tight mb-4">
            Sağlığınıza<br />
            <span className="text-orange-400">premium</span> yatırım
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Hesabınıza giriş yaparak sipariş geçmişinizi takip edin, özel tekliflerden haberdar olun.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: "🔒", text: "Kişisel verileriniz şifreli korunur" },
              { icon: "📦", text: "Siparişlerinizi kolayca takip edin" },
              { icon: "🎁", text: "Üyelere özel kampanyalar ve indirimler" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/60 text-sm">
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/20 text-xs">© 2026 DR.MAXX · Tüm hakları saklıdır.</p>
      </div>

      {/* Sağ panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobil logo */}
          <Link href="/" className="flex lg:hidden justify-center mb-8">
            <span className="text-xl font-black">
              <span className="text-orange-500">DR.</span>
              <span className="text-gray-900">MAXX</span>
            </span>
          </Link>

          <h1 className="text-2xl font-black text-gray-900 mb-1">
            {mode === "giris" ? "Hoş geldiniz" : "Hesap oluşturun"}
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            {mode === "giris"
              ? "Hesabınıza giriş yapın veya yeni hesap oluşturun."
              : "Birkaç adımda üyeliğinizi tamamlayın."}
          </p>

          {/* Google butonu */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 h-12 rounded-2xl border-2 border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-all disabled:opacity-60 shadow-sm"
          >
            {googleLoading
              ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              : <GoogleIcon />}
            <span>Google ile {mode === "giris" ? "giriş yap" : "kayıt ol"}</span>
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">veya e-posta ile</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "kayit" && (
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Ad Soyad</label>
                <input
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Adınız Soyadınız"
                  required
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-orange-400 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">E-posta</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="ornek@email.com"
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-orange-400 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Şifre</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder={mode === "kayit" ? "En az 6 karakter" : "Şifreniz"}
                  required
                  className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-orange-400 focus:bg-white focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
              >
                <AlertCircle size={15} className="flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all disabled:opacity-60 shadow-lg shadow-orange-500/25"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <>
                    {mode === "giris" ? "Giriş Yap" : "Hesap Oluştur"}
                    <ArrowRight size={15} />
                  </>}
            </button>
          </form>

          {/* Mod geçişi */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {mode === "giris" ? (
              <>Hesabınız yok mu?{" "}
                <button onClick={() => { setMode("kayit"); setError(null); }} className="font-bold text-orange-500 hover:text-orange-600 transition-colors">
                  Kayıt Olun
                </button>
              </>
            ) : (
              <>Zaten üye misiniz?{" "}
                <button onClick={() => { setMode("giris"); setError(null); }} className="font-bold text-orange-500 hover:text-orange-600 transition-colors">
                  Giriş Yapın
                </button>
              </>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function GirisPage() {
  return (
    <Suspense>
      <GirisForm />
    </Suspense>
  );
}
