insert into cms_content (key, content, updated_at) values
(
  'menu_items',
  '[
    {"id":1,"label":"Anasayfa","href":"/","order":1,"active":true},
    {"id":2,"label":"Ürünler","href":"/urunler","order":2,"active":true},
    {"id":3,"label":"Kategoriler","href":"/urunler","order":3,"active":true},
    {"id":4,"label":"Blog","href":"/blog","order":4,"active":true},
    {"id":5,"label":"Hakkımızda","href":"/hakkimizda","order":5,"active":true},
    {"id":6,"label":"İletişim","href":"/iletisim","order":6,"active":true}
  ]'::jsonb,
  now()
),
(
  'pages',
  '[
    {
      "id":1,
      "title":"Hakkımızda",
      "slug":"/hakkimizda",
      "updated":"2026-05-03",
      "status":"Yayında",
      "metaTitle":"Hakkımızda | DR.MAXX",
      "metaDesc":"DR.MAXX hakkında bilgi edinin.",
      "content":"DR.MAXX, bilimsel formülleriyle öne çıkan bir sağlık takviyesi markasıdır.\n\nAmacımız, insanların daha sağlıklı ve enerjik bir yaşam sürmelerine yardımcı olmak için kaliteli takviye ürünleri sunmaktır.\n\nÜrünlerimiz kalite standartlarına uygun tesislerde üretilir."
    },
    {
      "id":2,
      "title":"Gizlilik Politikası",
      "slug":"/gizlilik",
      "updated":"2026-04-01",
      "status":"Yayında",
      "metaTitle":"Gizlilik Politikası | DR.MAXX",
      "metaDesc":"Kişisel verilerinizin nasıl işlendiğini öğrenin.",
      "content":"Bu gizlilik politikası, kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar.\n\nToplanan veriler yalnızca sipariş işleme, müşteri hizmetleri ve yasal yükümlülükler için kullanılır."
    },
    {
      "id":3,
      "title":"KVKK",
      "slug":"/kvkk",
      "updated":"2026-05-07",
      "status":"Yayında",
      "metaTitle":"KVKK Aydınlatma Metni | DR.MAXX",
      "metaDesc":"6698 sayılı Kanun kapsamında aydınlatma metni.",
      "content":"Kişisel verileriniz KVKK kapsamında işlenmektedir.\n\nBaşvurularınızı iletişim kanallarımız üzerinden tarafımıza iletebilirsiniz."
    },
    {
      "id":4,
      "title":"Kargo & Teslimat",
      "slug":"/kargo",
      "updated":"2026-03-15",
      "status":"Yayında",
      "metaTitle":"Kargo & Teslimat | DR.MAXX",
      "metaDesc":"Kargo ve teslimat bilgileri.",
      "content":"Siparişleriniz 1-3 iş günü içinde kargoya teslim edilmektedir.\n\n300 TL ve üzeri siparişlerde kargo ücretsizdir."
    },
    {
      "id":5,
      "title":"İade & Değişim",
      "slug":"/iade",
      "updated":"2026-03-15",
      "status":"Yayında",
      "metaTitle":"İade & Değişim | DR.MAXX",
      "metaDesc":"İade ve değişim politikamız hakkında bilgi alın.",
      "content":"Ürün teslimatından itibaren 14 gün içinde iade talebinde bulunabilirsiniz.\n\nİade edilecek ürünlerin kullanılmamış ve orijinal ambalajında olması gerekir."
    }
  ]'::jsonb,
  now()
)
on conflict (key) do update set
  content = excluded.content,
  updated_at = excluded.updated_at;
