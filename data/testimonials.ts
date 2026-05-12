export interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  product: string;
  initials: string;
  avatarColor: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Merve A.",
    role: "Doğrulanmış Alıcı",
    rating: 5,
    comment:
      "Siparişim çok hızlı şekilde teslim edildi. Aynı gün kargo hizmeti gerçekten başarılı. Temiz ve güvenli bir şekilde paketlenmiş. Çok memnunum.",
    product: "Sitikolin Plus 200ml",
    initials: "MA",
    avatarColor: "#F97316",
  },
  {
    id: "2",
    name: "Ahmet Y.",
    role: "Doğrulanmış Alıcı",
    rating: 5,
    comment:
      "Ürün çok iyi kutulmuş, hasarsız şekilde geldi. Kargo sürecini başından sonuna kadar takip ettim, her adımda profesyonel hizmet aldım.",
    product: "NeuroDrops 50ml",
    initials: "AY",
    avatarColor: "#2563EB",
  },
  {
    id: "3",
    name: "Selin K.",
    role: "Doğrulanmış Alıcı",
    rating: 5,
    comment:
      "Müşteri hizmetleri ekibi çok ilgili ve yardımcı oldu. Sorularıma hızlıca cevap verdiler. DR.MAXX'dan alışveriş yapmak gerçekten rahatlatıcı.",
    product: "Resveratrol Advance Complex",
    initials: "SK",
    avatarColor: "#7C3AED",
  },
];
