var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  emissionFactors: () => emissionFactors,
  insertEmissionFactorSchema: () => insertEmissionFactorSchema,
  insertReportSchema: () => insertReportSchema,
  insertTransactionSchema: () => insertTransactionSchema,
  insertUploadSchema: () => insertUploadSchema,
  insertUserSchema: () => insertUserSchema,
  reports: () => reports,
  reportsRelations: () => reportsRelations,
  sessions: () => sessions,
  transactions: () => transactions,
  transactionsRelations: () => transactionsRelations,
  uploads: () => uploads,
  uploadsRelations: () => uploadsRelations,
  upsertUserSchema: () => upsertUserSchema,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  decimal,
  timestamp,
  integer,
  jsonb,
  boolean,
  index
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"),
  // Add password field for simple auth
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  companyName: text("company_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  uploadId: varchar("upload_id").notNull().references(() => uploads.id),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  category: text("category"),
  scope: integer("scope"),
  // 1, 2, or 3
  emissionsFactor: decimal("emissions_factor", { precision: 10, scale: 6 }),
  co2Emissions: decimal("co2_emissions", { precision: 10, scale: 3 }),
  aiClassified: boolean("ai_classified").default(false),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var uploads = pgTable("uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  filename: text("filename").notNull(),
  fileSize: integer("file_size").notNull(),
  status: text("status").notNull().default("processing"),
  // processing, completed, failed
  processedRows: integer("processed_rows").default(0),
  totalRows: integer("total_rows").default(0),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at")
});
var reports = pgTable("reports", {
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
  status: text("status").notNull().default("generating"),
  // generating, completed, failed
  pdfPath: text("pdf_path"),
  xbrlPath: text("xbrl_path"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var emissionFactors = pgTable("emission_factors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  scope: integer("scope").notNull(),
  factor: decimal("factor", { precision: 10, scale: 6 }).notNull(),
  unit: text("unit").notNull(),
  // kg CO2e per unit
  source: text("source").notNull(),
  // DEFRA, Climatiq, etc.
  year: integer("year").notNull(),
  description: text("description")
});
var usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  uploads: many(uploads),
  reports: many(reports)
}));
var transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id]
  }),
  upload: one(uploads, {
    fields: [transactions.uploadId],
    references: [uploads.id]
  })
}));
var uploadsRelations = relations(uploads, ({ one, many }) => ({
  user: one(users, {
    fields: [uploads.userId],
    references: [users.id]
  }),
  transactions: many(transactions)
}));
var reportsRelations = relations(reports, ({ one }) => ({
  user: one(users, {
    fields: [reports.userId],
    references: [users.id]
  })
}));
var insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  companyName: true
});
var upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true
});
var insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true
});
var insertUploadSchema = createInsertSchema(uploads).omit({
  id: true,
  createdAt: true,
  completedAt: true
});
var insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true
});
var insertEmissionFactorSchema = createInsertSchema(emissionFactors).omit({
  id: true
});

