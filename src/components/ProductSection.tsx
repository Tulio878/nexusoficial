import { useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { products, categories } from "@/data/products";

interface ProductSectionProps {
  title: string;
  items: typeof products;
  showTabs?: boolean;
}

const ProductSection = ({ title, items, showTabs = false }: ProductSectionProps) => {
  const [active, setActive] = useState("todos");
  const filtered = active === "todos" ? items : items.filter((p) => p.category === active);

  return (
    <section className="bg-background">
      <div className="container py-10">
        <h2 className="text-xl font-bold text-foreground mb-6">{title}</h2>

        {showTabs && (
          <div className="flex gap-2 flex-wrap mb-6">
            {categories.map((cat) => (
              cat.id === "todos" ? (
                <button
                  key={cat.id}
                  onClick={() => setActive(cat.id)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                    active === cat.id
                      ? "bg-foreground text-background"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ) : (
                <Link
                  key={cat.id}
                  to={`/categoria/${cat.id}`}
                  className="px-5 py-2 rounded-full text-sm font-medium bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  {cat.label}
                </Link>
              )
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
