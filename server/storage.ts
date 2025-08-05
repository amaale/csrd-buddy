import { 
  users, uploads, transactions, reports, emissionFactors,
  type User, type InsertUser, type UpsertUser, type Upload, type InsertUpload,
  type Transaction, type InsertTransaction, type Report, type InsertReport,
  type EmissionFactor, type InsertEmissionFactor
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User methods for authentication
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Upload methods
  createUpload(upload: InsertUpload): Promise<Upload>;
  getUpload(id: string): Promise<Upload | undefined>;
  updateUpload(id: string, data: Partial<Upload>): Promise<Upload>;
  getUserUploads(userId: string): Promise<Upload[]>;

  // Transaction methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  createTransactions(transactions: InsertTransaction[]): Promise<Transaction[]>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  getTransactionsByUpload(uploadId: string): Promise<Transaction[]>;
  updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction>;

  // Report methods
  createReport(report: InsertReport): Promise<Report>;
  getUserReports(userId: string): Promise<Report[]>;
  getReport(id: string): Promise<Report | undefined>;
  updateReport(id: string, data: Partial<Report>): Promise<Report>;

  // Emission factor methods
  createEmissionFactor(factor: InsertEmissionFactor): Promise<EmissionFactor>;
  getEmissionFactors(): Promise<EmissionFactor[]>;
  getEmissionFactorByCategory(category: string, subcategory?: string): Promise<EmissionFactor | undefined>;

  // Analytics methods
  getUserEmissionsSummary(userId: string, startDate?: Date, endDate?: Date): Promise<{
    totalEmissions: number;
    scope1Emissions: number;
    scope2Emissions: number;
    scope3Emissions: number;
    transactionCount: number;
  }>;
  
  getUserEmissionsTrend(userId: string, months: number): Promise<Array<{
    month: string;
    totalEmissions: number;
    scope1: number;
    scope2: number;
    scope3: number;
  }>>;
}

export class DatabaseStorage implements IStorage {
  // User operations for authentication
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
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

  async createUpload(upload: InsertUpload): Promise<Upload> {
    const [result] = await db
      .insert(uploads)
      .values(upload)
      .returning();
    return result;
  }

  async getUpload(id: string): Promise<Upload | undefined> {
    const [upload] = await db.select().from(uploads).where(eq(uploads.id, id));
    return upload || undefined;
  }

  async updateUpload(id: string, data: Partial<Upload>): Promise<Upload> {
    const [result] = await db
      .update(uploads)
      .set(data)
      .where(eq(uploads.id, id))
      .returning();
    return result;
  }

  async getUserUploads(userId: string): Promise<Upload[]> {
    return await db
      .select()
      .from(uploads)
      .where(eq(uploads.userId, userId))
      .orderBy(desc(uploads.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [result] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return result;
  }

  async createTransactions(transactionList: InsertTransaction[]): Promise<Transaction[]> {
    return await db
      .insert(transactions)
      .values(transactionList)
      .returning();
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date));
  }

  async getTransactionsByUpload(uploadId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.uploadId, uploadId))
      .orderBy(desc(transactions.date));
  }

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const [result] = await db
      .update(transactions)
      .set(data)
      .where(eq(transactions.id, id))
      .returning();
    return result;
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [result] = await db
      .insert(reports)
      .values(report)
      .returning();
    return result;
  }

  async getUserReports(userId: string): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .where(eq(reports.userId, userId))
      .orderBy(desc(reports.createdAt));
  }

  async getReport(id: string): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report || undefined;
  }

  async updateReport(id: string, data: Partial<Report>): Promise<Report> {
    const [result] = await db
      .update(reports)
      .set(data)
      .where(eq(reports.id, id))
      .returning();
    return result;
  }

  async createEmissionFactor(factor: InsertEmissionFactor): Promise<EmissionFactor> {
    const [result] = await db
      .insert(emissionFactors)
      .values(factor)
      .returning();
    return result;
  }

  async getEmissionFactors(): Promise<EmissionFactor[]> {
    return await db.select().from(emissionFactors);
  }

  async getEmissionFactorByCategory(category: string, subcategory?: string): Promise<EmissionFactor | undefined> {
    const conditions = [eq(emissionFactors.category, category)];
    if (subcategory) {
      conditions.push(eq(emissionFactors.subcategory, subcategory));
    }
    
    const [factor] = await db
      .select()
      .from(emissionFactors)
      .where(and(...conditions))
      .orderBy(desc(emissionFactors.year))
      .limit(1);
    
    return factor || undefined;
  }

  async getUserEmissionsSummary(userId: string, startDate?: Date, endDate?: Date): Promise<{
    totalEmissions: number;
    scope1Emissions: number;
    scope2Emissions: number;
    scope3Emissions: number;
    transactionCount: number;
  }> {
    const conditions = [eq(transactions.userId, userId)];
    if (startDate) conditions.push(gte(transactions.date, startDate));
    if (endDate) conditions.push(lte(transactions.date, endDate));

    const [result] = await db
      .select({
        totalEmissions: sql<number>`COALESCE(SUM(CAST(${transactions.co2Emissions} AS NUMERIC)), 0)`,
        scope1Emissions: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.scope} = 1 THEN CAST(${transactions.co2Emissions} AS NUMERIC) ELSE 0 END), 0)`,
        scope2Emissions: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.scope} = 2 THEN CAST(${transactions.co2Emissions} AS NUMERIC) ELSE 0 END), 0)`,
        scope3Emissions: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.scope} = 3 THEN CAST(${transactions.co2Emissions} AS NUMERIC) ELSE 0 END), 0)`,
        transactionCount: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(and(...conditions));

    return result;
  }

  async getUserEmissionsTrend(userId: string, months: number): Promise<Array<{
    month: string;
    totalEmissions: number;
    scope1: number;
    scope2: number;
    scope3: number;
  }>> {
    const results = await db
      .select({
        month: sql<string>`TO_CHAR(${transactions.date}, 'YYYY-MM')`,
        totalEmissions: sql<number>`COALESCE(SUM(CAST(${transactions.co2Emissions} AS NUMERIC)), 0)`,
        scope1: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.scope} = 1 THEN CAST(${transactions.co2Emissions} AS NUMERIC) ELSE 0 END), 0)`,
        scope2: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.scope} = 2 THEN CAST(${transactions.co2Emissions} AS NUMERIC) ELSE 0 END), 0)`,
        scope3: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.scope} = 3 THEN CAST(${transactions.co2Emissions} AS NUMERIC) ELSE 0 END), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          sql`${transactions.date} >= NOW() - INTERVAL '${sql.raw(months.toString())} months'`
        )
      )
      .groupBy(sql`TO_CHAR(${transactions.date}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${transactions.date}, 'YYYY-MM')`);

    return results;
  }
}

export const storage = new DatabaseStorage();
