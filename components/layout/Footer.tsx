import Link from "next/link";
import { Globe, MessageSquare, Play, Users, Phone, Mail, MapPin } from "lucide-react";

const footerLinks = {
  "Alışveriş": [
    { label: "Tüm Ürünler",    href: "/urunler" },
    { label: "Kategoriler",    href: "/urunler#kategoriler" },
    { label: "Kampanyalar",    href: "/urunler?badge=Kampanya" },
    { label: "Yeni Ürünler",   href: "/urunler?sort=newest" },
    { label: "Çok Satanlar",   href: "/urunler?badge=%C3%87ok+Satan" },
  ],
  "Hesabım": [
    { label: "Hesabım",        href: "#" },
    { label: "Siparişlerim",   href: "#" },
    { label: "Favorilerim",    href: "#" },
    { label: "Adreslerim",     href: "#" },
  ],
  "Bilgi": [
    { label: "Hakkımızda",         href: "/hakkimizda" },
    { label: "Kargo & Teslimat",   href: "/kargo" },
    { label: "İade & Değişim",     href: "/iade" },
    { label: "Gizlilik Politikası",href: "/gizlilik" },
    { label: "KVKK",               href: "/kvkk" },
    { label: "SSS",                href: "/sss" },
  ],
};

const socialLinks = [
  { icon: Globe,         label: "Instagram", href: "https://instagram.com" },
  { icon: MessageSquare, label: "Facebook",  href: "https://facebook.com" },
  { icon: Play,          label: "YouTube",   href: "https://youtube.com" },
  { icon: Users,         label: "LinkedIn",  href: "https://linkedin.com" },
];

export function Footer() {
  return (
    <footer className="bg-[#070D1A] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-black tracking-tight">
                <span className="text-orange-500">DR.</span>
                <span className="text-white">MAXX</span>
              </span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Bilimsel formüllerle geliştirilmiş premium takviyeler ile daha sağlıklı bir yaşam için yanınızdayız.
            </p>
            <div className="flex items-center gap-2 mt-6">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 text-white/50 transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-white/50 hover:text-white/90 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">İletişim</h4>
            <ul className="space-y-3">
              <li>
                <a href="tel:08503099489" className="flex items-start gap-2.5 text-sm text-white/50 hover:text-white/80 transition-colors">
                  <Phone size={15} className="mt-0.5 flex-shrink-0 text-orange-500/70" />
                  <span>0850 309 9489</span>
                </a>
              </li>
              <li>
                <a href="mailto:info@drmaxx.com.tr" className="flex items-start gap-2.5 text-sm text-white/50 hover:text-white/80 transition-colors">
                  <Mail size={15} className="mt-0.5 flex-shrink-0 text-orange-500/70" />
                  <span>info@drmaxx.com.tr</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/50">
                <MapPin size={15} className="mt-0.5 flex-shrink-0 text-orange-500/70" />
                <span className="whitespace-pre-line leading-relaxed">{"İstanbul, Türkiye\nPzt - Cum: 09:00 - 18:00"}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-white/30">
            <span>© 2026 DR.MAXX. Tüm hakları saklıdır.</span>
            <span>·</span>
            <Link href="/gizlilik" className="hover:text-white/60 transition-colors">Gizlilik</Link>
            <Link href="/kvkk" className="hover:text-white/60 transition-colors">KVKK</Link>
          </div>
          <div className="flex items-center gap-3">
            {["VISA", "MC", "TROY"].map((brand) => (
              <div key={brand} className="h-7 px-3 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/60">
                {brand}
              </div>
            ))}
            <div className="h-7 px-3 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/60">GMP</div>
            <div className="h-7 px-3 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/60">ISO</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
