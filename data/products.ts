export type Badge = "Çok Satan" | "Yeni" | "Çocuklara Özel" | "Uzman Önerisi";

export interface IngredientRow {
  name: string;
  dose1?: string;      // 1 kapsül / 1 ölçek
  dose2?: string;      // 2 kapsül / 2 ölçek
  brd?: string;        // Beslenme Referans Değeri
  nitelik?: string;    // Niteliği (Toz, Sıvı vb.)
  dailyDose?: string;  // Tek sütunlu günlük doz
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: Badge;
  quantity: string;
  category: string;
  description: string;
  color: string;
  image?: string;
  gallery?: string[];  // Ürün detay sayfası galeri resimleri
  // Detay sayfası için ek alanlar
  shortDesc?: string;
  benefits?: string[];
  ingredients?: string[];          // Basit liste
  ingredientTable?: IngredientRow[]; // Doz tablosu
  ingredientTableHeaders?: string[]; // Özel sütun başlıkları
  ingredientNote?: string;           // Besin öğeleri / içindekiler
  usage?: string;
  storage?: string;
  warnings?: string;
  approvalNo?: string;
  barcode?: string;
  certificates?: string;
  manufacturer?: string;
  batchNo?: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Sitikolin Plus+",
    slug: "sitikolin-plus",
    price: 1299,
    rating: 4.8,
    reviewCount: 248,
    badge: "Çok Satan",
    quantity: "30 Yumuşak Kapsül",
    category: "Nörobilim",
    description: "Sitikolin, Omega-3 (Balık Yağı), Fosfatidilserin, Koenzim Q10, B Vitamini Kompleksi, Metilkobalamin B12",
    color: "#1D4ED8",
    image: "/products/sitikolin-sise.png",
    gallery: [
      "/products/sitikolin-plus.jpg?v=2",
      "/products/sitikolin-sise.png",
      "/products/stikolin-.png",
      "/products/sitikolin-kutu.png",
    ],
    shortDesc: "Beyin fonksiyonlarını destekleyen, odaklanma ve konsantrasyonu artıran ileri formül takviye.",
    benefits: [
      "Hafıza ve öğrenme kapasitesini destekler",
      "Zihinsel yorgunluğu azaltır",
      "Nörotransmitter üretimini destekler",
      "Uzun süreli konsantrasyonu artırır",
    ],
    ingredientTable: [
      { name: "Balık Yağı",                   dose1: "750 mg",   dose2: "1500 mg",  brd: "**" },
      { name: "  — Omega-3 yağ asitleri",      dose1: "600 mg",   dose2: "1200 mg",  brd: "**" },
      { name: "  — EPA",                       dose1: "300 mg",   dose2: "600 mg",   brd: "**" },
      { name: "  — DHA",                       dose1: "200 mg",   dose2: "400 mg",   brd: "**" },
      { name: "  — Fosfatidilserin",           dose1: "75 mg",    dose2: "150 mg",   brd: "**" },
      { name: "Sitikolin",                     dose1: "125 mg",   dose2: "250 mg",   brd: "**" },
      { name: "Koenzim Q10",                   dose1: "25 mg",    dose2: "50 mg",    brd: "**" },
      { name: "Vitamin B5",                    dose1: "5 mg",     dose2: "10 mg",    brd: "%166,66" },
      { name: "Vitamin B1",                    dose1: "2,5 mg",   dose2: "5 mg",     brd: "%454,54" },
      { name: "Vitamin B6",                    dose1: "2,5 mg",   dose2: "5 mg",     brd: "%357,14" },
      { name: "Vitamin B2",                    dose1: "2,5 mg",   dose2: "5 mg",     brd: "%178,57" },
      { name: "Metilkobalamin (Vitamin B12)",  dose1: "50 µg",    dose2: "100 µg",   brd: "%4000" },
    ],
    ingredientNote: "Balık yağı (Omega-3 yağ asitleri [EPA, DHA]), fosfatidilserin, sitikolin (sodyum sitikolin), koenzim Q10, pantotenik asit (Vitamin B5), tiamin hidroklorür (Vitamin B1), piridoksin hidroklorür (Vitamin B6), riboflavin (Vitamin B2), metilkobalamin (Vitamin B12).",
    usage: "Günde 2 yumuşak kapsülün tercihen yemeklerle birlikte bol su ile kullanılması önerilir.",
    storage: "25°C'nin altındaki oda sıcaklığında, kuru ve serin bir yerde muhafaza ediniz. Doğrudan güneş ışığına maruz bırakmayınız. Çocukların ulaşamayacağı yerde saklayınız.",
    warnings: "Tavsiye edilen günlük porsiyonu aşmayınız. Takviye edici gıdalar normal beslenmenin yerine geçemez. Çocukların ulaşamayacağı yerde saklayınız. İlaç değildir. Hastalıkların önlenmesi veya tedavi edilmesi amacıyla kullanılmaz. Hamilelik ve emzirme dönemi ile hastalık veya ilaç kullanılması durumlarında doktorunuza danışınız.",
    approvalNo: "026222-17.02.2026",
    barcode: "8685043001010",
  },
  {
    id: "2",
    name: "Resveratrol Advance Complex",
    slug: "resveratrol-advance-complex",
    price: 1499,
    originalPrice: 1799,
    rating: 4.7,
    reviewCount: 89,
    badge: "Yeni",
    quantity: "150ml",
    category: "Antioksidan",
    description: "Resveratrol, Quercetin, Laktoferrin, Vitamin C, Çinko Pikolinat, Vitamin D3 içeren sıvı takviye edici gıda.",
    color: "#7C3AED",
    image: "/products/resveratrol-sise.png",
    gallery: [
      "/products/resveratrol-advance-complex.jpg?v=2",
      "/products/resveratrol.png",
      "/products/resveratrol-sise.png",
      "/products/resveratrol-kutu.png",
    ],
    shortDesc: "Güçlü antioksidan formülü ile hücresel yaşlanmayı yavaşlatır, bağışıklık sistemini güçlendirir. 4 yaş ve üzeri için uygundur.",
    benefits: [
      "Güçlü antioksidan koruma sağlar",
      "Bağışıklık sistemini destekler",
      "Hücresel yenilemeyi hızlandırır",
      "Kalp-damar sağlığını destekler",
    ],
    ingredientTable: [
      { name: "Kuersetin",   nitelik: "Toz", dailyDose: "500 mg"  },
      { name: "Resveratrol", nitelik: "Toz", dailyDose: "200 mg"  },
      { name: "Laktoferrin", nitelik: "Toz", dailyDose: "200 mg"  },
      { name: "Vitamin C",   nitelik: "Toz", dailyDose: "100 mg"  },
      { name: "Çinko",       nitelik: "Toz", dailyDose: "7,5 mg"  },
      { name: "Vitamin D3",  nitelik: "Toz", dailyDose: "20 µg"   },
    ],
    ingredientTableHeaders: ["Etken Madde", "Niteliği", "Günlük Alım Dozu (2 Ölçek / 10 ml)"],
    ingredientNote: "Quercetin (Etken madde), Resveratrol (Etken madde), Laktoferrin (Etken madde), Kalsiyum L-Askorbat (Etken madde), Çinko Pikolinat (Etken madde), Deiyonize Su (Yardımcı madde), Gliserol (Kıvam artırıcı), Ksantan Gam (Kıvam artırıcı), Sitrik Asit (Asitlik düzenleyici), Stevia (Tatlandırıcı).",
    usage: "1 ölçek (5 ml) günde 1 veya 2 kez alınması tavsiye edilir. KULLANMADAN ÖNCE ÇALKALAYINIZ.\n\nKullanıcı Grubu: 4-10 yaş grubu çocukların kullanımına uygundur.",
    storage: "Şişe kapağı açıldıktan sonra buzdolabında 2 ay saklanabilir. Çocukların ulaşamayacağı yerde saklayın. Ambalajında ve 25°C altında oda sıcaklığında saklayınız.",
    warnings: "Takviye edici gıdalar normal beslenmenin yerine geçemez. Hamilelik ve emzirme döneminde, hastalık veya ilaç kullanılması durumlarında doktorunuza danışınız. Tavsiye edilen günlük alım dozunu aşmayınız. Sıvı formdur. İlaç değildir. Hastalıkların önlenmesi veya tedavi edilmesi amacıyla kullanılmaz.",
    approvalNo: "016098-05.01.2023",
    batchNo: "HNRSRP45",
    certificates: "GMP, ISO 22000, ISO 9001, HALAL",
    manufacturer: "Honor İlaç San. Tic. Ltd. Şti. — Kahramankazan / ANKARA · İşletme Kayıt No: TR-06-K-063782\nGıda İşletmecisi: DR MAXX İlaç Sanayi ve Ticaret A.Ş., Çakmak Mah. 165/1 Sok. No:26B, Merkezefendi / DENİZLİ",
  },
  {
    id: "3",
    name: "NeuroDrops",
    slug: "neurodrops",
    price: 999,
    rating: 4.9,
    reviewCount: 412,
    badge: "Çok Satan",
    quantity: "100ml Damla",
    category: "Nörobilim",
    description: "B6 Vitamini (Piridoksin) içeren damlalık formülü takviye edici gıda.",
    color: "#8B5CF6",
    image: "/products/neuro-drops.jpg?v=2",
    shortDesc: "Sinir sistemi sağlığını destekleyen, kolay emilen damlalık formüllü B6 vitamini takviyesi. 4 yaş ve üzeri için uygundur.",
    benefits: [
      "Sinir sistemi fonksiyonlarını destekler",
      "Nörotransmitter sentezine katkıda bulunur",
      "Damlalık formülü ile pratik kullanım",
      "Çocuklar ve yetişkinler için uygundur",
    ],
    ingredientTable: [
      { name: "Vitamin B6 (Piridoksin)", dailyDose: "—", brd: "—" },
    ],
    ingredientTableHeaders: ["İçerik", "1 Damla (0,05 ml)", "%BRD"],
    ingredientNote: "Deiyonize Su (Yardımcı madde), B6 Vitamini (Piridoksin), Aroma Verici, Sitrik Asit (E330) – Asitlik düzenleyici, Potasyum Sorbat (E202) – Koruyucu, Sodyum Sakkarin (E954iii) – Tatlandırıcı.\n\nBRD: Beslenme Referans Değeri Yoktur.",
    usage: "4–10 yaş: Günde 1 damla (0,05 ml)\n11 yaş ve üzeri: Günde 2 damla (0,10 ml)\n\nKullanmadan önce çalkalayınız.\n\nKullanıcı Grubu: 4–10 yaş arası çocuklar ve 11 yaş üstü yetişkinler için uygundur.",
    storage: "25°C altında kuru ve serin yerlerde muhafaza edilmelidir.",
    warnings: "Çocukların ulaşamayacağı yerde saklayınız. Tavsiye edilen günlük porsiyonu aşmayınız. Hamilelik ve emzirme dönemi ile hastalık veya ilaç kullanılması durumunda doktorunuza danışınız. Ürünün içeriğindeki maddelere karşı duyarlılığınız varsa kullanmayınız. Takviye edici gıdalar normal beslenmenin yerine geçemez. İlaç değildir. Hastalıkların önlenmesi veya tedavi amacıyla kullanılamaz.",
  },
  {
    id: "4",
    name: "Phospholipid Complex",
    slug: "phospholipid-complex",
    price: 1199,
    rating: 4.6,
    reviewCount: 156,
    quantity: "200mlX2",
    category: "Beyin Sağlığı",
    description: "Fosfolipidler, Kril Yağı (Omega-3, EPA, DHA, Astaksantin), Keten Tohumu Yağı, Magnezyum L-Treonat ve Vitamin B6 içeren sıvı takviye edici gıda.",
    color: "#0891B2",
    image: "/products/fosfolipid-sise.png",
    gallery: [
      "/products/phospholipid-complex.jpg?v=2",
      "/products/fosfolipid.png",
      "/products/fosfolipid-sise.png",
      "/products/fosfolipid-kutu.png",
    ],
    shortDesc: "Beyin hücresi zarlarını güçlendiren fosfolipid kompleksi ile bilişsel performansı, hafıza ve öğrenme kapasitesini destekler. 4 yaş ve üzeri için uygundur.",
    benefits: [
      "Beyin hücresi zarlarını güçlendirir",
      "Bilişsel fonksiyonları destekler",
      "Hafıza ve öğrenmeyi iyileştirir",
      "Omega-3 ile sinaptik iletimi artırır",
    ],
    ingredientTable: [
      { name: "Fosfolipidler",          dailyDose: "628,55 mg", brd: "**"    },
      { name: "  — Krill Yağı",         dailyDose: "500,00 mg", brd: "**"    },
      { name: "  — — Omega 3",          dailyDose: "110,00 mg", brd: "**"    },
      { name: "  — — EPA",              dailyDose: "50,00 mg",  brd: "**"    },
      { name: "  — — DHA",              dailyDose: "25,00 mg",  brd: "**"    },
      { name: "  — — Astaksantin",      dailyDose: "0,10 mg",   brd: "**"    },
      { name: "  — Keten Tohumu Yağı",  dailyDose: "125,00 mg", brd: "**"    },
      { name: "  — — Alfa linolenik asit", dailyDose: "65,62 mg", brd: "**"  },
      { name: "  — — Oleik asit",       dailyDose: "26,37 mg",  brd: "**"    },
      { name: "  — — Linoleik asit",    dailyDose: "19,12 mg",  brd: "**"    },
      { name: "  — — Palmitik asit",    dailyDose: "7,50 mg",   brd: "**"    },
      { name: "  — — Stearik asit",     dailyDose: "5,50 mg",   brd: "**"    },
      { name: "Magnezyum",              dailyDose: "16,50 mg",  brd: "%4,40" },
      { name: "Vitamin B6",             dailyDose: "5,00 mg",   brd: "%357"  },
    ],
    ingredientTableHeaders: ["Etken Maddeler", "Miktar mg / 1 Ölçek (5 ml)", "BRD %"],
    ingredientNote: "Deiyonize Su, Fosfolipidler (Fosfatidilkolin, Fosfatidilinositol, Fosfatidiletanolamin, Fosfatidilserin), Krill Yağı (Omega 3, EPA, DHA, Astaksantin), Magnezyum L-Treonat, Keten Tohumu Yağı (Alfa linolenik asit, Oleik asit, Linoleik asit, Palmitik asit, Stearik asit), Piridoksin hidroklorür, Gliserol (E422), Ksantam gam (E415), Tutti Frutti Aroması, Sitrik asit (E330), Steviol glikozitler (E960a), Sodyum Benzoat (E211), Potasyum Sorbat (E202), Polisorbat 80 (E433).",
    usage: "4-10 yaş grubu çocuklar için günde 1 ölçek (5 ml) bir bardak su ile alınması tavsiye edilir. 11 yaş ve üzeri için günde 2 ölçek (10 ml) alınması tavsiye edilir. KULLANMADAN ÖNCE ÇALKALAYINIZ.\n\nKullanıcı Grubu: 4-10 yaş grubu çocuklar ve 11 yaş ve üzeri içindir.",
    storage: "Çocukların ulaşamayacağı yerde 25°C'nin altında saklayınız. Direkt güneş ışığına maruz bırakmayın, ısı ve nemden uzak ortamda saklayınız. Açıldıktan sonra buzdolabında muhafaza ediniz ve 3 (üç) ay içerisinde tüketilmesi önerilir.",
    warnings: "Hastalıkların önlenmesi veya tedavi edilmesi amacıyla kullanılmaz. Hamilelik ve emzirme dönemi ile hastalık veya ilaç kullanılması durumlarında doktorunuza danışınız. Ürünün içeriğindeki maddelerden herhangi birine karşı duyarlılığınız varsa kullanmayınız. Çocukların ulaşamayacağı yerde saklayınız. Takviye edici gıdalar normal beslenmenin yerine geçemez. Tavsiye edilen günlük porsiyonu aşmayınız. İlaç değildir.",
    approvalNo: "022951-31.01.2025",
    barcode: "8683555375704",
  },
  {
    id: "5",
    name: "Karagen Kids",
    slug: "karagen-kids",
    price: 799,
    rating: 4.8,
    reviewCount: 203,
    badge: "Çocuklara Özel",
    quantity: "150ml",
    category: "Çocuk Sağlığı",
    description: "Karagen Ekstresi, Kekik, Hatmi ve Meyan Kökü içeren bitkisel takviye edici gıda. Tatlandırıcı içerir.",
    color: "#3B82F6",
    image: "/products/karagen-kids.jpg?v=2",
    shortDesc: "Karagen ekstresi ve bitkisel formülüyle solunum yolu sağlığını destekleyen, 4-10 yaş çocuklar ile yetişkinler için özel sıvı takviye.",
    benefits: [
      "Solunum yolu sağlığını destekler",
      "Doğal bitkisel formül içerir",
      "Çocuklar ve yetişkinler için uygundur",
      "Glukoz ve alkol içermez",
    ],
    ingredientTable: [
      { name: "Karagen Ekstresi",     dailyDose: "200 mg" },
      { name: "Kekik Ekstresi",       dailyDose: "200 mg" },
      { name: "Hatmi Ekstresi",       dailyDose: "200 mg" },
      { name: "Meyan Kökü Ekstresi",  dailyDose: "100 mg" },
      { name: "Isırgan Ekstresi",     dailyDose: "60 mg"  },
    ],
    ingredientTableHeaders: ["Bileşen", "Miktar (mg / 5 ml)"],
    ingredientNote: "Karagen Ekstresi İçeren Takviye Edici Gıda. Tatlandırıcı içerir. BRD (Beslenme Referans Değeri): Yoktur.",
    usage: "Tavsiye edilen günlük porsiyon miktarı günde 2 defa 5 ml'dir. KULLANMADAN ÖNCE ÇALKALAYINIZ.\n\nKullanıcı Grubu: 4–10 yaş grubu çocuklar ve 11 yaş üstü yetişkinlerin kullanımına uygundur.",
    storage: "Şişenin kapağı açıldıktan sonra buzdolabında 3 ay muhafaza edilebilir. 25°C'nin altında, ağzı kapalı olarak serin ve kuru yerde muhafaza ediniz.",
    warnings: "Ürünün içeriğindeki maddelerden herhangi birine karşı duyarlılığınız varsa kullanmayınız. Hamilelik ve emzirme dönemi ile hastalık veya ilaç kullanılması durumlarında doktorunuza danışınız. Çocukların ulaşamayacağı yerde saklayınız. Takviye edici gıdalar normal beslenmenin yerine geçmez. Tavsiye edilen günlük porsiyonu aşmayınız. İlaç değildir. Hastalıkların önlenmesi veya tedavi edilmesi amacıyla kullanılmaz. Sıvı formdur. Menşei: Türkiye.",
    approvalNo: "016098-05.01.2023",
    batchNo: "HNRFTC05",
    manufacturer: "Honor İlaç San. Tic. Ltd. Şti. — Kahramankazan / ANKARA · İşletme Kayıt No: TR-06-K-063782\nGıda İşletmecisi: DR MAX İlaç Sanayi ve Ticaret A.Ş., Çakmak Mah. 165/1 Sok. No:26B, Merkezefendi / DENİZLİ",
  },
  {
    id: "6",
    name: "Omega 3 Balık Yağı",
    slug: "omega-3-balik-yagi",
    price: 899,
    rating: 4.7,
    reviewCount: 334,
    quantity: "90 Kapsül",
    category: "Omega",
    description: "Balık Yağı (Omega-3, EPA, DHA), Fosfatidilserin, Sitikolin, Koenzim Q10 ve B Vitamini Kompleksi içeren yumuşak kapsül takviye edici gıda.",
    color: "#D97706",
    image: "/products/omega-3.png",
    gallery: [
      "/products/omega-3.png",
      "/products/sitikolin-plus.png",
    ],
    shortDesc: "Balık yağı, fosfatidilserin ve sitikolin kombinasyonu ile beyin, kalp ve sinir sistemi sağlığını bütünsel olarak destekleyen ileri formül.",
    benefits: [
      "Kalp-damar sağlığını destekler",
      "Beyin ve sinir sistemi fonksiyonlarını güçlendirir",
      "Fosfatidilserin ile hafızayı destekler",
      "B vitamini kompleksi ile enerji metabolizmasına katkı sağlar",
    ],
    ingredientTable: [
      { name: "Balık Yağı",                  dose1: "750 mg",  dose2: "1500 mg", brd: "**"      },
      { name: "  — Omega-3 yağ asitleri",     dose1: "600 mg",  dose2: "1200 mg", brd: "**"      },
      { name: "  — EPA",                      dose1: "300 mg",  dose2: "600 mg",  brd: "**"      },
      { name: "  — DHA",                      dose1: "200 mg",  dose2: "400 mg",  brd: "**"      },
      { name: "  — Fosfatidilserin",          dose1: "75 mg",   dose2: "150 mg",  brd: "**"      },
      { name: "Sitikolin",                    dose1: "125 mg",  dose2: "250 mg",  brd: "**"      },
      { name: "Koenzim Q10",                  dose1: "25 mg",   dose2: "50 mg",   brd: "**"      },
      { name: "Vitamin B5",                   dose1: "5 mg",    dose2: "10 mg",   brd: "%166,66" },
      { name: "Vitamin B1",                   dose1: "2,5 mg",  dose2: "5 mg",    brd: "%454,54" },
      { name: "Vitamin B6",                   dose1: "2,5 mg",  dose2: "5 mg",    brd: "%357,14" },
      { name: "Vitamin B2",                   dose1: "2,5 mg",  dose2: "5 mg",    brd: "%178,57" },
      { name: "Metilkobalamin (Vitamin B12)", dose1: "50 µg",   dose2: "100 µg",  brd: "%4000"   },
    ],
    ingredientNote: "Balık yağı (Omega-3 yağ asitleri [EPA, DHA]), fosfatidilserin, sitikolin (sodyum sitikolin), koenzim Q10, pantotenik asit (Vitamin B5), tiamin hidroklorür (Vitamin B1), piridoksin hidroklorür (Vitamin B6), riboflavin (Vitamin B2), metilkobalamin (Vitamin B12).",
    usage: "Günde 2 yumuşak kapsülün tercihen yemeklerle birlikte bol su ile kullanılması önerilir.",
    storage: "25°C'nin altındaki oda sıcaklığında, kuru ve serin bir yerde muhafaza ediniz. Doğrudan güneş ışığına maruz bırakmayınız. Çocukların ulaşamayacağı yerde saklayınız.",
    warnings: "Tavsiye edilen günlük porsiyonu aşmayınız. Takviye edici gıdalar normal beslenmenin yerine geçemez. Çocukların ulaşamayacağı yerde saklayınız. İlaç değildir. Hastalıkların önlenmesi veya tedavi edilmesi amacıyla kullanılmaz. Hamilelik ve emzirme dönemi ile hastalık veya ilaç kullanılması durumlarında doktorunuza danışınız. Tavsiye edilen günlük alım dozunu aşmayınız.",
    approvalNo: "026222-17.02.2026",
    barcode: "8685043001010",
  },
];

export const expertProducts: Product[] = [
  products[0],
  products[5],
  products[1],
  products[2],
];
