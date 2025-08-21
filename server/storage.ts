import { dataProducts, type DataProduct, type InsertDataProduct, approvalRequests, type ApprovalRequest, type InsertApprovalRequest, dataLineage, type DataLineage, type InsertDataLineage, productDependencies, type ProductDependency, type InsertProductDependency, userFavorites, type UserFavorite, type InsertUserFavorite, productChanges, type ProductChange, type InsertProductChange } from "@shared/schema";
import { db } from "./db";
import { eq, like, and, sql, desc } from "drizzle-orm";

export interface IStorage {
  getDataProduct(id: number): Promise<DataProduct | undefined>;
  getAllDataProducts(): Promise<DataProduct[]>;
  createDataProduct(product: InsertDataProduct): Promise<DataProduct>;
  updateDataProduct(id: number, product: Partial<InsertDataProduct>): Promise<DataProduct | undefined>;
  deleteDataProduct(id: number): Promise<boolean>;
  searchDataProducts(query: string): Promise<DataProduct[]>;
  getDataProductsByFilters(filters: {
    type?: string;
    domain?: string;
    status?: string;
  }): Promise<DataProduct[]>;
  getStats(): Promise<{
    totalProducts: number;
    activeProducts: number;
    withContracts: number;
    needsAttention: number;
  }>;
  
  // Approval System Methods
  createApprovalRequest(request: InsertApprovalRequest): Promise<ApprovalRequest>;
  getAllApprovalRequests(): Promise<ApprovalRequest[]>;
  getApprovalRequest(id: number): Promise<ApprovalRequest | undefined>;
  updateApprovalRequestStatus(id: number, status: string, approvedBy?: string, rejectionReason?: string): Promise<ApprovalRequest | undefined>;
  getPendingApprovalRequests(): Promise<ApprovalRequest[]>;
  getApprovalRequestsByStatus(status: string): Promise<ApprovalRequest[]>;
  
  // Lineage Methods
  getProductLineage(productId: number): Promise<DataLineage[]>;
  createDataLineage(lineage: InsertDataLineage): Promise<DataLineage>;
  
  // Dependencies Methods
  getProductDependencies(productId: number): Promise<ProductDependency[]>;
  createProductDependency(dependency: InsertProductDependency): Promise<ProductDependency>;
  
  // Favorites Methods
  getUserFavorites(userEmail: string): Promise<UserFavorite[]>;
  addToFavorites(userEmail: string, productId: number): Promise<UserFavorite>;
  removeFromFavorites(userEmail: string, productId: number): Promise<boolean>;
  isProductFavorited(userEmail: string, productId: number): Promise<boolean>;
  
  // Changelog Methods
  getProductChanges(productId: number): Promise<ProductChange[]>;
  getAllRecentChanges(limit?: number): Promise<(ProductChange & { productName: string })[]>;
  createProductChange(change: InsertProductChange): Promise<ProductChange>;
}

export class DatabaseStorage implements IStorage {
  async getDataProduct(id: number): Promise<DataProduct | undefined> {
    const [product] = await db.select().from(dataProducts).where(eq(dataProducts.id, id));
    return product || undefined;
  }

  async getAllDataProducts(): Promise<DataProduct[]> {
    return await db.select().from(dataProducts).orderBy(dataProducts.lastUpdated);
  }

  async createDataProduct(insertProduct: InsertDataProduct): Promise<DataProduct> {
    const [product] = await db
      .insert(dataProducts)
      .values(insertProduct)
      .returning();

    // Track creation
    await this.createProductChange({
      productId: product.id,
      changedBy: "system",
      changeType: "created",
      fieldName: null,
      oldValue: null,
      newValue: null,
      description: `Produto "${product.name}" foi criado`
    });

    return product;
  }

  async updateDataProduct(id: number, updates: Partial<InsertDataProduct>): Promise<DataProduct | undefined> {
    // Get the current product to track changes
    const currentProduct = await this.getDataProduct(id);
    if (!currentProduct) {
      return undefined;
    }

    const [product] = await db
      .update(dataProducts)
      .set({
        ...updates,
        lastUpdated: new Date()
      })
      .where(eq(dataProducts.id, id))
      .returning();

    // Track the changes
    if (product) {
      await this.trackProductUpdate(id, currentProduct, updates, "user@example.com");
    }

    return product || undefined;
  }

  async deleteDataProduct(id: number): Promise<boolean> {
    const result = await db.delete(dataProducts).where(eq(dataProducts.id, id));
    return (result.rowCount || 0) > 0;
  }

