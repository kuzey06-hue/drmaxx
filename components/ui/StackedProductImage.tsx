"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Stacked product image effect.
 * quantity=1 → 1 bottle, quantity=2 → 2 fanned, quantity=3+ → 3 stacked.
 * Framer Motion animates images in/out when quantity changes.
 */

const STACK = [
  { rotate: -9,  x: -9,  y: 3,  scale: 0.86, zIndex: 1 },
  { rotate: -4,  x: -2,  y: 1,  scale: 0.93, zIndex: 2 },
  { rotate:  2,  x:  5,  y: 0,  scale: 1.00, zIndex: 3 },
];

interface StackedProductImageProps {
  image?: string;
  color: string;
  name: string;
  quantity: number;
  /** Tailwind size classes, default "w-16 h-16" */
  className?: string;
  /** sizes hint for next/image, default "64px" */
  sizes?: string;
}

export function StackedProductImage({
  image,
  color,
  name,
  quantity,
  className = "w-16 h-16",
  sizes = "64px",
}: StackedProductImageProps) {
  const count = Math.min(Math.max(quantity, 1), 3);

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <AnimatePresence>
        {STACK.map((cfg, i) => {
          if (i < 3 - count) return null;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: cfg.scale * 0.45, rotate: cfg.rotate }}
              animate={{
                opacity: 1,
                scale: cfg.scale,
                rotate: cfg.rotate,
                x: cfg.x,
                y: cfg.y,
              }}
              exit={{ opacity: 0, scale: cfg.scale * 0.45, rotate: cfg.rotate }}
              transition={{
                type: "spring",
                damping: 18,
                stiffness: 320,
                mass: 0.7,
              }}
              className="absolute inset-0 rounded-xl overflow-hidden"
              style={{
                background: `${color}18`,
                zIndex: cfg.zIndex,
              }}
            >
              {image ? (
                <Image
                  src={image}
                  alt={name}
                  fill
                  className="object-contain p-1.5"
                  sizes={sizes}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(160deg, ${color}, ${color}cc)`,
                  }}
                >
                  <span className="text-white text-[7px] font-black">DM</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
