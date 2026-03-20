import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50">
      {/* Mobile header - dark */}
      <div className="md:hidden bg-foreground text-background">
        <div className="flex items-center justify-between h-14 px-4">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 text-background/80 hover:text-background">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to="/" className="text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-base font-black tracking-tight">NEXUS</span>
              <div className="w-3.5 h-3.5 bg-[#1D9BF0] rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-2 w-2 text-white stroke-[3]"><path d="M20 6 9 17l-5-5" /></svg>
              </div>
            </div>
            <p className="text-[10px] text-background/60 -mt-0.5">12.5k seguidores • 7.492 vendido(s)</p>
          </Link>

          <Link to="/carrinho" className="relative p-1 text-background/80 hover:text-background">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        {menuOpen && (
          <nav className="border-t border-background/10 px-4 pb-4 pt-2 space-y-1">
            <Link to="/" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-background/80 hover:text-background">INÍCIO</Link>
            <Link to="/categoria/capacetes-ls2" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-background/80 hover:text-background">CAPACETES</Link>
            <Link to="/categoria/vestuario" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-background/80 hover:text-background">VESTUÁRIO</Link>
            <Link to="/categoria/acessorios" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-background/80 hover:text-background">ACESSÓRIOS</Link>
          </nav>
        )}
      </div>

      {/* Desktop header */}
      <div className="hidden md:block bg-background border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-1.5">
            <span className="text-xl font-black tracking-tight text-foreground">NEXUS</span>
            <div className="w-4 h-4 bg-[#1D9BF0] rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5 text-white stroke-[3]"><path d="M20 6 9 17l-5-5" /></svg>
            </div>
          </Link>

          <nav className="flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">INÍCIO</Link>
            <Link to="/categoria/capacetes-ls2" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">CAPACETES</Link>
            <Link to="/categoria/vestuario" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">VESTUÁRIO</Link>
            <Link to="/categoria/acessorios" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">ACESSÓRIOS</Link>
          </nav>

          <Link to="/carrinho" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
        <div className="container pb-2 -mt-1">
          <p className="text-xs text-muted-foreground">12.5k seguidores • 7.492 vendido(s)</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