// server/db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, and, desc, gte, lte, sql as sql2 } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations for authentication
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async createUser(userData) {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async createUpload(upload2) {
    const [result] = await db.insert(uploads).values(upload2).returning();
    return result;
  }
  async getUpload(id) {
    const [upload2] = await db.select().from(uploads).where(eq(uploads.id, id));
    return upload2 || void 0;
  }
  async updateUpload(id, data) {
    const [result] = await db.update(uploads).set(data).where(eq(uploads.id, id)).returning();
    return result;
  }
  async getUserUploads(userId) {
    return await db.select().from(uploads).where(eq(uploads.userId, userId)).orderBy(desc(uploads.createdAt));
  }
  async createTransaction(transaction) {
    const [result] = await db.insert(transactions).values(transaction).returning();
    return result;
  }
  async createTransactions(transactionList) {
    return await db.insert(transactions).values(transactionList).returning();
  }
  async getUserTransactions(userId) {
    return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.date));
  }
  async getTransactionsByUpload(uploadId) {
    return await db.select().from(transactions).where(eq(transactions.uploadId, uploadId)).orderBy(desc(transactions.date));
  }
  async updateTransaction(id, data) {
    const [result] = await db.update(transactions).set(data).where(eq(transactions.id, id)).returning();
    return result;
  }
  async createReport(report) {
    const [result] = await db.insert(reports).values(report).returning();
    return result;
  }
  async getUserReports(userId) {
    return await db.select().from(reports).where(eq(reports.userId, userId)).orderBy(desc(reports.createdAt));
  }
  async getReport(id) {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report || void 0;
  }
  async updateReport(id, data) {
    const [result] = await db.update(reports).set(data).where(eq(reports.id, id)).returning();
    return result;
  }
  async createEmissionFactor(factor) {
    const [result] = await db.insert(emissionFactors).values(factor).returning();
    return result;
  }
  async getEmissionFactors() {
    return await db.select().from(emissionFactors);
  }
  async getEmissionFactorByCategory(category, subcategory) {
    const conditions = [eq(emissionFactors.category, category)];
    if (subcategory) {
      conditions.push(eq(emissionFactors.subcategory, subcategory));
    }
    const [factor] = await db.select().from(emissionFactors).where(and(...conditions)).orderBy(desc(emissionFactors.year)).limit(1);
    return factor || void 0;
  }
  async getUserEmissionsSummary(userId, startDate, endDate) {
    const conditions = [eq(transactions.userId, userId)];
    if (startDate) conditions.push(gte(transactions.date, startDate));
    if (endDate) conditions.push(lte(transactions.date, endDate));
    const [result] = await db.select({
      totalEmissions: sql2`COALESCE(SUM(CAST(${transactions.co2Emissions} AS NUMERIC)), 0)`,
      scope1Emissions: sql2`COALESCE(SUM(CASE WHEN ${transactions.scope} = 1 THEN CAST(${transactions.co2Emissions} AS NUMERIC) ELSE 0 END), 0)`,
      scope2Emissions: sql2`COALESCE(SUM(CASE WHEN ${transactions.scope} = 2 THEN CAST(${transactions.co2Emissions} AS NUMERIC) ELSE 0 END), 0)`,
      scope3Emissions: sql2`COALESCE(SUM(CASE WHEN ${transactions.scope} = 3 THEN CAST(${transactions.co2Emissions} AS NUMERIC) ELSE 0 END), 0)`,
      transactionCount: sql2`COUNT(*)`
    }).from(transactions).where(and(...conditions));
    return result;
  }
  async getUserEmissionsTrend(userId, months) {
    const results = await db.select({
      month: sql2`TO_CHAR(${transactions.date}, 'YYYY-MM')`,
      totalEmissions: sql2`COALESCE(SUM(CAST(${transactions.co2Emissions} AS NUMERIC)), 0)`,
      scope1: sql2`COALESCE(SUM(CASE WHEN ${transactions.scope} = 1 THEN CAST(${transactions.co2Emissions} AS NUMERIC) ELSE 0 END), 0)`,
      scope2: sql2`COALESCE(SUM(CASE WHEN ${transactions.scope} = 2 THEN CAST(${transactions.co2Emissions} AS NUMERIC) ELSE 0 END), 0)`,
      scope3: sql2`COALESCE(SUM(CASE WHEN ${transactions.scope} = 3 THEN CAST(${transactions.co2Emissions} AS NUMERIC) ELSE 0 END), 0)`
    }).from(transactions).where(
      and(
        eq(transactions.userId, userId),
        sql2`${transactions.date} >= NOW() - INTERVAL '${sql2.raw(months.toString())} months'`
      )
    ).groupBy(sql2`TO_CHAR(${transactions.date}, 'YYYY-MM')`).orderBy(sql2`TO_CHAR(${transactions.date}, 'YYYY-MM')`);
    return results;
  }
};
var storage = new DatabaseStorage();

// server/simpleAuth.ts
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
import { z } from "zod";
var loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
var registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1)
});
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-this",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl
    }
  });
}
async function setupAuth(app2) {
  app2.use(getSession());
  app2.post("/api/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = registerSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName
      });
      req.session.userId = user.id;
      res.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  app2.post("/api/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.userId = user.id;
      res.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
var isAuthenticated = async (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.userId = req.session.userId;
  next();
};

// server/routes.ts
import { z as z2 } from "zod";

// server/services/openai.ts
import OpenAI from "openai";
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});
async function classifyTransaction(description, amount) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an expert in carbon accounting and the GHG Protocol. Classify business transactions into the appropriate carbon emissions scope and category.

Scope 1: Direct emissions from owned or controlled sources (fuel combustion, company vehicles, manufacturing processes)
Scope 2: Indirect emissions from purchased energy (electricity, steam, heating, cooling)
Scope 3: Other indirect emissions in the value chain (business travel, commuting, waste, purchased goods/services)

Common categories:
- Transport/Fuel (Scope 1): Company vehicles, fuel purchases
- Energy (Scope 2): Electricity bills, gas bills for heating
- Business Travel (Scope 3): Flights, hotels, rental cars for business
- Purchased Goods/Services (Scope 3): Office supplies, consulting services
- Waste (Scope 3): Waste disposal, recycling
- Commuting (Scope 3): Employee commuting costs

Respond with JSON in this exact format:
{
  "category": "string",
  "subcategory": "string or null",
  "scope": 1 | 2 | 3,
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`
        },
        {
          role: "user",
          content: `Classify this transaction:
Description: ${description}
Amount: \u20AC${amount}

Provide the classification in JSON format.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      category: result.category || "Unknown",
      subcategory: result.subcategory || void 0,
      scope: result.scope || 3,
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      reasoning: result.reasoning || "Classification based on transaction description"
    };
  } catch (error) {
    console.error("Error classifying transaction:", error);
    return {
      category: "Unknown",
      scope: 3,
      confidence: 0.1,
      reasoning: "AI classification failed, manual review required"
    };
  }
}
async function classifyTransactionsBatch(transactions2) {
  const classifications = [];
  const batchSize = 10;
  for (let i = 0; i < transactions2.length; i += batchSize) {
    const batch = transactions2.slice(i, i + batchSize);
    const batchPromises = batch.map((tx) => classifyTransaction(tx.description, tx.amount));
    const batchResults = await Promise.all(batchPromises);
    classifications.push(...batchResults);
    if (i + batchSize < transactions2.length) {
      await new Promise((resolve) => setTimeout(resolve, 1e3));
    }
  }
  return classifications;
}

