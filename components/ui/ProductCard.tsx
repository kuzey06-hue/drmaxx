"use client";

import { motion } from "framer-motion";
import { Heart, ShoppingCart, Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "./Badge";
import { StarRating } from "./StarRating";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/data/products";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const hasImage = !!product.image && !imgError;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: String(product.id),
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      color: product.color,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group relative flex flex-col rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      {/* Wishlist */}
      <button
        onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted); }}
        className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
        aria-label="Favorilere ekle"
      >
        <Heart size={15} className={wishlisted ? "fill-rose-500 text-rose-500" : "text-gray-400"} />
      </button>

      {/* Badge */}
      {product.badge && (
        <div className="absolute top-3 left-3 z-10">
          <Badge label={product.badge} />
        </div>
      )}

      <Link href={`/urunler/${product.slug}`} className="flex flex-col flex-1">
        {/* Product image */}
        <div
          className="relative mx-3 mt-3 mb-2 h-44 rounded-xl overflow-hidden flex items-center justify-center"
          style={{
            background: hasImage
              ? `linear-gradient(135deg, ${product.color}10 0%, ${product.color}20 100%)`
              : `linear-gradient(135deg, ${product.color}18 0%, ${product.color}30 100%)`,
          }}
        >
          {hasImage ? (
            <Image
              src={product.image!}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <>
              <div
                className="w-24 h-32 rounded-xl flex flex-col items-center justify-center text-white font-bold text-sm shadow-lg"
                style={{ background: `linear-gradient(160deg, ${product.color} 0%, ${product.color}cc 100%)` }}
              >
                <span className="text-[9px] font-extrabold tracking-widest opacity-70 mb-1">DR.MAXX</span>
                <span className="text-center px-2 leading-tight text-[11px]">{product.name}</span>
              </div>
              <div
                className="absolute inset-0 opacity-20 blur-2xl"
                style={{ background: `radial-gradient(circle at 50% 80%, ${product.color}, transparent 70%)` }}
              />
            </>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col flex-1 px-3 pb-3 gap-1.5">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{product.name}</h3>
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
          <div className="flex items-baseline gap-2 mt-auto pt-1">
            <span className="text-base font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 leading-tight">{product.quantity}</p>
        </div>
      </Link>

      {/* Cart button */}
      <div className="px-3 pb-3">
        <button
          onClick={handleAddToCart}
          className={`w-full flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold transition-all ${
            added
              ? "bg-green-500 text-white"
              : "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-200"
          }`}
        >
          {added ? (
            <><Check size={13} /> Eklendi</>
          ) : (
            <><ShoppingCart size={13} /> Sepete Ekle</>
          )}
        </button>
      </div>
    </motion.div>
  );
}
