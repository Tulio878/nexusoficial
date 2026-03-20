import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { products } from "@/data/products";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const formatPrice = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const CartPage = () => {
  const { items, addItem, updateQuantity, removeItem, clearCart, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();
  const [viewers, setViewers] = useState(14);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers((prev) => {
        const delta = Math.random() < 0.5 ? -1 : 1;
        return Math.max(8, Math.min(25, prev + delta));
      });
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  // Order bumps: acessórios complementares
  const suggestionIds = [50, 83, 51, 54]; // Fone Bluetooth + Viseira Camaleão + Viseira Fumê + Luva Norisk
  const cartIds = new Set(items.map((i) => i.product.id));
  const suggestions = suggestionIds
    .filter((id) => !cartIds.has(id))
    .map((id) => products.find((p) => p.id === id)!)
    .filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="bg-foreground text-background">
        <div className="container py-3 flex items-center justify-between text-sm">
          <Link to="/" className="text-background/70 hover:text-background transition-colors flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="font-bold text-base">Carrinho</span>
          {items.length > 0 ? (
            <button onClick={() => { clearCart(); toast.success("Carrinho limpo!"); }} className="text-background/60 hover:text-background text-xs">
              Limpar
            </button>
          ) : <span className="w-10" />}
        </div>
      </div>

      

      <main className="flex-1 pb-36 md:pb-0">
        <div className="container py-4 md:py-8">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/40" />
              <h2 className="text-xl font-bold text-muted-foreground">Carrinho vazio</h2>
              <Link
                to="/"
                className="border border-border rounded-lg px-6 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Ver produtos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                {/* Cart items */}
                {items.map((item) => {
                  const discount = item.product.discount ?? Math.round(
                    ((item.product.originalPrice - item.product.price) / item.product.originalPrice) * 100
                  );
                  return (
                    <div
                      key={`${item.product.id}-${item.size || ""}`}
                      className="flex gap-3 border border-border rounded-xl p-3"
                    >
                      <Link to={`/produto/${item.product.id}`} className="relative flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-20 h-20 object-contain rounded-lg bg-secondary p-1"
                        />
                        <span className="absolute top-0.5 left-0.5 bg-destructive text-destructive-foreground text-[8px] font-bold px-1 py-0.5 rounded">
                          -{discount}%
                        </span>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link to={`/produto/${item.product.id}`}>
                            <h3 className="text-xs font-medium text-foreground line-clamp-2">{item.product.name}</h3>
                          </Link>
                          <button
                            onClick={() => removeItem(item.product.id, item.size)}
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {item.size && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">Tam: {item.size}</p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-border rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.size)}
                              className="w-8 h-8 flex items-center justify-center bg-foreground text-background rounded-l-lg text-sm font-bold"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size)}
                              className="w-8 h-8 flex items-center justify-center bg-foreground text-background rounded-r-lg text-sm font-bold"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-success">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Summary inline */}
                <div className="border border-border rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{totalItems} item(s)</span>
                    <span className="text-foreground">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="text-success font-medium">Grátis</span>
                  </div>
                </div>

                {/* Social proof */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                  <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span><strong className="text-foreground">{viewers} pessoas</strong> estão vendo este produto agora</span>
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-3">Aproveite e leve também</h3>
                    <div className="space-y-2">
                      {suggestions.map((p) => {
                        const disc = p.discount ?? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
                        return (
                          <div key={p.id} className="flex items-center gap-3 border border-border rounded-xl p-2.5">
                            <img src={p.image} alt={p.name} className="w-12 h-12 object-contain rounded-lg bg-secondary p-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-muted-foreground line-through">{formatPrice(p.originalPrice)}</span>
                                <span className="text-xs font-bold text-foreground">{formatPrice(p.price)}</span>
                                <span className="bg-destructive text-destructive-foreground text-[8px] font-bold px-1 py-0.5 rounded">-{disc}%</span>
                              </div>
                            </div>
                            <button
                              onClick={() => { addItem(p); toast.success("Adicionado!"); }}
                              className="text-xs font-medium text-success border border-success rounded-lg px-3 py-1.5 hover:bg-success/10 transition-colors flex-shrink-0"
                            >
                              + Adicionar
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop summary sidebar */}
              <div className="hidden lg:block">
                <div className="border border-border rounded-xl p-6 sticky top-20">
                  <h2 className="text-base font-bold text-foreground mb-4">Resumo</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{totalItems} item(ns)</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frete</span>
                      <span className="text-success font-medium">Grátis</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span className="text-success">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                  <button onClick={() => navigate("/checkout")} className="w-full bg-foreground text-background py-3.5 rounded-lg font-bold text-sm tracking-wider hover:bg-foreground/90 transition-colors mt-4">
                    🛒 FINALIZAR COMPRA
                  </button>
                  <p className="text-[10px] text-muted-foreground text-center mt-2">
                    Pagamento 100% seguro via PIX
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile fixed bottom bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 md:hidden z-40">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] text-muted-foreground">Total</p>
              <p className="text-lg font-black text-foreground">{formatPrice(totalPrice)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-success">FRETE GRÁTIS</p>
              <p className="text-[10px] text-muted-foreground">Entrega em 3-7 dias</p>
            </div>
          </div>
          <button onClick={() => navigate("/checkout")} className="w-full bg-foreground text-background py-3.5 rounded-xl font-bold text-sm tracking-wider hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2">
            🛒 FINALIZAR COMPRA
          </button>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Pagamento 100% seguro via PIX
          </p>
        </div>
      )}

      <div className="hidden md:block"><Footer /></div>
    </div>
  );
};

export default CartPage;
