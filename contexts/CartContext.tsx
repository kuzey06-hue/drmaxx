"use client";

import {
  createContext, useContext, useState, useEffect, useCallback,
} from "react";

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  image?: string;
  color: string;
  quantity: number;
}

// ── Adet indirim kademeleri ────────────────────────────────────────────────────
export const QTY_TIERS = [
  { minQty: 2, percent: 5,  label: "2 Al %5 İndirim"  },
  { minQty: 3, percent: 10, label: "3 Al %10 İndirim" },
] as const;

/** Belirtilen adede göre indirim yüzdesini döndürür (0 = indirim yok) */
export function getQtyDiscountPercent(qty: number): number {
  let result = 0;
  for (const tier of QTY_TIERS) {
    if (qty >= tier.minQty) result = tier.percent;
  }
  return result;
}

/** Bir sonraki kademeyi döndürür (yoksa null) */
export function getNextQtyTier(qty: number) {
  return QTY_TIERS.find(t => qty < t.minQty) ?? null;
}

// ── Context tipi ───────────────────────────────────────────────────────────────
interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  itemCount: number;
  /** Adet indirimleri uygulanmış ara toplam */
  subtotal: number;
  /** Adet indirimlerinden toplam tasarruf */
  qtyDiscount: number;
  /** Bir ürünün adet indirimine göre birim fiyatını döndürür */
  getEffectivePrice: (item: CartItem) => number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // localStorage'dan yükle
  useEffect(() => {
    try {
      const stored = localStorage.getItem("drmaxx_cart");
      if (stored) setItems(JSON.parse(stored));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  // localStorage'a kaydet
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("drmaxx_cart", JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.id !== id));
    } else {
      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const getEffectivePrice = useCallback((item: CartItem) => {
    const disc = getQtyDiscountPercent(item.quantity);
    return item.price * (1 - disc / 100);
  }, []);

  const itemCount   = items.reduce((s, i) => s + i.quantity, 0);

  // Adet indirimi uygulanmış fiyat toplamı
  const subtotal    = items.reduce((s, i) => {
    const disc = getQtyDiscountPercent(i.quantity);
    return s + i.price * i.quantity * (1 - disc / 100);
  }, 0);

  // Adet indirimlerinden toplam tasarruf
  const qtyDiscount = items.reduce((s, i) => {
    const disc = getQtyDiscountPercent(i.quantity);
    return s + i.price * i.quantity * (disc / 100);
  }, 0);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQty, clearCart,
      itemCount, subtotal, qtyDiscount, getEffectivePrice,
      isOpen,
      openCart:  () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
