import { categories } from "@/data/products";

interface CategoryTabsProps {
  active: string;
  onSelect: (id: string) => void;
}

const CategoryTabs = ({ active, onSelect }: CategoryTabsProps) => (
  <div className="flex gap-2 flex-wrap">
    {categories.map((cat) => (
      <button
        key={cat.id}
        onClick={() => onSelect(cat.id)}
        className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
          active === cat.id
            ? "bg-foreground text-background"
            : "bg-secondary text-muted-foreground hover:text-foreground"
        }`}
      >
        {cat.label}
      </button>
    ))}
  </div>
);

export default CategoryTabs;
