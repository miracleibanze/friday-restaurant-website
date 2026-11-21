import { ShoppingBag, UtensilsCrossed } from "lucide-react";

export function FoodImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className: string;
}) {
  if (src) {
    return <img src={src} alt={alt} className={className} />;
  }

  return (
    <div
      role="img"
      aria-label={`${alt} image unavailable`}
      className={`${className} flex items-center justify-center bg-[#f6f2ec]`}
    >
      <span className="relative flex size-20 items-center justify-center rounded-full border border-[#ded4c5] bg-white/70 text-[#8b7358]">
        <UtensilsCrossed size={34} strokeWidth={1.4} />
        <span className="absolute -bottom-1 -right-2 flex size-9 items-center justify-center rounded-full border-2 border-[#f6f2ec] bg-[#8b7358] text-white">
          <ShoppingBag size={17} strokeWidth={1.7} />
        </span>
      </span>
    </div>
  );
}
