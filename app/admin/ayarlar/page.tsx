"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Store, Truck, CreditCard, Bell, Shield, Palette, Globe, Save, Eye, EyeOff,
  Upload, Plus, X, Check, Building2, RefreshCw, Trash2,
} from "lucide-react";

interface BankAccount {
  id: string;
  banka: string;
  hesapSahibi: string;
  iban: string;
  subeAdi?: string;
  hesapNo?: string;
  aciklama?: string;
}

const EMPTY_ACCOUNT: Omit<BankAccount, "id"> = {
  banka: "", hesapSahibi: "", iban: "", subeAdi: "", hesapNo: "", aciklama: "",
};

const bankInputCls = "w-full h-9 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all";

function BankForm({
  value,
  onChange,
}: {
  value: Omit<BankAccount, "id"> | BankAccount;
  onChange: (v: Omit<BankAccount, "id"> | BankAccount) => void;
}) {
  const set = (k: keyof typeof value, v: string) => onChange({ ...value, [k]: v });
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Banka Adı *</label>
        <input value={value.banka} onChange={e => set("banka", e.target.value)}
          placeholder="Ziraat Bankası, Garanti, İş Bankası..." className={bankInputCls} />
      </div>
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Hesap Sahibi *</label>
        <input value={value.hesapSahibi} onChange={e => set("hesapSahibi", e.target.value)}
          placeholder="DR MAXX İlaç San. Tic. A.Ş." className={bankInputCls} />
      </div>
      <div className="col-span-2 space-y-1">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">IBAN *</label>
        <input value={value.iban} onChange={e => set("iban", e.target.value.toUpperCase())}
          placeholder="TR00 0000 0000 0000 0000 0000 00" className={bankInputCls} maxLength={32} />
      </div>
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Şube Adı / Kodu</label>
        <input value={value.subeAdi ?? ""} onChange={e => set("subeAdi", e.target.value)}
          placeholder="Merkez Şubesi / 1234" className={bankInputCls} />
      </div>
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Hesap No</label>
        <input value={value.hesapNo ?? ""} onChange={e => set("hesapNo", e.target.value)}
          placeholder="12345678" className={bankInputCls} />
      </div>
      <div className="col-span-2 space-y-1">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Açıklama (opsiyonel)</label>
        <input value={value.aciklama ?? ""} onChange={e => set("aciklama", e.target.value)}
          placeholder="Havale yaparken sipariş numaranızı belirtin" className={bankInputCls} />
      </div>
    </div>
  );
}

function IbanRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide w-16 flex-shrink-0">{label}</span>
      <span className="text-xs font-mono text-gray-700 bg-white px-2 py-1 rounded-lg border border-gray-100 tracking-wider select-all">{value}</span>
    </div>
  );
}

const TABS = [
  { id: "genel", label: "Genel", icon: Store },
  { id: "kargo", label: "Kargo", icon: Truck },
  { id: "odeme", label: "Ödeme", icon: CreditCard },
  { id: "bildirim", label: "Bildirimler", icon: Bell },
  { id: "guvenlik", label: "Güvenlik", icon: Shield },
  { id: "gorunum", label: "Görünüm", icon: Palette },
  { id: "seo", label: "SEO", icon: Globe },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-orange-500" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-8 py-5 border-b border-gray-100 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Input({ defaultValue, placeholder, type = "text", className = "" }: {
  defaultValue?: string; placeholder?: string; type?: string; className?: string;
}) {
  return (
    <input
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className={`h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:outline-none transition-all ${className}`}
    />
  );
}

