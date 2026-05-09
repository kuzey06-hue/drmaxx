"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Pencil, Trash2, Package, X, Check, RefreshCw, AlertTriangle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  badge?: string | null;
  quantity: string;
  category: string;
  description: string;
  color: string;
  image?: string;
  stock: number;
  active: boolean;
  rating: number;
  reviewCount: number;
}

const BADGES = ["", "Çok Satan", "Yeni", "Çocuklara Özel", "Uzman Önerisi"];

const badgeStyles: Record<string, string> = {
  "Çok Satan":     "bg-orange-100 text-orange-700",
  "Yeni":          "bg-blue-100 text-blue-700",
  "Çocuklara Özel":"bg-pink-100 text-pink-700",
  "Uzman Önerisi": "bg-purple-100 text-purple-700",
};

const EMPTY: Omit<Product, "id"> = {
  name: "", slug: "", price: 0, originalPrice: null, badge: null,
  quantity: "", category: "", description: "", color: "#F97316",
  image: "", stock: 0, active: true, rating: 5.0, reviewCount: 0,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full h-9 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all";

export default function UrunlerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"edit" | "new" | null>(null);
  const [form, setForm] = useState<Omit<Product, "id"> & { id?: string }>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [debugMsg, setDebugMsg] = useState("");

  const fetchProducts = useCallback(() => {
    setLoading(true);
    fetch("/api/cms/products?t=" + Date.now())
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) {
          setDebugMsg("API yanıtı: " + JSON.stringify(data).slice(0, 200));
        } else {
          setDebugMsg(`${data.length} ürün geldi`);
        }
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((e) => { setDebugMsg("Hata: " + e); setLoading(false); });
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setForm({ ...EMPTY });
    setModal("new");
  };

  const openEdit = (p: Product) => {
    setForm({ ...p });
    setModal("edit");
  };

  const closeModal = () => { setModal(null); setSaved(false); };

  const set = (key: keyof typeof form, val: unknown) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);

    const method = modal === "new" ? "POST" : "PUT";
    const body = modal === "new"
      ? { ...form }
      : { ...form, id: form.id };

    try {
      const res = await fetch("/api/cms/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Hata: ${data.error || res.statusText}`);
        setSaving(false);
        return;
      }
    } catch (e) {
      alert(`Bağlantı hatası: ${e}`);
      setSaving(false);
      return;
    }

    await fetchProducts();
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); closeModal(); }, 900);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/cms/products?id=${deleteTarget.id}`, { method: "DELETE" });
    setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ürünler</h1>
          <p className="text-sm text-gray-400 mt-0.5">{products.length} ürün listeleniyor</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchProducts} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 px-3 py-2.5 rounded-xl hover:bg-gray-100 transition-all">
            <RefreshCw size={13} /> Yenile
          </button>
          <button onClick={openNew}
            className="flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-orange-200">
            <Plus size={16} /> Yeni Ürün Ekle
          </button>
        </div>
      </motion.div>

      {/* Debug */}
      {debugMsg && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 text-sm text-yellow-800 font-mono">
          {debugMsg}
        </div>
      )}

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.06 }}
        className="relative"
      >
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" placeholder="Ürün adı veya kategori ara..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
        />
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm gap-2">
            <RefreshCw size={15} className="animate-spin" /> Ürünler yükleniyor...
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Görsel", "Ürün Adı", "Kategori", "Fiyat", "Stok", "Badge", "İşlemler"].map(h => (
                  <th key={h} className={`px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider ${h === "İşlemler" ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: product.color + "18" }}>
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-8 h-8 object-contain"
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <Package size={18} style={{ color: product.color }} />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{product.quantity}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-gray-600">{product.category}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-bold text-gray-900">₺{product.price.toLocaleString("tr-TR")}</p>
                    {product.originalPrice && (
                      <p className="text-xs text-gray-400 line-through">₺{product.originalPrice.toLocaleString("tr-TR")}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-sm font-semibold ${(product.stock ?? 0) < 100 ? "text-orange-500" : "text-gray-700"}`}>
                      {product.stock ?? 0}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {product.badge ? (
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${badgeStyles[product.badge] ?? "bg-gray-100 text-gray-600"}`}>
                        {product.badge}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEdit(product)}
                        className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-blue-50 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors border border-gray-100 hover:border-blue-200">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setDeleteTarget(product)}
                        className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors border border-gray-100 hover:border-red-200">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">
                    {search ? "Arama kriterine uygun ürün bulunamadı." : "Henüz ürün yok. Yeni ürün ekleyin."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Edit / New Product Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                <h3 className="text-base font-bold text-gray-900">
                  {modal === "new" ? "Yeni Ürün Ekle" : "Ürünü Düzenle"}
                </h3>
                <button onClick={closeModal} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <X size={15} className="text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Ürün Adı *">
                    <input value={form.name} onChange={e => set("name", e.target.value)}
                      placeholder="Ürün adı" className={inputCls} />
                  </Field>
                  <Field label="Kategori *">
                    <input value={form.category} onChange={e => set("category", e.target.value)}
                      placeholder="Nörobilim, Omega, vb." className={inputCls} />
                  </Field>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Field label="Fiyat (₺) *">
                    <input type="number" value={form.price || ""} onChange={e => set("price", Number(e.target.value))}
                      placeholder="0" className={inputCls} />
                  </Field>
                  <Field label="İndirimli Fiyat (₺)">
                    <input type="number" value={form.originalPrice || ""} onChange={e => set("originalPrice", e.target.value ? Number(e.target.value) : null)}
                      placeholder="Boş bırakın" className={inputCls} />
                  </Field>
                  <Field label="Stok Adedi">
                    <input type="number" value={form.stock || ""} onChange={e => set("stock", Number(e.target.value))}
                      placeholder="0" className={inputCls} />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Paket / Miktar">
                    <input value={form.quantity} onChange={e => set("quantity", e.target.value)}
                      placeholder="30 Kapsül, 150ml, vb." className={inputCls} />
                  </Field>
                  <Field label="Badge">
                    <select value={form.badge ?? ""} onChange={e => set("badge", e.target.value || null)}
                      className={inputCls}>
                      {BADGES.map(b => <option key={b} value={b}>{b || "— Yok —"}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Açıklama">
                  <textarea value={form.description} onChange={e => set("description", e.target.value)}
                    rows={3} placeholder="Ürün içeriği ve kısa açıklama..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all resize-none" />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Görsel URL">
                    <input value={form.image || ""} onChange={e => set("image", e.target.value)}
                      placeholder="/products/urun-adi.png" className={inputCls} />
                  </Field>
                  <Field label="Renk (HEX)">
                    <div className="flex items-center gap-2">
                      <input type="color" value={form.color}
                        onChange={e => set("color", e.target.value)}
                        className="h-9 w-14 rounded-xl border border-gray-200 cursor-pointer p-1 bg-gray-50" />
                      <input value={form.color} onChange={e => set("color", e.target.value)}
                        placeholder="#F97316" className={inputCls} />
                    </div>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Slug (URL)">
                    <input value={form.slug} onChange={e => set("slug", e.target.value)}
                      placeholder="urun-adi (otomatik oluşturulur)" className={inputCls} />
                  </Field>
                  <Field label="Durum">
                    <div className="flex items-center h-9">
                      <button onClick={() => set("active", !form.active)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.active ? "bg-orange-500" : "bg-gray-200"}`}>
                        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.active ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                      <span className="ml-3 text-sm text-gray-600">{form.active ? "Aktif" : "Pasif"}</span>
                    </div>
                  </Field>
                </div>

                {/* Görsel önizleme */}
                {form.image && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: form.color + "18" }}>
                      <img src={form.image} alt="Önizleme" className="w-10 h-10 object-contain"
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{form.name || "Ürün Adı"}</p>
                      <p className="text-xs text-gray-400">{form.image}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center flex-shrink-0">
                <p className="text-xs text-gray-400">* Zorunlu alanlar</p>
                <div className="flex gap-2">
                  <button onClick={closeModal}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors">
                    İptal
                  </button>
                  <button onClick={handleSave} disabled={saving || !form.name || !form.price}
                    className={`flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-50 ${saved ? "bg-green-500" : "bg-orange-500 hover:bg-orange-600"}`}>
                    {saving ? <RefreshCw size={13} className="animate-spin" /> : saved ? <Check size={13} /> : null}
                    {saved ? "Kaydedildi" : saving ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={18} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Ürünü Sil</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Bu işlem geri alınamaz</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-5">
                <span className="font-semibold text-gray-900">{deleteTarget.name}</span> ürününü silmek istediğinizden emin misiniz?
              </p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors">
                  İptal
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50">
                  {deleting ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  {deleting ? "Siliniyor..." : "Evet, Sil"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
