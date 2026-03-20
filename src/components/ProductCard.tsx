import { Link } from "react-router-dom";
import { Truck, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import type { Product } from "@/data/products";

const formatPrice = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const discount = product.discount ?? Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );
  const href = `/produto/${product.id}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast.success("Adicionado ao carrinho!");
  };

  return (
    <div className="group block bg-card rounded-xl overflow-hidden border border-border/30 hover:border-border/60 transition-all duration-300 hover:-translate-y-0.5">
      {/* Discount badge */}
      <div className="relative">
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-[10px] md:text-xs font-bold">
            -{discount}%
          </span>
        </div>
        <Link to={href}>
          <div className="aspect-square overflow-hidden bg-muted/20">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          </div>
        </Link>
      </div>

      {/* Info */}
      <div className="p-3 md:p-4 space-y-2">
        <Link to={href}>
          <h3 className="font-medium text-foreground text-xs md:text-sm line-clamp-2 min-h-[2rem] md:min-h-[2.5rem] group-hover:text-muted-foreground transition-colors leading-relaxed">
            {product.name}
          </h3>
        </Link>

        <div className="space-y-0.5">
          <span className="text-[10px] md:text-xs text-muted-foreground line-through block">
            {formatPrice(product.originalPrice)}
          </span>
          <span className="text-base md:text-lg font-black text-foreground tracking-tight">
            {formatPrice(product.price)}
          </span>
        </div>

        {product.freeShipping && (
          <div className="flex items-center gap-1.5 text-[10px] md:text-xs">
            <Truck className="h-3 w-3 text-success" />
            <span className="text-success font-medium">Frete Expresso</span>
          </div>
        )}

        <p className="text-[10px] md:text-xs text-muted-foreground">
          {product.sold.toLocaleString()} vendido(s)
        </p>

        <div className="pt-0.5">
          <Button variant="hero" size="sm" className="w-full gap-1.5 text-xs md:text-sm h-9 md:h-10 rounded-lg" onClick={handleAddToCart}>
            <ShoppingCart className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
