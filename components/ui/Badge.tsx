import { cn } from "@/lib/utils";

interface BadgeProps {
  label: string;
  className?: string;
}

const badgeColors: Record<string, string> = {
  "Çok Satan": "bg-orange-500 text-white",
  "Yeni": "bg-emerald-500 text-white",
  "Çocuklara Özel": "bg-sky-500 text-white",
  "Uzman Önerisi": "bg-violet-500 text-white",
};

export function Badge({ label, className }: BadgeProps) {
  const color = badgeColors[label] ?? "bg-gray-500 text-white";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold",
        color,
        className
      )}
    >
      {label}
    </span>
  );
}
