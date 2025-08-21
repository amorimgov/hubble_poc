import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Grid3X3, List } from "lucide-react";

interface SearchFiltersProps {
  searchQuery: string;
  typeFilter: string;
  domainFilter: string;
  statusFilter: string;
  viewMode: "grid" | "list";
  onSearch: (query: string) => void;
  onFiltersChange: (filters: { type: string; domain: string; status: string }) => void;
  onViewModeChange: (mode: "grid" | "list") => void;
}

export default function SearchFilters({
  searchQuery,
  typeFilter,
  domainFilter,
  statusFilter,
  viewMode,
  onSearch,
  onFiltersChange,
  onViewModeChange,
}: SearchFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = {
      type: typeFilter,
      domain: domainFilter,
      status: statusFilter,
      [key]: value === "all" ? "" : value,
    };
    onFiltersChange(newFilters);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Search Bar */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Buscar produtos de dados..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <Select value={typeFilter} onValueChange={(value) => handleFilterChange("type", value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="dashboard_selfservice">Dashboard/SelfService</SelectItem>
              <SelectItem value="api_outputs">API/Outputs</SelectItem>
              <SelectItem value="insights">Insights</SelectItem>
              <SelectItem value="ai_agents">AI Agents</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={domainFilter} onValueChange={(value) => handleFilterChange("domain", value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos os domínios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os domínios</SelectItem>
              <SelectItem value="sales">Vendas</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="finance">Financeiro</SelectItem>
              <SelectItem value="hr">RH</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(value) => handleFilterChange("status", value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="deprecated">Deprecado</SelectItem>
              <SelectItem value="development">Desenvolvimento</SelectItem>
              <SelectItem value="experimentacao">Experimentação</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewModeChange(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
