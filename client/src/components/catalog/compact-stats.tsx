import { useQuery } from "@tanstack/react-query";
import { Database, CheckCircle, Clock, Wrench, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DataProduct } from "@shared/schema";

interface CompactStatsProps {
  onFilterChange: (filter: { status?: string }) => void;
}

export default function CompactStats({ onFilterChange }: CompactStatsProps) {
  // Get all products to calculate status counts
  const { data: products = [] } = useQuery<DataProduct[]>({
    queryKey: ["/api/data-products"],
  });

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === "active").length;
  const deprecatedProducts = products.filter(p => p.status === "deprecated").length;
  const developmentProducts = products.filter(p => p.status === "development").length;
  const experimentacaoProducts = products.filter(p => p.status === "experimentacao").length;

  const statItems = [
    {
      label: "Total",
      value: totalProducts,
      icon: Database,
      color: "text-slate-600",
      hoverColor: "hover:text-slate-800",
      onClick: () => onFilterChange({})
    },
    {
      label: "Ativos",
      value: activeProducts,
      icon: CheckCircle,
      color: "text-green-600",
      hoverColor: "hover:text-green-800",
      onClick: () => onFilterChange({ status: "active" })
    },
    {
      label: "Descontinuados",
      value: deprecatedProducts,
      icon: XCircle,
      color: "text-red-600",
      hoverColor: "hover:text-red-800",
      onClick: () => onFilterChange({ status: "deprecated" })
    },
    {
      label: "Desenvolvimento",
      value: developmentProducts,
      icon: Wrench,
      color: "text-blue-600",
      hoverColor: "hover:text-blue-800",
      onClick: () => onFilterChange({ status: "development" })
    },
    {
      label: "Experimentação",
      value: experimentacaoProducts,
      icon: Clock,
      color: "text-orange-600",
      hoverColor: "hover:text-orange-800",
      onClick: () => onFilterChange({ status: "experimentacao" })
    }
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-2">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.label}
            variant="ghost"
            onClick={item.onClick}
            className={`flex-1 h-auto p-3 flex flex-col items-center gap-1 ${item.color} ${item.hoverColor} transition-colors hover:bg-white/50`}
          >
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span className="font-bold text-lg">{item.value}</span>
            </div>
            <span className="text-xs font-medium opacity-80">{item.label}</span>
          </Button>
        );
      })}
    </div>
  );
}