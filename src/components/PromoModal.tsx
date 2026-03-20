import { useState } from "react";
import { X, ArrowRight } from "lucide-react";

const PromoModal = () => {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm">
      <div className="bg-background rounded-2xl max-w-sm w-full p-8 text-center relative shadow-2xl">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <span className="inline-block bg-foreground text-background text-xs font-bold px-3 py-1 rounded-sm tracking-wider mb-4">
          OFERTA EXCLUSIVA
        </span>

        <h2 className="text-lg font-semibold text-foreground mb-2">Você foi selecionado</h2>

        <p className="text-5xl font-black text-foreground mb-2">ATÉ 90% OFF</p>

        <p className="text-sm text-muted-foreground mb-6">
          Desconto aplicado automaticamente nos produtos selecionados
        </p>

        <button
          onClick={() => setOpen(false)}
          className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3.5 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
        >
          Continuar para a Loja
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="mt-4 text-[10px] text-muted-foreground tracking-wider">
          OFERTA POR TEMPO LIMITADO
        </p>
      </div>
    </div>
  );
};

export default PromoModal;
