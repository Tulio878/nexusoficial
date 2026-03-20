import { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { categories } from "@/data/products";

const CategoryScrollTabs = () => {
  const [active, setActive] = useState("todos");
  const tabsRef = useRef<(HTMLElement | null)[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasMoved = useRef(false);

  const updateIndicator = useCallback(() => {
    const idx = categories.findIndex((c) => c.id === active);
    const el = tabsRef.current[idx];
    const scroll = scrollRef.current;
    if (el && scroll) {
      const scrollRect = scroll.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setIndicator({
        left: elRect.left - scrollRect.left + scroll.scrollLeft,
        width: elRect.width,
      });
    }
  }, [active]);

  useEffect(() => { updateIndicator(); }, [updateIndicator]);

  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    scroll.addEventListener("scroll", updateIndicator, { passive: true });
    window.addEventListener("resize", updateIndicator);
    return () => {
      scroll.removeEventListener("scroll", updateIndicator);
      window.removeEventListener("resize", updateIndicator);
    };
  }, [updateIndicator]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - scroll.offsetLeft;
    scrollLeft.current = scroll.scrollLeft;
    scroll.style.cursor = "grabbing";
    scroll.style.userSelect = "none";
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const scroll = scrollRef.current;
    if (!scroll) return;
    e.preventDefault();
    const x = e.pageX - scroll.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 3) hasMoved.current = true;
    scroll.scrollLeft = scrollLeft.current - walk;
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    const scroll = scrollRef.current;
    if (scroll) {
      scroll.style.cursor = "grab";
      scroll.style.userSelect = "";
    }
  }, []);

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (hasMoved.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  return (
    <section className="bg-background border-b border-border">
      <div
        ref={scrollRef}
        className="relative flex items-center gap-1 py-2.5 overflow-x-auto no-scrollbar px-4 md:px-8 lg:px-16 cursor-grab"
        style={{ WebkitOverflowScrolling: "touch" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClickCapture={onClickCapture}
      >
        {categories.map((cat, i) => (
          <Link
            key={cat.id}
            ref={(el: HTMLAnchorElement | null) => { tabsRef.current[i] = el; }}
            to={cat.id === "todos" ? "/" : `/categoria/${cat.id}`}
            onClick={(e) => {
              if (cat.id === "todos") {
                e.preventDefault();
                setActive(cat.id);
              }
            }}
            draggable={false}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors flex-shrink-0 select-none ${
              (cat.id === "todos" && active === "todos")
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.label}
          </Link>
        ))}

        <motion.div
          className="absolute bottom-0 h-[2px] bg-foreground rounded-full"
          animate={{ left: indicator.left, width: indicator.width }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      </div>
    </section>
  );
};

export default CategoryScrollTabs;
