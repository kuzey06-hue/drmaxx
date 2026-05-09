import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductsGrid } from "@/components/sections/ProductsGrid";
import { getMergedProducts } from "@/lib/getProducts";

export const dynamic = "force-dynamic";

export default async function UrunlerPage() {
  const products = await getMergedProducts();

  return (
    <main>
      <Navbar />

      {/* Page header */}
      <div className="bg-[#0A0F1E] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
            <a href="/" className="hover:text-white/60 transition-colors">Anasayfa</a>
            <span>/</span>
            <span className="text-white/70">Ürünler</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Tüm Ürünler</h1>
          <p className="text-white/40 text-sm mt-1">{products.length} ürün listeleniyor</p>
        </div>
      </div>

      <ProductsGrid products={products} />

      <Footer />
    </main>
  );
}
