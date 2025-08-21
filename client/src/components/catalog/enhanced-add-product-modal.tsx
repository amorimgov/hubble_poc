import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { X, Bot, MessageSquare, Workflow, Brain, BarChart3, Settings, Zap, Network, ArrowLeft, ArrowRight, Database, FileText } from "lucide-react";
import type { InsertDataProduct } from "@shared/schema";

const enhancedProductSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  type: z.enum([
    "dashboard_selfservice", 
    "api_outputs", 
    "insights", 
    "ai_agents",
    "recommendation_system",
    "genai_chat",
    "genai_workflow", 
    "traditional_ai",
    "genie_spaces"
  ]),
  domain: z.enum(["sales", "marketing", "finance", "hr", "operations", "customer_service", "product"]),
  status: z.enum(["active", "deprecated", "development", "experimentacao"]),
  owner: z.string().min(1, "Proprietário é obrigatório"),
  ownerInitials: z.string().min(1, "Iniciais são obrigatórias").max(3, "Máximo 3 caracteres"),
  contractSLA: z.string().optional(),
  technicalContact: z.string().optional(),
  businessContact: z.string().optional(),
  dataSource: z.string().optional(),
  updateFrequency: z.enum(["real-time", "daily", "weekly", "monthly", "on-demand"]).optional(),
  apiEndpoint: z.string().url("URL inválida").optional().or(z.literal("")),
  documentationUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  modelType: z.string().optional(),
  confidenceLevel: z.enum(["high", "medium", "low"]).optional(),
  complianceLevel: z.string().optional(),
});

type EnhancedProductForm = z.infer<typeof enhancedProductSchema>;

