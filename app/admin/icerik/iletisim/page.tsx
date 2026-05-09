"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Map,
  FormInput,
  Share2,
  CheckCircle2,
} from "lucide-react";

// ─── Simple SVG social icons ──────────────────────────────────────────────────
function IgIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function FbIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function TwIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function YtIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function LiIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

// ─── Atoms ────────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
      {children}
    </p>
  );
}

function Input({
  defaultValue,
  placeholder,
  type = "text",
}: {
  defaultValue?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-400 focus:bg-white focus:outline-none w-full"
    />
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${className ?? ""}`}>
      {children}
    </div>
  );
}

function CardHeader({
  icon,
  title,
  iconBg = "bg-blue-50",
  iconColor = "text-blue-500",
}: {
  icon: React.ReactNode;
  title: string;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-5 pb-5 border-b border-gray-100">
      <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked ? "bg-orange-500" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

// ─── Section 1: İletişim Bilgileri ───────────────────────────────────────────

function ContactInfoSection() {
  const [sundayClosed, setSundayClosed] = useState(true);

  return (
    <Card>
      <CardHeader icon={<MapPin className="w-3.5 h-3.5" />} title="İletişim Bilgileri" iconBg="bg-blue-50" iconColor="text-blue-500" />

      <div className="space-y-4">
        <div>
          <Label>Adres</Label>
          <textarea
            defaultValue="Atatürk Cad. No: 42, Şişli / İstanbul, 34360"
            rows={2}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-orange-400 focus:bg-white focus:outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Telefon</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                defaultValue="+90 (212) 555 00 00"
                className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50 pl-8 pr-3 text-sm focus:border-orange-400 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
          <div>
            <Label>E-posta</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                defaultValue="info@drmaxx.com"
                className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50 pl-8 pr-3 text-sm focus:border-orange-400 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <Label>WhatsApp</Label>
          <div className="relative">
            <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              defaultValue="+90 (532) 555 00 00"
              className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50 pl-8 pr-3 text-sm focus:border-orange-400 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Çalışma Saatleri */}
        <div>
          <Label>Çalışma Saatleri</Label>
          <div className="space-y-2.5">
            {/* Hafta içi */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-20 shrink-0">Hafta içi</span>
              <div className="flex items-center gap-2 flex-1">
                <input type="time" defaultValue="09:00" className="h-8 rounded-xl border border-gray-200 bg-gray-50 px-2 text-xs focus:border-orange-400 focus:outline-none" />
                <span className="text-gray-400 text-xs">–</span>
                <input type="time" defaultValue="18:00" className="h-8 rounded-xl border border-gray-200 bg-gray-50 px-2 text-xs focus:border-orange-400 focus:outline-none" />
              </div>
            </div>
            {/* Cumartesi */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-20 shrink-0">Cumartesi</span>
              <div className="flex items-center gap-2 flex-1">
                <input type="time" defaultValue="10:00" className="h-8 rounded-xl border border-gray-200 bg-gray-50 px-2 text-xs focus:border-orange-400 focus:outline-none" />
                <span className="text-gray-400 text-xs">–</span>
                <input type="time" defaultValue="15:00" className="h-8 rounded-xl border border-gray-200 bg-gray-50 px-2 text-xs focus:border-orange-400 focus:outline-none" />
              </div>
            </div>
            {/* Pazar */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-20 shrink-0">Pazar</span>
              <div className="flex items-center gap-2">
                <Toggle checked={!sundayClosed} onChange={(v) => setSundayClosed(!v)} />
                <span className="text-xs text-gray-500">{sundayClosed ? "Kapalı" : "Açık"}</span>
              </div>
              {!sundayClosed && (
                <div className="flex items-center gap-2 flex-1">
                  <input type="time" defaultValue="11:00" className="h-8 rounded-xl border border-gray-200 bg-gray-50 px-2 text-xs focus:border-orange-400 focus:outline-none" />
                  <span className="text-gray-400 text-xs">–</span>
                  <input type="time" defaultValue="14:00" className="h-8 rounded-xl border border-gray-200 bg-gray-50 px-2 text-xs focus:border-orange-400 focus:outline-none" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Section 2: Harita ────────────────────────────────────────────────────────

function MapSection() {
  return (
    <Card>
      <CardHeader icon={<Map className="w-3.5 h-3.5" />} title="Harita" iconBg="bg-green-50" iconColor="text-green-500" />

      <div className="space-y-4">
        <div>
          <Label>Google Maps Embed URL</Label>
          <textarea
            placeholder="https://www.google.com/maps/embed?pb=..."
            rows={3}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono focus:border-orange-400 focus:bg-white focus:outline-none resize-none"
          />
          <p className="text-xs text-gray-400 mt-1.5">Harita önizlemesi için URL'yi girin</p>
        </div>

        <div>
          <Label>Harita Yüksekliği</Label>
          <select className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-400 focus:bg-white focus:outline-none appearance-none">
            <option>300px</option>
            <option>400px</option>
            <option>500px</option>
          </select>
        </div>
      </div>
    </Card>
  );
}

// ─── Section 3: Form Ayarları ─────────────────────────────────────────────────

function FormSettingsSection() {
  const [formActive, setFormActive] = useState(true);
  const [autoReply, setAutoReply] = useState(false);

  return (
    <Card>
      <CardHeader icon={<FormInput className="w-3.5 h-3.5" />} title="İletişim Formu Ayarları" iconBg="bg-purple-50" iconColor="text-purple-500" />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Form Aktif</p>
            <p className="text-xs text-gray-400">Ziyaretçilerin form göndermesine izin ver</p>
          </div>
          <Toggle checked={formActive} onChange={setFormActive} />
        </div>

        <div className={`space-y-4 ${!formActive ? "opacity-40 pointer-events-none" : ""}`}>
          <div>
            <Label>Form Başlığı</Label>
            <Input defaultValue="Bize Ulaşın" />
          </div>

          <div>
            <Label>Bildirim E-postası</Label>
            <Input defaultValue="iletisim@drmaxx.com" placeholder="admin@site.com" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Otomatik Yanıt</p>
              <p className="text-xs text-gray-400">Mesaj gönderen kişiye otomatik yanıt gönder</p>
            </div>
            <Toggle checked={autoReply} onChange={setAutoReply} />
          </div>

          {autoReply && (
            <div>
              <Label>Otomatik Yanıt Metni</Label>
              <textarea
                rows={4}
                defaultValue="Merhaba, mesajınız için teşekkür ederiz. En kısa sürede size geri dönüş yapacağız."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-orange-400 focus:bg-white focus:outline-none resize-none"
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Section 4: Sosyal Medya ──────────────────────────────────────────────────

const SOCIAL_LINKS = [
  { label: "Instagram", icon: IgIcon, color: "text-pink-500", default: "https://instagram.com/drmaxx" },
  { label: "Facebook", icon: FbIcon, color: "text-blue-600", default: "https://facebook.com/drmaxx" },
  { label: "Twitter / X", icon: TwIcon, color: "text-sky-500", default: "https://x.com/drmaxx" },
  { label: "YouTube", icon: YtIcon, color: "text-red-500", default: "" },
  { label: "LinkedIn", icon: LiIcon, color: "text-blue-700", default: "" },
];

function SocialSection() {
  return (
    <Card>
      <CardHeader icon={<Share2 className="w-3.5 h-3.5" />} title="Sosyal Medya Bağlantıları" iconBg="bg-orange-50" iconColor="text-orange-500" />

      <div className="space-y-3">
        {SOCIAL_LINKS.map(({ label, icon: Icon, color, default: def }) => (
          <div key={label} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="flex-1">
              <input
                defaultValue={def}
                placeholder={`${label} URL`}
                className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-400 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IletisimEditorPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">İletişim Sayfası</h1>
          <p className="text-sm text-gray-400 mt-0.5">İletişim sayfası içeriklerini düzenleyin</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 h-9 px-5 rounded-xl text-sm font-semibold transition-all ${
            saved ? "bg-green-500 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"
          }`}
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Kaydedildi
            </>
          ) : (
            "Kaydet"
          )}
        </button>
      </div>

      <div className="space-y-6">
        <ContactInfoSection />
        <MapSection />
        <FormSettingsSection />
        <SocialSection />
      </div>
    </div>
  );
}
