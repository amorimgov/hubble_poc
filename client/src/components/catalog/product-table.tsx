import { useState } from "react";
import { Eye, Edit, Copy, MoreHorizontal, ArrowUpDown, Bot, Database, BarChart3, Brain, MessageSquare, Workflow, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DataProduct } from "@shared/schema";

interface ProductTableProps {
  products: DataProduct[];
}

type SortField = 'name' | 'type' | 'domain' | 'status' | 'owner' | 'lastUpdated';
type SortDirection = 'asc' | 'desc';

export default function ProductTable({ products }: ProductTableProps) {
  const [, setLocation] = useLocation();
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const getProductIcon = (type: string) => {
    switch (type) {
      case "recommendation_system": return Brain;
      case "genai_chat": return MessageSquare;
      case "genai_workflow": return Workflow;
      case "traditional_ai": return Brain;
      case "dashboard_selfservice": return BarChart3;
      case "api_outputs": return Zap;
      case "genie_spaces": return Database;
      case "insights": return BarChart3;
      case "ai_agents": return Bot;
      default: return Database;
    }
  };

  const getProductTypeLabel = (type: string) => {
    switch (type) {
      case "recommendation_system": return "Sistema de Recomendação";
      case "genai_chat": return "Chat com GenAI";
      case "genai_workflow": return "Workflow com GenAI";
      case "traditional_ai": return "IA Tradicional";
      case "dashboard_selfservice": return "Dashboard/SelfService";
      case "api_outputs": return "API/Outputs";
      case "genie_spaces": return "Genie Spaces";
      case "insights": return "Insights";
      case "ai_agents": return "AI Agents";
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "deprecated": return "bg-red-100 text-red-800";
      case "development": return "bg-blue-100 text-blue-800";
      case "experimentacao": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Ativo";
      case "deprecated": return "Descontinuado";
      case "development": return "Desenvolvimento";
      case "experimentacao": return "Experimentação";
      default: return status;
    }
  };

  const getDomainLabel = (domain: string) => {
    switch (domain) {
      case "sales": return "Vendas";
      case "marketing": return "Marketing";
      case "finance": return "Financeiro";
      case "hr": return "RH";
      case "operations": return "Operações";
      case "customer_service": return "Atendimento";
      case "product": return "Produto";
      default: return domain;
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'lastUpdated') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Mock user permissions
  const currentUserEmail = "admin@empresa.com";
  const canEdit = (product: DataProduct) => 
    product.technicalContact === currentUserEmail || 
    product.businessContact === currentUserEmail ||
    currentUserEmail === "admin@empresa.com";

  return (
    <div className="border rounded-lg bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('name')}
                className="h-8 p-0 font-semibold hover:bg-transparent"
              >
                Produto
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('type')}
                className="h-8 p-0 font-semibold hover:bg-transparent"
              >
                Tipo
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('domain')}
                className="h-8 p-0 font-semibold hover:bg-transparent"
              >
                Domínio
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('status')}
                className="h-8 p-0 font-semibold hover:bg-transparent"
              >
                Status
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('owner')}
                className="h-8 p-0 font-semibold hover:bg-transparent"
              >
                Owner
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-center">Tags</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('lastUpdated')}
                className="h-8 p-0 font-semibold hover:bg-transparent"
              >
                Atualizado
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProducts.map((product) => {
            const Icon = getProductIcon(product.type);
            return (
              <TableRow key={product.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">
                      {product.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-700">
                    {getProductTypeLabel(product.type)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-700">
                    {getDomainLabel(product.domain)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary" 
                    className={`${getStatusColor(product.status)}`}
                  >
                    {getStatusLabel(product.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {product.ownerInitials}
                    </div>
                    <span className="text-sm text-gray-700">{product.owner}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-32">
                    {product.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5">
                        {tag}
                      </Badge>
                    ))}
                    {product.tags.length > 2 && (
                      <span className="text-xs text-gray-400">+{product.tags.length - 2}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-500">
                    {new Date(product.lastUpdated).toLocaleDateString('pt-BR')}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocation(`/product/${product.id}`)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {canEdit(product) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}