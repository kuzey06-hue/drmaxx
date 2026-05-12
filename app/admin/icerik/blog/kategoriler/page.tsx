"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Tag,
  Trash2,
  PenSquare,
  Plus,
  ArrowLeft,
  CheckCircle2,
  X,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
}

const INITIAL_CATS: Category[] = [
  { id: 1, name: "Sağlık", slug: "saglik", count: 12 },
  { id: 2, name: "Beslenme", slug: "beslenme", count: 8 },
  { id: 3, name: "Çocuk Sağlığı", slug: "cocuk-sagligi", count: 5 },
  { id: 4, name: "Nörobilim", slug: "norobilim", count: 3 },
  { id: 5, name: "Takviyeler", slug: "takviyeler", count: 9 },
  { id: 6, name: "Genel", slug: "genel", count: 4 },
];

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ─── Atoms ────────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
      {children}
    </p>
  );
}

// ─── Edit Row (inline editing) ────────────────────────────────────────────────

function EditRow({
  cat,
  onSave,
  onCancel,
}: {
  cat: Category;
  onSave: (c: Category) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(cat.name);
  const [slug, setSlug] = useState(cat.slug);

  return (
    <tr className="bg-orange-50/40">
      <td className="px-5 py-3">
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSlug(slugify(e.target.value));
          }}
          className="h-8 w-full rounded-xl border border-orange-300 bg-white px-3 text-sm focus:border-orange-400 focus:outline-none"
          autoFocus
        />
      </td>
      <td className="px-4 py-3">
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="h-8 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-mono focus:border-orange-400 focus:outline-none"
        />
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">{cat.count}</td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSave({ ...cat, name, slug })}
            className="h-7 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors"
          >
            Kaydet
          </button>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KategorilerPage() {
  const [cats, setCats] = useState<Category[]>(INITIAL_CATS);
  const [editingId, setEditingId] = useState<number | null>(null);

  // New form
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [addSaved, setAddSaved] = useState(false);

  const handleDelete = (id: number) => {
    setCats(cats.filter((c) => c.id !== id));
  };

  const handleSaveEdit = (updated: Category) => {
    setCats(cats.map((c) => (c.id === updated.id ? updated : c)));
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    setCats([
      ...cats,
      { id: Date.now(), name: newName.trim(), slug: newSlug || slugify(newName), count: 0 },
    ]);
    setNewName("");
    setNewSlug("");
    setAddSaved(true);
    setTimeout(() => setAddSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/icerik/blog"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Blog
          </Link>
          <div className="w-px h-5 bg-gray-200" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blog Kategorileri</h1>
            <p className="text-sm text-gray-400 mt-0.5">Tüm kategorileri yönetin</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 text-xs font-semibold text-gray-500">
          <Tag className="w-3.5 h-3.5" />
          {cats.length} kategori
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-5 py-3">Kategori Adı</th>
              <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">Slug</th>
              <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">Yazı Sayısı</th>
              <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-wide px-5 py-3">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {cats.map((cat) =>
              editingId === cat.id ? (
                <EditRow
                  key={cat.id}
                  cat={cat}
                  onSave={handleSaveEdit}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <tr key={cat.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                        <Tag className="w-3 h-3 text-orange-500" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">
                      {cat.slug}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-gray-600 font-medium">{cat.count}</span>
                    <span className="text-xs text-gray-400 ml-1">yazı</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditingId(cat.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <PenSquare className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        disabled={cat.count > 0}
                        title={cat.count > 0 ? "Yazı içeren kategori silinemez" : "Sil"}
                      >
                        <Trash2 className={`w-3.5 h-3.5 ${cat.count > 0 ? "opacity-30" : ""}`} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>

        {/* Inline Add Form */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Yeni Kategori Ekle</p>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Label>Kategori Adı</Label>
              <input
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setNewSlug(slugify(e.target.value));
                }}
                placeholder="Örn. Sporcu Beslenmesi"
                className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-orange-400 focus:bg-white focus:outline-none"
              />
            </div>
            <div className="w-48">
              <Label>Slug</Label>
              <input
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="otomatik"
                className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-mono focus:border-orange-400 focus:bg-white focus:outline-none"
              />
            </div>
            <button
              onClick={handleAdd}
              className={`flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                addSaved
                  ? "bg-green-500 text-white"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              }`}
            >
              {addSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Eklendi
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Ekle
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Note */}
      <p className="text-xs text-gray-400 mt-4 text-center">
        Yazı içeren kategoriler silinemez. Önce yazıları başka bir kategoriye taşıyın.
      </p>
    </div>
  );
}
