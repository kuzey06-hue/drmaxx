import { NextRequest, NextResponse } from "next/server";
import { readCmsContent, writeCmsContent } from "@/lib/cmsStore";

const CMS_KEY = "blog_posts";
type BlogPost = Record<string, unknown> & { id: string; date?: string };

async function readPosts() {
  return readCmsContent<BlogPost[]>(CMS_KEY, []);
}

async function writePosts(posts: BlogPost[]) {
  await writeCmsContent(CMS_KEY, posts);
}

export async function GET() {
  const posts = await readPosts();
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const posts = await readPosts();
  const newPost: BlogPost = {
    ...body,
    id: Date.now().toString(),
    date: typeof body.date === "string" ? body.date : new Date().toISOString().split("T")[0],
  };

  posts.unshift(newPost);
  await writePosts(posts);
  return NextResponse.json(newPost, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const posts = await readPosts();
  const idx = posts.findIndex((p) => p.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  posts[idx] = { ...posts[idx], ...body } as BlogPost;
  await writePosts(posts);
  return NextResponse.json(posts[idx]);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const posts = await readPosts();
  const filtered = posts.filter((p) => p.id !== id);
  await writePosts(filtered);
  return NextResponse.json({ ok: true });
}
