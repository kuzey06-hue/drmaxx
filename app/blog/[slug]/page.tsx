import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, User, ArrowLeft, Tag } from "lucide-react";
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
  tags?: string[];
  metaTitle?: string;
  metaDesc?: string;
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const file = path.join(process.cwd(), "data", "cms", "blog.json");
    const raw = await fs.readFile(file, "utf-8");
    const posts: BlogPost[] = JSON.parse(raw);
    return posts.find(p => p.slug === slug && p.status === "Yayında") ?? null;
  } catch {
    return null;
  }
}

// Basit markdown → HTML dönüştürücü
function renderMarkdown(md: string) {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-gray-900 mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-gray-900 mt-8 mb-3">$1</h2>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-orange-400 pl-4 italic text-gray-600 my-4">$1</blockquote>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
    .replace(/_(.+?)_/g, '<em class="italic">$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-orange-500 hover:underline">$1</a>')
    .split("\n\n")
    .map(p => p.startsWith("<h") || p.startsWith("<blockquote") ? p : `<p class="text-gray-700 leading-relaxed mb-4">${p}</p>`)
    .join("\n");
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <main>
      <Navbar />

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
            <Link href="/" className="hover:text-gray-600">Anasayfa</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-gray-600">Blog</Link>
            <span>/</span>
            <span className="text-gray-600 line-clamp-1">{post.title}</span>
          </div>

          {/* Makale */}
          <article className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Kapak */}
            {post.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.coverImage} alt={post.title} className="w-full h-64 object-cover" />
            ) : (
              <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <span className="text-7xl opacity-20">🧠</span>
              </div>
            )}

            <div className="px-8 py-8">
              {/* Kategori */}
              <span className="inline-block px-3 py-1 rounded-full bg-orange-50 text-orange-500 text-xs font-bold mb-4">
                {post.category}
              </span>

              {/* Başlık */}
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-snug mb-4">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-gray-400 pb-6 border-b border-gray-100 mb-6">
                <span className="flex items-center gap-1.5"><User size={12} />{post.author}</span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  {new Date(post.date).toLocaleDateString("tr-TR", { day:"numeric", month:"long", year:"numeric" })}
                </span>
              </div>

              {/* İçerik */}
              <div
                className="prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content || "") }}
              />

              {/* Etiketler */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-8 pt-6 border-t border-gray-100 flex-wrap">
                  <Tag size={13} className="text-gray-400" />
                  {post.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs text-gray-600 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>

          {/* Geri */}
          <div className="mt-8">
            <Link href="/blog" className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors">
              <ArrowLeft size={15} /> Tüm Yazılara Dön
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
