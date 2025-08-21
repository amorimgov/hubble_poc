import { type DataProduct, type InsertDataProduct, type ApprovalRequest, type InsertApprovalRequest, type DataLineage, type InsertDataLineage, type ProductDependency, type InsertProductDependency, type UserFavorite, type InsertUserFavorite, type ProductChange, type InsertProductChange } from "@shared/schema";

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

// Simple in-memory storage
class SimpleStorage implements IStorage {
  private products: DataProduct[] = [];
  private favorites: UserFavorite[] = [];
  private changes: ProductChange[] = [];
  private nextId = 45;

  constructor() {
    // Initialize with sample data
    this.products = [
      {
        id: 45,
        name: "Dashboard Executivo Financeiro",
        type: "Dashboard",
        description: "Dashboard executivo com KPIs financeiros em tempo real",
        domain: "Financeiro", 
        status: "active",
        owner: "Carlos Silva",
        ownerInitials: "CS",
        tags: ["finance", "kpi", "executive"],
        metadata: {},
        contractSLA: "99.5% uptime",
        qualityMetrics: {},
        documentation: "# Dashboard Executivo\n\nDashboard com métricas financeiras...",
        upstreamSources: [],
        downstreamTargets: [],
        lastUpdated: new Date(),
        createdAt: new Date()
      },
      {
        id: 46,
        name: "Relatório Self-Service Vendas",
        type: "Report",
        description: "Relatórios para equipe de vendas",
        domain: "Vendas",
        status: "active", 
        owner: "Mariana Ferreira",
        ownerInitials: "MF",
        tags: ["sales", "self-service"],
        metadata: {},
        contractSLA: "Geração <3min",
        qualityMetrics: {},
        documentation: "# Relatório Vendas\n\nRelatórios self-service...",
        upstreamSources: [],
        downstreamTargets: [],
        lastUpdated: new Date(),
        createdAt: new Date()
      }
    ];

    this.favorites = [
      { id: 1, userEmail: "user@example.com", productId: 45, createdAt: new Date() }
    ];

    this.changes = [
      {
        id: 1,
        productId: 45,
        changedBy: "Carlos Silva",
        changeType: "created",
        fieldName: null,
        oldValue: null, 
        newValue: null,
        description: "Dashboard criado",
        changedAt: new Date(Date.now() - 86400000)
      },
      {
        id: 2,
        productId: 45,
        changedBy: "Ana Costa",
        changeType: "updated",
        fieldName: "description",
        oldValue: "Dashboard básico",
        newValue: "Dashboard executivo com KPIs financeiros em tempo real",
        description: "Descrição atualizada",
        changedAt: new Date(Date.now() - 43200000)
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
    const q = query.toLowerCase();
    return this.products.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }

  async getDataProductsByFilters(filters: { type?: string; domain?: string; status?: string }): Promise<DataProduct[]> {
    return this.products.filter(p => {
      if (filters.type && p.type !== filters.type) return false;
      if (filters.domain && p.domain !== filters.domain) return false;
      if (filters.status && p.status !== filters.status) return false;
      return true;
    });
  }

  async getStats() {
    return {
      totalProducts: this.products.length,
      activeProducts: this.products.filter(p => p.status === 'active').length,
      withContracts: this.products.filter(p => p.contractSLA).length,
      needsAttention: 0
    };
  }

  // Simplified implementations for other methods
  async createApprovalRequest(): Promise<ApprovalRequest> { throw new Error("Not implemented"); }
  async getAllApprovalRequests(): Promise<ApprovalRequest[]> { return []; }
  async getApprovalRequest(): Promise<ApprovalRequest | undefined> { return undefined; }
  async updateApprovalRequestStatus(): Promise<ApprovalRequest | undefined> { return undefined; }
  async getPendingApprovalRequests(): Promise<ApprovalRequest[]> { return []; }
  async getApprovalRequestsByStatus(): Promise<ApprovalRequest[]> { return []; }
  
  async getProductLineage(): Promise<DataLineage[]> { return []; }
  async createDataLineage(): Promise<DataLineage> { throw new Error("Not implemented"); }
  
  async getProductDependencies(): Promise<ProductDependency[]> { return []; }
  async createProductDependency(): Promise<ProductDependency> { throw new Error("Not implemented"); }
  
  async getUserFavorites(userEmail: string): Promise<UserFavorite[]> {
    return this.favorites.filter(f => f.userEmail === userEmail);
  }

  async addToFavorites(userEmail: string, productId: number): Promise<UserFavorite> {
    const favorite: UserFavorite = {
      id: Date.now(),
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

  async getProductChanges(productId: number): Promise<ProductChange[]> {
    return this.changes.filter(c => c.productId === productId);
  }

  async getAllRecentChanges(limit: number = 50): Promise<(ProductChange & { productName: string })[]> {
    return this.changes.map(change => {
      const product = this.products.find(p => p.id === change.productId);
      return { ...change, productName: product?.name || 'Unknown' };
    }).slice(0, limit);
  }

  async createProductChange(change: InsertProductChange): Promise<ProductChange> {
    const newChange: ProductChange = {
      id: Date.now(),
      productId: change.productId,
      changedBy: change.changedBy,
      changeType: change.changeType,
      fieldName: change.fieldName || null,
      oldValue: change.oldValue || null,
      newValue: change.newValue || null,
      description: change.description || null,
      changedAt: new Date()
    };
    this.changes.push(newChange);
    return newChange;
  }
}

export const storage = new SimpleStorage();