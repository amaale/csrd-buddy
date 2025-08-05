import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./simpleAuth";
import { z } from "zod";
import { insertUploadSchema, insertTransactionSchema, insertReportSchema } from "@shared/schema";
import { classifyTransaction, classifyTransactionsBatch } from "./services/openai";
import { calculateEmissions, initializeDefaultEmissionFactors } from "./services/emissions";
import { parseCSV, validateCSVStructure } from "./services/csv-parser";
import { generatePDFReport, ensureReportsDirectory } from "./services/pdf-generator";
import { generateXBRLReport } from "./services/xbrl-generator";
import { advancedAccounting } from "./services/advanced-accounting";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Initialize default emission factors
  await initializeDefaultEmissionFactors();
  
  // Ensure reports directory exists
  await ensureReportsDirectory();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
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

  // Upload CSV file and process transactions
  app.post("/api/uploads", isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Get user ID from authenticated session
      const userId = req.userId;

      // Read and validate CSV file
      const csvContent = fs.readFileSync(req.file.path, 'utf-8');
      const validation = validateCSVStructure(csvContent);
      
      if (!validation.isValid) {
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          message: "Invalid CSV structure", 
          errors: validation.errors 
        });
      }

      // Create upload record
      const uploadData = insertUploadSchema.parse({
        userId,
        filename: req.file.originalname,
        fileSize: req.file.size,
        status: "processing"
      });

      const uploadRecord = await storage.createUpload(uploadData);

      // Parse CSV
      const parseResult = await parseCSV(csvContent);

      if (parseResult.transactions.length === 0) {
        await storage.updateUpload(uploadRecord.id, {
          status: "failed",
          errorMessage: "No valid transactions found in CSV",
          totalRows: parseResult.totalRows
        });

        fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          message: "No valid transactions found", 
          errors: parseResult.errors 
        });
      }

      // Update upload with total rows
      await storage.updateUpload(uploadRecord.id, {
        totalRows: parseResult.totalRows
      });

      // Process transactions in background
      processTransactionsAsync(uploadRecord.id, userId, parseResult.transactions);

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json({
        uploadId: uploadRecord.id,
        totalRows: parseResult.totalRows,
        validRows: parseResult.validRows,
        errors: parseResult.errors,
        status: "processing"
      });

    } catch (error) {
      console.error("Upload error:", error);
      
      // Clean up file if it exists
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          console.error("Error cleaning up file:", e);
        }
      }

      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Upload failed" 
      });
    }
  });

  // Get upload status
  app.get("/api/uploads/:id", async (req, res) => {
    try {
      const upload = await storage.getUpload(req.params.id);
      if (!upload) {
        return res.status(404).json({ message: "Upload not found" });
      }

      res.json(upload);
    } catch (error) {
      console.error("Get upload error:", error);
      res.status(500).json({ message: "Failed to get upload status" });
    }
  });

  // Get user uploads
  app.get("/api/uploads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const uploads = await storage.getUserUploads(userId);
      res.json(uploads);
    } catch (error) {
      console.error("Get uploads error:", error);
      res.status(500).json({ message: "Failed to get uploads" });
    }
  });

  // Get transactions
  app.get("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Failed to get transactions" });
    }
  });

  // Get emissions summary
  app.get("/api/emissions/summary", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const summary = await storage.getUserEmissionsSummary(userId, start, end);
      res.json(summary);
    } catch (error) {
      console.error("Get emissions summary error:", error);
      res.status(500).json({ message: "Failed to get emissions summary" });
    }
  });

  // Get emissions trend
  app.get("/api/emissions/trend", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const months = parseInt(req.query.months as string) || 12;

      const trend = await storage.getUserEmissionsTrend(userId, months);
      res.json(trend);
    } catch (error) {
      console.error("Get emissions trend error:", error);
      res.status(500).json({ message: "Failed to get emissions trend" });
    }
  });

  // Generate report
  app.post("/api/reports", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      
      const reportSchema = insertReportSchema.extend({
        startDate: z.string().transform(str => new Date(str)),
        endDate: z.string().transform(str => new Date(str))
      });

      const reportData = reportSchema.parse(req.body);

      // Get emissions summary for the period
      const summary = await storage.getUserEmissionsSummary(
        userId, 
        reportData.startDate, 
        reportData.endDate
      );

      // Create report record
      const report = await storage.createReport({
        ...reportData,
        userId,
        totalEmissions: summary.totalEmissions.toString(),
        scope1Emissions: summary.scope1Emissions.toString(),
        scope2Emissions: summary.scope2Emissions.toString(),
        scope3Emissions: summary.scope3Emissions.toString(),
        status: "generating"
      });

      // Generate PDF in background
      generateReportAsync(report.id, userId);

      res.json(report);
    } catch (error) {
      console.error("Create report error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to create report" 
      });
    }
  });

  // Get user reports
  app.get("/api/reports", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const reports = await storage.getUserReports(userId);
      res.json(reports);
    } catch (error) {
      console.error("Get reports error:", error);
      res.status(500).json({ message: "Failed to get reports" });
    }
  });

  // Download report PDF
  app.get("/api/reports/:id/download", async (req, res) => {
    try {
      const report = await storage.getReport(req.params.id);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      if (!report.pdfPath || !fs.existsSync(report.pdfPath)) {
        return res.status(404).json({ message: "PDF file not found" });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${report.title}.pdf"`);
      
      const fileStream = fs.createReadStream(report.pdfPath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Download report error:", error);
      res.status(500).json({ message: "Failed to download report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Background processing functions
async function processTransactionsAsync(
  uploadId: string, 
  userId: string, 
  parsedTransactions: Array<{ description: string; amount: number; date: Date }>
): Promise<void> {
  try {
    // Classify transactions using AI
    const classifications = await classifyTransactionsBatch(parsedTransactions);

    const transactionsToInsert = [];

    for (let i = 0; i < parsedTransactions.length; i++) {
      const parsed = parsedTransactions[i];
      const classification = classifications[i];

      // Calculate emissions
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

    // Insert all transactions
    await storage.createTransactions(transactionsToInsert);

    // Update upload status
    await storage.updateUpload(uploadId, {
      status: "completed",
      processedRows: transactionsToInsert.length,
      completedAt: new Date()
    });

  } catch (error) {
    console.error("Error processing transactions:", error);
    
    await storage.updateUpload(uploadId, {
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Processing failed"
    });
  }
}

async function generateReportAsync(reportId: string, userId: string): Promise<void> {
  try {
    const report = await storage.getReport(reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    // Get user info (mock for demo)
    const companyName = "Demo Company Ltd";
    const userEmail = "demo@company.com";

    // Get transactions for the report period
    const transactions = await storage.getUserTransactions(userId);
    const reportTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= new Date(report.startDate) && 
             transactionDate <= new Date(report.endDate);
    });

    const reportsDir = await ensureReportsDirectory();
    const filename = `report-${reportId}.pdf`;
    const pdfPath = path.join(reportsDir, filename);

    // Generate PDF
    await generatePDFReport({
      report,
      transactions: reportTransactions,
      companyName,
      userEmail
    }, pdfPath);

    // Update report with PDF path
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
