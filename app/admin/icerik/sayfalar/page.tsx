"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  X,
  Edit3,
  CheckCircle2,
  ChevronRight,
  Trash2,
  Globe,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StaticPage {
  id: number;
  title: string;
  slug: string;
  updated: string;
  status: "Yayında" | "Taslak";
  content?: string;
  metaTitle?: string;
  metaDesc?: string;
}

// ─── Atoms ────────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
      {children}
    </p>
  );
}

function FieldInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-400 focus:bg-white focus:outline-none w-full"
    />
  );
}

function StatusPill({ status }: { status: string }) {
  if (status === "Yayında") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Yayında
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700">
      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
      Taslak
    </span>
  );
}

// ─── Edit Panel ───────────────────────────────────────────────────────────────

function EditPanel({
  page,
  onClose,
  onSave,
}: {
  page: StaticPage;
  onClose: () => void;
  onSave: (updated: StaticPage) => Promise<void>;
}) {
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [content, setContent] = useState(page.content ?? "");
  const [metaTitle, setMetaTitle] = useState(page.metaTitle ?? page.title);
  const [metaDesc, setMetaDesc] = useState(page.metaDesc ?? "");
  const [status, setStatus] = useState<"Yayında" | "Taslak">(page.status);
  const [saving, setSaving] = useState(false);
  const [savedAnim, setSavedAnim] = useState(false);

  const buildUpdated = (overrideStatus?: "Yayında" | "Taslak"): StaticPage => ({
    ...page,
    title,
    slug,
    content,
    metaTitle,
    metaDesc,
    status: overrideStatus ?? status,
  });

  const save = async (overrideStatus?: "Yayında" | "Taslak") => {
    setSaving(true);
    await onSave(buildUpdated(overrideStatus));
    setSaving(false);
    setSavedAnim(true);
    setTimeout(() => setSavedAnim(false), 2500);
    if (overrideStatus) setStatus(overrideStatus);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-[520px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-bold text-gray-900">Sayfayı Düzenle</h3>
            <StatusPill status={status} />
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <Label>Sayfa Başlığı</Label>
            <FieldInput value={title} onChange={setTitle} />
          </div>

          <div>
            <Label>Slug (URL)</Label>
            <FieldInput value={slug} onChange={setSlug} placeholder="/sayfa-adi" />
          </div>

          <div>
            <Label>İçerik (Markdown)</Label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              placeholder="Sayfa içeriğini buraya girin... (## Başlık, **kalın**, _italik_ desteklenir)"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-mono focus:border-orange-400 focus:bg-white focus:outline-none resize-none"
            />
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">SEO</p>
            <div className="space-y-3">
              <div>
                <Label>Meta Başlık</Label>
                <FieldInput value={metaTitle} onChange={setMetaTitle} />
              </div>
              <div>
                <Label>Meta Açıklama</Label>
                <textarea
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  rows={3}
                  placeholder="Sayfa açıklaması (160 karakter önerilir)"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-orange-400 focus:bg-white focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Durum</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "Yayında" | "Taslak")}
              className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-400 focus:bg-white focus:outline-none"
            >
              <option>Yayında</option>
              <option>Taslak</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
          {/* Save as draft */}
          <button
            onClick={() => save("Taslak")}
            disabled={saving}
            className="h-9 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Taslak Kaydet
          </button>

          {/* Publish */}
          <button
            onClick={() => save("Yayında")}
            disabled={saving}
            className={`flex-1 flex items-center justify-center gap-2 h-9 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
              savedAnim
                ? "bg-green-500 text-white"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
          >
            {saving ? (
              "Kaydediliyor..."
            ) : savedAnim ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Kaydedildi
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />
                Yayınla
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="h-9 px-4 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            İptal
          </button>
        </div>
      </div>
    </>
  );
}

// ─── New Page Panel ───────────────────────────────────────────────────────────

function NewPagePanel({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (p: StaticPage) => void;
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (publishStatus: "Yayında" | "Taslak") => {
    if (!title.trim() || !slug.trim()) {
      setError("Başlık ve slug zorunludur.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/cms/sayfalar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug.startsWith("/") ? slug : "/" + slug,
          content,
          status: publishStatus,
          metaTitle: title + " | DR.MAXX",
          metaDesc: "",
        }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      onAdd(created);
      onClose();
    } catch {
      setError("Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[520px] bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Yeni Sayfa</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <Label>Sayfa Başlığı</Label>
            <FieldInput value={title} onChange={setTitle} placeholder="Sayfa adı..." />
          </div>
          <div>
            <Label>Slug (URL)</Label>
            <FieldInput value={slug} onChange={setSlug} placeholder="/sayfa-adi" />
          </div>
          <div>
            <Label>İçerik</Label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Sayfa içeriği..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-orange-400 focus:bg-white focus:outline-none resize-none"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={() => handleCreate("Taslak")}
            disabled={saving}
            className="h-9 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Taslak
          </button>
          <button
            onClick={() => handleCreate("Yayında")}
            disabled={saving}
            className="flex-1 h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? "Oluşturuluyor..." : "Yayınla"}
          </button>
          <button onClick={onClose} className="h-9 px-4 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            İptal
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SayfalarPage() {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<StaticPage | null>(null);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    fetch("/api/cms/sayfalar")
      .then((r) => r.json())
      .then((data) => { setPages(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (updated: StaticPage) => {
    const res = await fetch("/api/cms/sayfalar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      setPages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setSelectedPage(updated);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu sayfayı silmek istediğinizden emin misiniz?")) return;
    await fetch(`/api/cms/sayfalar?id=${id}`, { method: "DELETE" });
    setPages((prev) => prev.filter((p) => p.id !== id));
    if (selectedPage?.id === id) setSelectedPage(null);
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sayfalar</h1>
          <p className="text-sm text-gray-400 mt-0.5">Statik sayfa içeriklerini yönetin</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 h-9 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors shadow-md shadow-orange-200"
        >
          <Plus className="w-4 h-4" />
          Yeni Sayfa
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Toplam", value: pages.length, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Yayında", value: pages.filter(p => p.status === "Yayında").length, color: "text-green-500", bg: "bg-green-50" },
          { label: "Taslak", value: pages.filter(p => p.status === "Taslak").length, color: "text-yellow-500", bg: "bg-yellow-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center`}>
              <FileText size={18} className={color} />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
            Yükleniyor...
          </div>
        ) : pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText size={32} className="text-gray-200 mb-3" />
            <p className="text-sm font-semibold text-gray-500">Henüz sayfa yok</p>
            <button onClick={() => setShowNew(true)} className="mt-3 text-xs text-orange-500 hover:underline">
              İlk sayfayı oluştur →
            </button>
          </div>
        ) : (
          pages.map((page) => (
            <div
              key={page.id}
              className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors group"
            >
              {/* Icon */}
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-orange-500" />
              </div>

              {/* Title + Slug */}
              <button
                onClick={() => setSelectedPage(page)}
                className="flex-1 min-w-0 text-left"
              >
                <p className="text-sm font-semibold text-gray-800 group-hover:text-orange-500 transition-colors">
                  {page.title}
                </p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{page.slug}</p>
              </button>

              {/* Updated */}
              <p className="text-xs text-gray-400 shrink-0 hidden sm:block">
                {new Date(page.updated).toLocaleDateString("tr-TR")}
              </p>

              {/* Status */}
              <StatusPill status={page.status} />

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setSelectedPage(page)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all"
                  title="Düzenle"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(page.id)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  title="Sil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className="w-4 h-4 text-gray-200 ml-1" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Panel */}
      {selectedPage && (
        <EditPanel
          page={selectedPage}
          onClose={() => setSelectedPage(null)}
          onSave={handleSave}
        />
      )}

      {/* New Page Panel */}
      {showNew && (
        <NewPagePanel
          onClose={() => setShowNew(false)}
          onAdd={(p) => setPages((prev) => [...prev, p])}
        />
      )}
    </div>
  );
}
