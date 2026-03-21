import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { getProductById, getProductsByCategory, getCategoryLabel, products } from "@/data/products";
import { Star, Truck, AlertTriangle, Heart, Minus, Plus, Shield, RotateCcw, Award, MapPin, ArrowLeft, ShoppingCart } from "lucide-react";
import ProductFeatures from "@/components/product/ProductFeatures";
import ProductReviews from "@/components/product/ProductReviews";
import RelatedProductCard from "@/components/product/RelatedProductCard";
import Footer from "@/components/Footer";

const formatPrice = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, totalItems } = useCart();
  const product = getProductById(Number(id));
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="bg-foreground text-background">
          <div className="container py-3 flex items-center gap-2 text-sm">
            <Link to="/" className="flex items-center gap-2 text-background/70 hover:text-background transition-colors">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Link>
          </div>
        </div>
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Produto não encontrado</p>
        </main>
        <Footer />
      </div>
    );
  }

  const discount = product.discount ?? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const rawImages = product.images?.length ? [...product.images] : [product.image];

  const coverMatch = rawImages[0]?.match(/^(.*\/produto\d+)\.webp$/);
  const secondImageMatchesCover = coverMatch && rawImages[1] === `${coverMatch[1]}-img1.webp`;
  const normalizedImages = secondImageMatchesCover ? rawImages.slice(1) : rawImages;
  const images = normalizedImages.filter((img, i) => normalizedImages.indexOf(img) === i);
  const catLabel = getCategoryLabel(product.category);

  const sameCategory = getProductsByCategory(product.category).filter(p => p.id !== product.id);
  const otherProducts = products.filter(p => p.id !== product.id && p.category !== product.category);
  const related = [...sameCategory.slice(0, 4), ...otherProducts.slice(0, 4)].slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="bg-foreground text-background sticky top-0 z-50">
        <div className="container py-3 flex items-center justify-between text-sm">
          <Link to="/" className="flex items-center gap-2 text-background/70 hover:text-background transition-colors">
            <ArrowLeft className="h-4 w-4" /> Detalhes do Produto
          </Link>
          <Link to="/carrinho" className="relative p-1 text-background/70 hover:text-background transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      <main className="flex-1">
        <div className="container py-4 md:py-6 px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-foreground transition-colors flex-shrink-0">🏠 Início</Link>
            <span className="flex-shrink-0">›</span>
            <Link to={`/categoria/${product.category}`} className="hover:text-foreground transition-colors flex-shrink-0">{catLabel}</Link>
            <span className="flex-shrink-0">›</span>
            <span className="text-foreground truncate">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            {/* Image gallery - thumbnails always on left */}
            <div className="flex gap-3 md:gap-4">
              {/* Thumbnails column */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-12 h-12 md:w-16 md:h-16 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-colors ${
                      selectedImage === i ? "border-destructive" : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <img src={img} alt={`Variação ${i + 1}`} className="w-full h-full object-contain p-0.5 md:p-1" />
                  </button>
                ))}
              </div>
              {/* Main image */}
              <div className="flex-1 bg-secondary rounded-xl flex items-center justify-center p-4 md:p-8 min-h-[280px] md:min-h-[400px]">
                <img src={images[selectedImage]} alt={product.name} className="w-full h-full max-h-[320px] md:max-h-[540px] object-contain" />
              </div>
            </div>

            {/* Product info */}
            <div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-1">
                <span className="font-semibold text-foreground">{product.brand}</span>
                <span>|</span>
                <Link to={`/categoria/${product.category}`} className="hover:text-foreground transition-colors uppercase text-[11px] md:text-sm">{catLabel}</Link>
              </div>

              <h1 className="text-lg md:text-2xl font-bold text-foreground mb-3 leading-tight">{product.name}</h1>

              {product.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 md:h-4 md:w-4 ${i < Math.floor(product.rating!) ? "text-amber-400 fill-amber-400" : "text-border"}`} />
                    ))}
                  </div>
                  <span className="text-xs md:text-sm font-semibold">{product.rating}</span>
                  <span className="text-xs md:text-sm text-muted-foreground">({product.reviews} avaliações)</span>
                </div>
              )}

              <div className="mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs md:text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="bg-destructive text-destructive-foreground text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 rounded">-{discount}%</span>
                </div>
                <p className="text-2xl md:text-4xl font-bold text-success mt-1">{formatPrice(product.price)}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">à vista no PIX</p>
              </div>

              <div className="flex items-center gap-2 text-destructive text-xs md:text-sm mt-3 mb-3 md:mt-4 md:mb-4">
                <AlertTriangle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span>Restam apenas 5 unidades!</span>
              </div>

              {product.freeShipping && (
                <div className="flex items-center gap-2 text-xs md:text-sm mb-5 md:mb-6">
                  <Truck className="h-3.5 w-3.5 md:h-4 md:w-4 text-success" />
                  <span className="font-bold text-success">FRETE GRÁTIS</span>
                  <span className="text-muted-foreground">para todo o Brasil</span>
                </div>
              )}

              <button className="w-full border border-border rounded-lg py-2.5 md:py-3 text-xs md:text-sm font-medium text-foreground flex items-center justify-center gap-2 hover:bg-secondary transition-colors mb-5 md:mb-6">
                <Heart className="h-4 w-4" />
                Adicionar à lista
              </button>

              {product.sizes && (
                <div className="mb-5 md:mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs md:text-sm font-semibold">Tamanho:</span>
                    <button className="text-[10px] md:text-xs text-muted-foreground hover:text-foreground transition-colors">Guia de tamanhos</button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg border text-xs md:text-sm font-medium transition-colors ${
                          selectedSize === size
                            ? "border-foreground bg-foreground text-background"
                            : "border-border hover:border-foreground"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mb-5 md:mb-6">
                <span className="text-xs md:text-sm font-semibold">Quantidade:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 md:w-10 text-center text-xs md:text-sm font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => { addItem(product, quantity, selectedSize || undefined); navigate("/carrinho"); }}
                className="w-full bg-foreground text-background py-3.5 md:py-4 rounded-lg font-bold text-xs md:text-sm tracking-wider hover:bg-foreground/90 transition-colors mb-3"
              >
                COMPRAR AGORA
              </button>
              <button
                onClick={() => { addItem(product, quantity, selectedSize || undefined); toast.success("Adicionado ao carrinho!"); }}
                className="w-full border border-border py-3.5 md:py-4 rounded-lg font-semibold text-xs md:text-sm text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2"
              >
                🛒 Adicionar ao Carrinho
              </button>

              <div className="grid grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8">
                {[
                  { icon: Shield, label: "Compra Segura" },
                  { icon: RotateCcw, label: "Troca Grátis" },
                  { icon: Award, label: "Garantia" },
                  { icon: MapPin, label: "RASTREIO" },
                ].map((b) => (
                  <div key={b.label} className="text-center">
                    <b.icon className="h-4 w-4 md:h-5 md:w-5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-[9px] md:text-[10px] text-muted-foreground">{b.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Description & Specs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-8 md:mt-12">
            <div className="border border-border rounded-xl p-4 md:p-6">
              <h2 className="text-base md:text-lg font-bold text-foreground mb-3 md:mb-4">Descrição do Produto</h2>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                {product.description || `${product.name} - Produto de alta qualidade com garantia de fábrica. Frete grátis para todo o Brasil.`}
              </p>
            </div>

            {product.specs && (
              <div className="border border-border rounded-xl p-4 md:p-6">
                <h2 className="text-base md:text-lg font-bold text-foreground mb-3 md:mb-4">Especificações Técnicas</h2>
                <div className="space-y-0">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-xs md:text-sm border-b border-border py-2.5 last:border-0">
                      <span className="text-muted-foreground">{key}</span>
                      <span className="font-medium text-foreground text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="mt-6">
              <ProductFeatures features={product.features} />
            </div>
          )}

          {/* Reviews */}
          {product.rating && product.ratingBreakdown && product.reviewsList && (
            <ProductReviews
              rating={product.rating}
              totalReviews={product.reviews || 0}
              breakdown={product.ratingBreakdown}
              reviewsList={product.reviewsList}
            />
          )}

          {/* Veja Também */}
          {related.length > 0 && (
            <div className="mt-8 md:mt-12">
              <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 md:mb-6">Veja Também</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {related.map((p) => (
                  <RelatedProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductPage;
