import { useState } from "react";
import { Star, ThumbsUp } from "lucide-react";
import type { ProductReview } from "@/data/products";

interface ProductReviewsProps {
  rating: number;
  totalReviews: number;
  breakdown: Record<number, number>;
  reviewsList: ProductReview[];
}

const ProductReviews = ({ rating, totalReviews, breakdown, reviewsList }: ProductReviewsProps) => {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const filters = [
    { key: "all", label: `Todas (${totalReviews})` },
    { key: "5", label: `5 ⭐ (${breakdown[5] || 0})` },
    { key: "4", label: `4 ⭐ (${breakdown[4] || 0})` },
    { key: "3", label: `3 ⭐ (${breakdown[3] || 0})` },
  ];

  const filtered = activeFilter === "all"
    ? reviewsList
    : reviewsList.filter(r => r.rating === Number(activeFilter));

  return (
    <div className="border border-border rounded-xl p-6 mt-6">
      <h2 className="text-lg font-bold text-foreground mb-6">Avaliações de Clientes</h2>

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Summary */}
        <div className="flex flex-col items-center justify-center gap-1 min-w-[120px]">
          <span className="text-5xl font-bold text-foreground">{rating}</span>
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? "text-amber-400 fill-amber-400" : "text-border"}`} />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">{totalReviews} avaliações</span>
        </div>

        {/* Bars */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map(star => {
            const count = breakdown[star] || 0;
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-4 text-muted-foreground">{star}</span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right text-muted-foreground text-xs">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeFilter === f.key
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Review list */}
      <div className="space-y-4">
        {filtered.map((review, i) => (
          <div key={i} className="border-b border-border pb-4 last:border-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-foreground">
                {review.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{review.name}</p>
                <p className="text-xs text-muted-foreground">{review.date}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Variação: {review.variation}</p>
            <p className="text-sm text-foreground/80">{review.comment}</p>
            <button className="flex items-center gap-1 text-xs text-muted-foreground mt-2 hover:text-foreground transition-colors">
              <ThumbsUp className="h-3 w-3" /> Útil
            </button>
          </div>
        ))}
      </div>

      {totalReviews > reviewsList.length && (
        <button className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors py-2 border border-border rounded-lg">
          Ver todas as {totalReviews} avaliações
        </button>
      )}
    </div>
  );
};

export default ProductReviews;
