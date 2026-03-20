import { Check } from "lucide-react";

const ProductFeatures = ({ features }: { features: string[] }) => (
  <div className="border border-border rounded-xl p-6">
    <h2 className="text-lg font-bold text-foreground mb-4">Características</h2>
    <ul className="space-y-2">
      {features.map((f, i) => (
        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-success flex-shrink-0" />
          {f}
        </li>
      ))}
    </ul>
  </div>
);

export default ProductFeatures;