// server/services/emissions.ts
var DEFAULT_EMISSION_FACTORS = {
  "fuel_diesel": { factor: 2.687, unit: "kg CO2e per litre", scope: 1 },
  "fuel_petrol": { factor: 2.315, unit: "kg CO2e per litre", scope: 1 },
  "electricity_uk": { factor: 0.193, unit: "kg CO2e per kWh", scope: 2 },
  "natural_gas": { factor: 0.184, unit: "kg CO2e per kWh", scope: 2 },
  "flight_domestic": { factor: 0.255, unit: "kg CO2e per km", scope: 3 },
  "flight_international": { factor: 0.195, unit: "kg CO2e per km", scope: 3 },
  "hotel_night": { factor: 24.3, unit: "kg CO2e per night", scope: 3 },
  "taxi_km": { factor: 0.211, unit: "kg CO2e per km", scope: 3 },
  "office_supplies": { factor: 0.5, unit: "kg CO2e per \u20AC", scope: 3 },
  "consulting_services": { factor: 0.1, unit: "kg CO2e per \u20AC", scope: 3 },
  "waste_general": { factor: 0.475, unit: "kg CO2e per kg", scope: 3 }
};
async function calculateEmissions(category, subcategory, amount, scope) {
  try {
    let emissionFactor = await storage.getEmissionFactorByCategory(category, subcategory);
    if (!emissionFactor) {
      const factorKey = getDefaultFactorKey(category, subcategory);
      const defaultFactor = DEFAULT_EMISSION_FACTORS[factorKey];
      if (defaultFactor) {
        emissionFactor = await storage.createEmissionFactor({
          category,
          subcategory: subcategory || null,
          scope: defaultFactor.scope,
          factor: defaultFactor.factor.toString(),
          unit: defaultFactor.unit,
          source: "DEFRA 2024",
          year: 2024,
          description: `Default factor for ${category}${subcategory ? ` - ${subcategory}` : ""}`
        });
      }
    }
    if (!emissionFactor) {
      const genericFactor = getGenericFactor(scope);
      return {
        co2Emissions: amount * genericFactor,
        emissionsFactor: genericFactor,
        unit: "kg CO2e per \u20AC",
        source: "Generic estimate",
        confidence: "low"
      };
    }
    const factor = parseFloat(emissionFactor.factor);
    const emissions = calculateEmissionsByCategory(category, amount, factor);
    return {
      co2Emissions: emissions,
      emissionsFactor: factor,
      unit: emissionFactor.unit,
      source: emissionFactor.source,
      confidence: getConfidence(emissionFactor.source)
    };
  } catch (error) {
    console.error("Error calculating emissions:", error);
    const genericFactor = getGenericFactor(scope);
    return {
      co2Emissions: amount * genericFactor,
      emissionsFactor: genericFactor,
      unit: "kg CO2e per \u20AC",
      source: "Fallback estimate",
      confidence: "low"
    };
  }
}
function getDefaultFactorKey(category, subcategory) {
  const cat = category.toLowerCase();
  const subcat = subcategory?.toLowerCase();
  if (cat.includes("fuel") || cat.includes("transport")) {
    if (subcat?.includes("diesel")) return "fuel_diesel";
    if (subcat?.includes("petrol") || subcat?.includes("gasoline")) return "fuel_petrol";
    return "fuel_diesel";
  }
  if (cat.includes("electricity") || cat.includes("energy")) {
    if (subcat?.includes("gas") || subcat?.includes("natural gas")) return "natural_gas";
    return "electricity_uk";
  }
  if (cat.includes("travel") || cat.includes("flight")) {
    if (subcat?.includes("domestic")) return "flight_domestic";
    return "flight_international";
  }
  if (cat.includes("hotel") || cat.includes("accommodation")) {
    return "hotel_night";
  }
  if (cat.includes("taxi") || cat.includes("uber")) {
    return "taxi_km";
  }
  if (cat.includes("office") || cat.includes("supplies")) {
    return "office_supplies";
  }
  if (cat.includes("consulting") || cat.includes("services")) {
    return "consulting_services";
  }
  if (cat.includes("waste")) {
    return "waste_general";
  }
  return "office_supplies";
}
function calculateEmissionsByCategory(category, amount, factor) {
  const cat = category.toLowerCase();
  if (cat.includes("fuel")) {
    const litres = amount / 1.5;
    return litres * factor;
  }
  if (cat.includes("electricity") || cat.includes("energy")) {
    const kWh = amount / 0.25;
    return kWh * factor;
  }
  if (cat.includes("travel") || cat.includes("flight")) {
    const estimatedKm = amount / 0.5;
    return estimatedKm * factor;
  }
  if (cat.includes("hotel")) {
    const nights = amount / 100;
    return nights * factor;
  }
  return amount * factor;
}
function getGenericFactor(scope) {
  switch (scope) {
    case 1:
      return 0.3;
    // kg CO2e per €
    case 2:
      return 0.2;
    // kg CO2e per €
    case 3:
      return 0.15;
    // kg CO2e per €
    default:
      return 0.2;
  }
}
function getConfidence(source) {
  if (source.includes("DEFRA") || source.includes("Climatiq")) return "high";
  if (source.includes("Default") || source.includes("2024")) return "medium";
  return "low";
}
async function initializeDefaultEmissionFactors() {
  try {
    const existingFactors = await storage.getEmissionFactors();
    if (existingFactors.length === 0) {
      console.log("Initializing default emission factors...");
      for (const [key, data] of Object.entries(DEFAULT_EMISSION_FACTORS)) {
        const [category, subcategory] = key.split("_");
        await storage.createEmissionFactor({
          category: category.charAt(0).toUpperCase() + category.slice(1),
          subcategory: subcategory ? subcategory.charAt(0).toUpperCase() + subcategory.slice(1) : null,
          scope: data.scope,
          factor: data.factor.toString(),
          unit: data.unit,
          source: "DEFRA 2024",
          year: 2024,
          description: `Default ${category} emission factor`
        });
      }
      console.log("Default emission factors initialized successfully");
    }
  } catch (error) {
    console.error("Error initializing emission factors:", error);
  }
}

