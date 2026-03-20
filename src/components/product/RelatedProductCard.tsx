import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import type { Product } from "@/data/products";

const formatPrice = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const RelatedProductCard = ({ product }: { product: Product }) => {
  const discount = product.discount ?? Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <Link
      to={`/produto/${product.id}`}
      className="group block bg-card rounded-xl overflow-hidden border border-border/30 hover:border-border/60 transition-all min-w-[160px]"
    >
      <div className="relative">
        <span className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground px-2 py-0.5 rounded text-[10px] font-bold">
          -{discount}%
        </span>
        <div className="aspect-square overflow-hidden bg-muted/20">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>
      <div className="p-3 space-y-1">
        {product.rating && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
            <span className="text-xs font-medium">{product.rating}</span>
          </div>
        )}
        <h3 className="text-xs font-medium text-foreground line-clamp-2 leading-relaxed">
          {product.name}
        </h3>
        <p className="text-sm font-bold text-foreground">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
};

export default RelatedProductCard;
