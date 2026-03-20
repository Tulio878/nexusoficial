import { useParams, Link } from "react-router-dom";
import { getProductsByCategory, getCategoryLabel, categories } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const items = getProductsByCategory(slug || "todos");
  const label = getCategoryLabel(slug || "todos");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <h1 className="text-2xl font-bold text-foreground">{label}</h1>
          <p className="text-sm text-muted-foreground mt-1">{items.length} produto(s) encontrado(s)</p>

          {/* Category tabs */}
          <div className="flex gap-2 flex-wrap mt-6 mb-8">
            {categories.filter(c => c.id !== "todos").map((cat) => (
              <Link
                key={cat.id}
                to={`/categoria/${cat.id}`}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  slug === cat.id
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