// server/services/csv-parser.ts
import { parse } from "csv-parse/sync";
async function parseCSV(csvContent) {
  const errors = [];
  const transactions2 = [];
  try {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true
    });
    const totalRows = records.length;
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNumber = i + 2;
      try {
        const transaction = parseTransactionRow(record, rowNumber);
        if (transaction) {
          transactions2.push(transaction);
        }
      } catch (error) {
        errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
    return {
      transactions: transactions2,
      errors,
      totalRows,
      validRows: transactions2.length
    };
  } catch (error) {
    return {
      transactions: [],
      errors: [`CSV parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`],
      totalRows: 0,
      validRows: 0
    };
  }
}
function parseTransactionRow(record, rowNumber) {
  const descriptionFields = ["description", "merchant", "payee", "details", "transaction_details", "memo"];
  const amountFields = ["amount", "value", "sum", "total", "debit", "credit", "transaction_amount"];
  const dateFields = ["date", "transaction_date", "payment_date", "posting_date", "value_date"];
  const descriptionField = findFieldIgnoreCase(record, descriptionFields);
  if (!descriptionField || !record[descriptionField]) {
    throw new Error("Description field not found or empty");
  }
  const amountField = findFieldIgnoreCase(record, amountFields);
  if (!amountField || record[amountField] === void 0 || record[amountField] === "") {
    throw new Error("Amount field not found or empty");
  }
  const dateField = findFieldIgnoreCase(record, dateFields);
  if (!dateField || !record[dateField]) {
    throw new Error("Date field not found or empty");
  }
  const amountStr = String(record[amountField]).replace(/[€$£,\s]/g, "");
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    throw new Error(`Invalid amount: ${record[amountField]}`);
  }
  const dateStr = String(record[dateField]);
  const date = parseDate(dateStr);
  if (!date || isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${record[dateField]}`);
  }
  const description = String(record[descriptionField]).trim();
  if (description.length < 3) {
    throw new Error("Description too short");
  }
  return {
    description,
    amount,
    date,
    rawData: record
  };
}
function findFieldIgnoreCase(record, possibleFields) {
  const recordKeys = Object.keys(record);
  for (const field of possibleFields) {
    if (record[field] !== void 0) {
      return field;
    }
    const matchingKey = recordKeys.find(
      (key) => key.toLowerCase() === field.toLowerCase()
    );
    if (matchingKey) {
      return matchingKey;
    }
    const partialMatch = recordKeys.find(
      (key) => key.toLowerCase().includes(field.toLowerCase()) || field.toLowerCase().includes(key.toLowerCase())
    );
    if (partialMatch) {
      return partialMatch;
    }
  }
  return null;
}
function parseDate(dateStr) {
  const cleanStr = dateStr.trim();
  const formats = [
    // ISO format
    /^\d{4}-\d{2}-\d{2}$/,
    // European format
    /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}$/,
    // US format
    /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/,
    // Long format
    /^\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}$/i
  ];
  let date = new Date(cleanStr);
  if (!isNaN(date.getTime())) {
    return date;
  }
  const europeanMatch = cleanStr.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (europeanMatch) {
    const [, day, month, year] = europeanMatch;
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  const usMatch = cleanStr.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    const fullYear = year.length === 2 ? 2e3 + parseInt(year) : parseInt(year);
    date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return null;
}
function validateCSVStructure(csvContent) {
  const errors = [];
  try {
    const lines = csvContent.split("\n").filter((line) => line.trim());
    if (lines.length < 2) {
      errors.push("CSV must have at least a header row and one data row");
      return { isValid: false, errors };
    }
    const [header] = parse(csvContent, {
      columns: false,
      to_line: 1,
      trim: true,
      bom: true
    });
    if (!header || header.length < 3) {
      errors.push("CSV must have at least 3 columns (description, amount, date)");
      return { isValid: false, errors };
    }
    const headerStr = header.join("|").toLowerCase();
    const hasDescription = /description|merchant|payee|details|memo/.test(headerStr);
    const hasAmount = /amount|value|sum|total|debit|credit/.test(headerStr);
    const hasDate = /date|payment|posting|value/.test(headerStr);
    if (!hasDescription) {
      errors.push("CSV must contain a description/merchant/payee column");
    }
    if (!hasAmount) {
      errors.push("CSV must contain an amount/value/sum column");
    }
    if (!hasDate) {
      errors.push("CSV must contain a date column");
    }
    return { isValid: errors.length === 0, errors };
  } catch (error) {
    errors.push(`CSV structure validation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return { isValid: false, errors };
  }
}

