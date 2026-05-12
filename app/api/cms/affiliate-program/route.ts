import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { readCmsContent, writeCmsContent } from "@/lib/cmsStore";

type LeadStatus = "new" | "approved" | "rejected";
type InfluencerStatus = "active" | "pending" | "paused";
type PayoutStatus = "pending" | "paid" | "cancelled";

type AffiliateLead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  instagram: string;
  website: string;
  channel: string;
  message: string;
  status: LeadStatus;
  adminNote: string;
  createdAt: string;
  updatedAt: string;
};

type AffiliateInfluencer = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  instagram: string;
  channel: string;
  notes: string;
  status: InfluencerStatus;
  commissionRate: number;
  couponCode: string;
  couponDiscountRate: number;
  personalDiscountCode: string;
  personalDiscountRate: number;
  refCode: string;
  joinedAt: string;
  updatedAt: string;
  leadId?: string;
};

type AffiliateEvent = {
  id: string;
  influencerId: string;
  type: "click" | "order";
  amount: number;
  commission: number;
  orderNo?: string;
  createdAt: string;
};

type AffiliatePayout = {
  id: string;
  influencerId: string;
  amount: number;
  status: PayoutStatus;
  periodStart: string;
  periodEnd: string;
  note: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
};

type AffiliateSettings = {
  baseUrl: string;
  defaultCommissionRate: number;
  defaultCouponDiscountRate: number;
  cookieDays: number;
  minimumPayout: number;
  currency: string;
  updatedAt: string;
};

type AffiliateProgram = {
  settings: AffiliateSettings;
  influencers: AffiliateInfluencer[];
  events: AffiliateEvent[];
  payouts: AffiliatePayout[];
};

type Coupon = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
  description: string;
  createdAt: string;
};

const PROGRAM_KEY = "affiliate_program";

const DEFAULT_SETTINGS: AffiliateSettings = {
  baseUrl: "https://drmaxx.vercel.app",
  defaultCommissionRate: 18,
  defaultCouponDiscountRate: 10,
  cookieDays: 30,
  minimumPayout: 500,
  currency: "TRY",
  updatedAt: new Date().toISOString(),
};

const DEFAULT_PROGRAM: AffiliateProgram = {
  settings: DEFAULT_SETTINGS,
  influencers: [],
  events: [],
  payouts: [],
};

const numberOr = (value: unknown, fallback: number) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const nowIso = () => new Date().toISOString();

const normalizeCode = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, "");

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

async function readProgram(): Promise<AffiliateProgram> {
  const parsed = await readCmsContent<Partial<AffiliateProgram>>(PROGRAM_KEY, DEFAULT_PROGRAM);
  return {
    settings: {
      ...DEFAULT_SETTINGS,
      ...(parsed.settings ?? {}),
    },
    influencers: Array.isArray(parsed.influencers)
      ? (parsed.influencers as AffiliateInfluencer[])
      : [],
    events: Array.isArray(parsed.events) ? (parsed.events as AffiliateEvent[]) : [],
    payouts: Array.isArray(parsed.payouts) ? (parsed.payouts as AffiliatePayout[]) : [],
  };
}

async function writeProgram(program: AffiliateProgram) {
  await writeCmsContent(PROGRAM_KEY, program);
}

async function readCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !Array.isArray(data)) return [];
  return data.map((row) => ({
    id: String(row.id),
    code: String(row.code ?? "").toUpperCase(),
    type: row.type === "fixed" ? "fixed" : "percent",
    value: Number(row.value ?? 0),
    minOrder: Number(row.min_order ?? 0),
    maxUses: row.max_uses === null ? null : Number(row.max_uses),
    usedCount: Number(row.used_count ?? 0),
    expiresAt: row.expires_at ? String(row.expires_at) : null,
    active: Boolean(row.active ?? true),
    description: String(row.description ?? ""),
    createdAt: String(row.created_at ?? ""),
  }));
}

