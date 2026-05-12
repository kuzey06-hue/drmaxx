import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { notFound } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface StaticPage {
  id: number;
  title: string;
  slug: string;
  content?: string;
  metaTitle?: string;
  metaDesc?: string;
  status: string;
}

async function getPage(slug: string): Promise<StaticPage | null> {
  try {
    const file = path.join(process.cwd(), "data", "cms", "sayfalar.json");
    const raw = await fs.readFile(file, "utf-8");
    const pages: StaticPage[] = JSON.parse(raw);
    return pages.find(p => p.slug === `/${slug}` && p.status === "Yayında") ?? null;
  } catch {
    return null;
  }
}

function renderMarkdown(md: string) {
  return md
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-gray-900 mt-8 mb-3">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-gray-900 mt-6 mb-2">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
    .replace(/_(.+?)_/g, '<em class="italic">$1</em>')
    .split("\n\n")
    .map(p => p.startsWith("<h") ? p : `<p class="text-gray-600 leading-relaxed mb-4">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("\n");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  return {
    title: page?.metaTitle ?? "DR.MAXX",
    description: page?.metaDesc ?? "",
  };
}

export default async function StaticSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <main>
      <Navbar />
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
            <Link href="/" className="hover:text-gray-600">Anasayfa</Link>
            <span>/</span>
            <span className="text-gray-600">{page.title}</span>
          </div>

          <article className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-12">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-8 pb-6 border-b border-gray-100">
              {page.title}
            </h1>
            <div
              className="prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(page.content || "") }}
            />
          </article>

          <div className="mt-8">
            <Link href="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-500 transition-colors">
              <ArrowLeft size={14} /> Anasayfaya Dön
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
