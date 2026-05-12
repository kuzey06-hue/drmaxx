import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  className?: string;
}

export function StarRating({ rating, reviewCount, size = "sm", className }: StarRatingProps) {
  const starSize = size === "sm" ? 12 : 16;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={starSize}
            className={i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-gray-500">
        {rating.toFixed(1)}
        {reviewCount !== undefined && (
          <span className="text-gray-400"> ({reviewCount})</span>
        )}
      </span>
    </div>
  );
}
