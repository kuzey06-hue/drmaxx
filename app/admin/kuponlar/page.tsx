"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Ticket, X, Check, RefreshCw, Trash2, AlertTriangle,
  Pencil, Copy, ToggleLeft, ToggleRight, Tag, TrendingUp,
} from "lucide-react";

interface Kupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
  description: string;
  createdAt: string;
}

const EMPTY: Omit<Kupon, "id" | "usedCount" | "createdAt"> = {
  code: "", type: "percent", value: 10, minOrder: 0,
  maxUses: null, expiresAt: null, active: true, description: "",
};

const inputCls = "w-full h-9 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{label}</label>
      {hint && <p className="text-[10px] text-gray-400 -mt-1">{hint}</p>}
      {children}
    </div>
  );
}

function statusBadge(k: Kupon) {
  if (!k.active) return { label: "Pasif", cls: "bg-gray-100 text-gray-500" };
  if (k.expiresAt && new Date(k.expiresAt) < new Date()) return { label: "Süresi Doldu", cls: "bg-red-100 text-red-600" };
  if (k.maxUses !== null && k.usedCount >= k.maxUses) return { label: "Limit Doldu", cls: "bg-orange-100 text-orange-600" };
  return { label: "Aktif", cls: "bg-green-100 text-green-700" };
}

