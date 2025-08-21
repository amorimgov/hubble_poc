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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { X } from "lucide-react";
import type { InsertDataProduct } from "@shared/schema";

const addProductSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  type: z.enum(["dashboard_selfservice", "api_outputs", "insights", "ai_agents", "recommendation_system", "genai_chat", "genai_workflow", "traditional_ai", "genie_spaces"]),
  domain: z.enum(["sales", "marketing", "finance", "hr", "operations", "customer_service", "product"]),
  status: z.enum(["active", "deprecated", "development", "experimentacao"]),
  owner: z.string().min(1, "Proprietário é obrigatório"),
  ownerInitials: z.string().min(1, "Iniciais são obrigatórias").max(3, "Máximo 3 caracteres"),
  contractSLA: z.string().optional(),
  technicalContact: z.string().optional(),
  businessContact: z.string().optional(),
  dataSource: z.string().optional(),
  updateFrequency: z.string().optional(),
  apiEndpoint: z.string().optional(),
  documentationUrl: z.string().optional(),
  modelType: z.string().optional(),
  confidenceLevel: z.string().optional(),
  complianceLevel: z.string().optional(),
});

type AddProductForm = z.infer<typeof addProductSchema>;

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddProductModal({ open, onOpenChange }: AddProductModalProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddProductForm>({
    resolver: zodResolver(addProductSchema),
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
      updateFrequency: "",
      apiEndpoint: "",
      documentationUrl: "",
      modelType: "",
      confidenceLevel: "",
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

  const onSubmit = (data: AddProductForm) => {
    const productData: InsertDataProduct = {
      ...data,
      tags,
      metadata: {},
      qualityMetrics: null,
      documentationContent: null,
    };
    createMutation.mutate(productData);
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
      default: return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Produto de Dados</DialogTitle>
          <DialogDescription>
            Cadastre um novo produto de dados no catálogo
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do produto de dados" {...field} />
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
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o produto de dados e sua finalidade"
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="dashboard_selfservice">{getTypeLabel("dashboard_selfservice")}</SelectItem>
                          <SelectItem value="api_outputs">{getTypeLabel("api_outputs")}</SelectItem>
                          <SelectItem value="insights">{getTypeLabel("insights")}</SelectItem>
                          <SelectItem value="ai_agents">{getTypeLabel("ai_agents")}</SelectItem>
                          <SelectItem value="recommendation_system">{getTypeLabel("recommendation_system")}</SelectItem>
                          <SelectItem value="genai_chat">{getTypeLabel("genai_chat")}</SelectItem>
                          <SelectItem value="genai_workflow">{getTypeLabel("genai_workflow")}</SelectItem>
                          <SelectItem value="traditional_ai">{getTypeLabel("traditional_ai")}</SelectItem>
                          <SelectItem value="genie_spaces">{getTypeLabel("genie_spaces")}</SelectItem>
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
                      <FormLabel>Domínio</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o domínio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sales">{getDomainLabel("sales")}</SelectItem>
                          <SelectItem value="marketing">{getDomainLabel("marketing")}</SelectItem>
                          <SelectItem value="finance">{getDomainLabel("finance")}</SelectItem>
                          <SelectItem value="hr">{getDomainLabel("hr")}</SelectItem>
                          <SelectItem value="operations">{getDomainLabel("operations")}</SelectItem>
                          <SelectItem value="customer_service">{getDomainLabel("customer_service")}</SelectItem>
                          <SelectItem value="product">{getDomainLabel("product")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="owner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proprietário</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do proprietário" {...field} />
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
                      <FormLabel>Iniciais</FormLabel>
                      <FormControl>
                        <Input placeholder="JS" maxLength={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="development">{getStatusLabel("development")}</SelectItem>
                        <SelectItem value="active">{getStatusLabel("active")}</SelectItem>
                        <SelectItem value="deprecated">{getStatusLabel("deprecated")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contractSLA"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contrato SLA (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 99.9% uptime, atualização diária" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Tags</FormLabel>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
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
                    placeholder="Adicionar tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagInputKeyPress}
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                className="bg-secondary hover:bg-blue-600"
              >
                {createMutation.isPending ? "Criando..." : "Criar Produto"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
