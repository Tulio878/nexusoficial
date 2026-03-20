import { useState, useCallback, useMemo } from "react";
import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import BenefitsBar from "@/components/BenefitsBar";
import CategoryScrollTabs from "@/components/CategoryScrollTabs";
import CategoryCards from "@/components/CategoryCards";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import PromoModal from "@/components/PromoModal";
import { getBestSellers, getInterleavedProducts } from "@/data/products";
import { Button } from "@/components/ui/button";

const INITIAL_COUNT = 12;
const LOAD_MORE_COUNT = 12;

const Index = () => {
  const bestSellers = getBestSellers(6);
  const interleaved = useMemo(() => getInterleavedProducts(), []);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  const visible = interleaved.slice(0, visibleCount);
  const hasMore = visibleCount < interleaved.length;

  const loadMore = useCallback(() => {
    setVisibleCount((c) => Math.min(c + LOAD_MORE_COUNT, interleaved.length));
  }, [interleaved.length]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PromoModal />
      <Header />
      <main className="flex-1">
        <HeroCarousel />
        <BenefitsBar />
        <CategoryScrollTabs />
        <CategoryCards />

        {/* 🔥 Mais Vendidos */}
        <section className="py-6 md:py-10 bg-background">
          <div className="container">
            <h2 className="text-base md:text-lg font-bold text-foreground mb-5 md:mb-6 flex items-center gap-2 tracking-tight">
              <span className="text-lg md:text-xl">🔥</span> Mais Vendidos
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Produtos Recomendados */}
        <section className="py-6 md:py-10 bg-background">
          <div className="container">
            <h2 className="text-base md:text-lg font-bold text-foreground mb-5 md:mb-6 tracking-tight">
              Produtos Recomendados
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-6">
                <Button variant="outline" size="lg" onClick={loadMore} className="px-8">
                  Ver mais produtos
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
