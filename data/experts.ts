export interface Expert {
  id: string;
  name: string;
  title: string;
  specialty: string;
  experience: string;
  bio: string;
  initials: string;
  recommendedProductIds: string[];
}

export const experts: Expert[] = [
  {
    id: "1",
    name: "Dr. Selim Çalışkan",
    title: "Fonksiyonel Tıp Uzmanı",
    specialty: "Nöroloji & Sağlıklı Yaşlanma",
    experience: "15+ yıl deneyim",
    bio: "Nöroloji ve sağlıklı yaşlanma üzerine 15+ yıllık deneyimi ile fonksiyonel tıp alanında öncü isimlerden biri.",
    initials: "SÇ",
    recommendedProductIds: ["1", "6", "2", "3"],
  },
];

export const quizSteps = [
  {
    step: "01",
    title: "Hedefinizi seçin",
    description: "Odaklanma, enerji veya bağışıklık gibi hedeflerinizi belirleyin.",
    icon: "Target",
  },
  {
    step: "02",
    title: "İhtiyaçlarınızı belirtin",
    description: "Yaşam tarzınız ve sağlık durumunuz hakkında bilgi verin.",
    icon: "ClipboardList",
  },
  {
    step: "03",
    title: "Size özel öneriler alın",
    description: "Uzman algoritmamız en uygun ürünleri sizin için seçer.",
    icon: "Sparkles",
  },
];
