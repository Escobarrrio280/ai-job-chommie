import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { tenderService } from "./services/tenderService";
import { notificationService } from "./services/notificationService";
import { matchingService } from "./services/matchingService";
import { insertBusinessProfileSchema, insertTenderSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not found" });
      }
      const user = await storage.getUser(userId);
      const businessProfile = await storage.getBusinessProfile(userId);
      
      res.json({
        ...user,
        businessProfile,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Business profile routes
  app.post('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertBusinessProfileSchema.parse({
        ...req.body,
        userId,
      });
      
      const existingProfile = await storage.getBusinessProfile(userId);
      
      let profile;
      if (existingProfile) {
        profile = await storage.updateBusinessProfile(userId, profileData);
      } else {
        profile = await storage.createBusinessProfile(profileData);
      }
      
      // Trigger matching for new/updated profile
      await matchingService.findMatches(userId);
      
      res.json(profile);
    } catch (error) {
      console.error("Error saving profile:", error);
      res.status(500).json({ message: "Failed to save profile" });
    }
  });

  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getBusinessProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Tender routes
  app.get('/api/tenders', async (req, res) => {
    try {
      const {
        category,
        province,
        valueMin,
        valueMax,
        status = 'active',
        search,
        limit = 20,
        offset = 0,
      } = req.query;

      const filters = {
        category: category as string,
        province: province as string,
        valueMin: valueMin ? parseFloat(valueMin as string) : undefined,
        valueMax: valueMax ? parseFloat(valueMax as string) : undefined,
        status: status as string,
        search: search as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      };

      const tenders = await storage.getTenders(filters);
      res.json(tenders);
    } catch (error) {
      console.error("Error fetching tenders:", error);
      res.status(500).json({ message: "Failed to fetch tenders" });
    }
  });

  app.get('/api/tenders/:id', async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      const tender = await storage.getTender(tenderId);
      
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      
      res.json(tender);
    } catch (error) {
      console.error("Error fetching tender:", error);
      res.status(500).json({ message: "Failed to fetch tender" });
    }
  });

  // Tender matching routes
  app.get('/api/matches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const matches = await storage.getTenderMatches(userId, limit);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  app.post('/api/matches/:tenderId/view', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tenderId = parseInt(req.params.tenderId);
      
      await storage.markMatchAsViewed(userId, tenderId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking match as viewed:", error);
      res.status(500).json({ message: "Failed to mark match as viewed" });
    }
  });

  // Saved tenders routes
  app.get('/api/saved', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const savedTenders = await storage.getSavedTenders(userId);
      res.json(savedTenders);
    } catch (error) {
      console.error("Error fetching saved tenders:", error);
      res.status(500).json({ message: "Failed to fetch saved tenders" });
    }
  });

  app.post('/api/saved/:tenderId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tenderId = parseInt(req.params.tenderId);
      
      const saved = await storage.saveTender(userId, tenderId);
      res.json(saved);
    } catch (error) {
      console.error("Error saving tender:", error);
      res.status(500).json({ message: "Failed to save tender" });
    }
  });

  app.delete('/api/saved/:tenderId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tenderId = parseInt(req.params.tenderId);
      
      await storage.unsaveTender(userId, tenderId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unsaving tender:", error);
      res.status(500).json({ message: "Failed to unsave tender" });
    }
  });

  app.get('/api/saved/:tenderId/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tenderId = parseInt(req.params.tenderId);
      
      const isSaved = await storage.isTenderSaved(userId, tenderId);
      res.json({ isSaved });
    } catch (error) {
      console.error("Error checking saved status:", error);
      res.status(500).json({ message: "Failed to check saved status" });
    }
  });

  // Statistics route
  app.get('/api/stats', async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const stats = await storage.getStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const notifications = await storage.getNotifications(userId, limit);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Sync tenders from eTenders Portal
  app.post('/api/sync-tenders', async (req, res) => {
    try {
      await tenderService.syncTenders();
      res.json({ message: "Tender sync initiated" });
    } catch (error) {
      console.error("Error syncing tenders:", error);
      res.status(500).json({ message: "Failed to sync tenders" });
    }
  });

  // Trigger matching for all users
  app.post('/api/trigger-matching', async (req, res) => {
    try {
      await matchingService.runMatchingForAllUsers();
      res.json({ message: "Matching process initiated" });
    } catch (error) {
      console.error("Error triggering matching:", error);
      res.status(500).json({ message: "Failed to trigger matching" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
