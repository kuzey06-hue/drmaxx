import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, createUser, hashPassword } from "@/lib/users";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: "Tüm alanlar zorunludur." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Şifre en az 6 karakter olmalıdır." }, { status: 400 });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Bu e-posta adresi zaten kayıtlı." }, { status: 409 });
    }

    const user = await createUser({
      name:         name.trim(),
      email:        email.trim().toLowerCase(),
      passwordHash: hashPassword(password),
      provider:     "credentials",
    });

    return NextResponse.json({ ok: true, id: user.id });
  } catch {
    return NextResponse.json({ error: "Kayıt sırasında bir hata oluştu." }, { status: 500 });
  }
}
