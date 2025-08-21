import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Bot, Database, BarChart3, Settings, Brain, MessageSquare, 
  Workflow, Zap, ArrowLeft, Edit, Save, X, Upload, Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LineageGraph from "@/components/lineage/lineage-graph";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import FavoriteButton from "@/components/catalog/favorite-button";
import ProductChangelog from "@/components/catalog/product-changelog";
import type { DataProduct, DataLineage, ProductDependency } from "@shared/schema";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [documentationMode, setDocumentationMode] = useState<"url" | "upload">("url");
  const queryClient = useQueryClient();

  const productId = params?.id ? parseInt(params.id) : null;

  const { data: product, isLoading } = useQuery<DataProduct>({
    queryKey: ["/api/data-products", productId],
    enabled: !!productId,
  });

  const { data: lineage = [] } = useQuery<DataLineage[]>({
    queryKey: ["/api/data-lineage", productId],
    enabled: !!productId,
  });

  const { data: dependencies = [] } = useQuery<ProductDependency[]>({
    queryKey: ["/api/product-dependencies", productId],
    enabled: !!productId,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  if (!product) {
    return <div className="flex items-center justify-center h-64">Produto não encontrado</div>;
  }



  const getProductIcon = (type: string) => {
    switch (type) {
      case "recommendation_system": return Brain;
      case "genai_chat": return MessageSquare;
      case "genai_workflow": return Workflow;
      case "traditional_ai": return Bot;
      case "dashboard_selfservice": return BarChart3;
      case "api_outputs": return Settings;
      case "genie_spaces": return Zap;
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

  const getHeaderColor = (type: string) => {
    switch (type) {
      case "recommendation_system": return "bg-gradient-to-r from-purple-600 to-purple-700";
      case "genai_chat": return "bg-gradient-to-r from-blue-600 to-blue-700";
      case "genai_workflow": return "bg-gradient-to-r from-green-600 to-green-700";
      case "traditional_ai": return "bg-gradient-to-r from-orange-600 to-orange-700";
      case "dashboard_selfservice": return "bg-gradient-to-r from-indigo-600 to-indigo-700";
      case "api_outputs": return "bg-gradient-to-r from-gray-600 to-gray-700";
      case "genie_spaces": return "bg-gradient-to-r from-yellow-600 to-yellow-700";
      default: return "bg-gradient-to-r from-accent to-accent/80";
    }
  };

  const Icon = getProductIcon(product.type);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dynamic Header */}
      <div className={`${getHeaderColor(product.type)} text-white`}>
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/catalog")}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{product.name}</h1>
                  <p className="text-white/80">{getProductTypeLabel(product.type)}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : 'N/A'}
              </Badge>
              <FavoriteButton 
                productId={product.id} 
                variant="ghost" 
                size="default"
                className="bg-white/20 text-white hover:bg-white/30 border-white/30" 
              />
              <Button
                variant="secondary"
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white/20 text-white hover:bg-white/30 border-white/30"
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-white/60">Proprietário</p>
              <p className="font-medium">{product.owner}</p>
            </div>
            <div>
              <p className="text-white/60">Domínio</p>
              <p className="font-medium">{product.domain}</p>
            </div>
            <div>
              <p className="text-white/60">Contato Técnico</p>
              <p className="font-medium">{product.technicalContact || "Não informado"}</p>
            </div>
            <div>
              <p className="text-white/60">Última Atualização</p>
              <p className="font-medium">
                {new Date(product.lastUpdated).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content with Tabs */}
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="documentation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="documentation">Documentação</TabsTrigger>
            <TabsTrigger value="lineage">Linhagem</TabsTrigger>
            <TabsTrigger value="dependencies">Tabelas/Modelos</TabsTrigger>
            <TabsTrigger value="changelog">Changelog</TabsTrigger>
          </TabsList>

          {/* Documentation Tab */}
          <TabsContent value="documentation">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Documentação
                  {isEditing && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDocumentationMode("url")}
                        className={documentationMode === "url" ? "bg-accent text-white" : ""}
                      >
                        <Link2 className="w-4 h-4 mr-1" />
                        URL
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDocumentationMode("upload")}
                        className={documentationMode === "upload" ? "bg-accent text-white" : ""}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Upload
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    {documentationMode === "url" ? (
                      <div>
                        <Label htmlFor="docUrl">URL da Documentação (.md)</Label>
                        <Input
                          id="docUrl"
                          placeholder="https://github.com/repo/docs/README.md"
                          defaultValue={product.documentationUrl || ""}
                        />
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor="docContent">Conteúdo Markdown</Label>
                        <Textarea
                          id="docContent"
                          placeholder="Cole aqui o conteúdo em markdown..."
                          rows={15}
                          defaultValue={product.documentationContent || ""}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="max-w-none">
                    {product.documentationContent ? (
                      <div className="prose prose-slate max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              const inline = !className;
                              return !inline ? (
                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </pre>
                              ) : (
                                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                  {children}
                                </code>
                              );
                            },
                            h1: ({ children }) => (
                              <h1 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-8">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-lg font-medium text-gray-700 mb-3 mt-6">
                                {children}
                              </h3>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc ml-6 mb-4 space-y-1">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal ml-6 mb-4 space-y-1">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="text-gray-700">
                                {children}
                              </li>
                            ),
                            p: ({ children }) => (
                              <p className="mb-4 text-gray-700 leading-relaxed">
                                {children}
                              </p>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-gray-900">
                                {children}
                              </strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic text-gray-600">
                                {children}
                              </em>
                            )
                          }}
                        >
                          {product.documentationContent}
                        </ReactMarkdown>
                      </div>
                    ) : product.documentationUrl ? (
                      <div className="text-center py-8">
                        <Link2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-4">Documentação externa</p>
                        <a
                          href={product.documentationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline"
                        >
                          {product.documentationUrl}
                        </a>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Nenhuma documentação disponível
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lineage Tab */}
          <TabsContent value="lineage">
            <Card>
              <CardHeader>
                <CardTitle>Linhagem de Dados</CardTitle>
              </CardHeader>
              <CardContent>
                {(product.upstreamSources && product.upstreamSources.length > 0) || 
                 (product.downstreamTargets && product.downstreamTargets.length > 0) ? (
                  <LineageGraph
                    upstreamSources={Array.isArray(product.upstreamSources) ? product.upstreamSources : []}
                    downstreamTargets={Array.isArray(product.downstreamTargets) ? product.downstreamTargets : []}
                    productName={product.name}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Database className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">Dados de linhagem não configurados</p>
                    <p className="text-sm text-gray-500">
                      Configure as fontes upstream e destinos downstream para visualizar o fluxo de dados
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dependencies Tab */}
          <TabsContent value="dependencies">
            <Card>
              <CardHeader>
                <CardTitle>Tabelas e Modelos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Database className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p>Tabelas e modelos relacionados</p>
                  <p className="text-sm mt-2">Esta seção mostrará as dependências de dados do produto</p>
                </div>
                </CardContent>
              </Card>
            </TabsContent>

          {/* Changelog Tab */}
          <TabsContent value="changelog">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Mudanças</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductChangelog productId={productId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}