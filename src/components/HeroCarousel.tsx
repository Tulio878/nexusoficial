import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import noriskFrance from "@/assets/products/norisk-soul-france.webp";
import ls2Xdron from "@/assets/products/ls2-xdron-azul.webp";
import noriskDarth from "@/assets/products/norisk-darth-preto.webp";

const slides = [
  {
    badge: "EDIÇÃO LIMITADA",
    title: "Coleção Grand Prix",
    subtitle: "Capacetes inspirados nos maiores circuitos do mundo",
    cta: "Ver Coleção",
    image: noriskFrance,
  },
  {
    badge: "LANÇAMENTO",
    title: "Capacetes LS2",
    subtitle: "Performance e tecnologia para quem busca o melhor",
    cta: "Ver Coleção",
    image: ls2Xdron,
  },
  {
    badge: "MAIS VENDIDO",
    title: "Norisk Soul II",
    subtitle: "O capacete mais vendido do Brasil com design exclusivo",
    cta: "Comprar Agora",
    image: noriskDarth,
  },
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % slides.length);
    }, 6000);
  }, []);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c + 1) % slides.length);
    resetTimer();
  }, [resetTimer]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const slide = slides[current];

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
  };

  return (
    <section className="bg-secondary overflow-hidden">
      <div className="container py-8 md:py-20">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-16">
          {/* Text content */}
          <div className="flex-1 min-w-0 text-center md:text-left">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <span className="inline-block bg-foreground text-background text-[10px] md:text-xs font-bold px-3 md:px-4 py-1 md:py-1.5 rounded-sm tracking-wider mb-4 md:mb-6">
                  {slide.badge}
                </span>
                <h1 className="text-2xl md:text-6xl lg:text-7xl font-black text-foreground leading-[0.95] tracking-tight">
                  {slide.title}
                </h1>
                <p className="mt-2 md:mt-4 text-muted-foreground text-sm md:text-lg max-w-md mx-auto md:mx-0">
                  {slide.subtitle}
                </p>
                <button className="mt-5 md:mt-8 inline-flex items-center gap-2 bg-foreground text-background px-6 md:px-8 py-3 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors">
                  {slide.cta}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="flex gap-2 mt-6 md:mt-10 justify-center md:justify-start">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > current ? 1 : -1);
                    setCurrent(i);
                    resetTimer();
                  }}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === current ? "w-8 bg-foreground" : "w-4 bg-foreground/20"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="flex-1 relative flex items-center justify-center w-full">
            <button
              onClick={goPrev}
              className="absolute left-2 md:-left-4 z-10 w-9 h-9 md:w-10 md:h-10 rounded-full border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-sm"
            >
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
            </button>

            <div className="bg-background rounded-2xl p-6 md:p-12 shadow-sm border border-border">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.img
                  key={current}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  src={slide.image}
                  alt={slide.title}
                  className="w-52 h-52 md:w-80 md:h-80 object-contain"
                />
              </AnimatePresence>
            </div>

            <button
              onClick={goNext}
              className="absolute right-2 md:-right-4 z-10 w-9 h-9 md:w-10 md:h-10 rounded-full border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-sm"
            >
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
