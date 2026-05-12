import { sendMail } from "@/lib/mail";
import { readNotificationSettings } from "@/lib/notificationSettings";

type OrderEmailItem = {
  productName: string;
  quantity: number;
  price: number;
};

type OrderEmailInput = {
  orderNo: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: OrderEmailItem[];
};

const money = (value: number) =>
  value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

export async function sendNewOrderEmail(order: OrderEmailInput) {
  const settings = await readNotificationSettings();
  if (!settings.emailNotif || !settings.orderNotif) return;

  const recipients = settings.orderNotificationEmails?.length
    ? settings.orderNotificationEmails
    : [settings.notificationEmail];

  const itemRows = order.items
    .map(
      (item) =>
        `<tr><td>${item.productName}</td><td>${item.quantity}</td><td>${money(item.price)}</td></tr>`,
    )
    .join("");

  await sendMail({
    to: recipients,
    subject: `Yeni sipariş: ${order.orderNo}`,
    text: `Yeni sipariş: ${order.orderNo}\nMüşteri: ${order.customer}\nTelefon: ${order.phone}\nToplam: ${money(order.total)}`,
    html: `
      <h2>Yeni sipariş alındı</h2>
      <p><b>Sipariş No:</b> ${order.orderNo}</p>
      <p><b>Müşteri:</b> ${order.customer}</p>
      <p><b>E-posta:</b> ${order.email}</p>
      <p><b>Telefon:</b> ${order.phone}</p>
      <p><b>Adres:</b> ${order.address}</p>
      <table border="1" cellpadding="8" cellspacing="0">
        <thead><tr><th>Ürün</th><th>Adet</th><th>Birim Fiyat</th></tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
      <p><b>Toplam:</b> ${money(order.total)}</p>
    `,
  });
}