interface EnhancedAddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EnhancedAddProductModal({ open, onOpenChange }: EnhancedAddProductModalProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedType, setSelectedType] = useState("dashboard_selfservice");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EnhancedProductForm>({
    resolver: zodResolver(enhancedProductSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "dashboard_selfservice",
      domain: "sales",
      status: "development",
      owner: "",
      ownerInitials: "",
      contractSLA: "",
      technicalContact: "",
      businessContact: "",
      dataSource: "",
      updateFrequency: "daily",
      apiEndpoint: "",
      documentationUrl: "",
      modelType: "",
      confidenceLevel: "medium",
      complianceLevel: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertDataProduct) => {
      const response = await apiRequest("POST", "/api/data-products", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Produto criado com sucesso!",
        description: "O novo produto de dados foi adicionado ao catálogo.",
      });
      onOpenChange(false);
      form.reset();
      setTags([]);
    },
    onError: () => {
      toast({
        title: "Erro ao criar produto",
        description: "Não foi possível criar o produto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const onSubmit = (data: EnhancedProductForm) => {
    const productData: InsertDataProduct = {
      ...data,
      tags,
      metadata: {},
      qualityMetrics: null,
      documentationContent: null,
    };
    createMutation.mutate(productData);
  };

  const getProductIcon = (type: string) => {
    switch (type) {
      case "recommendation_system": return Brain;
      case "genai_chat": return MessageSquare;
      case "genai_workflow": return Workflow;
      case "traditional_ai": return Bot;
      case "dashboard_selfservice": return BarChart3;
      case "api_outputs": return Settings;
      case "genie_spaces": return Zap;
      default: return BarChart3;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "dashboard_selfservice": return "Dashboard/SelfService";
      case "api_outputs": return "API/Outputs";
      case "insights": return "Insights";
      case "ai_agents": return "AI Agents";
      case "recommendation_system": return "Sistema de Recomendação";
      case "genai_chat": return "Chat com GenAI";
      case "genai_workflow": return "Workflow com GenAI";
      case "traditional_ai": return "IA Tradicional";
      case "genie_spaces": return "Genie Spaces";
      default: return type;
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Ativo";
      case "deprecated": return "Deprecado";
      case "development": return "Desenvolvimento";
      case "experimentacao": return "Experimentação";
      default: return status;
    }
  };

  const isAIProduct = () => {
    return ["recommendation_system", "genai_chat", "genai_workflow", "traditional_ai", "ai_agents"].includes(selectedType);
  };

  const isAPIProduct = () => {
    return ["api_outputs", "genai_chat", "genai_workflow"].includes(selectedType);
  };

  const Icon = getProductIcon(selectedType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <Icon className="w-4 h-4 text-accent" />
            </div>
            <div>
              <DialogTitle className="text-lg">Novo Produto de Dados</DialogTitle>
              <DialogDescription className="text-sm">
                {getTypeLabel(selectedType)} - Cadastre um novo produto no catálogo
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-hidden">
            {/* Fixed Header Section with Basic Info */}
            <div className="space-y-3 pb-4 border-b">
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Nome do Produto *</FormLabel>
                        <FormControl>
                          <Input 
                            className="h-8 text-sm" 
                            placeholder="Ex: Sistema de Recomendação de Produtos" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Descrição *</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="text-sm resize-none"
                            placeholder="Descreva a finalidade e valor do produto de dados"
                            rows={1}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-5 gap-3">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Tipo *</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedType(value);
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="recommendation_system">Sistema de Recomendação</SelectItem>
                            <SelectItem value="genai_chat">Chat com GenAI</SelectItem>
                            <SelectItem value="genai_workflow">Workflow com GenAI</SelectItem>
                            <SelectItem value="traditional_ai">IA Tradicional</SelectItem>
                            <SelectItem value="dashboard_selfservice">Dashboard/SelfService</SelectItem>
                            <SelectItem value="api_outputs">API/Outputs</SelectItem>
                            <SelectItem value="genie_spaces">Genie Spaces</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="domain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Domínio *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="Domínio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sales">Vendas</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="finance">Financeiro</SelectItem>
                            <SelectItem value="hr">RH</SelectItem>
                            <SelectItem value="operations">Operações</SelectItem>
                            <SelectItem value="customer_service">Atendimento</SelectItem>
                            <SelectItem value="product">Produto</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Status *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="development">Desenvolvimento</SelectItem>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="experimentacao">Experimentação</SelectItem>
                            <SelectItem value="deprecated">Deprecado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="owner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Proprietário *</FormLabel>
                        <FormControl>
                          <Input className="h-8 text-sm" placeholder="Nome do proprietário" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ownerInitials"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Iniciais *</FormLabel>
                        <FormControl>
                          <Input className="h-8 text-sm" placeholder="JS" maxLength={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Tab Section */}
            <Tabs defaultValue="documentation" className="h-full flex flex-col pt-4">
              <TabsList className="grid w-full grid-cols-4 h-8">
                <TabsTrigger value="documentation" className="text-sm">Documentação</TabsTrigger>
                <TabsTrigger value="complementary" className="text-sm">Info. Complementares</TabsTrigger>
                <TabsTrigger value="lineage" className="text-sm">Linhagem</TabsTrigger>
                <TabsTrigger value="dependencies" className="text-sm">Tabelas/Modelos</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto py-3">
                {/* Documentation Tab */}
                <TabsContent value="documentation" className="space-y-3 mt-0">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Documentação do Produto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <FormField
                        control={form.control}
                        name="documentationUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">URL da Documentação</FormLabel>
                            <FormControl>
                              <Input className="h-8 text-sm" placeholder="https://docs.empresa.com/produto" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="bg-blue-50 p-3 rounded-lg text-xs border border-blue-200">
                        <p className="font-medium mb-2 text-blue-800">Exemplos de documentação por tipo:</p>
                        <div className="space-y-1 text-blue-700">
                          <p><strong>Dashboard:</strong> "Conecta BigQuery via OAuth. Atualização 4h. KPIs: vendas, conversão. Filtros: período, região."</p>
                          <p><strong>API:</strong> "REST v2.1, Bearer token, 1000 req/min. Swagger: /docs. Health: /health"</p>
                          <p><strong>Modelo AI:</strong> "Random Forest, 2M registros. Features: idade, histórico. Deploy: MLflow."</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="technicalContact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Contato Técnico</FormLabel>
                              <FormControl>
                                <Input className="h-8 text-sm" placeholder="email@empresa.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="businessContact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Contato de Negócio</FormLabel>
                              <FormControl>
                                <Input className="h-8 text-sm" placeholder="email@empresa.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="contractSLA"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">SLA do Contrato</FormLabel>
                              <FormControl>
                                <Input className="h-8 text-sm" placeholder="Ex: 99.9% uptime, resposta em 2s" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="complianceLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Conformidade e Compliance</FormLabel>
                              <FormControl>
                                <Input className="h-8 text-sm" placeholder="Ex: LGPD, SOX, PCI-DSS" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Complementary Info Tab */}
                <TabsContent value="complementary" className="space-y-3 mt-0">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Informações Complementares</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-green-50 p-3 rounded-lg text-xs border border-green-200 mb-3">
                        <p className="font-medium mb-2 text-green-800">Exemplos de configuração:</p>
                        <div className="space-y-1 text-green-700">
                          <p><strong>Fonte:</strong> PostgreSQL prod_db.customers, BigQuery analytics.events, S3 files/exports/</p>
                          <p><strong>Frequência:</strong> Tempo real (streaming), Diário (02:00 UTC), Sob demanda (API trigger)</p>
                          <p><strong>SLA:</strong> 99.9% uptime, latência menor que 100ms, 4h recovery time</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="dataSource"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Fonte de Dados Principal</FormLabel>
                              <FormControl>
                                <Input className="h-8 text-sm" placeholder="PostgreSQL prod_db.customers" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="updateFrequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Frequência de Atualização</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue placeholder="Selecione a frequência" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="real-time">Tempo Real</SelectItem>
                                  <SelectItem value="daily">Diário</SelectItem>
                                  <SelectItem value="weekly">Semanal</SelectItem>
                                  <SelectItem value="monthly">Mensal</SelectItem>
                                  <SelectItem value="on-demand">Sob Demanda</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {isAPIProduct() && (
                        <FormField
                          control={form.control}
                          name="apiEndpoint"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Endpoint da API</FormLabel>
                              <FormControl>
                                <Input className="h-8 text-sm" placeholder="https://api.empresa.com/endpoint" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {isAIProduct() && (
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name="modelType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Tipo de Modelo</FormLabel>
                                <FormControl>
                                  <Input className="h-8 text-sm" placeholder="Ex: GPT-4, Random Forest, CNN" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="confidenceLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Nível de Confiança</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-8 text-sm">
                                      <SelectValue placeholder="Selecione o nível" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="high">Alto (acima de 90%)</SelectItem>
                                    <SelectItem value="medium">Médio (70-90%)</SelectItem>
                                    <SelectItem value="low">Baixo (abaixo de 70%)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Lineage Graph Tab */}
                <TabsContent value="lineage" className="space-y-3 mt-0">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Linhagem de Dados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
                        <Settings className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Visualização de Linhagem</h3>
                        <p className="text-sm text-gray-500 mb-4 max-w-md">
                          Configure as conexões de dados upstream e downstream para visualizar o fluxo de informações
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                          <div className="p-4 bg-white rounded border">
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <Workflow className="h-4 w-4 text-blue-500" />
                              Fontes (Upstream)
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs p-2 bg-blue-50 rounded border-l-2 border-blue-300">
                                <Bot className="h-3 w-3" />
                                <span>customers_table</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs p-2 bg-blue-50 rounded border-l-2 border-blue-300">
                                <Zap className="h-3 w-3" />
                                <span>CRM API v2.1</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs p-2 bg-blue-50 rounded border-l-2 border-blue-300">
                                <BarChart3 className="h-3 w-3" />
                                <span>sales_events</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-white rounded border">
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-green-500" />
                              Destinos (Downstream)
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs p-2 bg-green-50 rounded border-l-2 border-green-300">
                                <BarChart3 className="h-3 w-3" />
                                <span>Dashboard Vendas</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs p-2 bg-green-50 rounded border-l-2 border-green-300">
                                <Brain className="h-3 w-3" />
                                <span>Modelo Churn</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs p-2 bg-green-50 rounded border-l-2 border-green-300">
                                <Zap className="h-3 w-3" />
                                <span>API Analytics</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-100 p-3 rounded-lg text-xs">
                          <div className="flex items-center justify-center space-x-8">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded border-2 border-blue-300 flex items-center justify-center">
                                <Bot className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="text-gray-400">→</span>
                              <div className="w-8 h-8 bg-yellow-100 rounded border-2 border-yellow-300 flex items-center justify-center">
                                <Settings className="h-4 w-4 text-yellow-600" />
                              </div>
                              <span className="text-gray-400">→</span>
                              <div className="w-8 h-8 bg-green-100 rounded border-2 border-green-300 flex items-center justify-center">
                                <BarChart3 className="h-4 w-4 text-green-600" />
                              </div>
                            </div>
                          </div>
                          <p className="text-center mt-2 text-gray-600">Fonte → Processamento → Destino</p>
                        </div>
                        
                        <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg max-w-md">
                          <p className="text-xs text-amber-700">
                            <span className="font-medium">Próxima versão:</span> Interface visual interativa para mapear dependências e fluxos de dados
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Dependencies Tab */}
                <TabsContent value="dependencies" className="space-y-3 mt-0">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Tabelas e Modelos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <FormLabel className="text-sm">Tags</FormLabel>
                        <div className="flex flex-wrap gap-1 mt-2 mb-2">
                          {tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs h-6">
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1 hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            className="h-8 text-sm"
                            placeholder="Adicionar tag (tabela, modelo, dataset)"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={handleTagInputKeyPress}
                          />
                          <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                            Adicionar
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <p className="font-medium mb-1">Sugestões de tags:</p>
                        <p>• Tabelas: users_table, orders_table, products_table</p>
                        <p>• Modelos: recommendation_model, classification_model</p>
                        <p>• Datasets: training_data, validation_set</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  disabled={createMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={createMutation.isPending}
                  className="bg-accent hover:bg-accent/90"
                >
                  {createMutation.isPending ? "Criando..." : "Criar Produto"}
                </Button>
              </div>
            </Tabs>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}