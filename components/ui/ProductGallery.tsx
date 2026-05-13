"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "./Badge";
import type { Product } from "@/data/products";

interface Props {
  product: Product;
  discount?: number | null;
}

export function ProductGallery({ product, discount }: Props) {
  const images = product.gallery?.length ? product.gallery : (product.image ? [product.image] : []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  const mainImage = images[selectedIndex];
  const hasImage = !!mainImage && !imgError[selectedIndex];

  return (
    <div className="flex flex-col gap-4">
      {/* Ana görsel */}
      <div
        className="relative rounded-3xl overflow-hidden flex items-center justify-center aspect-square max-w-2xl w-full"
        style={{
          background: `linear-gradient(135deg, ${product.color}12 0%, ${product.color}25 100%)`,
        }}
      >
        {product.badge && (
          <div className="absolute top-4 left-4 z-10">
            <Badge label={product.badge} />
          </div>
        )}
        {discount && (
          <div className="absolute top-4 right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
            -{discount}%
          </div>
        )}
        {hasImage ? (
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className={selectedIndex === 0 ? "object-cover" : "object-contain p-4"}
            onError={() => setImgError({ ...imgError, [selectedIndex]: true })}
            priority
          />
        ) : (
          <div
            className="w-48 h-64 rounded-2xl flex flex-col items-center justify-center text-white font-bold shadow-xl"
            style={{ background: `linear-gradient(160deg, ${product.color}, ${product.color}cc)` }}
          >
            <span className="text-xs tracking-widest opacity-70 mb-2">DR.MAXX</span>
            <span className="text-center px-4 text-sm leading-snug">{product.name}</span>
          </div>
        )}
      </div>

      {/* Thumbnail'lar */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                selectedIndex === idx
                  ? "border-orange-500 ring-2 ring-orange-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Image
                src={img}
                alt={`${product.name} ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