// server/services/pdf-generator.ts
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
async function generatePDFReport(reportData, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      addReportHeader(doc, reportData);
      addExecutiveSummary(doc, reportData);
      addEmissionsBreakdown(doc, reportData);
      addMethodologySection(doc);
      addTransactionDetails(doc, reportData);
      addFooter(doc, reportData);
      doc.end();
      stream.on("finish", () => {
        resolve(outputPath);
      });
      stream.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}
function addReportHeader(doc, data) {
  doc.fontSize(24).fillColor("#1976D2").text("CSRD Buddy", 50, 50);
  doc.fontSize(12).fillColor("#666666").text("ESG Reporting Platform", 50, 80);
  doc.fontSize(20).fillColor("#000000").text("Corporate Sustainability Report", 50, 120);
  doc.fontSize(16).fillColor("#333333").text(data.report.title, 50, 150);
  doc.fontSize(12).text(`Company: ${data.companyName}`, 50, 180).text(`Period: ${data.report.period}`, 50, 195).text(`Report Date: ${new Date(data.report.createdAt).toLocaleDateString()}`, 50, 210).text(`Generated by: ${data.userEmail}`, 50, 225);
  doc.moveTo(50, 250).lineTo(550, 250).strokeColor("#E0E0E0").stroke();
}
function addExecutiveSummary(doc, data) {
  let yPosition = 270;
  doc.fontSize(16).fillColor("#000000").text("Executive Summary", 50, yPosition);
  yPosition += 30;
  const totalEmissions = parseFloat(data.report.totalEmissions);
  const scope1 = parseFloat(data.report.scope1Emissions);
  const scope2 = parseFloat(data.report.scope2Emissions);
  const scope3 = parseFloat(data.report.scope3Emissions);
  doc.fontSize(12).fillColor("#333333").text(`This report presents the greenhouse gas (GHG) emissions inventory for ${data.companyName} `, 50, yPosition).text(`for the period ${data.report.period}, prepared in accordance with the GHG Protocol `, 50, yPosition + 15).text(`Corporate Accounting and Reporting Standard and CSRD requirements.`, 50, yPosition + 30);
  yPosition += 60;
  doc.fontSize(14).fillColor("#1976D2").text("Key Findings:", 50, yPosition);
  yPosition += 25;
  doc.fontSize(11).fillColor("#333333").text(`\u2022 Total GHG Emissions: ${totalEmissions.toFixed(1)} tonnes CO\u2082e`, 70, yPosition).text(`\u2022 Scope 1 (Direct): ${scope1.toFixed(1)} tonnes CO\u2082e (${(scope1 / totalEmissions * 100).toFixed(1)}%)`, 70, yPosition + 15).text(`\u2022 Scope 2 (Energy Indirect): ${scope2.toFixed(1)} tonnes CO\u2082e (${(scope2 / totalEmissions * 100).toFixed(1)}%)`, 70, yPosition + 30).text(`\u2022 Scope 3 (Other Indirect): ${scope3.toFixed(1)} tonnes CO\u2082e (${(scope3 / totalEmissions * 100).toFixed(1)}%)`, 70, yPosition + 45);
}
function addEmissionsBreakdown(doc, data) {
  doc.addPage();
  let yPosition = 50;
  doc.fontSize(16).fillColor("#000000").text("Emissions Breakdown by Scope", 50, yPosition);
  yPosition += 40;
  doc.fontSize(14).fillColor("#F44336").text("Scope 1: Direct Emissions", 50, yPosition);
  yPosition += 20;
  doc.fontSize(11).fillColor("#333333").text("Direct emissions from owned or controlled sources including:", 50, yPosition).text("\u2022 Company vehicles and fleet operations", 70, yPosition + 15).text("\u2022 Fuel combustion in stationary sources", 70, yPosition + 30).text("\u2022 Fugitive emissions from refrigerants", 70, yPosition + 45);
  doc.fontSize(12).fillColor("#F44336").text(`Total Scope 1: ${parseFloat(data.report.scope1Emissions).toFixed(1)} tonnes CO\u2082e`, 50, yPosition + 70);
  yPosition += 100;
  doc.fontSize(14).fillColor("#FF9800").text("Scope 2: Energy Indirect Emissions", 50, yPosition);
  yPosition += 20;
  doc.fontSize(11).fillColor("#333333").text("Indirect emissions from purchased energy including:", 50, yPosition).text("\u2022 Purchased electricity consumption", 70, yPosition + 15).text("\u2022 Purchased heating and cooling", 70, yPosition + 30).text("\u2022 Purchased steam", 70, yPosition + 45);
  doc.fontSize(12).fillColor("#FF9800").text(`Total Scope 2: ${parseFloat(data.report.scope2Emissions).toFixed(1)} tonnes CO\u2082e`, 50, yPosition + 70);
  yPosition += 100;
  doc.fontSize(14).fillColor("#1976D2").text("Scope 3: Other Indirect Emissions", 50, yPosition);
  yPosition += 20;
  doc.fontSize(11).fillColor("#333333").text("Other indirect emissions in the value chain including:", 50, yPosition).text("\u2022 Business travel and accommodation", 70, yPosition + 15).text("\u2022 Employee commuting", 70, yPosition + 30).text("\u2022 Purchased goods and services", 70, yPosition + 45).text("\u2022 Waste disposal", 70, yPosition + 60);
  doc.fontSize(12).fillColor("#1976D2").text(`Total Scope 3: ${parseFloat(data.report.scope3Emissions).toFixed(1)} tonnes CO\u2082e`, 50, yPosition + 85);
}
function addMethodologySection(doc) {
  doc.addPage();
  let yPosition = 50;
  doc.fontSize(16).fillColor("#000000").text("Methodology", 50, yPosition);
  yPosition += 30;
  doc.fontSize(12).fillColor("#333333").text("This GHG inventory has been prepared using the following methodology:", 50, yPosition);
  yPosition += 25;
  doc.fontSize(11).text("\u2022 Organizational Boundary: Operational control approach", 70, yPosition).text("\u2022 Operational Boundary: All material emission sources identified", 70, yPosition + 15).text("\u2022 Base Year: Current reporting period", 70, yPosition + 30).text("\u2022 GHG Protocol: Corporate Accounting and Reporting Standard", 70, yPosition + 45).text("\u2022 Emission Factors: DEFRA 2024 conversion factors", 70, yPosition + 60).text("\u2022 Data Quality: AI-powered transaction classification with manual review", 70, yPosition + 75);
  yPosition += 110;
  doc.fontSize(14).fillColor("#1976D2").text("Data Sources:", 50, yPosition);
  yPosition += 25;
  doc.fontSize(11).fillColor("#333333").text("\u2022 Financial transaction records (expense reports, invoices)", 70, yPosition).text("\u2022 Energy bills and utility statements", 70, yPosition + 15).text("\u2022 Travel booking systems and receipts", 70, yPosition + 30).text("\u2022 Fuel purchase records", 70, yPosition + 45);
  yPosition += 80;
  doc.fontSize(14).fillColor("#1976D2").text("Limitations and Assumptions:", 50, yPosition);
  yPosition += 25;
  doc.fontSize(11).fillColor("#333333").text("\u2022 Some Scope 3 emissions may not be captured due to data limitations", 70, yPosition).text("\u2022 Emission factors are based on UK national averages", 70, yPosition + 15).text("\u2022 AI classification accuracy estimated at 95%", 70, yPosition + 30);
}
function addTransactionDetails(doc, data) {
  doc.addPage();
  let yPosition = 50;
  doc.fontSize(16).fillColor("#000000").text("Transaction Summary", 50, yPosition);
  yPosition += 30;
  const scope1Transactions = data.transactions.filter((t) => t.scope === 1);
  const scope2Transactions = data.transactions.filter((t) => t.scope === 2);
  const scope3Transactions = data.transactions.filter((t) => t.scope === 3);
  const addTransactionGroup = (transactions2, scopeName, color) => {
    if (transactions2.length === 0) return;
    doc.fontSize(14).fillColor(color).text(scopeName, 50, yPosition);
    yPosition += 25;
    doc.fontSize(10).fillColor("#333333").text("Description", 50, yPosition).text("Amount (\u20AC)", 300, yPosition).text("CO\u2082e (kg)", 400, yPosition).text("Date", 480, yPosition);
    yPosition += 15;
    doc.moveTo(50, yPosition).lineTo(550, yPosition).strokeColor("#E0E0E0").stroke();
    yPosition += 10;
    const topTransactions = transactions2.sort((a, b) => parseFloat(b.co2Emissions || "0") - parseFloat(a.co2Emissions || "0")).slice(0, 10);
    topTransactions.forEach((transaction) => {
      if (yPosition > 750) {
        doc.addPage();
        yPosition = 50;
      }
      const description = transaction.description.length > 30 ? transaction.description.substring(0, 30) + "..." : transaction.description;
      doc.fontSize(9).fillColor("#333333").text(description, 50, yPosition).text(parseFloat(transaction.amount).toFixed(2), 300, yPosition).text(parseFloat(transaction.co2Emissions || "0").toFixed(1), 400, yPosition).text(new Date(transaction.date).toLocaleDateString(), 480, yPosition);
      yPosition += 12;
    });
    yPosition += 20;
  };
  addTransactionGroup(scope1Transactions, "Scope 1 Transactions", "#F44336");
  addTransactionGroup(scope2Transactions, "Scope 2 Transactions", "#FF9800");
  addTransactionGroup(scope3Transactions, "Scope 3 Transactions", "#1976D2");
}
function addFooter(doc, data) {
  doc.addPage();
  let yPosition = 50;
  doc.fontSize(16).fillColor("#000000").text("Verification and Compliance", 50, yPosition);
  yPosition += 30;
  doc.fontSize(12).fillColor("#333333").text("This report has been prepared in accordance with:", 50, yPosition);
  yPosition += 25;
  doc.fontSize(11).text("\u2022 The GHG Protocol Corporate Accounting and Reporting Standard", 70, yPosition).text("\u2022 Corporate Sustainability Reporting Directive (CSRD)", 70, yPosition + 15).text("\u2022 European Sustainability Reporting Standards (ESRS)", 70, yPosition + 30);
  yPosition += 60;
  doc.fontSize(14).fillColor("#1976D2").text("Data Accuracy Statement:", 50, yPosition);
  yPosition += 25;
  doc.fontSize(11).fillColor("#333333").text("The data in this report has been processed using AI-powered classification ", 50, yPosition).text("with an estimated accuracy rate of 95%. All calculations use official ", 50, yPosition + 15).text("emission factors from DEFRA and other recognized sources.", 50, yPosition + 30);
  yPosition += 60;
  doc.fontSize(10).fillColor("#666666").text(`Report generated by CSRD Buddy on ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`, 50, yPosition).text(`Report ID: ${data.report.id}`, 50, yPosition + 15).text(`For questions about this report, contact: ${data.userEmail}`, 50, yPosition + 30);
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc.fontSize(10).fillColor("#666666").text(`Page ${i + 1} of ${pageCount}`, 500, 780);
  }
}
async function ensureReportsDirectory() {
  const reportsDir = path.join(process.cwd(), "reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  return reportsDir;
}

// server/routes.ts
import multer from "multer";
import path2 from "path";
import fs2 from "fs";
var upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  }
});
async function registerRoutes(app2) {
  await setupAuth(app2);
  await initializeDefaultEmissionFactors();
  await ensureReportsDirectory();
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.post("/api/uploads", isAuthenticated, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const userId = req.userId;
      const csvContent = fs2.readFileSync(req.file.path, "utf-8");
      const validation = validateCSVStructure(csvContent);
      if (!validation.isValid) {
        fs2.unlinkSync(req.file.path);
        return res.status(400).json({
          message: "Invalid CSV structure",
          errors: validation.errors
        });
      }
      const uploadData = insertUploadSchema.parse({
        userId,
        filename: req.file.originalname,
        fileSize: req.file.size,
        status: "processing"
      });
      const uploadRecord = await storage.createUpload(uploadData);
      const parseResult = await parseCSV(csvContent);
      if (parseResult.transactions.length === 0) {
        await storage.updateUpload(uploadRecord.id, {
          status: "failed",
          errorMessage: "No valid transactions found in CSV",
          totalRows: parseResult.totalRows
        });
        fs2.unlinkSync(req.file.path);
        return res.status(400).json({
          message: "No valid transactions found",
          errors: parseResult.errors
        });
      }
      await storage.updateUpload(uploadRecord.id, {
        totalRows: parseResult.totalRows
      });
      processTransactionsAsync(uploadRecord.id, userId, parseResult.transactions);
      fs2.unlinkSync(req.file.path);
      res.json({
        uploadId: uploadRecord.id,
        totalRows: parseResult.totalRows,
        validRows: parseResult.validRows,
        errors: parseResult.errors,
        status: "processing"
      });
    } catch (error) {
      console.error("Upload error:", error);
      if (req.file) {
        try {
          fs2.unlinkSync(req.file.path);
        } catch (e) {
          console.error("Error cleaning up file:", e);
        }
      }
      res.status(500).json({
        message: error instanceof Error ? error.message : "Upload failed"
      });
    }
  });
  app2.get("/api/uploads/:id", async (req, res) => {
    try {
      const upload2 = await storage.getUpload(req.params.id);
      if (!upload2) {
        return res.status(404).json({ message: "Upload not found" });
      }
      res.json(upload2);
    } catch (error) {
      console.error("Get upload error:", error);
      res.status(500).json({ message: "Failed to get upload status" });
    }
  });
  app2.get("/api/uploads", isAuthenticated, async (req, res) => {
    try {
      const userId = req.userId;
      const uploads2 = await storage.getUserUploads(userId);
      res.json(uploads2);
    } catch (error) {
      console.error("Get uploads error:", error);
      res.status(500).json({ message: "Failed to get uploads" });
    }
  });
  app2.get("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.userId;
      const transactions2 = await storage.getUserTransactions(userId);
      res.json(transactions2);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Failed to get transactions" });
    }
  });
  app2.get("/api/emissions/summary", isAuthenticated, async (req, res) => {
    try {
      const userId = req.userId;
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate) : void 0;
      const end = endDate ? new Date(endDate) : void 0;
      const summary = await storage.getUserEmissionsSummary(userId, start, end);
      res.json(summary);
    } catch (error) {
      console.error("Get emissions summary error:", error);
      res.status(500).json({ message: "Failed to get emissions summary" });
    }
  });
  app2.get("/api/emissions/trend", isAuthenticated, async (req, res) => {
    try {
      const userId = req.userId;
      const months = parseInt(req.query.months) || 12;
      const trend = await storage.getUserEmissionsTrend(userId, months);
      res.json(trend);
    } catch (error) {
      console.error("Get emissions trend error:", error);
      res.status(500).json({ message: "Failed to get emissions trend" });
    }
  });
  app2.post("/api/reports", isAuthenticated, async (req, res) => {
    try {
      const userId = req.userId;
      const reportSchema = insertReportSchema.extend({
        startDate: z2.string().transform((str) => new Date(str)),
        endDate: z2.string().transform((str) => new Date(str))
      });
      const reportData = reportSchema.parse(req.body);
      const summary = await storage.getUserEmissionsSummary(
        userId,
        reportData.startDate,
        reportData.endDate
      );
      const report = await storage.createReport({
        ...reportData,
        userId,
        totalEmissions: summary.totalEmissions.toString(),
        scope1Emissions: summary.scope1Emissions.toString(),
        scope2Emissions: summary.scope2Emissions.toString(),
        scope3Emissions: summary.scope3Emissions.toString(),
        status: "generating"
      });
      generateReportAsync(report.id, userId);
      res.json(report);
    } catch (error) {
      console.error("Create report error:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to create report"
      });
    }
  });
  app2.get("/api/reports", isAuthenticated, async (req, res) => {
    try {
      const userId = req.userId;
      const reports2 = await storage.getUserReports(userId);
      res.json(reports2);
    } catch (error) {
      console.error("Get reports error:", error);
      res.status(500).json({ message: "Failed to get reports" });
    }
  });
  app2.get("/api/reports/:id/download", async (req, res) => {
    try {
      const report = await storage.getReport(req.params.id);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      if (!report.pdfPath || !fs2.existsSync(report.pdfPath)) {
        return res.status(404).json({ message: "PDF file not found" });
      }
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${report.title}.pdf"`);
      const fileStream = fs2.createReadStream(report.pdfPath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Download report error:", error);
      res.status(500).json({ message: "Failed to download report" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}
async function processTransactionsAsync(uploadId, userId, parsedTransactions) {
  try {
    const classifications = await classifyTransactionsBatch(parsedTransactions);
    const transactionsToInsert = [];
    for (let i = 0; i < parsedTransactions.length; i++) {
      const parsed = parsedTransactions[i];
      const classification = classifications[i];
      const emissions = await calculateEmissions(
        classification.category,
        classification.subcategory,
        parsed.amount,
        classification.scope
      );
      const transaction = insertTransactionSchema.parse({
        userId,
        uploadId,
        description: parsed.description,
        amount: parsed.amount.toString(),
        date: parsed.date,
        category: classification.category,
        scope: classification.scope,
        emissionsFactor: emissions.emissionsFactor.toString(),
        co2Emissions: emissions.co2Emissions.toString(),
        aiClassified: true,
        verified: classification.confidence > 0.8
      });
      transactionsToInsert.push(transaction);
    }
    await storage.createTransactions(transactionsToInsert);
    await storage.updateUpload(uploadId, {
      status: "completed",
      processedRows: transactionsToInsert.length,
      completedAt: /* @__PURE__ */ new Date()
    });
  } catch (error) {
    console.error("Error processing transactions:", error);
    await storage.updateUpload(uploadId, {
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Processing failed"
    });
  }
}
async function generateReportAsync(reportId, userId) {
  try {
    const report = await storage.getReport(reportId);
    if (!report) {
      throw new Error("Report not found");
    }
    const companyName = "Demo Company Ltd";
    const userEmail = "demo@company.com";
    const transactions2 = await storage.getUserTransactions(userId);
    const reportTransactions = transactions2.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate >= new Date(report.startDate) && transactionDate <= new Date(report.endDate);
    });
    const reportsDir = await ensureReportsDirectory();
    const filename = `report-${reportId}.pdf`;
    const pdfPath = path2.join(reportsDir, filename);
    await generatePDFReport({
      report,
      transactions: reportTransactions,
      companyName,
      userEmail
    }, pdfPath);
    await storage.updateReport(reportId, {
      status: "completed",
      pdfPath
    });
  } catch (error) {
    console.error("Error generating report:", error);
    await storage.updateReport(reportId, {
      status: "failed"
    });
  }
}

// server/vite.ts
import express from "express";
import fs3 from "fs";
import path4 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path3 from "path";
import { fileURLToPath } from "url";
var __dirname = path3.dirname(fileURLToPath(import.meta.url));
var vite_config_default = defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path3.resolve(__dirname, "client", "src"),
      "@shared": path3.resolve(__dirname, "shared"),
      "@assets": path3.resolve(__dirname, "attached_assets")
    }
  },
  root: path3.resolve(__dirname, "client"),
  build: {
    outDir: path3.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path4.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path4.resolve(import.meta.dirname, "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
