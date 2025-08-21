import { useState } from "react";
import { Eye, Edit, Copy, MoreHorizontal, Bot, Database, BarChart3, Brain, MessageSquare, Workflow, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DataProduct } from "@shared/schema";
import FavoriteButton from "./favorite-button";

interface CompactProductCardProps {
  product: DataProduct;
}

export default function CompactProductCard({ product }: CompactProductCardProps) {
  const [, setLocation] = useLocation();

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

  const Icon = getProductIcon(product.type);

  // Mock user permissions - in real app this would come from auth context
  const currentUserEmail = "admin@empresa.com"; // This would come from auth
  const canEdit = product.technicalContact === currentUserEmail || 
                  product.businessContact === currentUserEmail ||
                  currentUserEmail === "admin@empresa.com";

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 group">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-3 min-w-0 flex-1">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
              </div>
              <div className="min-w-0 flex-1 pr-2">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 pr-1">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {getProductTypeLabel(product.type)}
                </p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-start space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <FavoriteButton 
                productId={product.id} 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0" 
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation(`/product/${product.id}`)}
                className="h-7 w-7 p-0"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
              
              {canEdit && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreHorizontal className="h-3.5 w-3.5" />
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
          </div>

          {/* Description */}
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Metadata */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Owner:</span>
              <div className="flex items-center space-x-1">
                <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {product.ownerInitials}
                </div>
                <span className="text-gray-700 font-medium">{product.owner}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Domínio:</span>
              <span className="text-gray-700 font-medium">{getDomainLabel(product.domain)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <Badge 
              variant="secondary" 
              className={`text-xs ${getStatusColor(product.status)}`}
            >
              {getStatusLabel(product.status)}
            </Badge>
            
            <div className="flex items-center space-x-1">
              {product.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5">
                  {tag}
                </Badge>
              ))}
              {product.tags.length > 2 && (
                <span className="text-xs text-gray-400">+{product.tags.length - 2}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}