import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { Calendar, User, ArrowRight } from "lucide-react";
import fs from "fs/promises";
import path from "path";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  date: string;
  status: string;
  content: string;
  coverImage?: string;
  metaDesc?: string;
}

async function getPosts(): Promise<BlogPost[]> {
  try {
    const file = path.join(process.cwd(), "data", "cms", "blog.json");
    const raw = await fs.readFile(file, "utf-8");
    const all: BlogPost[] = JSON.parse(raw);
    return all.filter(p => p.status === "Yayında");
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main>
      <Navbar />

      {/* Header */}
      <div className="bg-[#0A0F1E] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-3">DR.MAXX Blog</p>
          <h1 className="text-3xl md:text-4xl font-black text-white">Sağlık & Bilim</h1>
          <p className="text-white/40 mt-2 text-sm max-w-lg">
            Uzman yazarlarımızdan beslenme, takviye ve sağlıklı yaşam üzerine güncel içerikler.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-6">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-5xl mb-4">📝</p>
              <p className="text-xl font-bold text-gray-700">Henüz yazı yayınlanmadı</p>
              <p className="text-sm text-gray-400 mt-2">Yakında içerikler burada görünecek.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                  <article className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden h-full flex flex-col">
                    {/* Kapak */}
                    <div className="h-44 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
                      {post.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl opacity-20 select-none">
                          {["🧠","💊","🫀","🌿","⚗️","🔬"][i % 6]}
                        </span>
                      )}
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-xs font-bold text-gray-700">
                        {post.category}
                      </span>
                    </div>

                    {/* İçerik */}
                    <div className="p-5 flex flex-col flex-1">
                      <h2 className="font-bold text-gray-900 leading-snug group-hover:text-orange-500 transition-colors line-clamp-2 mb-2">
                        {post.title}
                      </h2>
                      {post.metaDesc && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{post.metaDesc}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto pt-4 border-t border-gray-100">
                        <span className="flex items-center gap-1"><User size={11} />{post.author}</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(post.date).toLocaleDateString("tr-TR", { day:"numeric", month:"long", year:"numeric" })}
                        </span>
                        <span className="ml-auto flex items-center gap-1 text-orange-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          Oku <ArrowRight size={11} />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
