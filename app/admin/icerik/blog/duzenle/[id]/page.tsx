"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bold, Italic, Heading2, Heading3, Link2, Quote } from "lucide-react";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-");
}

function insertMarkdown(textarea: HTMLTextAreaElement, before: string, after = "") {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  return textarea.value.substring(0, start) + before + selected + after + textarea.value.substring(end);
}

export default function BlogDuzenle() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Sağlık");
  const [author, setAuthor] = useState("Admin");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Taslak");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/cms/blog")
      .then(r => r.json())
      .then((posts: { id: string; title: string; slug: string; category: string; author: string; content: string; status: string; date: string; tags: string[]; metaTitle: string; metaDesc: string }[]) => {
        const post = posts.find(p => String(p.id) === id);
        if (!post) { setNotFound(true); setLoading(false); return; }
        setTitle(post.title);
        setSlug(post.slug);
        setCategory(post.category);
        setAuthor(post.author);
        setContent(post.content);
        setStatus(post.status);
        setDate(post.date);
        setTags(post.tags ?? []);
        setMetaTitle(post.metaTitle ?? "");
        setMetaDesc(post.metaDesc ?? "");
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const applyMarkdown = (before: string, after = "") => {
    const ta = document.getElementById("content-area") as HTMLTextAreaElement;
    if (!ta) return;
    setContent(insertMarkdown(ta, before, after));
    setTimeout(() => ta.focus(), 0);
  };

  const handleSave = async (publishStatus?: string) => {
    if (!title.trim()) { setError("Başlık zorunludur."); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/cms/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id, title, slug, category, author, content,
          status: publishStatus ?? status,
          date, tags, metaTitle, metaDesc,
        }),
      });
      if (!res.ok) throw new Error();
      router.push("/admin/icerik/blog");
    } catch {
      setError("Bir hata oluştu. Tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-gray-400 text-sm">Yükleniyor...</div>
  );

  if (notFound) return (
    <div className="text-center py-24">
      <p className="text-gray-500 mb-4">Yazı bulunamadı.</p>
      <Link href="/admin/icerik/blog" className="text-orange-500 hover:underline text-sm">← Geri Dön</Link>
    </div>
  );

  return (
    <div className="max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/icerik/blog" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={15} /> Geri
        </Link>
        <div className="flex-1" />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button onClick={() => handleSave("Taslak")} disabled={saving}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
          Taslak Kaydet
        </button>
        <button onClick={() => handleSave("Yayında")} disabled={saving}
          className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors disabled:opacity-50">
          {saving ? "Kaydediliyor..." : "Yayınla"}
        </button>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Yazı başlığı girin..."
              className="w-full text-xl font-bold text-gray-900 border-0 outline-none placeholder:text-gray-300 border-b border-gray-100 pb-4" />
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">SLUG (URL)</label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400">/blog/</span>
                <input value={slug} onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 h-8 rounded-lg border border-gray-200 bg-gray-50 px-2 text-sm text-gray-700 focus:border-orange-400 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">KATEGORİ</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-400 focus:outline-none">
                {["Sağlık","Beslenme","Çocuk Sağlığı","Nörobilim","Takviyeler","Genel"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 bg-gray-50">
              {[
                { icon: Bold, label: "Kalın", before: "**", after: "**" },
                { icon: Italic, label: "İtalik", before: "_", after: "_" },
                { icon: Heading2, label: "Başlık 2", before: "\n## ", after: "" },
                { icon: Heading3, label: "Başlık 3", before: "\n### ", after: "" },
                { icon: Link2, label: "Link", before: "[", after: "](url)" },
                { icon: Quote, label: "Alıntı", before: "\n> ", after: "" },
              ].map(({ icon: Icon, label, before, after }) => (
                <button key={label} title={label} onClick={() => applyMarkdown(before, after)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 transition-all">
                  <Icon size={14} />
                </button>
              ))}
              <span className="ml-auto text-[10px] text-gray-400">Markdown desteklenir</span>
            </div>
            <textarea id="content-area" value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="Yazı içeriğini buraya girin (Markdown desteklenir)..."
              className="w-full min-h-[420px] p-5 text-sm text-gray-800 font-mono resize-none outline-none placeholder:text-gray-300" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Yayın Ayarları</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Durum</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 w-full h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-400 focus:outline-none">
                  <option>Taslak</option><option>Yayında</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Yayın Tarihi</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-400 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Yazar</label>
                <select value={author} onChange={(e) => setAuthor(e.target.value)}
                  className="mt-1 w-full h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-orange-400 focus:outline-none">
                  <option>Admin</option><option>Dr. Selim Çalışkan</option>
                </select>
              </div>
            </div>
            <button onClick={() => handleSave("Yayında")} disabled={saving}
              className="mt-4 w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors disabled:opacity-50">
              {saving ? "Kaydediliyor..." : "Yayınla"}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Etiketler</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-50 text-orange-600 text-xs font-medium">
                  {t}
                  <button onClick={() => setTags(tags.filter(x => x !== t))} className="text-orange-400 hover:text-orange-700">×</button>
                </span>
              ))}
            </div>
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag}
              placeholder="Etiket yaz, Enter'a bas..."
              className="w-full h-8 rounded-lg border border-gray-200 bg-gray-50 px-2 text-xs focus:border-orange-400 focus:outline-none" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">SEO</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Meta Başlık</label>
                <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
                  className="mt-1 w-full h-8 rounded-lg border border-gray-200 bg-gray-50 px-2 text-xs focus:border-orange-400 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Meta Açıklama</label>
                <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs focus:border-orange-400 focus:outline-none resize-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
