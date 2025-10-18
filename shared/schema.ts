import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Traffic classification types
export type TrafficClassification = "HUMAN" | "SUSPICIOUS" | "KNOWN_CRAWLER" | "BLOCKED";
export type TrafficAction = "ALLOW" | "CHALLENGE" | "BLOCK" | "REDIRECT";

// Traffic logs table
export const trafficLogs = pgTable("traffic_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  ip: text("ip").notNull(),
  userAgent: text("user_agent").notNull(),
  country: text("country"),
  classification: text("classification").notNull().$type<TrafficClassification>(),
  score: integer("score").notNull(),
  action: text("action").notNull().$type<TrafficAction>(),
  referer: text("referer"),
  utmParams: jsonb("utm_params").$type<Record<string, string>>(),
  fingerprint: text("fingerprint"),
  detectionReasons: jsonb("detection_reasons").$type<string[]>(),
  challengePassed: integer("challenge_passed").$type<0 | 1>(),
});

// Preview tokens table
export const previewTokens = pgTable("preview_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  token: text("token").notNull().unique(),
  description: text("description").notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  usageCount: integer("usage_count").notNull().default(0),
  isActive: integer("is_active").notNull().default(1).$type<0 | 1>(),
});

// Rules table (whitelist/blacklist)
export const rules = pgTable("rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull().$type<"whitelist_ip" | "blacklist_ip" | "whitelist_ua" | "blacklist_ua">(),
  pattern: text("pattern").notNull(),
  action: text("action").notNull().$type<TrafficAction>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isActive: integer("is_active").notNull().default(1).$type<0 | 1>(),
});

// Settings table
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert schemas
export const insertTrafficLogSchema = createInsertSchema(trafficLogs).omit({
  id: true,
  timestamp: true,
});

export const insertPreviewTokenSchema = createInsertSchema(previewTokens).omit({
  id: true,
  createdAt: true,
  usageCount: true,
}).extend({
  expiresAt: z.string().optional(),
});

export const insertRuleSchema = createInsertSchema(rules).omit({
  id: true,
  createdAt: true,
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type TrafficLog = typeof trafficLogs.$inferSelect;
export type InsertTrafficLog = z.infer<typeof insertTrafficLogSchema>;

export type PreviewToken = typeof previewTokens.$inferSelect;
export type InsertPreviewToken = z.infer<typeof insertPreviewTokenSchema>;

export type Rule = typeof rules.$inferSelect;
export type InsertRule = z.infer<typeof insertRuleSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

// Statistics type for dashboard
export type TrafficStats = {
  total: number;
  human: number;
  suspicious: number;
  blocked: number;
  crawler: number;
  humanPercentage: number;
  suspiciousPercentage: number;
  blockedPercentage: number;
  crawlerPercentage: number;
};

// Chart data type
export type ChartDataPoint = {
  timestamp: string;
  human: number;
  suspicious: number;
  blocked: number;
  crawler: number;
};

// Audit report type
export type AuditReport = {
  startDate: string;
  endDate: string;
  totalRequests: number;
  classifications: {
    human: number;
    suspicious: number;
    blocked: number;
    crawler: number;
  };
  actions: {
    allow: number;
    challenge: number;
    block: number;
    redirect: number;
  };
  topIPs: Array<{ ip: string; count: number; classification: TrafficClassification }>;
  topUserAgents: Array<{ userAgent: string; count: number }>;
  challengeSuccessRate: number;
};
