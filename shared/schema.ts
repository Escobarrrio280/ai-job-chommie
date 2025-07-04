import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
  decimal,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Business profiles for tender matching
export const businessProfiles = pgTable("business_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  businessName: varchar("business_name").notNull(),
  registrationNumber: varchar("registration_number"),
  cidbGrading: varchar("cidb_grading"), // e.g., "Grade 8", "Grade 9"
  bbbeeLevel: varchar("bbbee_level"), // e.g., "Level 1", "Level 2"
  industryCategories: text("industry_categories").array(), // e.g., ["Construction", "IT Services"]
  preferredValueMin: decimal("preferred_value_min"),
  preferredValueMax: decimal("preferred_value_max"),
  provinces: text("provinces").array(), // e.g., ["Gauteng", "Western Cape"]
  phoneNumber: varchar("phone_number"),
  isVerified: boolean("is_verified").default(false),
  language: varchar("language").default("en"), // en, af, zu, xh, nso
  emailNotifications: boolean("email_notifications").default(true),
  smsNotifications: boolean("sms_notifications").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tender data from eTenders Portal
export const tenders = pgTable("tenders", {
  id: serial("id").primaryKey(),
  ocid: varchar("ocid").unique(), // Open Contracting ID from eTenders
  title: text("title").notNull(),
  description: text("description"),
  department: varchar("department"),
  category: varchar("category"),
  province: varchar("province"),
  valueMin: decimal("value_min"),
  valueMax: decimal("value_max"),
  closingDate: timestamp("closing_date"),
  advertisedDate: timestamp("advertised_date"),
  status: varchar("status"), // "active", "closed", "awarded", "cancelled"
  requirements: text("requirements").array(), // OCR extracted requirements
  documentUrl: varchar("document_url"),
  contactDetails: jsonb("contact_details"),
  cidbRequired: varchar("cidb_required"),
  bbbeeRequired: varchar("bbbee_required"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User tender matches with scoring
export const tenderMatches = pgTable("tender_matches", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  tenderId: integer("tender_id").references(() => tenders.id).notNull(),
  matchScore: integer("match_score"), // 0-100 percentage
  matchReasons: text("match_reasons").array(), // reasons for the match
  isViewed: boolean("is_viewed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved tenders
export const savedTenders = pgTable("saved_tenders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  tenderId: integer("tender_id").references(() => tenders.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notification history
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // "email", "sms"
  subject: varchar("subject"),
  message: text("message").notNull(),
  recipient: varchar("recipient"), // email or phone number
  status: varchar("status").default("pending"), // "pending", "sent", "failed"
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  businessProfile: one(businessProfiles, {
    fields: [users.id],
    references: [businessProfiles.userId],
  }),
  tenderMatches: many(tenderMatches),
  savedTenders: many(savedTenders),
  notifications: many(notifications),
}));

export const businessProfilesRelations = relations(businessProfiles, ({ one }) => ({
  user: one(users, {
    fields: [businessProfiles.userId],
    references: [users.id],
  }),
}));

export const tendersRelations = relations(tenders, ({ many }) => ({
  matches: many(tenderMatches),
  savedBy: many(savedTenders),
}));

export const tenderMatchesRelations = relations(tenderMatches, ({ one }) => ({
  user: one(users, {
    fields: [tenderMatches.userId],
    references: [users.id],
  }),
  tender: one(tenders, {
    fields: [tenderMatches.tenderId],
    references: [tenders.id],
  }),
}));

export const savedTendersRelations = relations(savedTenders, ({ one }) => ({
  user: one(users, {
    fields: [savedTenders.userId],
    references: [users.id],
  }),
  tender: one(tenders, {
    fields: [savedTenders.tenderId],
    references: [tenders.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertBusinessProfileSchema = createInsertSchema(businessProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTenderSchema = createInsertSchema(tenders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTenderMatchSchema = createInsertSchema(tenderMatches).omit({
  id: true,
  createdAt: true,
});

export const insertSavedTenderSchema = createInsertSchema(savedTenders).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertBusinessProfile = z.infer<typeof insertBusinessProfileSchema>;
export type BusinessProfile = typeof businessProfiles.$inferSelect;
export type InsertTender = z.infer<typeof insertTenderSchema>;
export type Tender = typeof tenders.$inferSelect;
export type InsertTenderMatch = z.infer<typeof insertTenderMatchSchema>;
export type TenderMatch = typeof tenderMatches.$inferSelect;
export type InsertSavedTender = z.infer<typeof insertSavedTenderSchema>;
export type SavedTender = typeof savedTenders.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