export default function KuponlarPage() {
  const [kuponlar, setKuponlar] = useState<Kupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"new" | "edit" | null>(null);
  const [form, setForm] = useState<typeof EMPTY & { id?: string }>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Kupon | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const fetch_ = useCallback(() => {
    setLoading(true);
    fetch("/api/cms/kuponlar")
      .then(r => r.json())
      .then(d => { setKuponlar(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const set = (k: keyof typeof form, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const openNew = () => { setForm({ ...EMPTY }); setModal("new"); };
  const openEdit = (k: Kupon) => { setForm({ ...k }); setModal("edit"); };
  const close = () => { setModal(null); setSaved(false); };

  const handleSave = async () => {
    if (!form.code || !form.value) return;
    setSaving(true);
    try {
      const res = await fetch("/api/cms/kuponlar", {
        method: modal === "new" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, maxUses: form.maxUses ? Number(form.maxUses) : null }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Hata oluştu.");
        setSaving(false);
        return;
      }
      fetch_();
      setSaving(false);
      setSaved(true);
      setTimeout(() => { setSaved(false); close(); }, 900);
    } catch (e) {
      alert("Bağlantı hatası: " + e);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/cms/kuponlar?id=${deleteTarget.id}`, { method: "DELETE" });
    setKuponlar(prev => prev.filter(k => k.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const toggleActive = async (k: Kupon) => {
    await fetch("/api/cms/kuponlar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: k.id, active: !k.active }),
    });
    setKuponlar(prev => prev.map(x => x.id === k.id ? { ...x, active: !x.active } : x));
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const activeCount = kuponlar.filter(k => {
    if (!k.active) return false;
    if (k.expiresAt && new Date(k.expiresAt) < new Date()) return false;
    if (k.maxUses !== null && k.usedCount >= k.maxUses) return false;
    return true;
  }).length;

  const totalUses = kuponlar.reduce((s, k) => s + k.usedCount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kupon Yönetimi</h1>
          <p className="text-sm text-gray-400 mt-0.5">{kuponlar.length} kupon · {activeCount} aktif</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-orange-200">
          <Plus size={16} /> Yeni Kupon Oluştur
        </button>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Toplam Kupon",    value: kuponlar.length,  icon: Ticket,    color: "text-blue-500",   bg: "bg-blue-50" },
          { label: "Aktif Kupon",     value: activeCount,      icon: Tag,       color: "text-green-500",  bg: "bg-green-50" },
          { label: "Toplam Kullanım", value: totalUses,        icon: TrendingUp,color: "text-orange-500", bg: "bg-orange-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tablo */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm gap-2">
            <RefreshCw size={15} className="animate-spin" /> Yükleniyor...
          </div>
        ) : kuponlar.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Ticket size={40} className="text-gray-200 mb-3" />
            <p className="text-sm font-semibold text-gray-500">Henüz kupon oluşturulmadı</p>
            <button onClick={openNew} className="mt-3 text-xs text-orange-500 hover:text-orange-700 font-semibold">
              İlk kuponu oluştur →
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Kupon Kodu", "İndirim", "Min. Tutar", "Kullanım", "Son Kullanım", "Durum", "İşlemler"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {kuponlar.map(k => {
                const badge = statusBadge(k);
                const usagePct = k.maxUses ? Math.min((k.usedCount / k.maxUses) * 100, 100) : null;
                return (
                  <tr key={k.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-gray-900 font-mono tracking-wider bg-gray-100 px-2.5 py-1 rounded-lg">
                          {k.code}
                        </span>
                        <button onClick={() => copyCode(k.code)}
                          className="text-gray-300 hover:text-orange-500 transition-colors" title="Kopyala">
                          {copied === k.code ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                        </button>
                      </div>
                      {k.description && <p className="text-[11px] text-gray-400 mt-1">{k.description}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-bold ${k.type === "percent" ? "text-purple-600" : "text-green-600"}`}>
                        {k.type === "percent" ? `%${k.value}` : `₺${k.value}`}
                      </span>
                      <p className="text-[10px] text-gray-400">{k.type === "percent" ? "Yüzde" : "Sabit"}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {k.minOrder > 0 ? `₺${k.minOrder.toLocaleString("tr-TR")}` : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <span className="text-sm font-semibold text-gray-800">
                          {k.usedCount}{k.maxUses !== null ? ` / ${k.maxUses}` : ""}
                        </span>
                        {usagePct !== null && (
                          <div className="mt-1 h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${usagePct >= 90 ? "bg-red-400" : usagePct >= 60 ? "bg-orange-400" : "bg-green-400"}`}
                              style={{ width: `${usagePct}%` }} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {k.expiresAt
                        ? <span className={new Date(k.expiresAt) < new Date() ? "text-red-500 font-semibold" : ""}>
                            {new Date(k.expiresAt).toLocaleDateString("tr-TR")}
                          </span>
                        : <span className="text-gray-300">Süresiz</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleActive(k)} title={k.active ? "Pasife Al" : "Aktife Al"}
                          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
                          {k.active ? <ToggleRight size={16} className="text-green-500" /> : <ToggleLeft size={16} />}
                        </button>
                        <button onClick={() => openEdit(k)}
                          className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-blue-50 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors border border-gray-100 hover:border-blue-200">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleteTarget(k)}
                          className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors border border-gray-100 hover:border-red-200">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Yeni / Düzenle Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={close}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}>

              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Ticket size={17} className="text-orange-500" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    {modal === "new" ? "Yeni Kupon Oluştur" : "Kuponu Düzenle"}
                  </h3>
                </div>
                <button onClick={close} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <X size={15} className="text-gray-500" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

                <Field label="Kupon Kodu *" hint="Büyük harf ve tire kullanabilirsiniz. Örn: DRMAXX20">
                  <div className="flex gap-2">
                    <input value={form.code}
                      onChange={e => set("code", e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
                      placeholder="DRMAXX20" maxLength={20}
                      className={inputCls + " font-mono font-bold tracking-widest text-orange-600"} />
                    <button type="button"
                      onClick={() => set("code", Math.random().toString(36).slice(2, 10).toUpperCase())}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 whitespace-nowrap transition-colors">
                      Rastgele
                    </button>
                  </div>
                </Field>

                <Field label="Açıklama">
                  <input value={form.description} onChange={e => set("description", e.target.value)}
                    placeholder="Hoş geldin kuponu, vb." className={inputCls} />
                </Field>

                {/* İndirim tipi + değer */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="İndirim Türü *">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { val: "percent", label: "Yüzde (%)" },
                        { val: "fixed",   label: "Sabit (₺)" },
                      ].map(opt => (
                        <button key={opt.val} type="button"
                          onClick={() => set("type", opt.val)}
                          className={`h-9 rounded-xl border-2 text-sm font-semibold transition-all ${form.type === opt.val ? "border-orange-400 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label={form.type === "percent" ? "İndirim Oranı (%) *" : "İndirim Tutarı (₺) *"}>
                    <div className="relative">
                      <input type="number" min={1} max={form.type === "percent" ? 100 : undefined}
                        value={form.value || ""} onChange={e => set("value", Number(e.target.value))}
                        placeholder={form.type === "percent" ? "10" : "50"}
                        className={inputCls + " pr-10"} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                        {form.type === "percent" ? "%" : "₺"}
                      </span>
                    </div>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Min. Sipariş Tutarı (₺)" hint="0 = şartsız">
                    <input type="number" min={0} value={form.minOrder || ""}
                      onChange={e => set("minOrder", Number(e.target.value))}
                      placeholder="0" className={inputCls} />
                  </Field>
                  <Field label="Max. Kullanım" hint="Boş = sınırsız">
                    <input type="number" min={1}
                      value={form.maxUses ?? ""}
                      onChange={e => set("maxUses", e.target.value ? Number(e.target.value) : null)}
                      placeholder="Sınırsız" className={inputCls} />
                  </Field>
                </div>

                <Field label="Son Kullanım Tarihi" hint="Boş bırakırsanız süresiz geçerlidir">
                  <input type="date" value={form.expiresAt ?? ""}
                    onChange={e => set("expiresAt", e.target.value || null)}
                    className={inputCls} />
                </Field>

                <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Aktif</p>
                    <p className="text-xs text-gray-400">Kupon müşteriler tarafından kullanılabilir</p>
                  </div>
                  <button type="button" onClick={() => set("active", !form.active)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.active ? "bg-orange-500" : "bg-gray-200"}`}>
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.active ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                {/* Önizleme */}
                {form.code && form.value > 0 && (
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-xl">
                    <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-2">Önizleme</p>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-orange-600 font-mono tracking-widest bg-white px-3 py-1.5 rounded-lg border border-orange-200 shadow-sm">
                        {form.code}
                      </span>
                      <div className="text-sm text-gray-600">
                        <span className="font-bold text-gray-900">
                          {form.type === "percent" ? `%${form.value} indirim` : `₺${form.value} indirim`}
                        </span>
                        {form.minOrder > 0 && <span className="text-gray-400"> · min ₺{form.minOrder}</span>}
                        {form.expiresAt && <span className="text-gray-400"> · {new Date(form.expiresAt).toLocaleDateString("tr-TR")}'e kadar</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 flex-shrink-0">
                <button onClick={close} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors">
                  İptal
                </button>
                <button onClick={handleSave} disabled={saving || !form.code || !form.value}
                  className={`flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-50 ${saved ? "bg-green-500" : "bg-orange-500 hover:bg-orange-600"}`}>
                  {saving ? <RefreshCw size={13} className="animate-spin" /> : saved ? <Check size={13} /> : null}
                  {saved ? "Kaydedildi" : saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Silme Onayı */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={18} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Kuponu Sil</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Bu işlem geri alınamaz</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-5">
                <span className="font-mono font-bold text-gray-900">{deleteTarget.code}</span> kodlu kuponu silmek istediğinizden emin misiniz?
              </p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors">
                  İptal
                </button>
                <button onClick={handleDelete}
                  className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors">
                  <Trash2 size={13} /> Evet, Sil
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
