// Sipariş type tanımları — gerçek veriler data/cms/orders.json'da tutulur
// Admin paneli ve API'ler /api/cms/orders endpoint'ini kullanır

export type OrderStatus = "Beklemede" | "İşleniyor" | "Kargoda" | "Teslim Edildi" | "İptal";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNo: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  date: string;
  paymentMethod: string;
  invoiceType?: "bireysel" | "kurumsal";
  tcKimlik?: string;
  vergiNo?: string;
  vergiDairesi?: string;
  firmaAdi?: string;
}

// Demo veri temizlendi — canlı veriler JSON dosyasından gelir
export const orders: Order[] = [];