  async searchDataProducts(query: string): Promise<DataProduct[]> {
    const allProducts = await db.select().from(dataProducts);
    const lowercaseQuery = query.toLowerCase();
    return allProducts.filter(product =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  async getDataProductsByFilters(filters: {
    type?: string;
    domain?: string;
    status?: string;
  }): Promise<DataProduct[]> {
    const allProducts = await db.select().from(dataProducts);
    return allProducts.filter(product => {
      if (filters.type && product.type !== filters.type) return false;
      if (filters.domain && product.domain !== filters.domain) return false;
      if (filters.status && product.status !== filters.status) return false;
      return true;
    });
  }

  async getStats(): Promise<{
    totalProducts: number;
    activeProducts: number;
    withContracts: number;
    needsAttention: number;
  }> {
    const products = await db.select().from(dataProducts);
    return {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.status === 'active').length,
      withContracts: products.filter(p => p.contractSLA).length,
      needsAttention: products.filter(p => p.status === 'deprecated' || p.status === 'development').length,
    };
  }

  async seedDatabase(): Promise<void> {
    // Check if data already exists
    const existingProducts = await db.select().from(dataProducts);
    if (existingProducts.length > 0) {
      return; // Database already seeded
    }

    // Seed the database with sample data
    await this.insertSeedData();
  }

  private async insertSeedData(): Promise<void> {
    const sampleProducts: InsertDataProduct[] = [
      // Dashboard/SelfService (10 produtos)
      {
        name: "Dashboard Executivo Financeiro",
        description: "Dashboard com métricas executivas de performance financeira, incluindo receita, margem e fluxo de caixa em tempo real.",
        type: "dashboard_selfservice",
        domain: "finance",
        status: "active",
        owner: "Carlos Silva",
        ownerInitials: "CS",
        tags: ["dashboard", "finance", "executive"],
        metadata: { views: "2.1k", refresh: "Tempo real", widgets: 12 },
        contractSLA: "99.5% uptime, tempo real",
        qualityMetrics: { freshness: 99.8, usability: 95.2 },
      },
      {
        name: "Relatório Self-Service Vendas",
        description: "Ferramenta self-service para geração de relatórios personalizados de vendas por região, produto e período.",
        type: "dashboard_selfservice",
        domain: "sales",
        status: "active",
        owner: "Ana Rodrigues",
        ownerInitials: "AR",
        tags: ["self-service", "sales", "reports"],
        metadata: { users: "450", reports: "1.2k/mês", templates: 25 },
        contractSLA: "99% uptime, <3s load time",
        qualityMetrics: { performance: 92.1, satisfaction: 88.5 },
      },
      {
        name: "Dashboard RH Analytics",
        description: "Visualizações interativas de métricas de RH incluindo turnover, satisfação e performance dos colaboradores.",
        type: "dashboard_selfservice",
        domain: "hr",
        status: "active",
        owner: "Marina Costa",
        ownerInitials: "MC",
        tags: ["hr", "analytics", "dashboard"],
        metadata: { departments: 15, metrics: 45, users: "120" },
        contractSLA: "Atualização diária, 99% uptime",
        qualityMetrics: { accuracy: 97.3, completeness: 94.8 },
      },
      {
        name: "Painel Marketing Digital",
        description: "Dashboard consolidado de campanhas digitais com métricas de ROI, conversão e engajamento em tempo real.",
        type: "dashboard_selfservice",
        domain: "marketing",
        status: "active",
        owner: "Pedro Santos",
        ownerInitials: "PS",
        tags: ["marketing", "digital", "roi"],
        metadata: { campaigns: "85", channels: 12, conversions: "15.2k" },
        contractSLA: "Tempo real, 99.8% disponibilidade",
        qualityMetrics: { freshness: 99.9, accuracy: 96.7 },
      },
      {
        name: "Dashboard Operacional Logística",
        description: "Monitoramento em tempo real de operações logísticas, entregas e performance de fornecedores.",
        type: "dashboard_selfservice",
        domain: "sales",
        status: "active",
        owner: "Rafael Lima",
        ownerInitials: "RL",
        tags: ["logistics", "operations", "monitoring"],
        metadata: { deliveries: "2.8k/dia", suppliers: 45, routes: "150" },
        contractSLA: "Tempo real, 99.5% uptime",
        qualityMetrics: { reliability: 98.2, freshness: 99.1 },
      },
      {
        name: "Análise Self-Service Custos",
        description: "Ferramenta para análise detalhada de custos por centro, projeto e categoria com drill-down interativo.",
        type: "dashboard_selfservice",
        domain: "finance",
        status: "active",
        owner: "Luciana Alves",
        ownerInitials: "LA",
        tags: ["costs", "analysis", "finance"],
        metadata: { cost_centers: 85, projects: "120", variance: "±3%" },
        contractSLA: "Atualização horária, 99% uptime",
        qualityMetrics: { accuracy: 98.5, granularity: 96.2 },
      },
      {
        name: "Dashboard Qualidade Produtos",
        description: "Monitoramento de indicadores de qualidade, defeitos e satisfação do cliente por linha de produto.",
        type: "dashboard_selfservice",
        domain: "sales",
        status: "development",
        owner: "Fernanda Oliveira",
        ownerInitials: "FO",
        tags: ["quality", "products", "monitoring"],
        metadata: { products: "450", defects: "0.2%", satisfaction: "92%" },
        contractSLA: "Em desenvolvimento",
        qualityMetrics: { completeness: 85.0, testing: 78.5 },
      },
      {
        name: "Painel Sustentabilidade ESG",
        description: "Dashboard de métricas ESG incluindo pegada de carbono, consumo energético e indicadores sociais.",
        type: "dashboard_selfservice",
        domain: "finance",
        status: "active",
        owner: "Roberto Mendes",
        ownerInitials: "RM",
        tags: ["esg", "sustainability", "compliance"],
        metadata: { metrics: 35, reports: "Monthly", compliance: "100%" },
        contractSLA: "Atualização mensal, 99% uptime",
        qualityMetrics: { accuracy: 97.8, completeness: 95.5 },
      },
      {
        name: "Dashboard Inovação P&D",
        description: "Acompanhamento de projetos de P&D, pipeline de inovação e métricas de time-to-market.",
        type: "dashboard_selfservice",
        domain: "marketing",
        status: "active",
        owner: "Thiago Ferreira",
        ownerInitials: "TF",
        tags: ["innovation", "rd", "projects"],
        metadata: { projects: "25", pipeline: "8", ttm: "6 meses" },
        contractSLA: "Atualização semanal, 99% uptime",
        qualityMetrics: { progress: 94.2, accuracy: 96.8 },
      },
      {
        name: "Sistema de Recomendação E-commerce",
        description: "Motor de recomendação avançado para produtos com base em comportamento do usuário e histórico de compras.",
        type: "recommendation_system",
        domain: "sales",
        status: "active",
        owner: "Ana Carolina",
        ownerInitials: "AC",
        tags: ["ml", "recommendation", "ecommerce", "personalization"],
        metadata: { users: "2.5M", products: "50K", accuracy: "92%" },
        contractSLA: "Latência < 100ms, 99.9% uptime",
        qualityMetrics: { precision: 91.2, recall: 88.7 },
        modelType: "Collaborative Filtering + Deep Learning",
        confidenceLevel: "high",
        dataSource: "user_interactions, product_catalog, purchase_history",
        updateFrequency: "real-time",
      },
      {
        name: "Assistente Virtual Atendimento",
        description: "Chatbot inteligente para suporte ao cliente com capacidade de resolução automática e escalação inteligente.",
        type: "genai_chat",
        domain: "customer_service",
        status: "active",
        owner: "Marcos Silva",
        ownerInitials: "MS",
        tags: ["chatbot", "ai", "customer-service", "nlp"],
        metadata: { conversations: "15K/mês", resolution: "78%", satisfaction: "4.2/5" },
        contractSLA: "Disponível 24/7, tempo resposta < 2s",
        qualityMetrics: { accuracy: 89.3, completeness: 92.1 },
        modelType: "GPT-4 Fine-tuned",
        confidenceLevel: "high",
        dataSource: "knowledge_base, faq_data, conversation_logs",
        updateFrequency: "weekly",
      },
      {
        name: "Workflow Aprovação Despesas",
        description: "Fluxo automatizado para aprovação de despesas corporativas com validação inteligente e roteamento dinâmico.",
        type: "genai_workflow",
        domain: "finance",
        status: "active",
        owner: "Patricia Costa",
        ownerInitials: "PC",
        tags: ["workflow", "automation", "finance", "approval"],
        metadata: { requests: "800/mês", automation: "85%", processing_time: "2h avg" },
        contractSLA: "SLA 4h para aprovação, 99% uptime",
        qualityMetrics: { automation_rate: 85.4, accuracy: 94.7 },
        modelType: "Rule-based + ML Classification",
        confidenceLevel: "medium",
        dataSource: "expense_policies, historical_approvals, user_data",
        updateFrequency: "monthly",
      },
      {
        name: "Modelo Previsão Demanda",
        description: "Modelo de machine learning tradicional para previsão de demanda de produtos com análise sazonal.",
        type: "traditional_ai",
        domain: "operations",
        status: "active",
        owner: "Carlos Eduardo",
        ownerInitials: "CE",
        tags: ["forecasting", "demand", "ml", "operations"],
        metadata: { products: "2.5K", accuracy: "94%", horizon: "12 semanas" },
        contractSLA: "Atualização semanal, 99% uptime",
        qualityMetrics: { mape: 6.2, bias: 2.1 },
        modelType: "Random Forest + ARIMA",
        confidenceLevel: "high",
        dataSource: "sales_history, seasonality_data, external_factors",
        updateFrequency: "weekly",
      },
      {
        name: "API Dados Clientes Unificados",
        description: "API central para acesso unificado aos dados de clientes consolidados de múltiplas fontes.",
        type: "api_outputs",
        domain: "customer_service",
        status: "active",
        owner: "Rafael Santos",
        ownerInitials: "RS",
        tags: ["api", "customers", "integration", "data"],
        metadata: { endpoints: "15", requests: "50K/dia", latency: "45ms avg" },
        contractSLA: "Latência < 100ms, 99.9% uptime",
        qualityMetrics: { availability: 99.95, response_time: 42.3 },
        apiEndpoint: "https://api.empresa.com/customers/v2",
        dataSource: "crm_system, support_tickets, transaction_data",
        updateFrequency: "real-time",
      },
      {
        name: "Insights Comportamento Digital",
        description: "Análises avançadas sobre comportamento digital dos usuários com segmentação automática e predições.",
        type: "insights",
        domain: "marketing",
        status: "active",
        owner: "Juliana Mendes",
        ownerInitials: "JM",
        tags: ["analytics", "behavior", "segmentation", "digital"],
        metadata: { users: "1.2M", segments: "47", insights: "120/semana" },
        contractSLA: "Atualização diária, relatórios semanais",
        qualityMetrics: { accuracy: 91.8, coverage: 96.4 },
        dataSource: "web_analytics, mobile_data, campaign_data",
        updateFrequency: "daily",
      },
      {
        name: "Espaço Genie Vendas",
        description: "Ambiente colaborativo de dados para equipe de vendas com acesso self-service a métricas e análises.",
        type: "genie_spaces",
        domain: "sales",
        status: "development",
        owner: "Leonardo Alves",
        ownerInitials: "LA",
        tags: ["self-service", "sales", "collaboration", "analytics"],
        metadata: { users: "45", dashboards: "23", queries: "300/mês" },
        contractSLA: "Em desenvolvimento - Beta testing",
        qualityMetrics: { adoption: 78.2, satisfaction: 4.1 },
        dataSource: "sales_data, crm_system, performance_metrics",
        updateFrequency: "real-time",
      },
      {
        name: "Dashboard Análise Sentimentos Legacy",
        description: "Sistema antigo de análise de sentimentos em redes sociais - sendo substituído por novo modelo.",
        type: "dashboard_selfservice",
        domain: "marketing",
        status: "deprecated",
        owner: "Sistema Legacy",
        ownerInitials: "SL",
        tags: ["legacy", "sentiment", "social", "deprecated"],
        metadata: { posts: "100K/mês", accuracy: "72%", replacement: "Em andamento" },
        contractSLA: "Descontinuado em 31/12/2024",
        qualityMetrics: { accuracy: 72.1, coverage: 45.3 },
        dataSource: "social_media_feeds, sentiment_lexicon",
        updateFrequency: "daily",
      },
      {
        name: "Chatbot Experimental Multimodal",
        description: "Protótipo de chatbot com capacidade de processar texto, imagem e voz simultaneamente.",
        type: "genai_chat",
        domain: "customer_service",
        status: "experimentacao",
        owner: "Lab Inovação",
        ownerInitials: "LI",
        tags: ["experimental", "multimodal", "ai", "prototype"],
        metadata: { test_users: "50", modalities: "3", accuracy: "78%" },
        contractSLA: "Ambiente experimental - sem SLA",
        qualityMetrics: { experimental: 78.5, stability: 65.2 },
        modelType: "GPT-4V + Whisper",
        confidenceLevel: "low",
        dataSource: "test_conversations, multimedia_training_data",
        updateFrequency: "on-demand",
      },
      {
        name: "Motor Recomendação v1.0 (Descontinuado)",
        description: "Primeira versão do sistema de recomendação baseado apenas em filtros colaborativos.",
        type: "recommendation_system",
        domain: "sales",
        status: "deprecated",
        owner: "Arquitetura Legacy",
        ownerInitials: "AL",
        tags: ["legacy", "collaborative-filtering", "v1", "discontinued"],
        metadata: { users: "500K", accuracy: "68%", replacement: "v2.0 ativo" },
        contractSLA: "Descontinuado desde Janeiro 2024",
        qualityMetrics: { precision: 68.3, recall: 72.1 },
        modelType: "Collaborative Filtering",
        confidenceLevel: "low",
        dataSource: "historical_ratings, user_profiles",
        updateFrequency: "monthly",
      },
      {
        name: "Análise Preditiva Churn Beta",
        description: "Modelo experimental para predição de churn de clientes usando técnicas de deep learning.",
        type: "traditional_ai",
        domain: "customer_service",
        status: "experimentacao",
        owner: "Data Science Lab",
        ownerInitials: "DS",
        tags: ["experimental", "churn", "deep-learning", "beta"],
        metadata: { customers: "10K", accuracy: "86%", test_period: "3 meses" },
        contractSLA: "Modelo em teste - validação em andamento",
        qualityMetrics: { precision: 86.4, f1_score: 84.7 },
        modelType: "LSTM Neural Network",
        confidenceLevel: "medium",
        dataSource: "customer_behavior, transaction_history, support_interactions",
        updateFrequency: "weekly",
      },
      {
        name: "Relatório Self-Service Compliance",
        description: "Geração automatizada de relatórios de compliance regulatório com templates personalizáveis.",
        type: "dashboard_selfservice",
        domain: "finance",
        status: "active",
        owner: "Carla Nunes",
        ownerInitials: "CN",
        tags: ["compliance", "regulatory", "reports"],
        metadata: { regulations: 12, templates: 8, automation: "95%" },
        contractSLA: "99.5% uptime, <2s response",
        qualityMetrics: { compliance: 100.0, automation: 95.2 },
      },

      // API/Outputs (10 produtos)
      {
        name: "API Gateway Vendas",
        description: "Gateway centralizado para APIs de vendas com autenticação, rate limiting e monitoramento integrado.",
        type: "api_outputs",
        domain: "sales",
        status: "active",
        owner: "João Silva",
        ownerInitials: "JS",
        tags: ["api", "gateway", "sales"],
        metadata: { endpoints: 45, requests: "2.5M/dia", latency: "120ms" },
        contractSLA: "99.9% uptime, <200ms response",
        qualityMetrics: { availability: 99.95, performance: 97.8 },
      },
      {
        name: "API Pagamentos Instantâneos",
        description: "API para processamento de pagamentos instantâneos com integração PIX e validação em tempo real.",
        type: "api_outputs",
        domain: "finance",
        status: "active",
        owner: "Maria Rodrigues",
        ownerInitials: "MR",
        tags: ["payments", "pix", "realtime"],
        metadata: { transactions: "150k/dia", success_rate: "99.8%", avg_time: "1.2s" },
        contractSLA: "99.9% uptime, <2s processing",
        qualityMetrics: { reliability: 99.8, speed: 98.5 },
      },
      {
        name: "API Gestão Colaboradores",
        description: "Interface para operações CRUD de dados de colaboradores com controle de acesso baseado em roles.",
        type: "api_outputs",
        domain: "hr",
        status: "active",
        owner: "Sandra Pereira",
        ownerInitials: "SP",
        tags: ["hr", "employees", "crud"],
        metadata: { employees: "2.8k", operations: "500/dia", security: "OAuth2" },
        contractSLA: "99.5% uptime, LGPD compliant",
        qualityMetrics: { security: 100.0, performance: 94.2 },
      },
      {
        name: "API Marketing Automation",
        description: "Automação de campanhas de marketing com segmentação dinâmica e personalização de conteúdo.",
        type: "api_outputs",
        domain: "marketing",
        status: "active",
        owner: "Lucas Martins",
        ownerInitials: "LM",
        tags: ["marketing", "automation", "personalization"],
        metadata: { campaigns: "250", segments: "1.2k", engagement: "8.5%" },
        contractSLA: "99% uptime, <500ms response",
        qualityMetrics: { delivery: 98.9, personalization: 92.3 },
      },
      {
        name: "API Relatórios Financeiros",
        description: "Geração automatizada de relatórios financeiros em múltiplos formatos com assinatura digital.",
        type: "api_outputs",
        domain: "finance",
        status: "active",
        owner: "Patricia Lima",
        ownerInitials: "PL",
        tags: ["reports", "finance", "automation"],
        metadata: { reports: "450/mês", formats: 5, signature: "Digital" },
        contractSLA: "99.8% uptime, <30s generation",
        qualityMetrics: { accuracy: 99.5, speed: 96.7 },
      },
      {
        name: "API Integração ERP",
        description: "Conectores para sincronização bidirecional com sistemas ERP legados e modernos.",
        type: "api_outputs",
        domain: "sales",
        status: "active",
        owner: "Eduardo Santos",
        ownerInitials: "ES",
        tags: ["erp", "integration", "sync"],
        metadata: { systems: 8, sync_frequency: "15min", data_volume: "2GB/dia" },
        contractSLA: "99.5% uptime, sync garantido",
        qualityMetrics: { reliability: 98.8, data_integrity: 99.2 },
      },
      {
        name: "API Notificações Push",
        description: "Serviço de notificações push multicanal com templates personalizáveis e analytics.",
        type: "api_outputs",
        domain: "marketing",
        status: "development",
        owner: "Renata Oliveira",
        ownerInitials: "RO",
        tags: ["notifications", "push", "multichannel"],
        metadata: { channels: 6, templates: 25, delivery_rate: "94%" },
        contractSLA: "Em desenvolvimento",
        qualityMetrics: { delivery: 94.0, engagement: 12.5 },
      },
      {
        name: "API Analytics Comportamental",
        description: "Coleta e processamento de dados comportamentais de usuários com LGPD compliance.",
        type: "api_outputs",
        domain: "marketing",
        status: "active",
        owner: "Felipe Cardoso",
        ownerInitials: "FC",
        tags: ["analytics", "behavior", "lgpd"],
        metadata: { events: "5M/dia", users: "180k", retention: "68%" },
        contractSLA: "99.9% uptime, LGPD compliant",
        qualityMetrics: { coverage: 96.8, privacy: 100.0 },
      },
      {
        name: "API Warehouse Management",
        description: "Gestão de estoque e movimentações de warehouse com rastreabilidade completa.",
        type: "api_outputs",
        domain: "sales",
        status: "active",
        owner: "Gustavo Ribeiro",
        ownerInitials: "GR",
        tags: ["warehouse", "inventory", "tracking"],
        metadata: { products: "15k", movements: "800/dia", accuracy: "99.5%" },
        contractSLA: "99.8% uptime, rastreabilidade 100%",
        qualityMetrics: { accuracy: 99.5, speed: 95.8 },
      },
      {
        name: "API Customer 360",
        description: "Visão unificada de clientes agregando dados de múltiplas fontes com score de qualidade.",
        type: "api_outputs",
        domain: "sales",
        status: "active",
        owner: "Camila Torres",
        ownerInitials: "CT",
        tags: ["customer", "360", "unified"],
        metadata: { customers: "85k", sources: 12, quality_score: "92%" },
        contractSLA: "99.7% uptime, <300ms response",
        qualityMetrics: { completeness: 92.0, accuracy: 95.5 },
      },

      // Insights (10 produtos)
      {
        name: "Análise Preditiva Churn",
        description: "Modelo preditivo para identificação de clientes com alta probabilidade de churn com score de risco.",
        type: "insights",
        domain: "sales",
        status: "active",
        owner: "Daniela Santos",
        ownerInitials: "DS",
        tags: ["churn", "prediction", "ml"],
        metadata: { accuracy: "94.2%", precision: "91.8%", recall: "88.5%" },
        contractSLA: "Retreino semanal, 90%+ accuracy",
        qualityMetrics: { accuracy: 94.2, drift: 2.1 },
      },
      {
        name: "Insights Otimização Preços",
        description: "Análise de elasticidade de preços e recomendações de pricing baseadas em dados de mercado.",
        type: "insights",
        domain: "sales",
        status: "active",
        owner: "Ricardo Almeida",
        ownerInitials: "RA",
        tags: ["pricing", "optimization", "elasticity"],
        metadata: { products: "2.5k", uplift: "+12%", confidence: "95%" },
        contractSLA: "Atualização quinzenal, 95% confidence",
        qualityMetrics: { accuracy: 96.5, impact: 12.3 },
      },
      {
        name: "Análise Sentimento Marca",
        description: "Monitoramento de sentimento da marca em redes sociais com análise de tendências e alertas.",
        type: "insights",
        domain: "marketing",
        status: "active",
        owner: "Juliana Costa",
        ownerInitials: "JC",
        tags: ["sentiment", "brand", "social"],
        metadata: { mentions: "15k/mês", sentiment: "+0.72", reach: "2.8M" },
        contractSLA: "Análise em tempo real, alertas <1h",
        qualityMetrics: { coverage: 89.5, accuracy: 87.2 },
      },
      {
        name: "Insights Performance Colaboradores",
        description: "Análise de performance e potencial de colaboradores com recomendações de desenvolvimento.",
        type: "insights",
        domain: "hr",
        status: "active",
        owner: "André Silva",
        ownerInitials: "AS",
        tags: ["hr", "performance", "development"],
        metadata: { employees: "2.8k", metrics: 25, satisfaction: "87%" },
        contractSLA: "Avaliação trimestral, confidencialidade",
        qualityMetrics: { objectivity: 92.8, fairness: 95.5 },
      },
      {
        name: "Análise Fraude Transacional",
        description: "Detecção em tempo real de transações fraudulentas com machine learning e regras de negócio.",
        type: "insights",
        domain: "finance",
        status: "active",
        owner: "Marcos Oliveira",
        ownerInitials: "MO",
        tags: ["fraud", "detection", "realtime"],
        metadata: { transactions: "500k/dia", fraud_rate: "0.08%", blocked: "1.2k/dia" },
        contractSLA: "Detecção <100ms, 99.9% uptime",
        qualityMetrics: { precision: 94.8, recall: 91.2 },
      },
      {
        name: "Insights Jornada Cliente",
        description: "Mapeamento e análise da jornada do cliente com identificação de pontos de fricção e oportunidades.",
        type: "insights",
        domain: "marketing",
        status: "active",
        owner: "Beatriz Mendes",
        ownerInitials: "BM",
        tags: ["journey", "customer", "experience"],
        metadata: { touchpoints: 45, conversion: "18.5%", friction_points: 12 },
        contractSLA: "Atualização semanal, 95% coverage",
        qualityMetrics: { completeness: 94.2, actionability: 88.7 },
      },
      {
        name: "Análise Otimização Campanhas",
        description: "Otimização automática de campanhas de marketing com A/B testing e budget allocation.",
        type: "insights",
        domain: "marketing",
        status: "active",
        owner: "Rodrigo Ferreira",
        ownerInitials: "RF",
        tags: ["campaigns", "optimization", "ab_testing"],
        metadata: { campaigns: "85", tests: "150", roi_uplift: "+28%" },
        contractSLA: "Otimização diária, ROI tracking",
        qualityMetrics: { significance: 95.0, impact: 28.5 },
      },
      {
        name: "Insights Risco Crédito",
        description: "Análise de risco de crédito com scoring automático e recomendações de limite de exposição.",
        type: "insights",
        domain: "finance",
        status: "active",
        owner: "Isabela Rocha",
        ownerInitials: "IR",
        tags: ["credit", "risk", "scoring"],
        metadata: { applications: "2.5k/mês", approval_rate: "68%", default_rate: "2.1%" },
        contractSLA: "Avaliação <5min, 98% accuracy",
        qualityMetrics: { accuracy: 98.2, stability: 96.8 },
      },
      {
        name: "Análise Demanda Produtos",
        description: "Previsão de demanda por produto e região com sazonalidade e fatores externos.",
        type: "insights",
        domain: "sales",
        status: "development",
        owner: "Gabriel Lima",
        ownerInitials: "GL",
        tags: ["demand", "forecasting", "seasonality"],
        metadata: { products: "1.8k", accuracy: "89%", horizon: "12 meses" },
        contractSLA: "Em desenvolvimento",
        qualityMetrics: { accuracy: 89.0, stability: 82.5 },
      },
      {
        name: "Insights Retenção Talentos",
        description: "Análise de fatores de retenção de talentos com predição de turnover e planos de ação.",
        type: "insights",
        domain: "hr",
        status: "active",
        owner: "Larissa Nunes",
        ownerInitials: "LN",
        tags: ["retention", "talents", "turnover"],
        metadata: { employees: "2.8k", turnover_pred: "8.5%", satisfaction: "89%" },
        contractSLA: "Análise trimestral, confidencial",
        qualityMetrics: { predictive_power: 91.5, actionability: 87.8 },
      },

      // AI Agents (10 produtos)
      {
        name: "Agent Atendimento Cliente",
        description: "Assistente virtual para atendimento ao cliente com processamento de linguagem natural e escalação inteligente.",
        type: "ai_agents",
        domain: "sales",
        status: "active",
        owner: "Fernanda Silva",
        ownerInitials: "FS",
        tags: ["chatbot", "customer_service", "nlp"],
        metadata: { resolution_rate: "85%", avg_time: "3.2min", satisfaction: "4.2/5" },
        contractSLA: "24x7 disponível, <1s response",
        qualityMetrics: { accuracy: 85.0, satisfaction: 84.0 },
      },
      {
        name: "Agent Análise Documentos",
        description: "IA para processamento e extração de informações de documentos financeiros com validação automática.",
        type: "ai_agents",
        domain: "finance",
        status: "active",
        owner: "Paulo Roberto",
        ownerInitials: "PR",
        tags: ["document", "ocr", "extraction"],
        metadata: { documents: "500/dia", accuracy: "96.8%", processing: "15s avg" },
        contractSLA: "99% uptime, 95%+ accuracy",
        qualityMetrics: { accuracy: 96.8, speed: 94.2 },
      },
      {
        name: "Agent Recrutamento RH",
        description: "Assistente de IA para triagem de currículos e agendamento de entrevistas com matching automático.",
        type: "ai_agents",
        domain: "hr",
        status: "active",
        owner: "Vanessa Costa",
        ownerInitials: "VC",
        tags: ["recruitment", "screening", "matching"],
        metadata: { cvs: "1.2k/mês", match_rate: "78%", time_saved: "40h/mês" },
        contractSLA: "Triagem <2h, 75%+ match rate",
        qualityMetrics: { precision: 78.0, efficiency: 85.5 },
      },
      {
        name: "Agent Criação Conteúdo",
        description: "IA generativa para criação de conteúdo de marketing personalizado e otimizado para SEO.",
        type: "ai_agents",
        domain: "marketing",
        status: "active",
        owner: "Leonardo Dias",
        ownerInitials: "LD",
        tags: ["content", "generation", "seo"],
        metadata: { content: "150/mês", engagement: "+35%", seo_score: "92/100" },
        contractSLA: "Conteúdo em 24h, qualidade garantida",
        qualityMetrics: { quality: 88.5, originality: 95.2 },
      },
      {
        name: "Agent Monitoramento Compliance",
        description: "Sistema autônomo de monitoramento de compliance regulatório com alertas proativos e relatórios.",
        type: "ai_agents",
        domain: "finance",
        status: "active",
        owner: "Amanda Santos",
        ownerInitials: "AS",
        tags: ["compliance", "monitoring", "regulatory"],
        metadata: { rules: "250", violations: "12/mês", prevention: "95%" },
        contractSLA: "Monitoramento 24x7, alertas <5min",
        qualityMetrics: { coverage: 95.0, accuracy: 92.8 },
      },
      {
        name: "Agent Otimização Vendas",
        description: "IA que analisa padrões de vendas e sugere ações personalizadas para cada vendedor em tempo real.",
        type: "ai_agents",
        domain: "sales",
        status: "active",
        owner: "Diego Martins",
        ownerInitials: "DM",
        tags: ["sales", "optimization", "recommendations"],
        metadata: { sellers: "85", recommendations: "450/dia", conversion: "+22%" },
        contractSLA: "Sugestões em tempo real, 20%+ uplift",
        qualityMetrics: { relevance: 89.2, impact: 22.0 },
      },
      {
        name: "Agent Prevenção Fraudes",
        description: "Agente autônomo para detecção e prevenção de fraudes em tempo real com aprendizado contínuo.",
        type: "ai_agents",
        domain: "finance",
        status: "active",
        owner: "Renato Oliveira",
        ownerInitials: "RO",
        tags: ["fraud", "prevention", "realtime"],
        metadata: { transactions: "800k/dia", blocked: "2.1k/dia", false_positive: "0.5%" },
        contractSLA: "Detecção <50ms, 99.5% accuracy",
        qualityMetrics: { precision: 99.5, recall: 94.8 },
      },
      {
        name: "Agent Análise Feedback",
        description: "IA para análise automática de feedback de clientes com categorização e insights acionáveis.",
        type: "ai_agents",
        domain: "marketing",
        status: "development",
        owner: "Cristina Lima",
        ownerInitials: "CL",
        tags: ["feedback", "analysis", "sentiment"],
        metadata: { feedback: "800/mês", categories: 15, sentiment: "82% positivo" },
        contractSLA: "Em desenvolvimento",
        qualityMetrics: { categorization: 87.5, sentiment_accuracy: 82.0 },
      },
      {
        name: "Agent Gestão Contratos",
        description: "Assistente para análise, revisão e gestão automatizada de contratos com alertas de vencimento.",
        type: "ai_agents",
        domain: "finance",
        status: "active",
        owner: "Marcelo Torres",
        ownerInitials: "MT",
        tags: ["contracts", "management", "alerts"],
        metadata: { contracts: "1.5k", analysis: "15min avg", alerts: "98% precisão" },
        contractSLA: "Análise <30min, 95% accuracy",
        qualityMetrics: { accuracy: 95.0, completeness: 92.5 },
      },
      {
        name: "Agent Personalização Marketing",
        description: "IA para personalização em tempo real de experiências de marketing baseada no comportamento do usuário.",
        type: "ai_agents",
        domain: "marketing",
        status: "active",
        owner: "Tatiana Ferreira",
        ownerInitials: "TF",
        tags: ["personalization", "realtime", "behavior"],
        metadata: { users: "180k", experiences: "2.5M/dia", engagement: "+45%" },
        contractSLA: "Personalização <100ms, 40%+ uplift",
        qualityMetrics: { relevance: 89.8, performance: 45.2 },
      },
    ];

    // Insert products in batches for better performance
    for (const product of sampleProducts) {
      await db.insert(dataProducts).values([product]);
    }

    // Create some fake changelog data
    await this.seedChangelogData();
  }

  // Approval System Implementation
  async createApprovalRequest(insertRequest: InsertApprovalRequest): Promise<ApprovalRequest> {
    const [request] = await db
      .insert(approvalRequests)
      .values(insertRequest)
      .returning();
    return request;
  }

  async getAllApprovalRequests(): Promise<ApprovalRequest[]> {
    return await db.select().from(approvalRequests);
  }

  async getApprovalRequest(id: number): Promise<ApprovalRequest | undefined> {
    const [request] = await db.select().from(approvalRequests).where(eq(approvalRequests.id, id));
    return request || undefined;
  }

  async updateApprovalRequestStatus(id: number, status: string, approvedBy?: string, rejectionReason?: string): Promise<ApprovalRequest | undefined> {
    const updateData: any = { status };
    if (approvedBy) updateData.approvedBy = approvedBy;
    if (rejectionReason) updateData.rejectionReason = rejectionReason;
    if (status === "approved" || status === "rejected") {
      updateData.approvedAt = new Date();
    }

    const [request] = await db
      .update(approvalRequests)
      .set(updateData)
      .where(eq(approvalRequests.id, id))
      .returning();
    return request || undefined;
  }

  async getPendingApprovalRequests(): Promise<ApprovalRequest[]> {
    return await db.select().from(approvalRequests).where(eq(approvalRequests.status, "pending"));
  }

  async getApprovalRequestsByStatus(status: string): Promise<ApprovalRequest[]> {
    return await db.select().from(approvalRequests).where(eq(approvalRequests.status, status));
  }

  // Lineage Methods
  async getProductLineage(productId: number): Promise<DataLineage[]> {
    return await db.select().from(dataLineage).where(eq(dataLineage.productId, productId));
  }

  async createDataLineage(insertLineage: InsertDataLineage): Promise<DataLineage> {
    const [lineage] = await db.insert(dataLineage).values(insertLineage).returning();
    return lineage;
  }

  // Dependencies Methods
  async getProductDependencies(productId: number): Promise<ProductDependency[]> {
    return await db.select().from(productDependencies).where(eq(productDependencies.productId, productId));
  }

  async createProductDependency(insertDependency: InsertProductDependency): Promise<ProductDependency> {
    const [dependency] = await db.insert(productDependencies).values(insertDependency).returning();
    return dependency;
  }

  // Favorites Implementation
  async getUserFavorites(userEmail: string): Promise<UserFavorite[]> {
    const favorites = await db
      .select()
      .from(userFavorites)
      .where(eq(userFavorites.userEmail, userEmail))
      .orderBy(desc(userFavorites.createdAt));
    return favorites;
  }

  async addToFavorites(userEmail: string, productId: number): Promise<UserFavorite> {
    const [favorite] = await db
      .insert(userFavorites)
      .values({ userEmail, productId })
      .returning();
    return favorite;
  }

  async removeFromFavorites(userEmail: string, productId: number): Promise<boolean> {
    const result = await db
      .delete(userFavorites)
      .where(and(
        eq(userFavorites.userEmail, userEmail),
        eq(userFavorites.productId, productId)
      ));
    return (result.rowCount || 0) > 0;
  }

  async isProductFavorited(userEmail: string, productId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(userFavorites)
      .where(and(
        eq(userFavorites.userEmail, userEmail),
        eq(userFavorites.productId, productId)
      ))
      .limit(1);
    return !!favorite;
  }

  // Changelog Methods
  async getProductChanges(productId: number): Promise<ProductChange[]> {
    return await db.select().from(productChanges)
      .where(eq(productChanges.productId, productId))
      .orderBy(desc(productChanges.changedAt));
  }

  async getAllRecentChanges(limit: number = 50): Promise<(ProductChange & { productName: string })[]> {
    return await db.select({
      id: productChanges.id,
      productId: productChanges.productId,
      changedBy: productChanges.changedBy,
      changeType: productChanges.changeType,
      fieldName: productChanges.fieldName,
      oldValue: productChanges.oldValue,
      newValue: productChanges.newValue,
      description: productChanges.description,
      changedAt: productChanges.changedAt,
      productName: dataProducts.name,
    }).from(productChanges)
      .innerJoin(dataProducts, eq(productChanges.productId, dataProducts.id))
      .orderBy(desc(productChanges.changedAt))
      .limit(limit);
  }

  async createProductChange(insertChange: InsertProductChange): Promise<ProductChange> {
    const [change] = await db.insert(productChanges)
      .values(insertChange)
      .returning();
    return change;
  }

  // Helper method to track changes when updating products
  private async trackProductUpdate(productId: number, oldProduct: DataProduct, newProduct: Partial<InsertDataProduct>, changedBy: string = "system"): Promise<void> {
    const changes: InsertProductChange[] = [];

    // Compare each field and track changes
    Object.entries(newProduct).forEach(([key, newValue]) => {
      const oldValue = (oldProduct as any)[key];
      if (oldValue !== newValue && newValue !== undefined) {
        const fieldDisplayNames: Record<string, string> = {
          name: "Nome",
          description: "Descrição",
          type: "Tipo",
          domain: "Domínio",
          status: "Status",
          owner: "Responsável",
          tags: "Tags",
          contractSLA: "SLA do Contrato",
          technicalContact: "Contato Técnico",
          businessContact: "Contato de Negócio",
          updateFrequency: "Frequência de Atualização",
          documentationContent: "Documentação"
        };

        changes.push({
          productId,
          changedBy,
          changeType: "updated",
          fieldName: key,
          oldValue: Array.isArray(oldValue) ? oldValue.join(", ") : String(oldValue || ""),
          newValue: Array.isArray(newValue) ? newValue.join(", ") : String(newValue),
          description: `${fieldDisplayNames[key] || key} alterado${fieldDisplayNames[key] ? ` de "${oldValue}" para "${newValue}"` : ""}`
        });
      }
    });

    // Insert all changes
    if (changes.length > 0) {
      await db.insert(productChanges).values(changes);
    }
  }

  // Generate fake changelog data
  private async seedChangelogData(): Promise<void> {
    // Clear existing changelog data to force recreation
    await db.delete(productChanges);

    const products = await db.select().from(dataProducts);
    
    const sampleChanges: InsertProductChange[] = [
      // Dashboard Executivo Financeiro (ID: 45)
      {
        productId: 45,
        changedBy: "Carlos Silva",
        changeType: "created",
        fieldName: null,
        oldValue: null,
        newValue: null,
        description: "Dashboard Executivo Financeiro foi criado"
      },
      {
        productId: 45,
        changedBy: "Ana Costa",
        changeType: "updated",
        fieldName: "description",
        oldValue: "Dashboard básico de métricas financeiras",
        newValue: "Dashboard executivo com KPIs financeiros, análise de receita, despesas e fluxo de caixa em tempo real.",
        description: "Descrição atualizada para incluir mais detalhes sobre funcionalidades"
      },
      {
        productId: 45,
        changedBy: "Roberto Lima",
        changeType: "status_changed",
        fieldName: "status",
        oldValue: "development",
        newValue: "active",
        description: "Status alterado de 'development' para 'active'"
      },
      // Relatório Self-Service Vendas (ID: 46)
      {
        productId: 46,
        changedBy: "Mariana Ferreira",
        changeType: "created",
        fieldName: null,
        oldValue: null,
        newValue: null,
        description: "Relatório Self-Service Vendas foi criado"
      },
      {
        productId: 46,
        changedBy: "José Santos",
        changeType: "updated",
        fieldName: "contractSLA",
        oldValue: "Geração <5min",
        newValue: "Geração <3min, 99% uptime",
        description: "SLA atualizado para melhor performance"
      },
      {
        productId: 46,
        changedBy: "Ana Costa",
        changeType: "updated",
        fieldName: "qualityMetrics",
        oldValue: "accuracy: 95%",
        newValue: "accuracy: 97.5%, freshness: 99.2%",
        description: "Métricas de qualidade aprimoradas"
      },
      // API Previsão Churn (ID: 47)
      {
        productId: 47,
        changedBy: "Pedro Almeida",
        changeType: "created",
        fieldName: null,
        oldValue: null,
        newValue: null,
        description: "API Previsão Churn foi criada"
      },
      {
        productId: 47,
        changedBy: "Carla Mendes",
        changeType: "updated",
        fieldName: "modelType",
        oldValue: "Random Forest",
        newValue: "XGBoost Ensemble",
        description: "Modelo atualizado para melhor precisão"
      },
      {
        productId: 47,
        changedBy: "Pedro Almeida",
        changeType: "status_changed",
        fieldName: "status",
        oldValue: "experimentacao",
        newValue: "active",
        description: "Modelo promovido para produção após validação"
      },
      // Dashboard Qualidade Produtos (ID: 51)
      {
        productId: 51,
        changedBy: "Fernanda Oliveira",
        changeType: "created",
        fieldName: null,
        oldValue: null,
        newValue: null,
        description: "Dashboard Qualidade Produtos foi criado"
      },
      {
        productId: 51,
        changedBy: "Marcos Santos",
        changeType: "updated",
        fieldName: "owner",
        oldValue: "Sistema",
        newValue: "Fernanda Oliveira",
        description: "Responsável alterado para Fernanda Oliveira"
      },
      {
        productId: 51,
        changedBy: "Fernanda Oliveira",
        changeType: "updated",
        fieldName: "tags",
        oldValue: "quality, monitoring",
        newValue: "quality, products, monitoring, automation",
        description: "Adicionada tag 'automation' às funcionalidades"
      }
    ];

    // Insert changelog data with staggered timestamps
    for (let i = 0; i < sampleChanges.length; i++) {
      const change = sampleChanges[i];
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() - (sampleChanges.length - i)); // Spread over last N days
      baseDate.setHours(9 + (i % 8), Math.floor(Math.random() * 60)); // Random hours
      
      await db.insert(productChanges).values([{
        ...change,
        changedAt: baseDate
      }]);
    }
  }
}

