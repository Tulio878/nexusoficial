import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { categoryCards } from "@/data/products";

const CategoryCards = () => (
  <section className="bg-background">
    <div className="container py-6 md:py-10">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-base md:text-xl font-bold text-foreground">Categorias</h2>
        <Link to="/categoria/capacetes-ls2" className="text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors">
          Ver todas <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {categoryCards.map((cat) => (
          <Link
            key={cat.id}
            to={`/categoria/${cat.id}`}
            className="relative rounded-xl overflow-hidden aspect-[4/3] group"
          >
            <img
              src={cat.image}
              alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-foreground/10" />
            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
              <p className="text-background font-bold text-xs md:text-sm">{cat.name}</p>
              <p className="text-background/60 text-[10px] md:text-xs">{cat.count} produtos</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default CategoryCards;
