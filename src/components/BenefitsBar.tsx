import { Truck, Zap, Shield, RotateCcw } from "lucide-react";

const benefits = [
  { icon: Truck, title: "Frete Grátis", sub: "Em todo o Brasil" },
  { icon: Zap, title: "Até 90% OFF", sub: "Produtos selecionados" },
  { icon: Shield, title: "Compra Segura", sub: "Pagamento protegido" },
  { icon: RotateCcw, title: "Troca Grátis", sub: "7 dias para trocar" },
];

const BenefitsBar = () => (
  <section className="bg-background">
    <div className="container py-4 md:py-6">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
        {benefits.map((b) => (
          <div
            key={b.title}
            className="flex items-center gap-2.5 rounded-xl border border-border bg-background p-3 md:p-4"
          >
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-foreground flex items-center justify-center flex-shrink-0">
              <b.icon className="h-4 w-4 md:h-5 md:w-5 text-background" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] md:text-sm font-semibold text-foreground leading-tight">{b.title}</p>
              <p className="text-[9px] md:text-xs text-muted-foreground leading-tight mt-0.5">{b.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default BenefitsBar;
