import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";
import type { DataProduct } from "@shared/schema";
import { useState } from "react";
import EditProductModal from "./edit-product-modal";
import { 
  BarChart3, 
  Brain,
  Bot,
  Settings,
  Edit,
  MessageSquare,
  Workflow,
  Zap,
  Eye
} from "lucide-react";

interface ProductCardProps {
  product: DataProduct;
  viewMode: "grid" | "list";
}

const getProductIcon = (type: string) => {
  switch (type) {
    case "dashboard_selfservice":
      return BarChart3;
    case "api_outputs":
      return Settings;
    case "insights":
      return Brain;
    case "recommendation_system":
      return Brain;
    case "genai_chat":
      return MessageSquare;
    case "genai_workflow":
      return Workflow;
    case "traditional_ai":
      return Bot;
    case "genie_spaces":
      return Zap;
    case "ai_agents":
      return Bot;
    default:
      return BarChart3;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "deprecated":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    case "development":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "experimentacao":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

const getStatusBorderColor = (status: string) => {
  switch (status) {
    case "active":
      return "border-l-4 border-l-green-500";
    case "deprecated":
      return "border-l-4 border-l-gray-500";
    case "development":
      return "border-l-4 border-l-blue-500";
    case "experimentacao":
      return "border-l-4 border-l-yellow-500";
    default:
      return "border-l-4 border-l-gray-300";
  }
};

const getDomainLabel = (domain: string) => {
  switch (domain) {
    case "sales":
      return "Vendas";
    case "marketing":
      return "Marketing";
    case "finance":
      return "Financeiro";
    case "hr":
      return "RH";
    default:
      return domain;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "active":
      return "Ativo";
    case "deprecated":
      return "Deprecado";
    case "development":
      return "Desenvolvimento";
    case "experimentacao":
      return "Experimentação";
    default:
      return status;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "dashboard_selfservice":
      return "Dashboard/SelfService";
    case "api_outputs":
      return "API/Outputs";
    case "insights":
      return "Insights";
    case "ai_agents":
      return "AI Agents";
    default:
      return type;
  }
};

export default function ProductCard({ product, viewMode }: ProductCardProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const Icon = getProductIcon(product.type);
  const timeAgo = formatDistanceToNow(new Date(product.lastUpdated), { 
    addSuffix: true, 
    locale: ptBR 
  });

  const renderMetadata = () => {
    const metadata = product.metadata as any;
    if (!metadata) return null;

    return (
      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
        {Object.entries(metadata).slice(0, 2).map(([key, value]) => (
          <span key={key}>
            {key}: {String(value)}
          </span>
        ))}
      </div>
    );
  };

  if (viewMode === "list") {
    return (
      <>
        <Card className={`hover:shadow-md transition-shadow ${getStatusBorderColor(product.status)}`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {getDomainLabel(product.domain)}
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(product.status)}`}>
                      {getStatusLabel(product.status)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">{product.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{getTypeLabel(product.type)}</span>
                    <span>Atualizado {timeAgo}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4 ml-4">
                {renderMetadata()}
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">{product.ownerInitials}</AvatarFallback>
                </Avatar>
                <Link href={`/product/${product.id}`}>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditModalOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-4">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <EditProductModal 
          product={product} 
          open={editModalOpen} 
          onOpenChange={setEditModalOpen} 
        />
      </>
    );
  }

  return (
    <>
      <Card className={`hover:shadow-md transition-shadow ${getStatusBorderColor(product.status)}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{getDomainLabel(product.domain)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`text-xs ${getStatusColor(product.status)}`}>
                {getStatusLabel(product.status)}
              </Badge>
              <Link href={`/product/${product.id}`}>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditModalOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm mb-4">{product.description}</p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <span>{getTypeLabel(product.type)}</span>
            <span>Atualizado {timeAgo}</span>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            {renderMetadata()}
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs">{product.ownerInitials}</AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      <EditProductModal 
        product={product} 
        open={editModalOpen} 
        onOpenChange={setEditModalOpen} 
      />
    </>
  );
}