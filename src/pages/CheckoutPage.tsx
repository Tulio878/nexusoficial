import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, User, Mail, Phone, FileText, MapPin, Truck, Shield, ShieldCheck, Package } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { products } from "@/data/products";
import { toast } from "sonner";

const formatPrice = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const isValidCPF = (cpf: string): boolean => {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false; // all same digits
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  if (parseInt(digits[9]) !== check) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  return parseInt(digits[10]) === check;
};

const CheckoutPage = () => {
  const { items, addItem, updateQuantity, removeItem, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [shipping, setShipping] = useState<"free" | "standard" | "express">("free");
  const [cepLoading, setCepLoading] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", cpf: "",
    cep: "", city: "", state: "", address: "", number: "", neighborhood: "", complement: "",
  });

  const maskCPF = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const maskPhone = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 10) return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
    return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
  };

  const maskCEP = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 8);
    return d.replace(/(\d{5})(\d)/, "$1-$2");
  };

  // ViaCEP auto-fill
  const fetchCep = async (cep: string) => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }
      setForm((prev) => ({
        ...prev,
        address: data.logradouro || prev.address,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
        complement: data.complemento || prev.complement,
      }));
    } catch {
      toast.error("Erro ao buscar CEP");
    } finally {
      setCepLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let masked = value;
    if (name === "cpf") masked = maskCPF(value);
    else if (name === "phone") masked = maskPhone(value);
    else if (name === "cep") {
      masked = maskCEP(value);
      // Auto-fetch when 8 digits entered
      const digits = value.replace(/\D/g, "");
      if (digits.length === 8) fetchCep(digits);
    }
    setForm((prev) => ({ ...prev, [name]: masked }));
  };

  const shippingCost = shipping === "standard" ? 14.90 : shipping === "express" ? 24.90 : 0;
  const originalTotal = items.reduce((s, i) => s + i.product.originalPrice * i.quantity, 0);
  const discount = originalTotal - totalPrice;
  const finalTotal = totalPrice + shippingCost;

  const cartIds = new Set(items.map((i) => i.product.id));
  const suggestionIds = [50, 83, 51, 54];
  const suggestions = suggestionIds
    .filter((id) => !cartIds.has(id))
    .map((id) => products.find((p) => p.id === id)!)
    .filter(Boolean);

  const [cpfError, setCpfError] = useState("");

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.phone || !form.cpf || !form.cep || !form.address || !form.number || !form.neighborhood || !form.city || !form.state) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (!isValidCPF(form.cpf)) {
      setCpfError("CPF inválido");
      toast.error("CPF inválido. Verifique o número digitado.");
      return;
    }
    setCpfError("");

    // Capture UTM params from URL
    const utm = window.location.search.replace(/^\?/, "");

    // Build PIX charge payload
    const amountInCents = Math.round(finalTotal * 100);
    const payload = {
      amount: amountInCents,
      customer: {
        name: form.name,
        email: form.email,
        phone: form.phone,
        document: form.cpf,
      },
      item: {
        title: `Pedido NEXUS - ${totalItems} item(s)`,
        price: amountInCents,
        quantity: 1,
      },
      ...(utm ? { utm } : {}),
      // Extra data for display on PIX page
      _display: {
        items: items.map((i) => ({
          name: i.product.name,
          image: i.product.image,
          price: i.product.price,
          originalPrice: i.product.originalPrice,
          quantity: i.quantity,
          size: i.size,
        })),
        originalTotal,
        discount,
        shippingCost,
        finalTotal,
        address: `${form.address}, ${form.number}${form.complement ? ` - ${form.complement}` : ""}`,
        neighborhood: form.neighborhood,
        city: form.city,
        state: form.state,
      },
    };

    // Encode and redirect to PIX page
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    clearCart();
    navigate(`/pix?data=${encoded}`);
  };

  const estados = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

  const inputClass = "w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none py-2";
  const fieldClass = "flex items-center gap-3 border-b border-border pb-1";

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--secondary))]">
      {/* Top bar */}
      <div className="bg-foreground text-background sticky top-0 z-50">
        <div className="container py-3.5 flex items-center justify-between">
          <Link to="/carrinho" className="text-background/70 hover:text-background transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="font-bold text-sm tracking-wider">FINALIZAR PEDIDO</span>
          <Lock className="h-4 w-4 text-success" />
        </div>
      </div>

      {/* Trust badges */}
      <div className="bg-background/80 backdrop-blur-sm">
        <div className="container py-3 flex items-center justify-between px-6">
          {[
            { icon: Shield, label: "Compra\nSegura", color: "text-success" },
            { icon: Lock, label: "Dados\nCriptografados", color: "text-muted-foreground" },
            { icon: Package, label: "Garantia de\nEntrega", color: "text-muted-foreground" },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-1.5 text-center">
              <b.icon className={`h-3.5 w-3.5 ${b.color}`} />
              <span className="text-[10px] text-muted-foreground leading-tight whitespace-pre-line text-left">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      <main className="flex-1 pb-40 md:pb-8">
        <div className="container py-4 md:py-8 max-w-lg mx-auto space-y-3 px-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <h2 className="text-xl font-bold text-foreground">Carrinho vazio</h2>
              <Link to="/" className="bg-foreground text-background rounded-lg px-6 py-2.5 text-sm font-bold hover:bg-foreground/90 transition-colors">
                Voltar à loja
              </Link>
            </div>
          ) : (
            <>
              {/* DADOS PESSOAIS */}
              <section className="bg-background rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-2 mb-5 tracking-wide">
                  <User className="h-4 w-4 text-muted-foreground" /> DADOS PESSOAIS
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] text-muted-foreground mb-1 block">Nome completo</label>
                    <div className={fieldClass}>
                      <User className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                      <input name="name" value={form.name} onChange={handleChange} placeholder="Seu nome completo" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground mb-1 block">E-mail</label>
                    <div className={fieldClass}>
                      <Mail className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                      <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="seu@email.com" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground mb-1 block">Telefone</label>
                    <div className={fieldClass}>
                      <Phone className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                      <input name="phone" value={form.phone} onChange={handleChange} placeholder="(00) 00000-0000" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground mb-1 block">CPF</label>
                    <div className={`${fieldClass} ${cpfError ? "border-destructive" : ""}`}>
                      <FileText className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                      <input
                        name="cpf"
                        value={form.cpf}
                        onChange={(e) => {
                          handleChange(e);
                          if (cpfError) setCpfError("");
                        }}
                        onBlur={() => {
                          if (form.cpf && !isValidCPF(form.cpf)) setCpfError("CPF inválido");
                        }}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className={inputClass}
                      />
                    </div>
                    {cpfError && <p className="text-[10px] text-destructive mt-1">{cpfError}</p>}
                  </div>
                </div>
              </section>

              {/* ENDEREÇO DE ENTREGA */}
              <section className="bg-background rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-2 mb-5 tracking-wide">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> ENDEREÇO DE ENTREGA
                </h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <input name="cep" value={form.cep} onChange={handleChange} placeholder="CEP" maxLength={9} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/30 transition-colors" />
                      {cepLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <input name="city" value={form.city} onChange={handleChange} placeholder="Cidade" className="border border-border rounded-lg px-3 py-2.5 text-sm bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/30 transition-colors" />
                  </div>
                  {/* Custom state selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setStateOpen(!stateOpen)}
                      className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:border-foreground/30 transition-colors text-left flex items-center justify-between"
                    >
                      <span className={form.state ? "text-foreground" : "text-muted-foreground/50"}>{form.state || "Estado"}</span>
                      <svg className={`w-4 h-4 text-muted-foreground transition-transform ${stateOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                    </button>
                    {stateOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setStateOpen(false)} />
                        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                          {estados.map((uf) => (
                            <button
                              key={uf}
                              type="button"
                              onClick={() => { setForm((prev) => ({ ...prev, state: uf })); setStateOpen(false); }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors ${form.state === uf ? "bg-secondary font-bold" : ""}`}
                            >
                              {uf}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input name="address" value={form.address} onChange={handleChange} placeholder="Rua, Avenida, etc." className="col-span-2 border border-border rounded-lg px-3 py-2.5 text-sm bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/30 transition-colors" />
                    <input name="number" value={form.number} onChange={handleChange} placeholder="Nº" className="border border-border rounded-lg px-3 py-2.5 text-sm bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/30 transition-colors" />
                  </div>
                  <input name="neighborhood" value={form.neighborhood} onChange={handleChange} placeholder="Bairro" className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/30 transition-colors" />
                  <input name="complement" value={form.complement} onChange={handleChange} placeholder="Complemento (opcional)" className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/30 transition-colors" />
                </div>
              </section>

              {/* SEUS PRODUTOS */}
              <section className="bg-background rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-2 tracking-wide">
                    <Package className="h-4 w-4 text-muted-foreground" /> SEUS PRODUTOS
                  </h3>
                  <span className="text-[11px] text-muted-foreground">{totalItems} item(s)</span>
                </div>

                <div className="space-y-5">
                  {items.map((item) => {
                    const disc = item.product.discount ?? Math.round(((item.product.originalPrice - item.product.price) / item.product.originalPrice) * 100);
                    return (
                      <div key={`${item.product.id}-${item.size || ""}`}>
                        <div className="flex gap-3">
                          <div className="relative flex-shrink-0">
                            <img src={item.product.image} alt={item.product.name} className="w-[72px] h-[72px] object-contain rounded-xl bg-secondary p-1.5" />
                            <span className="absolute top-1 left-1 bg-destructive text-destructive-foreground text-[8px] font-bold px-1 py-0.5 rounded">-{disc}%</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-foreground line-clamp-2 leading-relaxed">{item.product.name}</p>
                                {item.size && <p className="text-[10px] text-muted-foreground mt-0.5">Tam: {item.size}</p>}
                              </div>
                              <button onClick={() => removeItem(item.product.id, item.size)} className="p-1 text-muted-foreground/40 hover:text-destructive transition-colors flex-shrink-0">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                              </button>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] text-muted-foreground line-through">{formatPrice(item.product.originalPrice)}</span>
                              <span className="text-sm font-bold text-foreground">{formatPrice(item.product.price)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end mt-2">
                          <div className="flex items-center border border-border rounded-lg">
                            <button onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.size)} className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground text-base font-medium">−</button>
                            <span className="w-8 text-center text-xs font-bold text-foreground">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size)} className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground text-base font-medium">+</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* APROVEITE E LEVE TAMBÉM */}
              {suggestions.length > 0 && (
                <section className="bg-background rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-foreground mb-4">Aproveite e leve também</h3>
                  <div className="space-y-3">
                    {suggestions.map((p) => {
                      const disc = p.discount ?? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
                      return (
                        <div key={p.id} className="border border-border rounded-xl p-3">
                          <div className="flex items-center gap-3">
                            <img src={p.image} alt={p.name} className="w-12 h-12 object-contain rounded-lg bg-secondary p-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-muted-foreground line-through">{formatPrice(p.originalPrice)}</span>
                                <span className="text-xs font-bold text-foreground">{formatPrice(p.price)}</span>
                                <span className="bg-destructive text-destructive-foreground text-[8px] font-bold px-1 py-0.5 rounded">-{disc}%</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => { addItem(p); toast.success("Adicionado!"); }}
                            className="w-full border border-border rounded-lg py-2 mt-2.5 text-xs font-medium text-foreground hover:bg-secondary/50 transition-colors"
                          >
                            + Adicionar
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ENTREGA */}
              <section className="bg-background rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-2 mb-4 tracking-wide">
                  <Truck className="h-4 w-4 text-muted-foreground" /> ENTREGA
                </h3>

                <div className="space-y-2.5">
                  {([
                    { key: "free" as const, label: "Frete Grátis", sub: "7 a 12 dias úteis", price: "Grátis", priceClass: "text-success font-bold", badge: null },
                    { key: "standard" as const, label: "Frete Padrão", sub: "5 a 8 dias úteis", price: "R$ 14,90", priceClass: "text-foreground", badge: null },
                    { key: "express" as const, label: "Frete Grátis", sub: "2 a 4 dias úteis", price: "R$ 24,90", priceClass: "text-foreground", badge: "RECOMENDADO" },
                  ]).map((opt) => (
                    <label
                      key={opt.key}
                      className={`flex items-center justify-between border rounded-xl p-3.5 cursor-pointer transition-all ${shipping === opt.key ? "border-success bg-success/5 shadow-[0_0_0_1px_hsl(var(--success))]" : "border-border hover:border-border/80"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${shipping === opt.key ? "bg-success/15" : "bg-secondary"}`}>
                          <Truck className={`h-4 w-4 ${shipping === opt.key ? "text-success" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground leading-tight">
                            {opt.label}
                            {opt.badge && <span className="bg-success text-background text-[7px] font-bold px-1.5 py-0.5 rounded ml-1.5 align-middle">{opt.badge}</span>}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{opt.sub}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <span className={`text-sm ${opt.priceClass}`}>{opt.price}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${shipping === opt.key ? "border-success" : "border-muted-foreground/25"}`}>
                          {shipping === opt.key && <div className="w-2.5 h-2.5 rounded-full bg-success" />}
                        </div>
                      </div>
                      <input type="radio" name="shipping" value={opt.key} checked={shipping === opt.key} onChange={() => setShipping(opt.key)} className="sr-only" />
                    </label>
                  ))}
                </div>
              </section>

              {/* RESUMO DO PEDIDO */}
              <section className="bg-background rounded-2xl border border-border p-5">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-2 mb-4 tracking-wide">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" /> RESUMO DO PEDIDO
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-muted-foreground line-through">{formatPrice(originalTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-success flex items-center gap-1.5 text-sm">
                      <span className="w-4 h-4 rounded-full bg-success/15 flex items-center justify-center text-[10px]">✓</span>
                      Desconto aplicado
                    </span>
                    <span className="text-success">-{formatPrice(discount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Truck className="h-4 w-4" />
                      Frete
                    </span>
                    <span className={shippingCost === 0 ? "text-success" : "text-foreground"}>{shippingCost === 0 ? "Grátis" : formatPrice(shippingCost)}</span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">Total</span>
                      <div className="text-right">
                        <span className="text-2xl font-black text-success">{formatPrice(finalTotal)}</span>
                        <p className="text-[10px] text-muted-foreground">via PIX • 3-7 dias úteis</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Savings banner */}
              {discount > 0 && (
                <div className="bg-success/10 border border-success/20 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🎉</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-success">Você economiza {formatPrice(discount)}</p>
                    <p className="text-[10px] text-success/70">Aproveite esta oferta especial!</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Fixed bottom bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40">
          <div className="max-w-lg mx-auto p-4">
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total a pagar</p>
                <p className="text-[10px] text-muted-foreground">{totalItems} items</p>
              </div>
              <p className="text-2xl font-black text-foreground">{formatPrice(finalTotal)}</p>
            </div>
            <button onClick={handleSubmit} className="w-full bg-foreground text-background py-3.5 rounded-xl font-bold text-sm tracking-wider hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2">
              <Lock className="h-4 w-4" /> FINALIZAR PEDIDO
            </button>
            <div className="flex items-center justify-center gap-4 mt-2.5 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Pagamento seguro</span>
              <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Dados criptografados</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
