"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type VerifyProduct = {
  id: string;
  name: string;
  slug: string;
  barcode: string;
  approvalNo: string | null;
  batchNo: string | null;
  image: string | null;
  price: number | null;
};

type VerifyRecord = {
  id: string;
  lisansKod: string;
  productName: string;
  productSlug: string;
  serialNo: string;
  batchNo: string;
  productionDate: string;
  expiryDate: string;
  soldToName: string;
  soldToCity: string;
  soldToPhone: string;
  soldAt: string;
  notes: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type VerifyResponse = {
  ok: boolean;
  isOriginal?: boolean;
  verificationType?: "license" | "barcode" | "none";
  checkedCode?: string;
  checkedAt?: string;
  message?: string;
  products?: VerifyProduct[];
  matchedProduct?: VerifyProduct | null;
  record?: VerifyRecord;
  error?: string;
};

const formatPriceTl = (value: number) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value);

const getRemainingDays = (expiryDate: string) => {
  if (!expiryDate) return null;
  const end = new Date(`${expiryDate}T00:00:00`);
  if (Number.isNaN(end.getTime())) return null;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = end.getTime() - startOfToday.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
};

export default function OrijinallikSorgulamaPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const zxingControlsRef = useRef<{ stop: () => void } | null>(null);
  const rafRef = useRef<number | null>(null);
  const hasAutoVerifiedRef = useRef(false);

  const stopScanner = () => {
    if (zxingControlsRef.current) {
      try {
        zxingControlsRef.current.stop();
      } catch {
        // no-op
      }
      zxingControlsRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScannerOpen(false);
  };

  useEffect(() => stopScanner, []);

  const verifyCode = useCallback(async (raw: string) => {
    const value = raw.trim();
    if (!value) {
      setError("Geçerli bir kod girin.");
      setResult(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/orijinallik-sorgula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: value }),
      });
      const data = (await res.json()) as VerifyResponse;

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Sorgulama yapılamadı.");
        setResult(null);
        return;
      }

      setCode(data.checkedCode ?? value);
      setResult(data);
    } catch {
      setError("Sorgulama sırasında bağlantı hatası oluştu.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const lisansKod =
      params.get("lisanskod") ?? params.get("lisansKod") ?? params.get("code");

    if (!lisansKod || hasAutoVerifiedRef.current) return;
    hasAutoVerifiedRef.current = true;
    setCode(lisansKod);
    void verifyCode(lisansKod);
  }, [verifyCode]);

  const startScanner = async () => {
    setScannerError(null);
    setScannerOpen(true);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const video = videoRef.current;
    if (!video) {
      setScannerError("Kamera başlatılamadı.");
      setScannerOpen(false);
      return;
    }

    const BarcodeDetectorCtor = (
      window as Window & {
        BarcodeDetector?: new (options?: { formats?: string[] }) => {
          detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
        };
      }
    ).BarcodeDetector;

    if (!BarcodeDetectorCtor) {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: "environment" } } },
          video,
          (decoded) => {
            const raw = decoded?.getText?.().trim();
            if (raw) {
              stopScanner();
              void verifyCode(raw);
            }
          },
        );
        zxingControlsRef.current = controls as { stop: () => void };
      } catch {
        setScannerError("Kamera açılamadı veya bu cihazda desteklenmiyor.");
        stopScanner();
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      });
      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();

      const detector = new BarcodeDetectorCtor({
        formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "qr_code"],
      });

      const scan = async () => {
        if (!videoRef.current) return;
        try {
          const found = await detector.detect(videoRef.current);
          const raw = found?.[0]?.rawValue?.trim();
          if (raw) {
            stopScanner();
            void verifyCode(raw);
            return;
          }
        } catch {
          // keep scanning
        }
        rafRef.current = requestAnimationFrame(scan);
      };

      rafRef.current = requestAnimationFrame(scan);
    } catch {
      setScannerError("Kameraya erişim izni verilmedi veya kamera açılamadı.");
      stopScanner();
    }
  };

  const productName = result?.record?.productName || result?.matchedProduct?.name || "Ürün";
  const productImage = result?.matchedProduct?.image || result?.products?.[0]?.image || null;
  const recommendedPriceText = useMemo(() => {
    const price = result?.matchedProduct?.price ?? result?.products?.[0]?.price ?? null;
    if (typeof price === "number") {
      return `Tavsiye edilen perakende satış fiyatı ${formatPriceTl(price)} TL'dir.`;
    }
    return "Tavsiye edilen perakende satış fiyatı 7.500 TL'dir.";
  }, [result]);

  const remainingDays = useMemo(
    () => (result?.record?.expiryDate ? getRemainingDays(result.record.expiryDate) : null),
    [result],
  );

  return (
    <main>
      <Navbar />

      <section className="bg-[#070D1A] text-white py-14">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-black">Orijinallik Sorgulama</h1>
          <p className="text-white/70 mt-3 text-sm md:text-base">
            Lisans kodu girin, barkod okutun veya QR kod içeriğini kamerayla tarayın.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Lisans Kodu / Barkod / QR Link
          </label>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Örn: HNRDRSK52"
              className="h-11 flex-1 rounded-xl border border-gray-300 px-4 text-sm outline-none focus:border-orange-500"
            />
            <button
              onClick={() => void verifyCode(code)}
              disabled={loading}
              className="h-11 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-60"
            >
              {loading ? "Sorgulanıyor..." : "Sorgula"}
            </button>
            <button
              onClick={() => void startScanner()}
              className="h-11 px-5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Kamera ile Oku
            </button>
          </div>

          {scannerError && <p className="mt-3 text-sm text-red-500">{scannerError}</p>}
          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

          {scannerOpen && (
            <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden">
              <video ref={videoRef} className="w-full bg-black aspect-video object-cover" playsInline muted />
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
                <p className="text-xs text-gray-500">Kodu kadraja tutun.</p>
                <button
                  onClick={stopScanner}
                  className="text-xs font-semibold text-gray-700 hover:text-black"
                >
                  Kapat
                </button>
              </div>
            </div>
          )}
        </div>

        {result && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-[#f6f6f6] p-6">
            {!result.isOriginal ? (
              <div className="mx-auto max-w-md text-center">
                <div className="mx-auto w-24 h-24 rounded-full border-4 border-red-300 text-red-400 text-6xl leading-[84px]">×</div>
                <h2 className="mt-4 text-4xl font-semibold text-gray-700">Doğrulanamadı</h2>

                <div className="mt-4 mx-auto w-[160px] h-[120px] rounded-md border-4 border-gray-200 text-gray-500 text-2xl flex items-center justify-center font-semibold">
                  Görsel Yok
                </div>

                <p className="mt-5 text-[33px] text-gray-700 leading-relaxed">
                  Bu ürün Drmaxx a ait değildir. ya da eski parti numarasına sahip. Lütfen son tüketim tarihini kontrol edin. Bir hata var ise bize iletişim kutusundan bildirebilirsiniz.
                </p>

                <button
                  onClick={() => setResult(null)}
                  className="mt-6 h-12 px-8 rounded-lg bg-[#4A8FD8] hover:bg-[#3B7EC6] text-white font-semibold"
                >
                  OK
                </button>
              </div>
            ) : (
              <div className="mx-auto max-w-md text-center">
                <div className="mx-auto w-24 h-24 rounded-full border-4 border-green-200 text-green-400 text-6xl leading-[84px]">✓</div>

                <h2 className="mt-5 text-[46px] font-semibold text-gray-700">{productName}</h2>

                <div className="mt-4 flex justify-center">
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={productName}
                      className="h-40 w-auto object-contain"
                    />
                  ) : (
                    <div className="w-[140px] h-[120px] rounded-md border-4 border-gray-200 text-gray-500 text-xl flex items-center justify-center font-semibold">
                      Görsel Yok
                    </div>
                  )}
                </div>

                <p className="mt-2 text-[#E53E3E] text-[32px] font-semibold">{recommendedPriceText}</p>

                <div className="mt-4 space-y-1 text-[38px] text-gray-700">
                  {result.record?.productionDate && <p>Üretim Tarihi : {result.record.productionDate}</p>}
                  {result.record?.expiryDate && <p>SonKullanım Tarihi : {result.record.expiryDate}</p>}
                  {remainingDays !== null && <p>Son kullanım için kalan gün {remainingDays}</p>}
                  <p>Ürün Kodu : {result.record?.lisansKod || result.checkedCode}</p>
                </div>

                <p className="mt-3 text-[38px] font-bold text-[#FF7A7A]">DRMAXX A AİT ORİJİNAL ÜRÜN</p>

                <button
                  onClick={() => setResult(null)}
                  className="mt-6 h-12 px-8 rounded-lg bg-[#4A8FD8] hover:bg-[#3B7EC6] text-white font-semibold"
                >
                  OK
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