// Memory Storage implementation as fallback
class MemStorage implements IStorage {
  private products: DataProduct[] = [];
  private approvals: ApprovalRequest[] = [];
  private lineageData: DataLineage[] = [];
  private dependencies: ProductDependency[] = [];
  private favorites: UserFavorite[] = [];
  private changes: ProductChange[] = [];
  private nextId = 1;

  constructor() {
    this.seedMemoryData();
  }

  private seedMemoryData() {
    // Basic product data
    this.products = [
      {
        id: 45,
        name: "Dashboard Executivo Financeiro",
        type: "Dashboard",
        description: "Dashboard executivo com KPIs financeiros, análise de receita, despesas e fluxo de caixa em tempo real.",
        domain: "Financeiro",
        status: "active",
        owner: "Carlos Silva",
        ownerInitials: "CS",
        tags: ["finance", "kpi", "executive"],
        metadata: {},
        contractSLA: "99.5% uptime, <2s load time",
        qualityMetrics: "accuracy: 99%",

        documentation: "# Dashboard Executivo Financeiro\n\nDashboard completo com KPIs financeiros...",
        upstreamSources: [],
        downstreamTargets: [],
        lastUpdated: new Date(),
        createdAt: new Date()
      },
      {
        id: 46,
        name: "Relatório Self-Service Vendas",
        type: "Report",
        description: "Relatórios self-service para equipe de vendas com métricas de performance, pipeline e conversão.",
        domain: "Vendas",
        status: "active",
        owner: "Mariana Ferreira",
        ownerInitials: "MF",
        tags: ["sales", "self-service", "metrics"],
        metadata: {},
        contractSLA: "Geração <3min, 99% uptime",
        qualityMetrics: "accuracy: 97.5%, freshness: 99.2%",

        documentation: "# Relatório Self-Service Vendas\n\nSistema de relatórios...",
        upstreamSources: [],
        downstreamTargets: [],
        lastUpdated: new Date(),
        createdAt: new Date()
      }
    ];

    // Basic favorites data
    this.favorites = [
      { id: 4, userEmail: "user@example.com", productId: 45, createdAt: new Date() },
      { id: 5, userEmail: "user@example.com", productId: 51, createdAt: new Date() }
    ];

    // Basic changelog data
    this.changes = [
      {
        id: 1,
        productId: 45,
        changedBy: "Carlos Silva",
        changeType: "created",
        fieldName: null,
        oldValue: null,
        newValue: null,
        description: "Dashboard Executivo Financeiro foi criado",
        changedAt: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        id: 2,
        productId: 45,
        changedBy: "Ana Costa",
        changeType: "updated",
        fieldName: "description",
        oldValue: "Dashboard básico de métricas financeiras",
        newValue: "Dashboard executivo com KPIs financeiros, análise de receita, despesas e fluxo de caixa em tempo real.",
        description: "Descrição atualizada para incluir mais detalhes sobre funcionalidades",
        changedAt: new Date(Date.now() - 43200000) // 12 hours ago
      }
    ];
  }

