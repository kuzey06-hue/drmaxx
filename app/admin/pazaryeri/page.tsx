"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, Check, Eye, EyeOff, Save, ShoppingBag,
  AlertCircle, CheckCircle2, Clock, Package, ChevronDown,
  ArrowDownToLine, Zap, Info,
} from "lucide-react";

interface MarketplaceCfg {
  active: boolean;
  supplierId?: string;
  apiKey?: string;
  apiSecret?: string;
  merchantId?: string;
  username?: string;
  password?: string;
  autoSync?: boolean;
  lastSync?: string | null;
  syncCount?: number;
}

interface Settings { trendyol: MarketplaceCfg; hepsiburada: MarketplaceCfg; n11: MarketplaceCfg; }

interface SyncResult { ok: boolean; imported: number; skipped: number; total: number; error?: string; }

const inputCls = "w-full h-9 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all";

const MARKETS = [
  {
    id: "trendyol" as const,
    name: "Trendyol",
    color: "#F27A1A",
    bg: "bg-orange-50",
    border: "border-orange-200",
    logo: "🛍️",
    description: "Türkiye'nin en büyük e-ticaret platformu",
    docsUrl: "https://developers.trendyol.com",
    fields: [
      { key: "supplierId", label: "Supplier ID",  hint: "Trendyol mağaza numaranız",        type: "text",     required: true },
      { key: "apiKey",     label: "API Key",       hint: "Entegrasyon → API Bilgileri",      type: "text",     required: true },
      { key: "apiSecret",  label: "API Secret",    hint: "Gizli anahtar",                    type: "password", required: true },
    ],
  },
  {
    id: "hepsiburada" as const,
    name: "Hepsiburada",
    color: "#FF6000",
    bg: "bg-orange-50",
    border: "border-orange-200",
    logo: "🟠",
    description: "Türkiye'nin köklü e-ticaret markası",
    docsUrl: "https://developers.hepsiburada.com",
    fields: [
      { key: "merchantId", label: "Merchant ID", hint: "Üye mağaza numaranız",   type: "text",     required: true },
      { key: "username",   label: "Kullanıcı Adı", hint: "API kullanıcı adı",    type: "text",     required: true },
      { key: "password",   label: "Şifre",          hint: "API şifresi",          type: "password", required: true },
    ],
  },
  {
    id: "n11" as const,
    name: "n11",
    color: "#7B2D8B",
    bg: "bg-purple-50",
    border: "border-purple-200",
    logo: "🟣",
    description: "Doğuş Grubu e-ticaret platformu",
    docsUrl: "https://api.n11.com",
    fields: [
      { key: "apiKey",    label: "API Key",    hint: "Mağaza API anahtarınız",   type: "text",     required: true },
      { key: "apiSecret", label: "API Secret", hint: "Gizli anahtar",            type: "password", required: true },
    ],
  },
] as const;

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{label}</label>
        {hint && <span className="text-[10px] text-gray-400">— {hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-orange-500" : "bg-gray-200"}`}>
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export default function PazaryeriPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState<string | null>(null);
  const [savedMkt, setSavedMkt] = useState<string | null>(null);
  const [syncing, setSyncing]   = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<Record<string, SyncResult>>({});
  const [showPass, setShowPass] = useState<Record<string, boolean>>({});
  const [localForms, setLocalForms] = useState<Partial<Settings>>({});
  const [expanded, setExpanded] = useState<string | null>("trendyol");

  useEffect(() => {
    fetch("/api/cms/pazaryeri")
      .then(r => r.json())
      .then(d => {
        setSettings(d);
        setLocalForms(JSON.parse(JSON.stringify(d)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const setField = (mkt: keyof Settings, key: string, val: unknown) => {
    setLocalForms(prev => ({
      ...prev,
      [mkt]: { ...(prev[mkt] ?? {}), [key]: val },
    }));
  };

  const handleSave = async (mkt: keyof Settings) => {
    const form = localForms[mkt];
    if (!form) return;
    setSaving(mkt);
    await fetch("/api/cms/pazaryeri", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marketplace: mkt, ...form }),
    });
    // Güncel settings'i yenile
    const fresh = await fetch("/api/cms/pazaryeri").then(r => r.json());
    setSettings(fresh);
    setLocalForms(JSON.parse(JSON.stringify(fresh)));
    setSaving(null);
    setSavedMkt(mkt);
    setTimeout(() => setSavedMkt(null), 2000);
  };

  const handleSync = async (mkt: keyof Settings) => {
    setSyncing(mkt);
    setSyncResults(prev => ({ ...prev, [mkt]: undefined as unknown as SyncResult }));
    try {
      const res = await fetch("/api/pazaryeri/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketplace: mkt }),
      });
      const data: SyncResult = await res.json();
      setSyncResults(prev => ({ ...prev, [mkt]: data }));
      if (data.ok) {
        const fresh = await fetch("/api/cms/pazaryeri").then(r => r.json());
        setSettings(fresh);
      }
    } catch {
      setSyncResults(prev => ({ ...prev, [mkt]: { ok: false, imported: 0, skipped: 0, total: 0, error: "Bağlantı hatası" } }));
    }
    setSyncing(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-gray-400 text-sm gap-2"><RefreshCw size={15} className="animate-spin" /> Yükleniyor...</div>;
  }

  const totalSynced = MARKETS.reduce((s, m) => s + (settings?.[m.id]?.syncCount ?? 0), 0);
  const activeCount = MARKETS.filter(m => settings?.[m.id]?.active).length;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pazaryeri Entegrasyonu</h1>
          <p className="text-sm text-gray-400 mt-0.5">Trendyol, Hepsiburada ve n11 sipariş senkronizasyonu</p>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-xl font-black text-gray-900">{activeCount} / {MARKETS.length}</p>
            <p className="text-xs text-gray-400">Aktif platform</p>
          </div>
          <div>
            <p className="text-xl font-black text-orange-500">{totalSynced}</p>
            <p className="text-xs text-gray-400">Toplam sipariş</p>
          </div>
        </div>
      </motion.div>

      {/* Bilgi kartı */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-700">Nasıl çalışır?</p>
          <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
            API bilgilerini girin, entegrasyonu aktifleştirin. Senkronize Et butonuyla
            pazaryerinizdeki yeni siparişleri çekebilirsiniz. İçe aktarılan siparişler
            <strong> Siparişler</strong> bölümünde kaynak etiketiyle görünür.
          </p>
        </div>
      </div>

      {/* Pazaryeri kartları */}
      <div className="space-y-4">
        {MARKETS.map((mkt, idx) => {
          const cfg   = settings?.[mkt.id] ?? {} as MarketplaceCfg;
          const form  = localForms[mkt.id] ?? {} as MarketplaceCfg;
          const isExp = expanded === mkt.id;
          const result = syncResults[mkt.id];
          const hasCredentials = mkt.fields.filter(f => f.required).every(f => {
            const v = (form as unknown as Record<string, string>)[f.key];
            return v && v.length > 0 && !/^•+$/.test(v);
          });

          return (
            <motion.div key={mkt.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              {/* Kart başlığı */}
              <div className="flex items-center gap-4 px-6 py-4 cursor-pointer select-none"
                onClick={() => setExpanded(isExp ? null : mkt.id)}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: mkt.color + "18" }}>
                  {mkt.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">{mkt.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                      {cfg.active ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{mkt.description}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  {cfg.lastSync && (
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 justify-end">
                        <Clock size={10} /> Son sync
                      </p>
                      <p className="text-[11px] font-semibold text-gray-600">
                        {new Date(cfg.lastSync).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  )}
                  {(cfg.syncCount ?? 0) > 0 && (
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-gray-400">Aktarılan</p>
                      <p className="text-sm font-black text-gray-800">{cfg.syncCount}</p>
                    </div>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); handleSync(mkt.id); }}
                    disabled={!cfg.active || syncing === mkt.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40
                      bg-gray-800 hover:bg-gray-900 text-white">
                    {syncing === mkt.id
                      ? <RefreshCw size={12} className="animate-spin" />
                      : <ArrowDownToLine size={12} />}
                    {syncing === mkt.id ? "Sync..." : "Sync"}
                  </button>
                  <ChevronDown size={15} className={`text-gray-400 transition-transform duration-200 ${isExp ? "rotate-180" : ""}`} />
                </div>
              </div>

              {/* Sync sonucu */}
              <AnimatePresence>
                {result && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className={`mx-6 mb-3 px-4 py-3 rounded-xl border text-sm flex items-center gap-3 ${result.ok ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                    {result.ok
                      ? <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                      : <AlertCircle   size={16} className="text-red-500 flex-shrink-0" />}
                    <span className={result.ok ? "text-green-700" : "text-red-600"}>
                      {result.ok
                        ? `✓ ${result.imported} yeni sipariş aktarıldı${result.skipped > 0 ? `, ${result.skipped} tekrar atlandı` : ""}`
                        : result.error}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Ayarlar paneli */}
              <AnimatePresence>
                {isExp && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-100">
                    <div className="px-6 py-5 space-y-5">

                      {/* Aktif toggle */}
                      <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Entegrasyonu Aktifleştir</p>
                          <p className="text-xs text-gray-400">Aktif olduğunda sipariş senkronizasyonu yapılabilir</p>
                        </div>
                        <Toggle checked={form.active ?? false} onChange={v => setField(mkt.id, "active", v)} />
                      </div>

                      {/* API bilgileri */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {mkt.fields.map(f => (
                          <Field key={f.key} label={f.label} hint={f.hint}>
                            <div className="relative">
                              <input
                                type={f.type === "password" && !showPass[`${mkt.id}_${f.key}`] ? "password" : "text"}
                                value={(form as unknown as Record<string, string>)[f.key] ?? ""}
                                onChange={e => setField(mkt.id, f.key, e.target.value)}
                                placeholder={f.required ? "Zorunlu" : "İsteğe bağlı"}
                                className={inputCls + (f.type === "password" ? " pr-10" : "")}
                              />
                              {f.type === "password" && (
                                <button type="button"
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                  onClick={() => setShowPass(p => ({ ...p, [`${mkt.id}_${f.key}`]: !p[`${mkt.id}_${f.key}`] }))}>
                                  {showPass[`${mkt.id}_${f.key}`] ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                              )}
                            </div>
                          </Field>
                        ))}
                      </div>

                      {/* API döküman linki */}
                      <a href={mkt.docsUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 transition-colors">
                        <Zap size={12} /> {mkt.name} geliştirici dokümantasyonu →
                      </a>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          {cfg.lastSync && (
                            <span className="flex items-center gap-1">
                              <Clock size={11} />
                              Son sync: {new Date(cfg.lastSync).toLocaleString("tr-TR")}
                            </span>
                          )}
                          {(cfg.syncCount ?? 0) > 0 && (
                            <span className="flex items-center gap-1">
                              <ShoppingBag size={11} />
                              {cfg.syncCount} sipariş aktarıldı
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSync(mkt.id)}
                            disabled={!form.active || syncing === mkt.id || !hasCredentials}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40">
                            {syncing === mkt.id ? <RefreshCw size={13} className="animate-spin" /> : <ArrowDownToLine size={13} />}
                            {syncing === mkt.id ? "Senkronize ediliyor..." : "Siparişleri Çek"}
                          </button>
                          <button
                            onClick={() => handleSave(mkt.id)}
                            disabled={saving === mkt.id}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors ${savedMkt === mkt.id ? "bg-green-500" : "bg-orange-500 hover:bg-orange-600"} disabled:opacity-50`}>
                            {saving === mkt.id
                              ? <RefreshCw size={13} className="animate-spin" />
                              : savedMkt === mkt.id
                              ? <Check size={13} />
                              : <Save size={13} />}
                            {savedMkt === mkt.id ? "Kaydedildi" : saving === mkt.id ? "Kaydediliyor..." : "Kaydet"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Sipariş kaynaklarını göster */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Package size={16} className="text-gray-400" /> Aktarılan Siparişler
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {MARKETS.map(mkt => {
            const count = settings?.[mkt.id]?.syncCount ?? 0;
            return (
              <div key={mkt.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-xl">{mkt.logo}</span>
                <div>
                  <p className="text-lg font-black text-gray-900">{count}</p>
                  <p className="text-xs text-gray-400">{mkt.name}</p>
                </div>
                {settings?.[mkt.id]?.active && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-green-400 flex-shrink-0" title="Aktif" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <p className="text-xs text-amber-700 flex items-start gap-2">
            <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
            <span>
              Aktarılan siparişler <strong>Siparişler</strong> bölümünde görünür.
              Her sipariş, kaynak pazaryerinin adıyla etiketlenir (örn: <span className="font-mono">DRM-TY-2026-0001</span>).
              Aynı sipariş birden fazla kez aktarılmaz.
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
