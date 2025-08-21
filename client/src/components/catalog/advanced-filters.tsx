import { useState } from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

interface AdvancedFiltersProps {
  searchQuery: string;
  selectedTypes: string[];
  selectedDomains: string[];
  selectedStatuses: string[];
  selectedOwners: string[];
  selectedTags: string[];
  onSearchChange: (query: string) => void;
  onFiltersChange: (filters: {
    types: string[];
    domains: string[];
    statuses: string[];
    owners: string[];
    tags: string[];
  }) => void;
  onClearFilters: () => void;
}

const productTypes = [
  { value: "recommendation_system", label: "Sistema de Recomendação" },
  { value: "genai_chat", label: "Chat com GenAI" },
  { value: "genai_workflow", label: "Workflow com GenAI" },
  { value: "traditional_ai", label: "IA Tradicional" },
  { value: "dashboard_selfservice", label: "Dashboard/SelfService" },
  { value: "api_outputs", label: "API/Outputs" },
  { value: "genie_spaces", label: "Genie Spaces" },
  { value: "insights", label: "Insights" },
  { value: "ai_agents", label: "AI Agents" }
];

const domains = [
  { value: "sales", label: "Vendas" },
  { value: "marketing", label: "Marketing" },
  { value: "finance", label: "Financeiro" },
  { value: "hr", label: "RH" },
  { value: "operations", label: "Operações" },
  { value: "customer_service", label: "Atendimento" },
  { value: "product", label: "Produto" }
];

const statuses = [
  { value: "active", label: "Ativo" },
  { value: "deprecated", label: "Descontinuado" },
  { value: "development", label: "Desenvolvimento" },
  { value: "experimentacao", label: "Experimentação" }
];

export default function AdvancedFilters({
  searchQuery,
  selectedTypes,
  selectedDomains,
  selectedStatuses,
  selectedOwners,
  selectedTags,
  onSearchChange,
  onFiltersChange,
  onClearFilters
}: AdvancedFiltersProps) {
  const [typeOpen, setTypeOpen] = useState(false);
  const [domainOpen, setDomainOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const hasActiveFilters = selectedTypes.length > 0 || selectedDomains.length > 0 || 
                          selectedStatuses.length > 0 || selectedOwners.length > 0 || 
                          selectedTags.length > 0 || searchQuery.length > 0;

  const toggleFilter = (category: string, value: string) => {
    const currentFilters = {
      types: selectedTypes,
      domains: selectedDomains,
      statuses: selectedStatuses,
      owners: selectedOwners,
      tags: selectedTags
    };

    switch (category) {
      case 'types':
        currentFilters.types = selectedTypes.includes(value)
          ? selectedTypes.filter(t => t !== value)
          : [...selectedTypes, value];
        break;
      case 'domains':
        currentFilters.domains = selectedDomains.includes(value)
          ? selectedDomains.filter(d => d !== value)
          : [...selectedDomains, value];
        break;
      case 'statuses':
        currentFilters.statuses = selectedStatuses.includes(value)
          ? selectedStatuses.filter(s => s !== value)
          : [...selectedStatuses, value];
        break;
    }

    onFiltersChange(currentFilters);
  };

  const removeFilter = (category: string, value: string) => {
    toggleFilter(category, value);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar produtos, tags, owners..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-3">
            {/* Type Filter */}
            <Popover open={typeOpen} onOpenChange={setTypeOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-between h-9">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Tipo
                    {selectedTypes.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                        {selectedTypes.length}
                      </Badge>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0">
                <Command>
                  <CommandInput placeholder="Buscar tipo..." />
                  <CommandEmpty>Nenhum tipo encontrado</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {productTypes.map((type) => (
                      <CommandItem
                        key={type.value}
                        onSelect={() => toggleFilter('types', type.value)}
                        className="flex items-center gap-2"
                      >
                        <div className={`h-3 w-3 rounded border ${
                          selectedTypes.includes(type.value) 
                            ? 'bg-primary border-primary' 
                            : 'border-gray-300'
                        }`} />
                        {type.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Domain Filter */}
            <Popover open={domainOpen} onOpenChange={setDomainOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-between h-9">
                  <div className="flex items-center gap-2">
                    Domínio
                    {selectedDomains.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                        {selectedDomains.length}
                      </Badge>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0">
                <Command>
                  <CommandInput placeholder="Buscar domínio..." />
                  <CommandEmpty>Nenhum domínio encontrado</CommandEmpty>
                  <CommandGroup>
                    {domains.map((domain) => (
                      <CommandItem
                        key={domain.value}
                        onSelect={() => toggleFilter('domains', domain.value)}
                        className="flex items-center gap-2"
                      >
                        <div className={`h-3 w-3 rounded border ${
                          selectedDomains.includes(domain.value) 
                            ? 'bg-primary border-primary' 
                            : 'border-gray-300'
                        }`} />
                        {domain.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Status Filter */}
            <Popover open={statusOpen} onOpenChange={setStatusOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-between h-9">
                  <div className="flex items-center gap-2">
                    Status
                    {selectedStatuses.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                        {selectedStatuses.length}
                      </Badge>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0">
                <Command>
                  <CommandInput placeholder="Buscar status..." />
                  <CommandEmpty>Nenhum status encontrado</CommandEmpty>
                  <CommandGroup>
                    {statuses.map((status) => (
                      <CommandItem
                        key={status.value}
                        onSelect={() => toggleFilter('statuses', status.value)}
                        className="flex items-center gap-2"
                      >
                        <div className={`h-3 w-3 rounded border ${
                          selectedStatuses.includes(status.value) 
                            ? 'bg-primary border-primary' 
                            : 'border-gray-300'
                        }`} />
                        {status.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" onClick={onClearFilters} className="h-9 text-gray-600">
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {selectedTypes.map((type) => (
                <Badge key={type} variant="secondary" className="gap-1">
                  {productTypes.find(t => t.value === type)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter('types', type)}
                  />
                </Badge>
              ))}
              {selectedDomains.map((domain) => (
                <Badge key={domain} variant="secondary" className="gap-1">
                  {domains.find(d => d.value === domain)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter('domains', domain)}
                  />
                </Badge>
              ))}
              {selectedStatuses.map((status) => (
                <Badge key={status} variant="secondary" className="gap-1">
                  {statuses.find(s => s.value === status)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter('statuses', status)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}