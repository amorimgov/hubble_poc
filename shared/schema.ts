import { pgTable, text, serial, integer, boolean, timestamp, json, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const dataProducts = pgTable("data_products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // dashboard_selfservice, api_outputs, insights, ai_agents, recommendation_system, genai_chat, genai_workflow, traditional_ai, genie_spaces
  domain: text("domain").notNull(), // sales, marketing, finance, hr, operations, customer_service, product
  status: text("status").notNull(), // active, deprecated, development, experimentacao
  owner: text("owner").notNull(),
  ownerInitials: text("owner_initials").notNull(),
  tags: text("tags").array().notNull().default([]),
  metadata: json("metadata"), // type-specific metadata like columns, version, etc.
  contractSLA: text("contract_sla"),
  qualityMetrics: json("quality_metrics"),
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
  upstreamSources: json("upstream_sources").$type<string[]>().default([]),
  downstreamTargets: json("downstream_targets").$type<string[]>().default([]),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Lineage tracking
export const dataLineage = pgTable("data_lineage", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => dataProducts.id).notNull(),
  sourceType: text("source_type").notNull(), // table, model, api, file
  sourceName: text("source_name").notNull(),
  sourceDescription: text("source_description"),
  transformations: text("transformations").array().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Product dependencies (tables/models)
export const productDependencies = pgTable("product_dependencies", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => dataProducts.id).notNull(),
  dependencyType: text("dependency_type").notNull(), // table, model, dataset
  dependencyName: text("dependency_name").notNull(),
  dependencySchema: text("dependency_schema"),
  description: text("description"),
  isRequired: boolean("is_required").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
export const approvalRequests = pgTable("approval_requests", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => dataProducts.id),
  requestType: text("request_type").notNull(), // "create", "update", "delete"
  requestedBy: text("requested_by").notNull(),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected"
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  proposedChanges: json("proposed_changes").notNull(),
  currentData: json("current_data"),
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
export const userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  userEmail: text("user_email").notNull(),
  productId: integer("product_id").notNull().references(() => dataProducts.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
  createdAt: true,
});

export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
export type UserFavorite = typeof userFavorites.$inferSelect;

// Product Change Log
export const productChanges = pgTable("product_changes", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => dataProducts.id),
  changedBy: text("changed_by").notNull(),
  changeType: text("change_type").notNull(), // created, updated, status_changed
  fieldName: text("field_name"), // which field was changed
  oldValue: text("old_value"), // previous value
  newValue: text("new_value"), // new value
  description: text("description"), // human readable description
  changedAt: timestamp("changed_at").defaultNow().notNull(),
});

export const insertProductChangeSchema = createInsertSchema(productChanges).omit({
  id: true,
  changedAt: true,
});

export type InsertProductChange = z.infer<typeof insertProductChangeSchema>;
export type ProductChange = typeof productChanges.$inferSelect;
