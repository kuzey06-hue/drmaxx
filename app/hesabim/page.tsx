"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Package, User, LogOut, ChevronRight,
  ShoppingBag, MapPin, Bell, Shield,
} from "lucide-react";

interface OrderItem { productId: string; productName: string; quantity: number; price: number; }
interface Order {
  id: string; orderNo: string; customer: string; email: string;
  total: number; status: string; date: string; items: OrderItem[];
  paymentMethod: string;
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  "Beklemede":     { label: "Beklemede",     cls: "bg-yellow-100 text-yellow-700" },
  "İşleniyor":    { label: "İşleniyor",     cls: "bg-blue-100 text-blue-700" },
  "Kargoda":      { label: "Kargoda",       cls: "bg-purple-100 text-purple-700" },
  "Teslim Edildi":{ label: "Teslim Edildi", cls: "bg-green-100 text-green-700" },
  "İptal":        { label: "İptal",         cls: "bg-red-100 text-red-700" },
};

function fmt(n: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
}

type Tab = "siparisler" | "profil";

export default function HesabimPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("siparisler");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Oturumu yoksa giriş sayfasına yönlendir
  useEffect(() => {
    if (status === "unauthenticated") router.push("/giris");
  }, [status, router]);

  // Siparişleri çek (e-posta ile filtrele)
  useEffect(() => {
    if (!session?.user?.email) return;
    fetch("/api/cms/orders")
      .then(r => r.json())
      .then((all: Order[]) => {
        const mine = all.filter(
          o => o.email?.toLowerCase() === session.user!.email!.toLowerCase()
        );
        setOrders(mine);
        setOrdersLoading(false);
      })
      .catch(() => setOrdersLoading(false));
  }, [session?.user?.email]);

  if (status === "loading") {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <span className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  if (!session?.user) return null;

  const user = session.user;
  const initials = (user.name ?? user.email ?? "U")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <main>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-10">

          {/* Profil başlığı */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6 flex items-center gap-5"
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {user.image ? (
                <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-orange-100">
                  <Image src={user.image} alt={user.name ?? ""} width={64} height={64} className="object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl font-black">
                  {initials}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-black text-gray-900 truncate">{user.name ?? "Kullanıcı"}</h1>
              <p className="text-sm text-gray-400 truncate">{user.email}</p>
              <p className="text-xs text-green-600 font-semibold mt-1">✓ Aktif Üye</p>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </motion.div>

          {/* Stat kartları */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {[
              { icon: ShoppingBag, label: "Toplam Sipariş", value: orders.length },
              { icon: Package,     label: "Teslim Edilen",  value: orders.filter(o => o.status === "Teslim Edildi").length },
              { icon: Bell,        label: "Aktif Sipariş",  value: orders.filter(o => o.status === "İşleniyor" || o.status === "Kargoda").length },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-xl font-black text-gray-900">{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tab geçişleri */}
          <div className="flex gap-2 mb-5">
            {([
              { id: "siparisler", icon: Package,  label: "Siparişlerim" },
              { id: "profil",     icon: User,     label: "Profilim" },
            ] as { id: Tab; icon: React.ElementType; label: string }[]).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  tab === id
                    ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-orange-300 hover:text-orange-500"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {/* ── SİPARİŞLER TABU ──────────────────────────────── */}
          {tab === "siparisler" && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {ordersLoading ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 flex items-center justify-center">
                  <span className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center text-center">
                  <ShoppingBag size={48} className="text-gray-200 mb-4" />
                  <h3 className="font-bold text-gray-600 mb-1">Henüz sipariş vermemişsiniz</h3>
                  <p className="text-sm text-gray-400 mb-6">Ürünlerimizi keşfetmeye başlayın.</p>
                  <Link
                    href="/urunler"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors"
                  >
                    Ürünlere Git <ChevronRight size={14} />
                  </Link>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm font-black text-gray-900 font-mono">{order.orderNo}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${statusConfig[order.status]?.cls ?? "bg-gray-100 text-gray-600"}`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Ürünler */}
                    <div className="space-y-1.5 mb-4">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-700 truncate">{item.productName} <span className="text-gray-400">×{item.quantity}</span></span>
                          <span className="text-gray-800 font-semibold flex-shrink-0 ml-4">{fmt(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{order.paymentMethod}</span>
                      </div>
                      <p className="font-black text-gray-900">{fmt(order.total)}</p>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* ── PROFİL TABU ──────────────────────────────────── */}
          {tab === "profil" && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <h2 className="font-bold text-gray-900">Hesap Bilgileri</h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Ad Soyad</label>
                    <div className="h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center text-sm text-gray-700">
                      {user.name ?? "—"}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">E-posta</label>
                    <div className="h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center text-sm text-gray-700">
                      {user.email}
                    </div>
                  </div>
                </div>

                {/* Güvenlik notu */}
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <Shield size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Google hesabınızla giriş yapıyorsunuz. Şifre ve profil bilgilerinizi Google hesabı ayarlarından yönetebilirsiniz.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-4">Adres Defteri</h2>
                <div className="flex flex-col items-center py-6 text-center text-gray-400">
                  <MapPin size={32} className="text-gray-200 mb-2" />
                  <p className="text-sm">Henüz kayıtlı adres yok</p>
                  <p className="text-xs mt-1">Ödeme yaparken adresiniz otomatik kaydedilir.</p>
                </div>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-red-100 text-red-500 font-semibold text-sm hover:bg-red-50 transition-colors"
              >
                <LogOut size={15} />
                Hesaptan Çıkış Yap
              </button>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