  async getDataProduct(id: number): Promise<DataProduct | undefined> {
    return this.products.find(p => p.id === id);
  }

  async getAllDataProducts(): Promise<DataProduct[]> {
    return this.products;
  }

  async createDataProduct(product: InsertDataProduct): Promise<DataProduct> {
    const newProduct: DataProduct = {
      id: this.nextId++,
      name: product.name,
      description: product.description,
      type: product.type,
      domain: product.domain,
      status: product.status,
      owner: product.owner,
      ownerInitials: product.ownerInitials,
      tags: product.tags || [],
      metadata: product.metadata || {},
      contractSLA: product.contractSLA || null,
      qualityMetrics: product.qualityMetrics || {},
      documentation: product.documentation || "",
      upstreamSources: product.upstreamSources || [],
      downstreamTargets: product.downstreamTargets || [],
      lastUpdated: new Date(),
      createdAt: new Date()
    };
    this.products.push(newProduct);
    return newProduct;
  }

  async updateDataProduct(id: number, product: Partial<InsertDataProduct>): Promise<DataProduct | undefined> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    this.products[index] = { ...this.products[index], ...product, lastUpdated: new Date() };
    return this.products[index];
  }

  async deleteDataProduct(id: number): Promise<boolean> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    this.products.splice(index, 1);
    return true;
  }

  async searchDataProducts(query: string): Promise<DataProduct[]> {
    const lowercaseQuery = query.toLowerCase();
    return this.products.filter(product =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  async getDataProductsByFilters(filters: { type?: string; domain?: string; status?: string }): Promise<DataProduct[]> {
    return this.products.filter(product => {
      if (filters.type && product.type !== filters.type) return false;
      if (filters.domain && product.domain !== filters.domain) return false;
      if (filters.status && product.status !== filters.status) return false;
      return true;
    });
  }

  async getStats(): Promise<{ totalProducts: number; activeProducts: number; withContracts: number; needsAttention: number }> {
    return {
      totalProducts: this.products.length,
      activeProducts: this.products.filter(p => p.status === 'active').length,
      withContracts: this.products.filter(p => p.contractSLA).length,
      needsAttention: this.products.filter(p => p.status === 'needs_attention').length
    };
  }

  // Approval methods (simplified)
  async createApprovalRequest(request: InsertApprovalRequest): Promise<ApprovalRequest> {
    const newRequest: ApprovalRequest = { ...request, id: this.nextId++, createdAt: new Date() };
    this.approvals.push(newRequest);
    return newRequest;
  }

  async getAllApprovalRequests(): Promise<ApprovalRequest[]> {
    return this.approvals;
  }

  async getApprovalRequest(id: number): Promise<ApprovalRequest | undefined> {
    return this.approvals.find(a => a.id === id);
  }

  async updateApprovalRequestStatus(id: number, status: string, approvedBy?: string, rejectionReason?: string): Promise<ApprovalRequest | undefined> {
    const index = this.approvals.findIndex(a => a.id === id);
    if (index === -1) return undefined;
    
    this.approvals[index] = { ...this.approvals[index], status, approvedBy, rejectionReason };
    return this.approvals[index];
  }

  async getPendingApprovalRequests(): Promise<ApprovalRequest[]> {
    return this.approvals.filter(a => a.status === 'pending');
  }

  async getApprovalRequestsByStatus(status: string): Promise<ApprovalRequest[]> {
    return this.approvals.filter(a => a.status === status);
  }

  // Lineage methods (simplified)
  async getProductLineage(productId: number): Promise<DataLineage[]> {
    return this.lineageData.filter(l => l.productId === productId);
  }

  async createDataLineage(lineage: InsertDataLineage): Promise<DataLineage> {
    const newLineage: DataLineage = { ...lineage, id: this.nextId++ };
    this.lineageData.push(newLineage);
    return newLineage;
  }

  // Dependencies methods (simplified)
  async getProductDependencies(productId: number): Promise<ProductDependency[]> {
    return this.dependencies.filter(d => d.productId === productId);
  }

  async createProductDependency(dependency: InsertProductDependency): Promise<ProductDependency> {
    const newDependency: ProductDependency = { ...dependency, id: this.nextId++ };
    this.dependencies.push(newDependency);
    return newDependency;
  }

  // Favorites methods
  async getUserFavorites(userEmail: string): Promise<UserFavorite[]> {
    return this.favorites.filter(f => f.userEmail === userEmail);
  }

  async addToFavorites(userEmail: string, productId: number): Promise<UserFavorite> {
    const favorite: UserFavorite = {
      id: this.nextId++,
      userEmail,
      productId,
      createdAt: new Date()
    };
    this.favorites.push(favorite);
    return favorite;
  }

  async removeFromFavorites(userEmail: string, productId: number): Promise<boolean> {
    const index = this.favorites.findIndex(f => f.userEmail === userEmail && f.productId === productId);
    if (index === -1) return false;
    
    this.favorites.splice(index, 1);
    return true;
  }

  async isProductFavorited(userEmail: string, productId: number): Promise<boolean> {
    return this.favorites.some(f => f.userEmail === userEmail && f.productId === productId);
  }

  // Changelog methods
  async getProductChanges(productId: number): Promise<ProductChange[]> {
    return this.changes.filter(c => c.productId === productId).sort((a, b) => 
      new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
    );
  }

  async getAllRecentChanges(limit: number = 50): Promise<(ProductChange & { productName: string })[]> {
    return this.changes
      .map(change => {
        const product = this.products.find(p => p.id === change.productId);
        return { ...change, productName: product?.name || 'Unknown Product' };
      })
      .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
      .slice(0, limit);
  }

  async createProductChange(change: InsertProductChange): Promise<ProductChange> {
    const newChange: ProductChange = { ...change, id: this.nextId++, changedAt: new Date() };
    this.changes.push(newChange);
    return newChange;
  }
}

// Use simple storage implementation as fallback
export { storage } from "./simple-storage";