import { useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { products, categories } from "@/data/products";

const ProductGrid = () => {
  const [active, setActive] = useState("todos");

  const filtered = active === "todos" ? products : products.filter((p) => p.category === active);

  return (
    <section id="produtos" className="py-16 bg-background">
      <div className="container px-4">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-display text-foreground">NOSSOS PRODUTOS</h2>
          <p className="text-muted-foreground mt-2 font-body">
            Os melhores equipamentos para sua pilotagem
          </p>
        </div>

        {/* Category filters */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`px-6 py-2.5 text-xs font-bold tracking-widest transition-all border ${
                active === cat.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-foreground border-border hover:border-primary hover:text-primary"
              }`}
            >
              {cat.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="border-2 border-foreground text-foreground px-12 py-4 text-xs font-bold tracking-widest hover:bg-foreground hover:text-background transition-colors">
            VER TODOS OS PRODUTOS
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
