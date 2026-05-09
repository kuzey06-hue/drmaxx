import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const FILE = path.join(process.cwd(), "data", "cms", "blog.json");

async function readPosts() {
  const raw = await fs.readFile(FILE, "utf-8");
  return JSON.parse(raw);
}

async function writePosts(posts: unknown[]) {
  await fs.writeFile(FILE, JSON.stringify(posts, null, 2), "utf-8");
}

// GET /api/cms/blog  — tüm yazılar
export async function GET() {
  const posts = await readPosts();
  return NextResponse.json(posts);
}

// POST /api/cms/blog  — yeni yazı ekle
export async function POST(req: NextRequest) {
  const body = await req.json();
  const posts = await readPosts();
  const newPost = {
    ...body,
    id: Date.now().toString(),
    date: body.date || new Date().toISOString().split("T")[0],
  };
  posts.unshift(newPost);
  await writePosts(posts);
  return NextResponse.json(newPost, { status: 201 });
}

// PUT /api/cms/blog  — yazı güncelle (body'de id olmalı)
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const posts = await readPosts();
  const idx = posts.findIndex((p: { id: string }) => p.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  posts[idx] = { ...posts[idx], ...body };
  await writePosts(posts);
  return NextResponse.json(posts[idx]);
}

// DELETE /api/cms/blog?id=xxx
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const posts = await readPosts();
  const filtered = posts.filter((p: { id: string }) => p.id !== id);
  await writePosts(filtered);
  return NextResponse.json({ ok: true });
}
