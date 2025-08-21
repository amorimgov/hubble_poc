import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDataProductSchema, insertApprovalRequestSchema, ProductType, ProductDomain, ProductStatus } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all data products
  app.get("/api/data-products", async (req, res) => {
    try {
      const { search, type, domain, status } = req.query;
      
      let products = await storage.getAllDataProducts();
      
      // Apply search filter if provided
      if (search && typeof search === "string" && search.trim()) {
        const searchQuery = search.toLowerCase().trim();
        products = products.filter(product =>
          product.name.toLowerCase().includes(searchQuery) ||
          product.description.toLowerCase().includes(searchQuery) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchQuery)) ||
          product.owner.toLowerCase().includes(searchQuery)
        );
      }
      
      // Apply type filter if provided
      if (type && typeof type === "string" && type.trim() && type !== "all") {
        products = products.filter(product => product.type === type);
      }
      
      // Apply domain filter if provided
      if (domain && typeof domain === "string" && domain.trim() && domain !== "all") {
        products = products.filter(product => product.domain === domain);
      }
      
      // Apply status filter if provided
      if (status && typeof status === "string" && status.trim() && status !== "all") {
        products = products.filter(product => product.status === status);
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch data products" });
    }
  });

  // Get single data product
  app.get("/api/data-products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getDataProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Data product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch data product" });
    }
  });

  // Create new data product
  app.post("/api/data-products", async (req, res) => {
    try {
      const validatedData = insertDataProductSchema.parse(req.body);
      const product = await storage.createDataProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create data product" });
    }
  });

  // Update data product
  app.put("/api/data-products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDataProductSchema.partial().parse(req.body);
      const product = await storage.updateDataProduct(id, validatedData);
      
      if (!product) {
        return res.status(404).json({ message: "Data product not found" });
      }
      
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update data product" });
    }
  });

  // Delete data product
  app.delete("/api/data-products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDataProduct(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Data product not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete data product" });
    }
  });

  // Get catalog stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Approval System Routes
  
  // Get all approval requests
  app.get("/api/approval-requests", async (req, res) => {
    try {
      const { status } = req.query;
      let requests;
      
      if (status && typeof status === "string") {
        requests = await storage.getApprovalRequestsByStatus(status);
      } else {
        requests = await storage.getAllApprovalRequests();
      }
      
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch approval requests" });
    }
  });

  // Get pending approval requests
  app.get("/api/approval-requests/pending", async (req, res) => {
    try {
      const requests = await storage.getPendingApprovalRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending approval requests" });
    }
  });

  // Create approval request
  app.post("/api/approval-requests", async (req, res) => {
    try {
      const validation = insertApprovalRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid approval request data", errors: validation.error.issues });
      }

      const request = await storage.createApprovalRequest(validation.data);
      res.status(201).json(request);
    } catch (error) {
      res.status(500).json({ message: "Failed to create approval request" });
    }
  });

  // Update approval request status (approve/reject)
  app.patch("/api/approval-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, approvedBy, rejectionReason } = req.body;

      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const request = await storage.updateApprovalRequestStatus(id, status, approvedBy, rejectionReason);
      
      if (!request) {
        return res.status(404).json({ message: "Approval request not found" });
      }

      // If approved, apply the changes to the actual product
      if (status === "approved" && request.requestType === "create") {
        await storage.createDataProduct(request.proposedChanges as any);
      } else if (status === "approved" && request.requestType === "update" && request.productId) {
        await storage.updateDataProduct(request.productId, request.proposedChanges as any);
      } else if (status === "approved" && request.requestType === "delete" && request.productId) {
        await storage.deleteDataProduct(request.productId);
      }

      res.json(request);
    } catch (error) {
      res.status(500).json({ message: "Failed to update approval request" });
    }
  });

  const httpServer = createServer(app);
  // Get lineage for a specific product
  app.get("/api/data-lineage/:productId", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const lineage = await storage.getProductLineage(productId);
      res.json(lineage);
    } catch (error) {
      console.error("Error fetching lineage:", error);
      res.status(500).json({ message: "Failed to fetch lineage" });
    }
  });

  // Get dependencies for a specific product
  app.get("/api/product-dependencies/:productId", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const dependencies = await storage.getProductDependencies(productId);
      res.json(dependencies);
    } catch (error) {
      console.error("Error fetching dependencies:", error);
      res.status(500).json({ message: "Failed to fetch dependencies" });
    }
  });

  // Favorites routes
  app.get("/api/favorites/:userEmail", async (req, res) => {
    try {
      const userEmail = req.params.userEmail;
      const favorites = await storage.getUserFavorites(userEmail);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const { userEmail, productId } = req.body;
      const favorite = await storage.addToFavorites(userEmail, productId);
      res.json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:userEmail/:productId", async (req, res) => {
    try {
      const userEmail = req.params.userEmail;
      const productId = parseInt(req.params.productId);
      const success = await storage.removeFromFavorites(userEmail, productId);
      res.json({ success });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  app.get("/api/favorites/:userEmail/:productId/check", async (req, res) => {
    try {
      const userEmail = req.params.userEmail;
      const productId = parseInt(req.params.productId);
      const isFavorited = await storage.isProductFavorited(userEmail, productId);
      res.json({ isFavorited });
    } catch (error) {
      console.error("Error checking favorite status:", error);
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  // Product changelog routes
  app.get("/api/product-changes/:productId", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const changes = await storage.getProductChanges(productId);
      res.json(changes);
    } catch (error) {
      console.error("Error fetching product changes:", error);
      res.status(500).json({ message: "Failed to fetch product changes" });
    }
  });

  app.get("/api/recent-changes", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const changes = await storage.getAllRecentChanges(limit);
      res.json(changes);
    } catch (error) {
      console.error("Error fetching recent changes:", error);
      res.status(500).json({ message: "Failed to fetch recent changes" });
    }
  });

  // Force regenerate changelog data (for development)
  app.post("/api/seed-changelog", async (req, res) => {
    try {
      await storage.seedDatabase();
      res.json({ message: "Changelog data regenerated successfully" });
    } catch (error) {
      console.error("Error regenerating changelog data:", error);
      res.status(500).json({ message: "Failed to regenerate changelog data" });
    }
  });

  // Changelog routes
  // Get changes for a specific product
  app.get("/api/product-changes/:productId", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const changes = await storage.getProductChanges(productId);
      res.json(changes);
    } catch (error) {
      console.error("Error fetching product changes:", error);
      res.status(500).json({ message: "Failed to fetch product changes" });
    }
  });

  // Get all recent changes
  app.get("/api/recent-changes", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const changes = await storage.getAllRecentChanges(limit);
      res.json(changes);
    } catch (error) {
      console.error("Error fetching recent changes:", error);
      res.status(500).json({ message: "Failed to fetch recent changes" });
    }
  });

  return httpServer;
}