export default function AyarlarPage() {
  const [activeTab, setActiveTab] = useState("genel");
  const [saved, setSaved] = useState(false);

  // Banka / Havale-EFT state
  const [bankaActive, setBankaActive] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankaLoading, setBankaLoading] = useState(true);
  const [bankaSaving, setBankaSaving] = useState(false);
  const [bankaSaved, setBankaSaved] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [newAccountForm, setNewAccountForm] = useState<Omit<BankAccount, "id"> | null>(null);

  useEffect(() => {
    fetch("/api/cms/banka")
      .then(r => r.json())
      .then(data => {
        setBankaActive(data.active ?? false);
        setBankAccounts(data.accounts ?? []);
        setBankaLoading(false);
      })
      .catch(() => setBankaLoading(false));
  }, []);

  const saveBanka = async (accounts: BankAccount[], active: boolean) => {
    setBankaSaving(true);
    await fetch("/api/cms/banka", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active, accounts }),
    });
    setBankaSaving(false);
    setBankaSaved(true);
    setTimeout(() => setBankaSaved(false), 2000);
  };

  const addAccount = () => {
    if (!newAccountForm || !newAccountForm.banka || !newAccountForm.iban) return;
    const account: BankAccount = { ...newAccountForm, id: String(Date.now()) };
    const updated = [...bankAccounts, account];
    setBankAccounts(updated);
    setNewAccountForm(null);
    saveBanka(updated, bankaActive);
  };

  const updateAccount = () => {
    if (!editingAccount) return;
    const updated = bankAccounts.map(a => a.id === editingAccount.id ? editingAccount : a);
    setBankAccounts(updated);
    setEditingAccount(null);
    saveBanka(updated, bankaActive);
  };

  const deleteAccount = (id: string) => {
    const updated = bankAccounts.filter(a => a.id !== id);
    setBankAccounts(updated);
    saveBanka(updated, bankaActive);
  };

  const toggleBankaActive = (v: boolean) => {
    setBankaActive(v);
    saveBanka(bankAccounts, v);
  };

  // Toggle states
  const [toggles, setToggles] = useState({
    maintenance: false,
    freeShipping: true,
    smsNotif: true,
    emailNotif: true,
    orderNotif: true,
    reviewNotif: true,
    lowStockNotif: true,
    failedPaymentNotif: true,
    twoFactor: false,
    activityLog: true,
    metaPixel: false,
    googleAnalytics: true,
    richSnippets: true,
    sitemap: true,
    paytrActive: true,
  } as Record<string, boolean>);
  const [notificationEmail, setNotificationEmail] = useState("admin@drmaxx.com.tr");
  const [orderNotificationEmails, setOrderNotificationEmails] = useState(["admin@drmaxx.com.tr", ""]);

  const [showPassword, setShowPassword] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([
    { title: "Kredi / Banka Kartı", desc: "Visa, Mastercard, Troy", active: true },
    { title: "Havale / EFT", desc: "Banka transferi ile ödeme", active: true },
    { title: "Kapıda Ödeme", desc: "+15 ₺ hizmet bedeli", active: false },
    { title: "Apple Pay / Google Pay", desc: "Dijital cüzdan ödemeleri", active: false },
  ]);
  const togglePayment = (i: number) =>
    setPaymentMethods((prev) => prev.map((m, idx) => idx === i ? { ...m, active: !m.active } : m));
  const [shippingZones, setShippingZones] = useState([
    { id: 1, region: "İstanbul", cost: "0", free_limit: "500" },
    { id: 2, region: "Ankara", cost: "29.90", free_limit: "500" },
    { id: 3, region: "İzmir", cost: "29.90", free_limit: "500" },
    { id: 4, region: "Diğer İller", cost: "39.90", free_limit: "750" },
  ]);

  const setToggle = (key: string) => (v: boolean) =>
    setToggles((prev) => ({ ...prev, [key]: v }));

  useEffect(() => {
    fetch("/api/cms/notification-settings")
      .then((r) => r.json())
      .then((data) => {
        setToggles((prev) => ({
          ...prev,
          emailNotif: data.emailNotif ?? true,
          smsNotif: data.smsNotif ?? true,
          orderNotif: data.orderNotif ?? true,
          reviewNotif: data.reviewNotif ?? true,
          lowStockNotif: data.lowStockNotif ?? true,
          failedPaymentNotif: data.failedPaymentNotif ?? true,
        }));
        setNotificationEmail(data.notificationEmail ?? "admin@drmaxx.com.tr");
        const recipients = Array.isArray(data.orderNotificationEmails)
          ? data.orderNotificationEmails
          : [data.notificationEmail ?? "admin@drmaxx.com.tr"];
        setOrderNotificationEmails([recipients[0] ?? "", recipients[1] ?? ""]);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    await fetch("/api/cms/notification-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailNotif: toggles.emailNotif,
        smsNotif: toggles.smsNotif,
        orderNotif: toggles.orderNotif,
        reviewNotif: toggles.reviewNotif,
        lowStockNotif: toggles.lowStockNotif,
        failedPaymentNotif: toggles.failedPaymentNotif,
        notificationEmail,
        orderNotificationEmails: orderNotificationEmails.map((email) => email.trim()).filter(Boolean),
      }),
    }).catch(() => {});
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ayarlar</h1>
          <p className="text-sm text-gray-400 mt-0.5">Mağaza tercihlerinizi yönetin</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            saved
              ? "bg-green-500 text-white"
              : "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-200"
          }`}
        >
          {saved ? <Check size={15} /> : <Save size={15} />}
          {saved ? "Kaydedildi" : "Kaydet"}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Tab sidebar */}
        <nav className="flex-shrink-0 w-48">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-b border-gray-50 last:border-0 ${
                  activeTab === id
                    ? "bg-orange-50 text-orange-500"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >

          {/* ── GENEL ── */}
          {activeTab === "genel" && (
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-1">Genel Ayarlar</h2>
              <p className="text-xs text-gray-400 mb-6">Mağaza temel bilgileri</p>

              <Field label="Mağaza Adı" hint="Sitenin başlık ve meta etiketlerinde görünür">
                <Input defaultValue="DR.MAXX" className="w-56" />
              </Field>
              <Field label="Mağaza Adresi (URL)" hint="Canonical URL için kullanılır">
                <Input defaultValue="https://drmaxx.com.tr" className="w-56" />
              </Field>
              <Field label="İletişim E-postası" hint="Müşteri bildirimleri bu adrese gönderilir">
                <Input defaultValue="info@drmaxx.com.tr" type="email" className="w-56" />
              </Field>
              <Field label="Telefon" hint="Footer ve iletişim sayfasında gösterilir">
                <Input defaultValue="0850 309 9489" className="w-44" />
              </Field>
              <Field label="Para Birimi" hint="Tüm fiyatlar bu birimde gösterilir">
                <select className="h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 focus:border-orange-400 focus:outline-none">
                  <option>TRY — Türk Lirası (₺)</option>
                  <option>USD — Amerikan Doları ($)</option>
                  <option>EUR — Euro (€)</option>
                </select>
              </Field>
              <Field label="Bakım Modu" hint="Aktif edildiğinde siteyi ziyaretçilere kapatır">
                <Toggle checked={toggles.maintenance} onChange={setToggle("maintenance")} />
              </Field>
              <Field label="Mağaza Logosu" hint="PNG veya SVG, en az 200×60px">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all">
                  <Upload size={14} />
                  Logo Yükle
                </button>
              </Field>
            </div>
          )}

          {/* ── KARGO ── */}
          {activeTab === "kargo" && (
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-1">Kargo Ayarları</h2>
              <p className="text-xs text-gray-400 mb-6">Kargo bölgeleri ve ücret yapısı</p>

              <Field label="Ücretsiz Kargo" hint="Belirli tutarın üstünde ücretsiz kargo">
                <Toggle checked={toggles.freeShipping} onChange={setToggle("freeShipping")} />
              </Field>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-800">Kargo Bölgeleri</p>
                  <button
                    onClick={() => setShippingZones((z) => [...z, { id: Date.now(), region: "Yeni Bölge", cost: "0", free_limit: "500" }])}
                    className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    <Plus size={12} /> Bölge Ekle
                  </button>
                </div>
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Bölge", "Kargo Ücreti (₺)", "Ücretsiz Eşiği (₺)", ""].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-gray-400 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {shippingZones.map((zone) => (
                        <tr key={zone.id}>
                          <td className="px-4 py-3">
                            <input defaultValue={zone.region} className="text-sm text-gray-800 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-orange-400 outline-none w-32 py-0.5" />
                          </td>
                          <td className="px-4 py-3">
                            <input defaultValue={zone.cost} className="text-sm text-gray-800 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-orange-400 outline-none w-20 py-0.5" />
                          </td>
                          <td className="px-4 py-3">
                            <input defaultValue={zone.free_limit} className="text-sm text-gray-800 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-orange-400 outline-none w-20 py-0.5" />
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => setShippingZones((z) => z.filter((x) => x.id !== zone.id))}>
                              <X size={14} className="text-gray-300 hover:text-red-400 transition-colors" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Field label="Kargo Entegrasyonu" hint="Kullanılan kargo firması">
                <select className="h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 focus:border-orange-400 focus:outline-none">
                  <option>Yurtiçi Kargo</option>
                  <option>MNG Kargo</option>
                  <option>Aras Kargo</option>
                  <option>PTT Kargo</option>
                  <option>UPS</option>
                </select>
              </Field>
            </div>
          )}

          {/* ── ÖDEME ── */}
          {activeTab === "odeme" && (
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-1">Ödeme Yöntemleri</h2>
              <p className="text-xs text-gray-400 mb-6">Kabul edilen ödeme yöntemleri ve entegrasyonlar</p>

              {paymentMethods.map(({ title, desc, active }, i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${active ? "bg-green-50" : "bg-gray-50"}`}>
                      <CreditCard size={16} className={active ? "text-green-500" : "text-gray-400"} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{title}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                  </div>
                  <Toggle checked={active} onChange={() => togglePayment(i)} />
                </div>
              ))}

              {/* PayTR Entegrasyonu */}
              <div className="mt-6 rounded-xl border border-orange-100 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-orange-50 border-b border-orange-100">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-orange-500 flex items-center justify-center">
                      <CreditCard size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">PayTR Entegrasyonu</p>
                      <p className="text-[10px] text-gray-400">paytr.com → Mağaza Ayarları → API Bilgileri</p>
                    </div>
                  </div>
                  <Toggle checked={toggles.paytrActive ?? false} onChange={setToggle("paytrActive")} />
                </div>

                <div className="p-4 bg-white space-y-3">
                  {[
                    { label: "Merchant ID",   placeholder: "1234567",          hint: "Mağaza numaranız" },
                    { label: "Merchant Key",  placeholder: "••••••••••••••••", hint: "API güvenlik anahtarı" },
                    { label: "Merchant Salt", placeholder: "••••••••••••••••", hint: "API tuz değeri" },
                  ].map(({ label, placeholder, hint }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-32 flex-shrink-0">
                        <p className="text-xs font-semibold text-gray-700">{label}</p>
                        <p className="text-[10px] text-gray-400">{hint}</p>
                      </div>
                      <div className="flex-1 relative flex items-center">
                        <Input type={showPassword ? "text" : "password"} placeholder={placeholder} className="flex-1 pr-9" />
                        <button className="absolute right-3 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Mod</p>
                      <select className="w-full h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 focus:border-orange-400 focus:outline-none">
                        <option value="1">Test Modu</option>
                        <option value="0">Canlı Mod</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Max Taksit</p>
                      <select className="w-full h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 focus:border-orange-400 focus:outline-none">
                        <option value="0">Taksit Yok</option>
                        <option value="3">3 Taksit</option>
                        <option value="6">6 Taksit</option>
                        <option value="9">9 Taksit</option>
                        <option value="12">12 Taksit</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Dil</p>
                      <select className="w-full h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 focus:border-orange-400 focus:outline-none">
                        <option value="tr">Türkçe</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Timeout (dk)</p>
                      <Input defaultValue="30" className="w-full" />
                    </div>
                  </div>

                  <div className="mt-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mb-1">Callback URL</p>
                    <p className="text-xs font-mono text-blue-700 break-all">
                      {typeof window !== "undefined" ? window.location.origin : "https://siteniz.com"}/api/paytr/callback
                    </p>
                    <p className="text-[10px] text-blue-400 mt-1">Bu URL&apos;yi PayTR mağaza ayarlarına girin.</p>
                  </div>
                </div>
              </div>

              {/* ── Havale / EFT Banka Bilgileri ── */}
              <div className="mt-6 rounded-xl border border-gray-200 overflow-hidden">
                {/* Panel başlığı */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-gray-700 flex items-center justify-center">
                      <Building2 size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Havale / EFT Banka Bilgileri</p>
                      <p className="text-[10px] text-gray-400">Müşteriye gösterilecek hesap bilgileri</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {bankaSaving && <RefreshCw size={13} className="animate-spin text-gray-400" />}
                    {bankaSaved && <span className="text-[11px] text-green-500 font-semibold flex items-center gap-1"><Check size={11} /> Kaydedildi</span>}
                    <Toggle checked={bankaActive} onChange={toggleBankaActive} />
                  </div>
                </div>

                <div className="p-4 bg-white space-y-4">
                  {bankaLoading ? (
                    <div className="flex items-center justify-center py-6 text-gray-400 text-sm gap-2">
                      <RefreshCw size={14} className="animate-spin" /> Yükleniyor...
                    </div>
                  ) : (
                    <>
                      {/* Kayıtlı hesaplar */}
                      {bankAccounts.length > 0 && (
                        <div className="space-y-3">
                          {bankAccounts.map(acc => (
                            <div key={acc.id}>
                              {editingAccount?.id === acc.id ? (
                                /* Düzenleme formu */
                                <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-4 space-y-3">
                                  <p className="text-xs font-bold text-orange-600 uppercase tracking-wide">Hesabı Düzenle</p>
                                  <BankForm
                                    value={editingAccount}
                                    onChange={v => setEditingAccount(v as BankAccount)}
                                  />
                                  <div className="flex gap-2 pt-1">
                                    <button onClick={updateAccount}
                                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors">
                                      <Check size={12} /> Kaydet
                                    </button>
                                    <button onClick={() => setEditingAccount(null)}
                                      className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors">
                                      İptal
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* Hesap kartı */
                                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <Building2 size={16} className="text-gray-500" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900">{acc.banka}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{acc.hesapSahibi}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <button onClick={() => setEditingAccount(acc)}
                                        className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors">
                                        <Eye size={13} />
                                      </button>
                                      <button onClick={() => deleteAccount(acc.id)}
                                        className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="mt-3 grid grid-cols-1 gap-1.5">
                                    <IbanRow label="IBAN" value={acc.iban} />
                                    {acc.subeAdi && <IbanRow label="Şube" value={acc.subeAdi} />}
                                    {acc.hesapNo && <IbanRow label="Hesap No" value={acc.hesapNo} />}
                                    {acc.aciklama && (
                                      <p className="text-[11px] text-gray-400 italic mt-1">{acc.aciklama}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Yeni hesap formu */}
                      {newAccountForm !== null ? (
                        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Yeni Banka Hesabı</p>
                          <BankForm value={newAccountForm} onChange={setNewAccountForm} />
                          <div className="flex gap-2 pt-1">
                            <button onClick={addAccount}
                              disabled={!newAccountForm.banka || !newAccountForm.iban}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold transition-colors">
                              <Plus size={12} /> Hesabı Ekle
                            </button>
                            <button onClick={() => setNewAccountForm(null)}
                              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors">
                              İptal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setNewAccountForm({ ...EMPTY_ACCOUNT })}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50/40 transition-all font-medium">
                          <Plus size={15} /> Banka Hesabı Ekle
                        </button>
                      )}

                      {bankAccounts.length === 0 && newAccountForm === null && (
                        <p className="text-center text-xs text-gray-400 py-2">
                          Henüz hesap eklenmedi. Yukarıdaki butona tıklayın.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── BİLDİRİMLER ── */}
          {activeTab === "bildirim" && (
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-1">Bildirim Ayarları</h2>
              <p className="text-xs text-gray-400 mb-6">Hangi olaylar için bildirim alacağınızı seçin</p>

              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Bildirim Kanalları</p>
              <Field label="E-posta Bildirimleri" hint="Sipariş ve müşteri bildirimleri e-posta ile">
                <Toggle checked={toggles.emailNotif} onChange={setToggle("emailNotif")} />
              </Field>
              <Field label="SMS Bildirimleri" hint="Kritik sipariş güncellemeleri için SMS">
                <Toggle checked={toggles.smsNotif} onChange={setToggle("smsNotif")} />
              </Field>

              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-6 mb-3">Bildirim Türleri</p>
              <Field label="Yeni Sipariş" hint="Her yeni sipariş oluştuğunda bildir">
                <Toggle checked={toggles.orderNotif} onChange={setToggle("orderNotif")} />
              </Field>
              <Field label="Yeni Yorum" hint="Ürün değerlendirmeleri için bildir">
                <Toggle checked={toggles.reviewNotif} onChange={setToggle("reviewNotif")} />
              </Field>
              <Field label="Düşük Stok Uyarısı" hint="Stok 10'un altına düştüğünde bildir">
                <Toggle checked={toggles.lowStockNotif} onChange={setToggle("lowStockNotif")} />
              </Field>
              <Field label="Başarısız Ödeme" hint="Ödeme başarısız olduğunda bildir">
                <Toggle checked={toggles.failedPaymentNotif} onChange={setToggle("failedPaymentNotif")} />
              </Field>

              <Field label="Bildirim E-postası" hint="Bildirimlerin gönderileceği adres">
                <input
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  type="email"
                  className="h-9 w-56 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:outline-none transition-all"
                />
              </Field>
              <Field label="Siparis Mail Alicilari" hint="Yeni siparis geldiginde mail gidecek 2 adres">
                <div className="space-y-2">
                  {[0, 1].map((index) => (
                    <input
                      key={index}
                      value={orderNotificationEmails[index] ?? ""}
                      onChange={(e) => {
                        const next = [...orderNotificationEmails];
                        next[index] = e.target.value;
                        setOrderNotificationEmails(next);
                      }}
                      type="email"
                      placeholder={`alici${index + 1}@drmaxx.com.tr`}
                      className="block h-9 w-64 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:outline-none transition-all"
                    />
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* ── GÜVENLİK ── */}
          {activeTab === "guvenlik" && (
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-1">Güvenlik</h2>
              <p className="text-xs text-gray-400 mb-6">Hesap ve erişim güvenliği</p>

              <Field label="İki Faktörlü Doğrulama" hint="Giriş yaparken ek doğrulama kodu iste">
                <Toggle checked={toggles.twoFactor} onChange={setToggle("twoFactor")} />
              </Field>
              <Field label="Aktivite Günlüğü" hint="Admin panelindeki tüm işlemleri kaydet">
                <Toggle checked={toggles.activityLog} onChange={setToggle("activityLog")} />
              </Field>
              <Field label="Oturum Süresi" hint="Hareketsizlik durumunda otomatik çıkış">
                <select className="h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 focus:border-orange-400 focus:outline-none">
                  <option>30 dakika</option>
                  <option>1 saat</option>
                  <option>4 saat</option>
                  <option>8 saat</option>
                  <option>Hiçbir zaman</option>
                </select>
              </Field>

              <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Şifre Değiştir</p>
                <div className="space-y-3">
                  {["Mevcut Şifre", "Yeni Şifre", "Yeni Şifre (Tekrar)"].map((label) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-36">{label}</span>
                      <Input type="password" placeholder="••••••••" className="flex-1" />
                    </div>
                  ))}
                  <button className="mt-2 px-4 py-2 rounded-xl bg-gray-800 text-white text-xs font-semibold hover:bg-gray-900 transition-colors">
                    Şifreyi Güncelle
                  </button>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100">
                <p className="text-xs font-bold text-red-500 mb-1">Tehlikeli Bölge</p>
                <p className="text-xs text-red-400 mb-3">Bu işlemler geri alınamaz.</p>
                <button className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors">
                  Tüm Verileri Sıfırla
                </button>
              </div>
            </div>
          )}

          {/* ── GÖRÜNÜM ── */}
          {activeTab === "gorunum" && (
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-1">Görünüm</h2>
              <p className="text-xs text-gray-400 mb-6">Mağaza renk ve tema tercihleri</p>

              <Field label="Birincil Renk" hint="Buton ve vurgu rengi">
                <div className="flex items-center gap-3">
                  <input type="color" defaultValue="#F97316" className="h-9 w-16 rounded-xl border border-gray-200 cursor-pointer" />
                  <Input defaultValue="#F97316" className="w-28" />
                </div>
              </Field>
              <Field label="İkincil Renk" hint="Başlık ve koyu alanlar">
                <div className="flex items-center gap-3">
                  <input type="color" defaultValue="#0A0F1E" className="h-9 w-16 rounded-xl border border-gray-200 cursor-pointer" />
                  <Input defaultValue="#0A0F1E" className="w-28" />
                </div>
              </Field>
              <Field label="Banner Görseli" hint="Ana sayfa hero alanı, 1920×700px">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all">
                  <Upload size={14} /> Görsel Yükle
                </button>
              </Field>
              <Field label="Favicon" hint="Tarayıcı sekmesinde görünen ikon, 32×32px">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all">
                  <Upload size={14} /> Favicon Yükle
                </button>
              </Field>
              <Field label="Ürün Sayfası Düzeni" hint="Ürün detay sayfası görünümü">
                <select className="h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 focus:border-orange-400 focus:outline-none">
                  <option>Geniş (Varsayılan)</option>
                  <option>Kompakt</option>
                  <option>Galeri</option>
                </select>
              </Field>
            </div>
          )}

          {/* ── SEO ── */}
          {activeTab === "seo" && (
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-1">SEO Ayarları</h2>
              <p className="text-xs text-gray-400 mb-6">Arama motoru optimizasyonu</p>

              <Field label="Meta Başlık" hint="Tarayıcı sekmesi ve arama sonuçlarında görünür">
                <Input defaultValue="DR.MAXX | Premium Takviye Markası" className="w-72" />
              </Field>
              <Field label="Meta Açıklama" hint="Arama sonuçlarında gösterilen kısa açıklama">
                <textarea
                  defaultValue="Bilimsel formüllerle geliştirilmiş premium besin takviyeleri. Beyin sağlığı, omega-3 ve daha fazlası."
                  rows={3}
                  className="w-72 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:border-orange-400 focus:bg-white focus:outline-none resize-none transition-all"
                />
              </Field>
              <Field label="Google Analytics ID" hint="G-XXXXXXXXXX formatında">
                <Input placeholder="G-XXXXXXXXXX" className="w-44" />
              </Field>
              <Field label="Meta Pixel ID" hint="Facebook reklam takibi">
                <Input placeholder="1234567890" className="w-44" />
              </Field>
              <Field label="Google Analytics" hint="Ziyaretçi takibi için">
                <Toggle checked={toggles.googleAnalytics} onChange={setToggle("googleAnalytics")} />
              </Field>
              <Field label="Meta Pixel" hint="Facebook/Instagram reklam takibi">
                <Toggle checked={toggles.metaPixel} onChange={setToggle("metaPixel")} />
              </Field>
              <Field label="Yapılandırılmış Veri (JSON-LD)" hint="Ürünler için rich snippet desteği">
                <Toggle checked={toggles.richSnippets} onChange={setToggle("richSnippets")} />
              </Field>
              <Field label="Sitemap Otomatik Güncelleme" hint="Yeni ürün eklendiğinde sitemap.xml güncellenir">
                <Toggle checked={toggles.sitemap} onChange={setToggle("sitemap")} />
              </Field>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
}


