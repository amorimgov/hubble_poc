import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const dataProducts = sqliteTable("data_products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // dashboard_selfservice, api_outputs, insights, ai_agents, recommendation_system, genai_chat, genai_workflow, traditional_ai, genie_spaces
  domain: text("domain").notNull(), // sales, marketing, finance, hr, operations, customer_service, product
  status: text("status").notNull(), // active, deprecated, development, experimentacao
  owner: text("owner").notNull(),
  ownerInitials: text("owner_initials").notNull(),
  tags: text("tags").notNull().default("[]"), // JSON string for array
  metadata: text("metadata"), // JSON string for type-specific metadata like columns, version, etc.
  contractSLA: text("contract_sla"),
  qualityMetrics: text("quality_metrics"), // JSON string
  // Enhanced fields
  technicalContact: text("technical_contact"),
  businessContact: text("business_contact"),
  dataSource: text("data_source"),
  updateFrequency: text("update_frequency"), // real-time, daily, weekly, monthly
  apiEndpoint: text("api_endpoint"),
  documentationUrl: text("documentation_url"),
  documentationContent: text("documentation_content"), // markdown content
  modelType: text("model_type"), // for AI products: LLM, traditional ML, recommendation engine, etc.
  confidenceLevel: text("confidence_level"), // high, medium, low
  complianceLevel: text("compliance_level"), // LGPD, SOX, PCI, etc.
  upstreamSources: text("upstream_sources").notNull().default("[]"), // JSON string for array
  downstreamTargets: text("downstream_targets").notNull().default("[]"), // JSON string for array
  lastUpdated: integer("last_updated", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Lineage tracking
export const dataLineage = sqliteTable("data_lineage", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull().references(() => dataProducts.id),
  sourceType: text("source_type").notNull(), // table, model, api, file
  sourceName: text("source_name").notNull(),
  sourceDescription: text("source_description"),
  transformations: text("transformations").notNull().default("[]"), // JSON string for array
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Product dependencies (tables/models)
export const productDependencies = sqliteTable("product_dependencies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull().references(() => dataProducts.id),
  dependencyType: text("dependency_type").notNull(), // table, model, dataset
  dependencyName: text("dependency_name").notNull(),
  dependencySchema: text("dependency_schema"),
  description: text("description"),
  isRequired: integer("is_required", { mode: 'boolean' }).notNull().default(true),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const insertDataProductSchema = createInsertSchema(dataProducts).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export type InsertDataProduct = z.infer<typeof insertDataProductSchema>;
export type DataProduct = typeof dataProducts.$inferSelect;

// Enums for validation
export const ProductType = z.enum([
  "dashboard_selfservice", 
  "api_outputs", 
  "insights", 
  "ai_agents",
  "recommendation_system",
  "genai_chat",
  "genai_workflow", 
  "traditional_ai",
  "genie_spaces"
]);
export const ProductDomain = z.enum(["sales", "marketing", "finance", "hr", "operations", "customer_service", "product"]);
export const ProductStatus = z.enum(["active", "deprecated", "development", "experimentacao"]);

// Approval System Schema
export const approvalRequests = sqliteTable("approval_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").references(() => dataProducts.id),
  requestType: text("request_type").notNull(), // "create", "update", "delete"
  requestedBy: text("requested_by").notNull(),
  requestedAt: integer("requested_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected"
  approvedBy: text("approved_by"),
  approvedAt: integer("approved_at", { mode: 'timestamp' }),
  rejectionReason: text("rejection_reason"),
  proposedChanges: text("proposed_changes").notNull(), // JSON string
  currentData: text("current_data"), // JSON string
});

export const insertApprovalRequestSchema = createInsertSchema(approvalRequests).omit({
  id: true,
  requestedAt: true,
  approvedAt: true,
});

export type InsertApprovalRequest = z.infer<typeof insertApprovalRequestSchema>;
export type ApprovalRequest = typeof approvalRequests.$inferSelect;

// Lineage schemas
export const insertDataLineageSchema = createInsertSchema(dataLineage).omit({
  id: true,
  createdAt: true,
});

export type InsertDataLineage = z.infer<typeof insertDataLineageSchema>;
export type DataLineage = typeof dataLineage.$inferSelect;

// Dependencies schemas
export const insertProductDependencySchema = createInsertSchema(productDependencies).omit({
  id: true,
  createdAt: true,
});

export type InsertProductDependency = z.infer<typeof insertProductDependencySchema>;
export type ProductDependency = typeof productDependencies.$inferSelect;

// User Favorites Table
export const userFavorites = sqliteTable("user_favorites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userEmail: text("user_email").notNull(),
  productId: integer("product_id").notNull().references(() => dataProducts.id),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
  createdAt: true,
});

export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
export type UserFavorite = typeof userFavorites.$inferSelect;

// Product Change Log
export const productChanges = sqliteTable("product_changes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull().references(() => dataProducts.id),
  changedBy: text("changed_by").notNull(),
  changeType: text("change_type").notNull(), // created, updated, status_changed
  fieldName: text("field_name"), // which field was changed
  oldValue: text("old_value"), // previous value
  newValue: text("new_value"), // new value
  description: text("description"), // human readable description
  changedAt: integer("changed_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const insertProductChangeSchema = createInsertSchema(productChanges).omit({
  id: true,
  changedAt: true,
});

export type InsertProductChange = z.infer<typeof insertProductChangeSchema>;
export type ProductChange = typeof productChanges.$inferSelect;
