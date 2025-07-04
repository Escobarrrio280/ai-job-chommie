import {
  users,
  businessProfiles,
  tenders,
  tenderMatches,
  savedTenders,
  notifications,
  type User,
  type UpsertUser,
  type BusinessProfile,
  type InsertBusinessProfile,
  type Tender,
  type InsertTender,
  type TenderMatch,
  type InsertTenderMatch,
  type SavedTender,
  type InsertSavedTender,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, ilike, inArray, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Business profile operations
  getBusinessProfile(userId: string): Promise<BusinessProfile | undefined>;
  createBusinessProfile(profile: InsertBusinessProfile): Promise<BusinessProfile>;
  updateBusinessProfile(userId: string, profile: Partial<InsertBusinessProfile>): Promise<BusinessProfile>;
  
  // Tender operations
  getTenders(filters: {
    category?: string;
    province?: string;
    valueMin?: number;
    valueMax?: number;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Tender[]>;
  getTender(id: number): Promise<Tender | undefined>;
  createTender(tender: InsertTender): Promise<Tender>;
  updateTender(id: number, tender: Partial<InsertTender>): Promise<Tender>;
  
  // Tender matching operations
  getTenderMatches(userId: string, limit?: number): Promise<(TenderMatch & { tender: Tender })[]>;
  createTenderMatch(match: InsertTenderMatch): Promise<TenderMatch>;
  markMatchAsViewed(userId: string, tenderId: number): Promise<void>;
  
  // Saved tenders operations
  getSavedTenders(userId: string): Promise<(SavedTender & { tender: Tender })[]>;
  saveTender(userId: string, tenderId: number): Promise<SavedTender>;
  unsaveTender(userId: string, tenderId: number): Promise<void>;
  isTenderSaved(userId: string, tenderId: number): Promise<boolean>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(userId: string, limit?: number): Promise<Notification[]>;
  updateNotificationStatus(id: number, status: string, sentAt?: Date): Promise<void>;
  
  // Statistics
  getStats(userId?: string): Promise<{
    activeTenders: number;
    matchingTenders: number;
    savedTenders: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Business profile operations
  async getBusinessProfile(userId: string): Promise<BusinessProfile | undefined> {
    const [profile] = await db
      .select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, userId));
    return profile;
  }

  async createBusinessProfile(profile: InsertBusinessProfile): Promise<BusinessProfile> {
    const [newProfile] = await db
      .insert(businessProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateBusinessProfile(userId: string, profile: Partial<InsertBusinessProfile>): Promise<BusinessProfile> {
    const [updatedProfile] = await db
      .update(businessProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(businessProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  // Tender operations
  async getTenders(filters: {
    category?: string;
    province?: string;
    valueMin?: number;
    valueMax?: number;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Tender[]> {
    let query = db.select().from(tenders);
    
    const conditions = [];
    
    if (filters.category) {
      conditions.push(eq(tenders.category, filters.category));
    }
    
    if (filters.province) {
      conditions.push(eq(tenders.province, filters.province));
    }
    
    if (filters.valueMin) {
      conditions.push(gte(tenders.valueMin, filters.valueMin.toString()));
    }
    
    if (filters.valueMax) {
      conditions.push(lte(tenders.valueMax, filters.valueMax.toString()));
    }
    
    if (filters.status) {
      conditions.push(eq(tenders.status, filters.status));
    } else {
      conditions.push(eq(tenders.isActive, true));
    }
    
    if (filters.search) {
      conditions.push(
        sql`(${tenders.title} ILIKE ${`%${filters.search}%`} OR ${tenders.description} ILIKE ${`%${filters.search}%`})`
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    query = query.orderBy(desc(tenders.advertisedDate));
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.offset(filters.offset);
    }
    
    return await query;
  }

  async getTender(id: number): Promise<Tender | undefined> {
    const [tender] = await db.select().from(tenders).where(eq(tenders.id, id));
    return tender;
  }

  async createTender(tender: InsertTender): Promise<Tender> {
    const [newTender] = await db.insert(tenders).values(tender).returning();
    return newTender;
  }

  async updateTender(id: number, tender: Partial<InsertTender>): Promise<Tender> {
    const [updatedTender] = await db
      .update(tenders)
      .set({ ...tender, updatedAt: new Date() })
      .where(eq(tenders.id, id))
      .returning();
    return updatedTender;
  }

  // Tender matching operations
  async getTenderMatches(userId: string, limit = 50): Promise<(TenderMatch & { tender: Tender })[]> {
    return await db
      .select({
        id: tenderMatches.id,
        userId: tenderMatches.userId,
        tenderId: tenderMatches.tenderId,
        matchScore: tenderMatches.matchScore,
        matchReasons: tenderMatches.matchReasons,
        isViewed: tenderMatches.isViewed,
        createdAt: tenderMatches.createdAt,
        tender: tenders,
      })
      .from(tenderMatches)
      .innerJoin(tenders, eq(tenderMatches.tenderId, tenders.id))
      .where(and(
        eq(tenderMatches.userId, userId),
        eq(tenders.isActive, true)
      ))
      .orderBy(desc(tenderMatches.matchScore), desc(tenderMatches.createdAt))
      .limit(limit);
  }

  async createTenderMatch(match: InsertTenderMatch): Promise<TenderMatch> {
    const [newMatch] = await db.insert(tenderMatches).values(match).returning();
    return newMatch;
  }

  async markMatchAsViewed(userId: string, tenderId: number): Promise<void> {
    await db
      .update(tenderMatches)
      .set({ isViewed: true })
      .where(and(
        eq(tenderMatches.userId, userId),
        eq(tenderMatches.tenderId, tenderId)
      ));
  }

  // Saved tenders operations
  async getSavedTenders(userId: string): Promise<(SavedTender & { tender: Tender })[]> {
    return await db
      .select({
        id: savedTenders.id,
        userId: savedTenders.userId,
        tenderId: savedTenders.tenderId,
        createdAt: savedTenders.createdAt,
        tender: tenders,
      })
      .from(savedTenders)
      .innerJoin(tenders, eq(savedTenders.tenderId, tenders.id))
      .where(eq(savedTenders.userId, userId))
      .orderBy(desc(savedTenders.createdAt));
  }

  async saveTender(userId: string, tenderId: number): Promise<SavedTender> {
    const [saved] = await db
      .insert(savedTenders)
      .values({ userId, tenderId })
      .returning();
    return saved;
  }

  async unsaveTender(userId: string, tenderId: number): Promise<void> {
    await db
      .delete(savedTenders)
      .where(and(
        eq(savedTenders.userId, userId),
        eq(savedTenders.tenderId, tenderId)
      ));
  }

  async isTenderSaved(userId: string, tenderId: number): Promise<boolean> {
    const [saved] = await db
      .select()
      .from(savedTenders)
      .where(and(
        eq(savedTenders.userId, userId),
        eq(savedTenders.tenderId, tenderId)
      ));
    return !!saved;
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async getNotifications(userId: string, limit = 50): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async updateNotificationStatus(id: number, status: string, sentAt?: Date): Promise<void> {
    await db
      .update(notifications)
      .set({ status, sentAt })
      .where(eq(notifications.id, id));
  }

  // Statistics
  async getStats(userId?: string): Promise<{
    activeTenders: number;
    matchingTenders: number;
    savedTenders: number;
  }> {
    const [activeTendersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tenders)
      .where(and(eq(tenders.isActive, true), eq(tenders.status, 'active')));

    let matchingTenders = 0;
    let savedTendersCount = 0;

    if (userId) {
      const [matchingResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(tenderMatches)
        .innerJoin(tenders, eq(tenderMatches.tenderId, tenders.id))
        .where(and(
          eq(tenderMatches.userId, userId),
          eq(tenders.isActive, true)
        ));

      const [savedResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(savedTenders)
        .where(eq(savedTenders.userId, userId));

      matchingTenders = matchingResult.count;
      savedTendersCount = savedResult.count;
    }

    return {
      activeTenders: activeTendersResult.count,
      matchingTenders,
      savedTenders: savedTendersCount,
    };
  }
}

export const storage = new DatabaseStorage();
