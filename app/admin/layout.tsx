"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard, Package, ShoppingBag, Users, BarChart2, Settings, LogOut,
  ChevronRight, ChevronDown, Home, FileText, Mail, BookOpen, Layers, Menu as MenuIcon,
  UserCog, Globe, Ticket, Store,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
}

const navGroups: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "Mağaza",
    items: [
      { label: "Ürünler",    href: "/admin/urunler",    icon: Package },
      { label: "Siparişler", href: "/admin/siparisler", icon: ShoppingBag },
      { label: "Müşteriler", href: "/admin/musteriler", icon: Users },
      { label: "Kuponlar",    href: "/admin/kuponlar",   icon: Ticket },
      { label: "Pazaryeri",  href: "/admin/pazaryeri",  icon: Store },
      { label: "Raporlar",   href: "/admin/raporlar",   icon: BarChart2 },
    ],
  },
  {
    title: "İçerik",
    items: [
      { label: "Anasayfa", href: "/admin/icerik/anasayfa", icon: Home },
      {
        label: "Blog",
        href: "/admin/icerik/blog",
        icon: BookOpen,
        children: [
          { label: "Tüm Yazılar",  href: "/admin/icerik/blog" },
          { label: "Yeni Yazı",    href: "/admin/icerik/blog/ekle" },
          { label: "Kategoriler",  href: "/admin/icerik/blog/kategoriler" },
        ],
      },
      { label: "Sayfalar",   href: "/admin/icerik/sayfalar", icon: Layers },
      { label: "Menü",       href: "/admin/icerik/menu",     icon: MenuIcon },
      { label: "İletişim",   href: "/admin/icerik/iletisim", icon: Mail },
    ],
  },
  {
    title: "Sistem",
    items: [
      { label: "Kullanıcılar", href: "/admin/kullanicilar", icon: UserCog },
      { label: "Ayarlar",      href: "/admin/ayarlar",      icon: Settings },
    ],
  },
];

const pageTitles: Record<string, string> = {
  "/admin":                       "Dashboard",
  "/admin/urunler":               "Ürün Yönetimi",
  "/admin/siparisler":            "Sipariş Yönetimi",
  "/admin/musteriler":            "Müşteriler",
  "/admin/kuponlar":              "Kupon Yönetimi",
  "/admin/pazaryeri":             "Pazaryeri Entegrasyonu",
  "/admin/raporlar":              "Raporlar",
  "/admin/ayarlar":               "Ayarlar",
  "/admin/kullanicilar":          "Kullanıcılar",
  "/admin/icerik/anasayfa":       "Anasayfa Editörü",
  "/admin/icerik/blog":           "Blog Yazıları",
  "/admin/icerik/blog/ekle":      "Yeni Blog Yazısı",
  "/admin/icerik/blog/kategoriler":"Blog Kategorileri",
  "/admin/icerik/sayfalar":       "Sayfalar",
  "/admin/icerik/menu":           "Menü Yönetimi",
  "/admin/icerik/iletisim":       "İletişim Sayfası",
};

function NavItemComponent({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const isActive = pathname === item.href || (item.children?.some(c => pathname === c.href)) ||
                   (item.children && pathname.startsWith(item.href + "/"));
  const hasChildren = item.children && item.children.length > 0;
  const [open, setOpen] = useState(!!isActive);

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
            isActive ? "text-white bg-white/10" : "text-white/50 hover:text-white hover:bg-white/8"
          }`}
        >
          <Icon size={17} className={isActive ? "text-orange-400" : "text-white/40 group-hover:text-white/80"} />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown size={13} className={`transition-transform duration-200 opacity-50 ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="ml-8 mt-0.5 space-y-0.5">
            {item.children!.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  pathname === child.href
                    ? "text-orange-400 bg-orange-500/10"
                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                <span className={`w-1 h-1 rounded-full ${pathname === child.href ? "bg-orange-400" : "bg-white/20"}`} />
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
        isActive
          ? "bg-[#F97316] text-white shadow-lg shadow-orange-500/20"
          : "text-white/50 hover:text-white hover:bg-white/8"
      }`}
    >
      <Icon size={17} className={isActive ? "text-white" : "text-white/40 group-hover:text-white/80"} />
      <span>{item.label}</span>
      {isActive && <ChevronRight size={14} className="ml-auto opacity-70" />}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const pageTitle = pageTitles[pathname] ?? (
    pathname.startsWith("/admin/icerik/blog/duzenle") ? "Blog Yazısını Düzenle" : "Admin Panel"
  );

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#0F1729] flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F97316] flex items-center justify-center">
              <span className="text-white font-black text-xs">DM</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">DR.MAXX</p>
              <p className="text-white/40 text-[10px] uppercase tracking-widest mt-0.5">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {group.title && (
                <p className="px-3 mb-1.5 text-[10px] font-bold text-white/25 uppercase tracking-widest">
                  {group.title}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItemComponent key={item.href} item={item} pathname={pathname} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom user section */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/5 transition-all text-xs"
          >
            <Globe size={15} />
            Siteyi Görüntüle
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-white text-xs font-semibold truncate">Admin</p>
              <p className="text-white/40 text-[10px] truncate">admin@drmaxx.com</p>
            </div>
            <LogOut size={14} className="text-white/30 group-hover:text-red-400 flex-shrink-0 transition-colors" />
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-6 gap-4 flex-shrink-0">
          <h1 className="text-sm font-bold text-gray-900 flex-1">{pageTitle}</h1>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400">
              {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
