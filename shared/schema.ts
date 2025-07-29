import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  companyName: text("company_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  uploadId: varchar("upload_id").notNull().references(() => uploads.id),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  category: text("category"),
  scope: integer("scope"), // 1, 2, or 3
  emissionsFactor: decimal("emissions_factor", { precision: 10, scale: 6 }),
  co2Emissions: decimal("co2_emissions", { precision: 10, scale: 3 }),
  aiClassified: boolean("ai_classified").default(false),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const uploads = pgTable("uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  filename: text("filename").notNull(),
  fileSize: integer("file_size").notNull(),
  status: text("status").notNull().default("processing"), // processing, completed, failed
  processedRows: integer("processed_rows").default(0),
  totalRows: integer("total_rows").default(0),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  period: text("period").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalEmissions: decimal("total_emissions", { precision: 10, scale: 3 }).notNull(),
  scope1Emissions: decimal("scope1_emissions", { precision: 10, scale: 3 }).notNull(),
  scope2Emissions: decimal("scope2_emissions", { precision: 10, scale: 3 }).notNull(),
  scope3Emissions: decimal("scope3_emissions", { precision: 10, scale: 3 }).notNull(),
  status: text("status").notNull().default("generating"), // generating, completed, failed
  pdfPath: text("pdf_path"),
  xbrlPath: text("xbrl_path"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emissionFactors = pgTable("emission_factors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  scope: integer("scope").notNull(),
  factor: decimal("factor", { precision: 10, scale: 6 }).notNull(),
  unit: text("unit").notNull(), // kg CO2e per unit
  source: text("source").notNull(), // DEFRA, Climatiq, etc.
  year: integer("year").notNull(),
  description: text("description"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  uploads: many(uploads),
  reports: many(reports),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  upload: one(uploads, {
    fields: [transactions.uploadId],
    references: [uploads.id],
  }),
}));

export const uploadsRelations = relations(uploads, ({ one, many }) => ({
  user: one(users, {
    fields: [uploads.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  companyName: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertUploadSchema = createInsertSchema(uploads).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

export const insertEmissionFactorSchema = createInsertSchema(emissionFactors).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Upload = typeof uploads.$inferSelect;
export type InsertUpload = z.infer<typeof insertUploadSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type EmissionFactor = typeof emissionFactors.$inferSelect;
export type InsertEmissionFactor = z.infer<typeof insertEmissionFactorSchema>;
