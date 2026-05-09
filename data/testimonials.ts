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
      "Sitikolin Plus'ı 1 aydır kullanıyorum. Odaklanma sürem arttı ve zihinim daha berrak. Kesinlikle tavsiye ediyorum.",
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
      "NeuroDrops'u oğlum için kullanıyoruz. Okulda dikkat süresi belirgin şekilde arttı. İçeriği temiz olması da çok önemli.",
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
      "Resveratrol Advance Complex enerjimi yükseltti ve bağışıklığımı güçlendirdi. Kendimi çok daha iyi hissediyorum.",
    product: "Resveratrol Advance Complex",
    initials: "SK",
    avatarColor: "#7C3AED",
  },
];
