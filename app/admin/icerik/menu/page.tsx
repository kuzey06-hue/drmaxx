"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical, Eye, EyeOff, CheckCircle2, X, Save } from "lucide-react";

interface MenuItem {
  id: number;
  label: string;
  href: string;
  order: number;
  active: boolean;
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newHref, setNewHref] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/cms/menu")
      .then(r => r.json())
      .then(data => { setItems(data.sort((a: MenuItem, b: MenuItem) => a.order - b.order)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const reordered = items.map((item, i) => ({ ...item, order: i + 1 }));
    await fetch("/api/cms/menu", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reordered),
    });
    setItems(reordered);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAdd = async () => {
    if (!newLabel.trim() || !newHref.trim()) return;
    const res = await fetch("/api/cms/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel, href: newHref.startsWith("/") ? newHref : "/" + newHref, active: true }),
    });
    const created = await res.json();
    setItems(prev => [...prev, created]);
    setNewLabel("");
    setNewHref("");
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/cms/menu?id=${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const toggleActive = (id: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, active: !i.active } : i));
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const newItems = [...items];
    const [dragged] = newItems.splice(dragIdx, 1);
    newItems.splice(idx, 0, dragged);
    setItems(newItems);
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Menü Yönetimi</h1>
          <p className="text-sm text-gray-400 mt-0.5">Navigasyon menüsünü düzenleyin ve sıralayın</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-md ${
            saved ? "bg-green-500 text-white shadow-green-200" : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200"
          }`}
        >
          {saved ? <><CheckCircle2 size={15} /> Kaydedildi</> : <><Save size={15} /> Değişiklikleri Kaydet</>}
        </button>
      </div>

      {/* Menü Listesi */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Menü Öğeleri (Sürükle & Bırak ile sırala)</p>
        </div>
        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Yükleniyor...</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {items.map((item, idx) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 px-5 py-4 transition-colors ${dragIdx === idx ? "bg-orange-50" : "hover:bg-gray-50/60"} cursor-grab active:cursor-grabbing`}
              >
                <GripVertical size={16} className="text-gray-300 flex-shrink-0" />
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400 font-mono">{item.href}</p>
                </div>
                <button
                  onClick={() => toggleActive(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    item.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {item.active ? <Eye size={12} /> : <EyeOff size={12} />}
                  {item.active ? "Aktif" : "Gizli"}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Yeni Öğe Ekle */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Yeni Menü Öğesi Ekle</p>
        <div className="flex gap-3">
          <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Etiket (örn: Kampanyalar)"
            className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-orange-400 focus:bg-white focus:outline-none" />
          <input value={newHref} onChange={e => setNewHref(e.target.value)} placeholder="URL (örn: /kampanyalar)"
            className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-orange-400 focus:bg-white focus:outline-none" />
          <button
            onClick={handleAdd}
            disabled={!newLabel.trim() || !newHref.trim()}
            className="flex items-center gap-2 px-4 h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors disabled:opacity-40"
          >
            <Plus size={15} /> Ekle
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Not: Değişiklikleri kaydetmek için &quot;Değişiklikleri Kaydet&quot; butonuna tıklayın.</p>
      </div>
    </div>
  );
}
