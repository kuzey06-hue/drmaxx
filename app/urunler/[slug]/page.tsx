import { notFound } from "next/navigation";
import { products as baseProducts } from "@/data/products";
import { getMergedProducts, getMergedProduct } from "@/lib/getProducts";
import { ProductDetail } from "@/components/sections/ProductDetail";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return baseProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getMergedProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} | DR.MAXX`,
    description: product.shortDesc ?? product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getMergedProduct(slug);
  if (!product) notFound();

  const allProducts = await getMergedProducts();
  const related = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  const allRelated =
    related.length < 2
      ? [
          ...related,
          ...allProducts
            .filter((p) => p.id !== product.id && !related.includes(p))
            .slice(0, 3 - related.length),
        ]
      : related;

  return (
    <main>
      <Navbar />
      <ProductDetail product={product} related={allRelated} />
      <Footer />
    </main>
  );
}
