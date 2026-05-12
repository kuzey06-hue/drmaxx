"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Search, User, Heart, ShoppingCart, ChevronDown, Menu, X,
  UserPlus,
  Brain, Sparkles, Heart as HeartIcon, Baby, Droplets, Shield, Zap, Leaf,
  ArrowRight,
} from "lucide-react";
import { useState, useRef } from "react";
import { ingredients } from "@/data/categories";
import { useCart } from "@/contexts/CartContext";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "Anasayfa", href: "/", hasDropdown: false },
  { label: "Ürünler", href: "/urunler", hasDropdown: false },
  { label: "Affiliate", href: "/affiliate", hasDropdown: false },
  { label: "Kategoriler", href: "/urunler", hasDropdown: true },
  { label: "Blog", href: "/blog", hasDropdown: false },
  { label: "Hakkımızda", href: "/hakkimizda", hasDropdown: false },
  { label: "İletişim", href: "/iletisim", hasDropdown: false },
];

const categories = [
  { label: "Beyin & Odak",       desc: "Bilişsel performans ve konsantrasyon", slug: "Nörobilim",      icon: Brain,      color: "#6366F1", bg: "#EEF2FF" },
  { label: "Antioksidan",        desc: "Serbest radikal koruması",             slug: "Antioksidan",    icon: Sparkles,   color: "#F97316", bg: "#FFF7ED" },
  { label: "Beyin Sağlığı",      desc: "Nöroplastisite ve hücre desteği",      slug: "Beyin Sağlığı",  icon: HeartIcon,  color: "#8B5CF6", bg: "#F5F3FF" },
  { label: "Çocuk Sağlığı",      desc: "Büyüme ve gelişim desteği",            slug: "Çocuk Sağlığı",  icon: Baby,       color: "#10B981", bg: "#ECFDF5" },
  { label: "Omega & Yağ Asitleri", desc: "Kalp ve damar sağlığı",              slug: "Omega",          icon: Droplets,   color: "#0EA5E9", bg: "#F0F9FF" },
  { label: "Bağışıklık",         desc: "İmmün sistem güçlendirme",              slug: "Bağışıklık",     icon: Shield,     color: "#059669", bg: "#ECFDF5" },
  { label: "Enerji & Performans", desc: "Vücut ve zihin enerjisi",             slug: "Performans",     icon: Zap,        color: "#EAB308", bg: "#FEFCE8" },
  { label: "Vitamin & Mineral",  desc: "Temel besin desteği",                  slug: "Vitamin",        icon: Leaf,       color: "#22C55E", bg: "#F0FDF4" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { itemCount, openCart } = useCart();
  const { data: session } = useSession();
  const user = session?.user;

  const handleUserEnter = () => { if (userTimer.current) clearTimeout(userTimer.current); setUserOpen(true); };
  const handleUserLeave = () => { userTimer.current = setTimeout(() => setUserOpen(false), 280); };

  const handleCatEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setCatOpen(true);
  };
  const handleCatLeave = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => setCatOpen(false), 650);
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main nav */}
      <div className="bg-[#0A0F1E]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex h-16 items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-black tracking-tight">
                <span className="text-orange-500">DR.</span>
                <span className="text-white">MAXX</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1 flex-1">
              {navLinks.map((link) =>
                link.hasDropdown ? (
                  <div
                    key={link.label}
                    className="relative pb-5 -mb-5"
                    onMouseEnter={handleCatEnter}
                    onMouseLeave={handleCatLeave}
                  >
                    <button
                      className="flex items-center gap-0.5 px-3 py-2 text-sm font-medium text-white/75 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    >
                      {link.label}
                      <ChevronDown
                        size={14}
                        className={`opacity-60 transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    <AnimatePresence>
                      {catOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.18 }}
                          className="absolute left-1/2 -translate-x-1/2 top-[calc(100%-12px)] pt-4 z-50"
                          onMouseEnter={handleCatEnter}
                          onMouseLeave={handleCatLeave}
                        >
                          <div className="w-[680px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                              <div>
                                <p className="text-sm font-bold text-gray-900">Tüm Kategoriler</p>
                                <p className="text-xs text-gray-400 mt-0.5">Sağlık hedefinize göre takviye seçin</p>
                              </div>
                              <Link
                                href="/urunler"
                                className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                              >
                                Tüm Ürünler <ArrowRight size={12} />
                              </Link>
                            </div>

                            <div className="grid grid-cols-4 gap-px bg-gray-100">
                              {categories.map(({ label, desc, slug, icon: Icon, color, bg }) => (
                                <Link
                                  key={slug}
                                  href={`/urunler?kategori=${encodeURIComponent(slug)}`}
                                  className="group flex items-start gap-3 px-4 py-4 bg-white hover:bg-gray-50 transition-colors"
                                  onClick={() => setCatOpen(false)}
                                >
                                  <div
                                    className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl mt-0.5"
                                    style={{ backgroundColor: bg }}
                                  >
                                    <Icon size={18} style={{ color }} strokeWidth={1.8} />
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-gray-800 group-hover:text-gray-900 leading-snug">{label}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
                                  </div>
                                </Link>
                              ))}
                            </div>

                            <div className="px-5 py-3 bg-gradient-to-r from-orange-50 to-amber-50 border-t border-orange-100 flex items-center justify-between">
                              <p className="text-xs text-gray-600">
                                <span className="font-bold text-orange-500">Size En Uygun Ürünü</span> bulmak için testi başlatın
                              </p>
                              <Link
                                href="/#urun-bulucu"
                                className="text-[11px] font-bold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1"
                                onClick={() => setCatOpen(false)}
                              >
                                Teste Başla <ArrowRight size={11} />
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-0.5 px-3 py-2 text-sm font-medium text-white/75 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 ml-auto lg:ml-0">
              <Link
                href="/orijinallik-sorgulama"
                className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Orijinal ürün sorgulama"
              >
                <Shield size={17} />
              </Link>
              <Link
                href="/giris?mode=kayit"
                className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Üye ol"
              >
                <UserPlus size={17} />
              </Link>
              <Link
                href="/giris"
                className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Üye girişi"
              >
                <User size={17} />
              </Link>

              <div className="relative hidden md:block">
                <button
                  onClick={() => setSearchOpen((v) => !v)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  aria-label="Arama"
                >
                  <Search size={18} />
                </button>

                <AnimatePresence>
                  {searchOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full pt-2 z-50 w-72"
                    >
                      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Ürün veya kategori ara..."
                            className="w-full h-10 pl-10 pr-9 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm placeholder:text-gray-400 outline-none focus:border-orange-500"
                          />
                          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <button
                            onClick={() => setSearchOpen(false)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            aria-label="Aramayı kapat"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Kullanıcı menüsü */}
              <div
                className="relative hidden md:block pb-3 -mb-3"
                onMouseEnter={handleUserEnter}
                onMouseLeave={handleUserLeave}
              >
                {user ? (
                  <button className="flex items-center gap-2 h-9 px-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all">
                    {user.image ? (
                      <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-orange-400/50">
                        <Image src={user.image} alt={user.name ?? ""} width={28} height={28} className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-black">
                        {(user.name ?? user.email ?? "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                    )}
                    <span className="text-xs font-semibold max-w-[80px] truncate">
                      {user.name?.split(" ")[0] ?? "Hesabım"}
                    </span>
                  </button>
                ) : (
                  <Link
                    href="/giris"
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <User size={18} />
                  </Link>
                )}

                {/* Dropdown */}
                <AnimatePresence>
                  {userOpen && user && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full pt-1 z-50 w-52"
                      onMouseEnter={handleUserEnter}
                      onMouseLeave={handleUserLeave}
                    >
                      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-1">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                        </div>
                        <Link href="/hesabim" onClick={() => setUserOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <User size={14} className="text-gray-400" /> Hesabım
                        </Link>
                        <Link href="/hesabim" onClick={() => setUserOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <Heart size={14} className="text-gray-400" /> Siparişlerim
                        </Link>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <User size={14} /> Çıkış Yap
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all">
                <Heart size={18} />
              </button>
              <Link
                href="/orijinallik-sorgulama"
                className="hidden md:flex items-center gap-2 h-9 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all border border-white/10"
              >
                <Shield size={15} />
                <span>Orijinallik</span>
              </Link>
              <button
                onClick={openCart}
                className="flex items-center gap-2 h-9 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-all shadow-lg shadow-orange-500/25"
              >
                <ShoppingCart size={16} />
                <span className="hidden sm:inline">Sepetim</span>
                {itemCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-orange-500 text-xs font-bold">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all ml-1"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-white/10 lg:hidden"
            >
              <nav className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    {link.label}
                    {link.hasDropdown && <ChevronDown size={14} />}
                  </Link>
                ))}
                <div className="mt-2 pt-2 border-t border-white/10">
                  <p className="px-3 py-1.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">Kategoriler</p>
                  {categories.map(({ label, slug, icon: Icon, color, bg }) => (
                    <Link
                      key={slug}
                      href={`/urunler?kategori=${encodeURIComponent(slug)}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: bg + "22" }}>
                        <Icon size={14} style={{ color }} strokeWidth={1.8} />
                      </div>
                      <span className="text-sm text-white/75">{label}</span>
                    </Link>
                  ))}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ingredient ticker */}
      <div className="bg-[#060B18] border-b border-white/5 overflow-hidden py-2">
        <div className="flex whitespace-nowrap animate-[marquee_30s_linear_infinite]">
          {[...ingredients, ...ingredients].map((item, i) => (
            <span key={i} className="inline-flex items-center text-xs text-white/50 font-medium mx-4">
              <span className="mr-4 text-orange-500/60">✦</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}

