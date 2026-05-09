"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PenSquare, Trash2, Search, FileText, CheckCircle, Clock, Calendar, Plus } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  date: string;
  status: string;
}

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cms/blog")
      .then(r => r.json())
      .then(data => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu yazıyı silmek istediğinizden emin misiniz?")) return;
    await fetch(`/api/cms/blog?id=${id}`, { method: "DELETE" });
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === "Yayında").length,
    draft: posts.filter(p => p.status === "Taslak").length,
    thisMonth: posts.filter(p => {
      const d = new Date(p.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
  };

  return (
    <div className="max-w-5xl">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Blog Yazıları</h1>
          <p className="text-sm text-gray-400 mt-0.5">{stats.total} yazı</p>
        </div>
        <Link href="/admin/icerik/blog/ekle"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors shadow-md shadow-orange-200">
          <Plus size={15} /> Yeni Yazı
        </Link>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Toplam Yazı", value: stats.total, icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Yayınlanan", value: stats.published, icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
          { label: "Taslak", value: stats.draft, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-50" },
          { label: "Bu Ay", value: stats.thisMonth, icon: Calendar, color: "text-purple-500", bg: "bg-purple-50" },
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Arama */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Yazı veya kategori ara..."
              className="w-full h-9 pl-8 pr-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-orange-400 focus:outline-none" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText size={32} className="text-gray-200 mb-3" />
            <p className="text-sm font-semibold text-gray-500">Yazı bulunamadı</p>
            <Link href="/admin/icerik/blog/ekle" className="mt-3 text-xs text-orange-500 hover:underline">İlk yazıyı oluştur →</Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Başlık", "Kategori", "Yazar", "Tarih", "Durum", "İşlemler"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(post => (
                <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{post.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">/blog/{post.slug}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">{post.category}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{post.author}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {new Date(post.date).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      post.status === "Yayında"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/blog/${post.slug}`} target="_blank"
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                        title="Siteyi görüntüle">
                        <FileText size={14} />
                      </Link>
                      <Link href={`/admin/icerik/blog/duzenle/${post.id}`}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all">
                        <PenSquare size={14} />
                      </Link>
                      <button onClick={() => handleDelete(post.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
