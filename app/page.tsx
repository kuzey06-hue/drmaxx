import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { ProductFinder } from "@/components/sections/ProductFinder";
import { PopularProducts } from "@/components/sections/PopularProducts";
import { Testimonials } from "@/components/sections/Testimonials";
import { WhyDrMaxx } from "@/components/sections/WhyDrMaxx";
import { ExpertRecommendations } from "@/components/sections/ExpertRecommendations";
import { BottomTrustBar } from "@/components/sections/BottomTrustBar";
import { Newsletter } from "@/components/sections/Newsletter";
import { getMergedProducts } from "@/lib/getProducts";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getMergedProducts();

  return (
    <main>
      <Navbar />
      <Hero />
      <TrustBar />
      <PopularProducts products={products} />
      <ProductFinder />
      <Testimonials />
      <WhyDrMaxx />
      <ExpertRecommendations products={products} />
      <BottomTrustBar />
      <Newsletter />
      <Footer />
    </main>
  );
}
