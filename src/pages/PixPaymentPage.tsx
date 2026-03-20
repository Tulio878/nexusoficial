import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Lock, Copy, Check, Clock, CheckCircle, Shield, Package, Truck, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

const formatPrice = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatPriceCents = (v: number) =>
  (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface DisplayItem {
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  quantity: number;
  size?: string;
}

interface DisplayData {
  items: DisplayItem[];
  originalTotal: number;
  discount: number;
  shippingCost: number;
  finalTotal: number;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
}

const PixPaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [pixCode, setPixCode] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [amount, setAmount] = useState(0);
  const [display, setDisplay] = useState<DisplayData | null>(null);
  const [status, setStatus] = useState<"PENDING" | "COMPLETED">("PENDING");
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const data = searchParams.get("data");
    if (!data) {
      toast.error("Dados do pedido não encontrados");
      navigate("/checkout");
      return;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(decodeURIComponent(escape(atob(data))));
    } catch {
      toast.error("Dados inválidos");
      navigate("/checkout");
      return;
    }

    if (parsed._display) {
      setDisplay(parsed._display);
    }
    setAmount(parsed.amount);

    const createCharge = async () => {
      try {
        // Remove display data before sending to API
        const { _display, ...chargeData } = parsed;
        const response = await fetch("/api/pix/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(chargeData),
        });

        const result = await response.json();

        if (!response.ok || result?.error) {
          throw new Error(result?.error || "Erro ao criar cobrança");
        }

        setPixCode(result.pixCode);
        setTransactionId(result.transactionId);
        setLoading(false);
      } catch (e: any) {
        console.error("Error creating charge:", e);
        toast.error(e.message || "Erro ao criar cobrança PIX");
        navigate("/checkout");
      }
    };

    createCharge();
  }, []);

  // Polling
  useEffect(() => {
    if (!transactionId || status === "COMPLETED") return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/pix/status?transactionId=${encodeURIComponent(transactionId)}`
        );
        const result = await res.json();
        if (result.status === "COMPLETED") {
          setStatus("COMPLETED");
          clearCart();
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 5000);

    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [transactionId, status]);

  // Timer
  useEffect(() => {
    if (status === "COMPLETED") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (pollingRef.current) clearInterval(pollingRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 3000);
    } catch { toast.error("Erro ao copiar"); }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Delivery date ~7-12 days from now
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 10);
  const deliveryStr = deliveryDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  // No full-screen loading — page renders immediately, QR area shows inline spinner

  if (status === "COMPLETED") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Pagamento Confirmado!</h1>
          <p className="text-sm text-muted-foreground mt-2">Seu pedido foi aprovado com sucesso.</p>
        </div>
        <button onClick={() => navigate("/")} className="bg-foreground text-background rounded-xl px-8 py-3.5 font-bold text-sm tracking-wider hover:bg-foreground/90 transition-colors">
          VOLTAR À LOJA
        </button>
      </div>
    );
  }

  if (timeLeft <= 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-destructive/15 flex items-center justify-center">
          <Clock className="h-10 w-10 text-destructive" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Tempo esgotado</h1>
          <p className="text-sm text-muted-foreground mt-2">O prazo para pagamento expirou.</p>
        </div>
        <button onClick={() => navigate("/checkout")} className="bg-foreground text-background rounded-xl px-8 py-3.5 font-bold text-sm tracking-wider hover:bg-foreground/90 transition-colors">
          TENTAR NOVAMENTE
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--secondary))]">
      {/* Top bar */}
      <div className="bg-foreground text-background sticky top-0 z-50">
        <div className="container py-3.5 flex items-center justify-between">
          <Link to="/checkout" className="text-background/70 hover:text-background transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="font-bold text-sm tracking-wider">FINALIZAR PEDIDO</span>
          <Lock className="h-4 w-4 text-success" />
        </div>
      </div>

      {/* Trust badges */}
      <div className="bg-background/80 backdrop-blur-sm">
        <div className="container py-2.5 flex items-center justify-center gap-6 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-success" /> Compra Segura</span>
          <span className="flex items-center gap-1"><Lock className="h-3 w-3 text-success" /> Dados Criptografados</span>
          <span className="flex items-center gap-1"><Package className="h-3 w-3 text-success" /> Garantia de Entrega</span>
        </div>
      </div>

      <main className="flex-1 pb-8">
        <div className="container py-4 max-w-lg mx-auto space-y-3 px-4">

          {/* QR Code Section */}
          <section className="bg-background rounded-2xl p-5 shadow-sm">
            {/* Timer */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Expira em</span>
              <span className="text-sm font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-3">
              <div className="p-3">
                {loading ? (
                  <div className="w-[180px] h-[180px] flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Gerando QR Code...</p>
                  </div>
                ) : (
                  <QRCodeSVG value={pixCode} size={180} level="M" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">Escaneie com seu banco</p>
            </div>

            {/* Copy code inline */}
            {!loading && (
              <div className="flex items-center gap-2 mt-4">
                <div className="flex-1 bg-secondary rounded-lg px-3 py-2.5 overflow-hidden">
                  <p className="text-[11px] text-muted-foreground font-mono truncate">{pixCode}</p>
                </div>
                <button
                  onClick={copyCode}
                  className="bg-foreground text-background rounded-lg px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 flex-shrink-0 hover:bg-foreground/90 transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
            )}

            {/* Waiting indicator */}
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Aguardando pagamento...</span>
            </div>
          </section>

          {/* ITENS DO PEDIDO */}
          {display && (
            <section className="bg-background rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-foreground tracking-wide mb-4">ITENS DO PEDIDO</h3>

              <div className="space-y-4">
                {display.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="w-14 h-14 object-contain rounded-lg bg-secondary p-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground line-clamp-2">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {item.size || "Único"} · Qtd: {item.quantity}
                      </p>
                      <p className="text-sm font-bold text-success mt-0.5">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="border-t border-border mt-4 pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-muted-foreground">{formatPrice(display.originalTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-success">Economia</span>
                  <span className="text-success">-{formatPrice(display.discount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete</span>
                  <span className={display.shippingCost === 0 ? "text-success" : "text-foreground"}>
                    {display.shippingCost === 0 ? "Grátis" : formatPrice(display.shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-border">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="text-lg font-black text-foreground">{formatPrice(display.finalTotal)}</span>
                </div>
              </div>
            </section>
          )}

          {/* ENTREGA */}
          {display && (
            <section className="bg-background rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-foreground tracking-wide mb-4">ENTREGA</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Previsão de entrega</p>
                    <p className="text-xs text-success">{deliveryStr}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{display.address}</p>
                    <p className="text-[10px] text-muted-foreground">{display.neighborhood} · {display.city}/{display.state}</p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default PixPaymentPage;