async function writeCoupons(coupons: Coupon[]) {
  const rows = coupons.map((item) => ({
    id: item.id,
    code: item.code.toUpperCase(),
    type: item.type,
    value: item.value,
    min_order: item.minOrder,
    max_uses: item.maxUses,
    used_count: item.usedCount,
    expires_at: item.expiresAt,
    active: item.active,
    description: item.description,
    created_at: item.createdAt,
  }));

  const { error } = await supabaseAdmin.from("coupons").upsert(rows, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

async function readLeads(): Promise<AffiliateLead[]> {
  const { data, error } = await supabaseAdmin
    .from("affiliate_leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !Array.isArray(data)) return [];
  return data.map((row) => ({
    id: String(row.id),
    name: String(row.name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    city: String(row.city ?? ""),
    instagram: String(row.instagram ?? ""),
    website: String(row.website ?? ""),
    channel: String(row.channel ?? ""),
    message: String(row.message ?? ""),
    status:
      row.status === "approved" || row.status === "rejected" || row.status === "new"
        ? row.status
        : "new",
    adminNote: String(row.admin_note ?? ""),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  }));
}

async function writeLeads(leads: AffiliateLead[]) {
  const rows = leads.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    city: item.city,
    instagram: item.instagram,
    website: item.website,
    channel: item.channel,
    message: item.message,
    status: item.status,
    admin_note: item.adminNote,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  }));

  const { error } = await supabaseAdmin.from("affiliate_leads").upsert(rows, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

async function readOrders(): Promise<Array<Record<string, unknown>>> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !Array.isArray(data)) return [];
  return data as Array<Record<string, unknown>>;
}

const getOrderCode = (order: Record<string, unknown>) => {
  const code = order.kupon_kod ?? order.kuponKod ?? order.couponCode;
  return typeof code === "string" ? normalizeCode(code) : "";
};

const getOrderNo = (order: Record<string, unknown>) => {
  const orderNo = order.order_no ?? order.orderNo;
  return typeof orderNo === "string" ? orderNo : "";
};

const getOrderTotal = (order: Record<string, unknown>) => numberOr(order.total, 0);

const isOrderCancelled = (order: Record<string, unknown>) => {
  const status = String(order.status ?? "").toLowerCase();
  return status.includes("iptal") || status.includes("cancel");
};

function buildReferralUrl(baseUrl: string, refCode: string) {
  const safe = baseUrl?.trim() ? baseUrl.trim().replace(/\/+$/, "") : DEFAULT_SETTINGS.baseUrl;
  return `${safe}/?ref=${encodeURIComponent(refCode)}`;
}

function getUniqueCode(base: string, used: Set<string>) {
  let candidate = normalizeCode(base);
  if (!candidate) candidate = `DMX${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  if (candidate.length > 14) candidate = candidate.slice(0, 14);

  let i = 0;
  let next = candidate;
  while (used.has(next)) {
    i += 1;
    const suffix = i.toString();
    next = `${candidate.slice(0, Math.max(3, 14 - suffix.length))}${suffix}`;
  }
  used.add(next);
  return next;
}

function ensureCoupon(
  coupons: Coupon[],
  code: string,
  value: number,
  description: string,
) {
  const normalized = normalizeCode(code);
  if (!normalized) return;

  const idx = coupons.findIndex((item) => normalizeCode(item.code) === normalized);
  if (idx >= 0) {
    coupons[idx] = {
      ...coupons[idx],
      code: normalized,
      type: "percent",
      value,
      active: true,
      description,
    };
    return;
  }

  coupons.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    code: normalized,
    type: "percent",
    value,
    minOrder: 0,
    maxUses: null,
    usedCount: 0,
    expiresAt: null,
    active: true,
    description,
    createdAt: new Date().toISOString().split("T")[0],
  });
}

function disableCoupon(coupons: Coupon[], code: string) {
  const normalized = normalizeCode(code);
  const idx = coupons.findIndex((item) => normalizeCode(item.code) === normalized);
  if (idx >= 0) {
    coupons[idx] = { ...coupons[idx], active: false };
  }
}

type ComputedInfluencer = AffiliateInfluencer & {
  referralUrl: string;
  totalClicks: number;
  totalOrders: number;
  totalRevenue: number;
  totalCommission: number;
  totalPaid: number;
  pendingPayout: number;
  unpaidCommission: number;
};

async function buildResponse(program: AffiliateProgram) {
  const [orders, leads] = await Promise.all([readOrders(), readLeads()]);

  const influencers: ComputedInfluencer[] = program.influencers.map((item) => {
    const codes = new Set([
      normalizeCode(item.couponCode),
      normalizeCode(item.personalDiscountCode),
    ]);
    codes.delete("");

    const matchedOrders = orders.filter((order) => {
      if (isOrderCancelled(order)) return false;
      const code = getOrderCode(order);
      return !!code && codes.has(code);
    });

    const totalRevenue = matchedOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);
    const totalOrders = matchedOrders.length;
    const totalClicks = program.events.filter(
      (event) => event.influencerId === item.id && event.type === "click",
    ).length;
    const totalCommission =
      Math.round(((totalRevenue * item.commissionRate) / 100) * 100) / 100;
    const paidRows = program.payouts.filter(
      (payout) => payout.influencerId === item.id && payout.status === "paid",
    );
    const pendingRows = program.payouts.filter(
      (payout) => payout.influencerId === item.id && payout.status === "pending",
    );
    const totalPaid = paidRows.reduce((sum, payout) => sum + payout.amount, 0);
    const pendingPayout = pendingRows.reduce((sum, payout) => sum + payout.amount, 0);
    const unpaidCommission = Math.max(totalCommission - totalPaid, 0);

    return {
      ...item,
      referralUrl: buildReferralUrl(program.settings.baseUrl, item.refCode),
      totalClicks,
      totalOrders,
      totalRevenue,
      totalCommission,
      totalPaid,
      pendingPayout,
      unpaidCommission,
    };
  });

  const summary = {
    influencerCount: influencers.length,
    activeInfluencerCount: influencers.filter((item) => item.status === "active").length,
    pendingLeadCount: leads.filter((lead) => lead.status === "new").length,
    totalClicks: influencers.reduce((sum, item) => sum + item.totalClicks, 0),
    totalOrders: influencers.reduce((sum, item) => sum + item.totalOrders, 0),
    totalRevenue: influencers.reduce((sum, item) => sum + item.totalRevenue, 0),
    totalCommission: influencers.reduce((sum, item) => sum + item.totalCommission, 0),
    totalPaid: influencers.reduce((sum, item) => sum + item.totalPaid, 0),
    unpaidCommission: influencers.reduce((sum, item) => sum + item.unpaidCommission, 0),
  };

  const recentOrders = orders
    .map((order) => ({
      orderNo: getOrderNo(order),
      couponCode: getOrderCode(order),
      total: getOrderTotal(order),
      status: String(order.status ?? ""),
      date: String(order.date ?? order.created_at ?? ""),
    }))
    .filter((order) => order.couponCode)
    .slice(0, 20);

  return {
    settings: program.settings,
    influencers,
    payouts: program.payouts,
    events: program.events,
    leads,
    summary,
    recentOrders,
  };
}

export async function GET() {
  const program = await readProgram();
  return NextResponse.json(await buildResponse(program));
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const action = String(body.action ?? "");

    const [program, coupons, leads] = await Promise.all([
      readProgram(),
      readCoupons(),
      readLeads(),
    ]);

    const now = nowIso();

    if (action === "saveSettings") {
      const next = body.settings ?? {};
      program.settings = {
        ...program.settings,
        baseUrl:
          typeof next.baseUrl === "string" && next.baseUrl.trim()
            ? next.baseUrl.trim()
            : program.settings.baseUrl,
        defaultCommissionRate: numberOr(
          next.defaultCommissionRate,
          program.settings.defaultCommissionRate,
        ),
        defaultCouponDiscountRate: numberOr(
          next.defaultCouponDiscountRate,
          program.settings.defaultCouponDiscountRate,
        ),
        cookieDays: numberOr(next.cookieDays, program.settings.cookieDays),
        minimumPayout: numberOr(next.minimumPayout, program.settings.minimumPayout),
        currency:
          typeof next.currency === "string" && next.currency.trim()
            ? next.currency.trim().toUpperCase()
            : program.settings.currency,
        updatedAt: now,
      };
      await writeProgram(program);
      return NextResponse.json({ ok: true });
    }

    if (action === "createInfluencer") {
      const payload = body.influencer ?? {};

      const fullName = String(payload.fullName ?? payload.name ?? "").trim();
      const email = String(payload.email ?? "").trim();
      if (!fullName || !email) {
        return NextResponse.json(
          { ok: false, error: "Ad soyad ve e-posta zorunludur." },
          { status: 400 },
        );
      }

      const usedCodes = new Set<string>();
      coupons.forEach((coupon) => usedCodes.add(normalizeCode(coupon.code)));
      program.influencers.forEach((item) => {
        usedCodes.add(normalizeCode(item.couponCode));
        usedCodes.add(normalizeCode(item.personalDiscountCode));
        usedCodes.add(normalizeCode(item.refCode));
      });

      const baseCode = normalizeCode(
        String(payload.couponCode ?? toSlug(fullName)).replace(/-/g, ""),
      );
      const couponCode = getUniqueCode(baseCode || "DMX", usedCodes);
      const personalDiscountCode = getUniqueCode(`${couponCode}ME`, usedCodes);
      const refCode = getUniqueCode(
        normalizeCode(String(payload.refCode ?? toSlug(fullName))),
        usedCodes,
      );

      const influencer: AffiliateInfluencer = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        fullName,
        email,
        phone: String(payload.phone ?? "").trim(),
        city: String(payload.city ?? "").trim(),
        instagram: String(payload.instagram ?? "").trim(),
        channel: String(payload.channel ?? "").trim(),
        notes: String(payload.notes ?? "").trim(),
        status:
          payload.status === "active" || payload.status === "paused" || payload.status === "pending"
            ? payload.status
            : "active",
        commissionRate: numberOr(
          payload.commissionRate,
          program.settings.defaultCommissionRate,
        ),
        couponCode,
        couponDiscountRate: numberOr(
          payload.couponDiscountRate,
          program.settings.defaultCouponDiscountRate,
        ),
        personalDiscountCode,
        personalDiscountRate: numberOr(
          payload.personalDiscountRate,
          program.settings.defaultCouponDiscountRate,
        ),
        refCode,
        joinedAt: now,
        updatedAt: now,
        leadId: typeof payload.leadId === "string" ? payload.leadId : undefined,
      };

      program.influencers.unshift(influencer);

      ensureCoupon(
        coupons,
        influencer.couponCode,
        influencer.couponDiscountRate,
        `${influencer.fullName} affiliate kuponu`,
      );
      ensureCoupon(
        coupons,
        influencer.personalDiscountCode,
        influencer.personalDiscountRate,
        `${influencer.fullName} kişisel indirim kuponu`,
      );

      if (influencer.leadId) {
        const idx = leads.findIndex((lead) => lead.id === influencer.leadId);
        if (idx >= 0) {
          leads[idx] = {
            ...leads[idx],
            status: "approved",
            updatedAt: now,
          };
          await writeLeads(leads);
        }
      }

      await Promise.all([writeProgram(program), writeCoupons(coupons)]);
      return NextResponse.json({ ok: true, influencer });
    }

    if (action === "updateInfluencer") {
      const payload = body.influencer ?? {};
      const id = String(payload.id ?? "");
      if (!id) {
        return NextResponse.json({ ok: false, error: "Influencer id zorunlu." }, { status: 400 });
      }

      const idx = program.influencers.findIndex((item) => item.id === id);
      if (idx < 0) {
        return NextResponse.json({ ok: false, error: "Influencer bulunamadı." }, { status: 404 });
      }

      const current = program.influencers[idx];
      const usedCodes = new Set<string>();
      coupons.forEach((coupon) => usedCodes.add(normalizeCode(coupon.code)));
      program.influencers
        .filter((item) => item.id !== id)
        .forEach((item) => {
          usedCodes.add(normalizeCode(item.couponCode));
          usedCodes.add(normalizeCode(item.personalDiscountCode));
          usedCodes.add(normalizeCode(item.refCode));
        });

      const requestedCouponCode = normalizeCode(
        String(payload.couponCode ?? current.couponCode),
      );
      const couponCode =
        requestedCouponCode === normalizeCode(current.couponCode)
          ? current.couponCode
          : getUniqueCode(requestedCouponCode || "DMX", usedCodes);

      const requestedPersonalCode = normalizeCode(
        String(payload.personalDiscountCode ?? current.personalDiscountCode),
      );
      const personalDiscountCode =
        requestedPersonalCode === normalizeCode(current.personalDiscountCode)
          ? current.personalDiscountCode
          : getUniqueCode(requestedPersonalCode || `${couponCode}ME`, usedCodes);

      const requestedRefCode = normalizeCode(String(payload.refCode ?? current.refCode));
      const refCode =
        requestedRefCode === normalizeCode(current.refCode)
          ? current.refCode
          : getUniqueCode(requestedRefCode || toSlug(current.fullName), usedCodes);

      const updated: AffiliateInfluencer = {
        ...current,
        fullName: String(payload.fullName ?? current.fullName).trim(),
        email: String(payload.email ?? current.email).trim(),
        phone: String(payload.phone ?? current.phone).trim(),
        city: String(payload.city ?? current.city).trim(),
        instagram: String(payload.instagram ?? current.instagram).trim(),
        channel: String(payload.channel ?? current.channel).trim(),
        notes: String(payload.notes ?? current.notes).trim(),
        status:
          payload.status === "active" || payload.status === "paused" || payload.status === "pending"
            ? payload.status
            : current.status,
        commissionRate: numberOr(payload.commissionRate, current.commissionRate),
        couponCode,
        couponDiscountRate: numberOr(
          payload.couponDiscountRate,
          current.couponDiscountRate,
        ),
        personalDiscountCode,
        personalDiscountRate: numberOr(
          payload.personalDiscountRate,
          current.personalDiscountRate,
        ),
        refCode,
        updatedAt: now,
      };

      if (normalizeCode(current.couponCode) !== normalizeCode(updated.couponCode)) {
        disableCoupon(coupons, current.couponCode);
      }
      if (
        normalizeCode(current.personalDiscountCode) !==
        normalizeCode(updated.personalDiscountCode)
      ) {
        disableCoupon(coupons, current.personalDiscountCode);
      }

      ensureCoupon(
        coupons,
        updated.couponCode,
        updated.couponDiscountRate,
        `${updated.fullName} affiliate kuponu`,
      );
      ensureCoupon(
        coupons,
        updated.personalDiscountCode,
        updated.personalDiscountRate,
        `${updated.fullName} kişisel indirim kuponu`,
      );

      program.influencers[idx] = updated;
      await Promise.all([writeProgram(program), writeCoupons(coupons)]);
      return NextResponse.json({ ok: true });
    }

    if (action === "deleteInfluencer") {
      const id = String(body.id ?? "");
      if (!id) return NextResponse.json({ ok: false, error: "ID zorunlu." }, { status: 400 });

      const current = program.influencers.find((item) => item.id === id);
      if (!current) {
        return NextResponse.json({ ok: false, error: "Influencer bulunamadı." }, { status: 404 });
      }

      program.influencers = program.influencers.filter((item) => item.id !== id);
      program.events = program.events.filter((event) => event.influencerId !== id);
      program.payouts = program.payouts.filter((payout) => payout.influencerId !== id);

      disableCoupon(coupons, current.couponCode);
      disableCoupon(coupons, current.personalDiscountCode);

      await Promise.all([writeProgram(program), writeCoupons(coupons)]);
      return NextResponse.json({ ok: true });
    }

    if (action === "recordPayout") {
      const payload = body.payout ?? {};
      const influencerId = String(payload.influencerId ?? "");
      if (!influencerId) {
        return NextResponse.json(
          { ok: false, error: "Influencer seçimi zorunludur." },
          { status: 400 },
        );
      }

      const amount = numberOr(payload.amount, 0);
      if (amount <= 0) {
        return NextResponse.json(
          { ok: false, error: "Ödeme tutarı 0'dan büyük olmalıdır." },
          { status: 400 },
        );
      }

      const status: PayoutStatus =
        payload.status === "paid" || payload.status === "cancelled" ? payload.status : "pending";

      const payout: AffiliatePayout = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        influencerId,
        amount,
        status,
        periodStart: String(payload.periodStart ?? "").trim(),
        periodEnd: String(payload.periodEnd ?? "").trim(),
        note: String(payload.note ?? "").trim(),
        paidAt: status === "paid" ? now : undefined,
        createdAt: now,
        updatedAt: now,
      };

      program.payouts.unshift(payout);
      await writeProgram(program);
      return NextResponse.json({ ok: true });
    }

    if (action === "updatePayout") {
      const payload = body.payout ?? {};
      const id = String(payload.id ?? "");
      if (!id) return NextResponse.json({ ok: false, error: "Ödeme id zorunlu." }, { status: 400 });

      const idx = program.payouts.findIndex((item) => item.id === id);
      if (idx < 0) return NextResponse.json({ ok: false, error: "Ödeme bulunamadı." }, { status: 404 });

      const current = program.payouts[idx];
      const nextStatus: PayoutStatus =
        payload.status === "paid" || payload.status === "cancelled" || payload.status === "pending"
          ? payload.status
          : current.status;

      program.payouts[idx] = {
        ...current,
        amount: payload.amount !== undefined ? numberOr(payload.amount, current.amount) : current.amount,
        status: nextStatus,
        periodStart: payload.periodStart !== undefined ? String(payload.periodStart) : current.periodStart,
        periodEnd: payload.periodEnd !== undefined ? String(payload.periodEnd) : current.periodEnd,
        note: payload.note !== undefined ? String(payload.note) : current.note,
        paidAt: nextStatus === "paid" ? current.paidAt ?? now : undefined,
        updatedAt: now,
      };

      await writeProgram(program);
      return NextResponse.json({ ok: true });
    }

    if (action === "deletePayout") {
      const id = String(body.id ?? "");
      if (!id) return NextResponse.json({ ok: false, error: "ID zorunlu." }, { status: 400 });
      program.payouts = program.payouts.filter((item) => item.id !== id);
      await writeProgram(program);
      return NextResponse.json({ ok: true });
    }

    if (action === "recordClick") {
      const influencerId = String(body.influencerId ?? "");
      if (!influencerId) {
        return NextResponse.json({ ok: false, error: "Influencer id zorunlu." }, { status: 400 });
      }

      program.events.unshift({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        influencerId,
        type: "click",
        amount: 0,
        commission: 0,
        createdAt: now,
      });
      await writeProgram(program);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Geçersiz işlem." }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Affiliate işlem hatası.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
