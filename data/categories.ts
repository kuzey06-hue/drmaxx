export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
}

export const categories: Category[] = [
  { id: "1", name: "Nörobilim", slug: "norobilim", description: "Bilişsel destek ürünleri", productCount: 8 },
  { id: "2", name: "Antioksidan", slug: "antioksidan", description: "Hücresel koruma formülleri", productCount: 5 },
  { id: "3", name: "Omega & Yağ Asitleri", slug: "omega", description: "EPA, DHA ve daha fazlası", productCount: 4 },
  { id: "4", name: "Vitaminler", slug: "vitaminler", description: "Temel vitamin kompleksleri", productCount: 12 },
  { id: "5", name: "Mineraller", slug: "mineraller", description: "Biyoyararlanımı yüksek mineraller", productCount: 7 },
  { id: "6", name: "Çocuk Sağlığı", slug: "cocuk-sagligi", description: "Çocuklara özel formüller", productCount: 3 },
  { id: "7", name: "Bağışıklık", slug: "bagisiklik", description: "İmmün sistem desteği", productCount: 6 },
  { id: "8", name: "Liposomal", slug: "liposomal", description: "İleri emilim teknolojisi", productCount: 4 },
];

export const navCategories = categories.slice(0, 6);

export const ingredients = [
  "Sitikolin", "Omega 3", "Fosfatidilkolin", "Fosfatidilserin",
  "Fosfatidilinositol", "Koenzim Q10", "Metilkobalamin B12",
  "Resveratrol", "Quercetin", "C Vitamini", "Çinko",
  "Probiyotik", "Magnezyum", "L-Theanine", "K2 Vitamini", "Liposomal",
];
