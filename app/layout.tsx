import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { CartDrawer } from "@/components/ui/CartDrawer";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "DR.MAXX | İleri Formüller. Daha İyi Sonuçlar.",
  description:
    "Bilimsel olarak geliştirilmiş premium takviyeler ile potansiyelinizi üst düzeye çıkarın. GMP sertifikalı, klinik destekli, doktor onaylı ürünler.",
  keywords: "takviye, vitamin, mineral, omega 3, sitikolin, neurodrops, drmaxx, premium takviye",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
