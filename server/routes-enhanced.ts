// Enhanced routes with new features
import { Router } from 'express';
import multer from 'multer';
import { processPDFExpenses, classifyPDFExpenses } from './services/pdf-processor';
import { generateXBRLReport, validateXBRLDocument } from './services/xbrl-generator';
import { climatiqService, calculateEnhancedEmissions } from './services/climatiq-integration';
import { advancedAccounting } from './services/advanced-accounting';
import { storage } from './storage';
import { insertTransactionSchema, insertReportSchema } from '@shared/schema';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for PDF uploads
const pdfUpload = multer({
  dest: 'uploads/pdf/',
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB for PDFs
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// PDF expense processing
router.post('/api/uploads/pdf', pdfUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    const userId = 'demo-user-id';
    
    // Process PDF and extract expenses
    const extractionResult = await processPDFExpenses(req.file.path);
    
    if (extractionResult.expenses.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        message: 'No expenses found in PDF',
        errors: extractionResult.errors
      });
    }

    // Classify extracted expenses
    const classifiedExpenses = await classifyPDFExpenses(extractionResult.expenses);

    // Create upload record
    const uploadData = {
      userId,
      filename: req.file.originalname,
      fileSize: req.file.size,
      status: 'completed' as const,
      processedRows: classifiedExpenses.length,
      totalRows: classifiedExpenses.length
    };

    const uploadRecord = await storage.createUpload(uploadData);

    // Create transactions from PDF expenses
    const transactionPromises = classifiedExpenses.map(async (expense) => {
      const emissionsResult = await calculateEnhancedEmissions(
        expense.category || 'Other',
        undefined,
        expense.amount
      );

      return storage.createTransaction({
        userId,
        uploadId: uploadRecord.id,
        date: expense.date ? new Date(expense.date) : new Date(),
        description: expense.description,
        amount: expense.amount,
        category: expense.category || 'Other',
        scope: 3, // Default scope for PDF expenses
        co2Emissions: emissionsResult.emissions,
        verified: false
      });
    });

    await Promise.all(transactionPromises);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      uploadId: uploadRecord.id,
      extractedExpenses: classifiedExpenses.length,
      confidence: extractionResult.confidence,
      status: 'completed'
    });

  } catch (error) {
    console.error('PDF processing error:', error);
    
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Error cleaning up file:', e);
      }
    }

    res.status(500).json({
      message: 'Failed to process PDF',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// XBRL report generation
router.post('/api/reports/xbrl', async (req, res) => {
  try {
    const userId = 'demo-user-id';
    const { startDate, endDate, entityName, entityIdentifier } = req.body;

    // Get emissions data for the period
    const summary = await storage.getUserEmissionsSummary(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    // Get category breakdown
    const scopeAnalysis = await advancedAccounting.calculateScopeAnalysis(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    // Prepare XBRL data
    const xbrlData = {
      reportingPeriod: {
        startDate: startDate || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        endDate: endDate || new Date().toISOString().split('T')[0]
      },
      entity: {
        name: entityName || 'Demo Company',
        identifier: entityIdentifier || 'DEMO-001',
        currency: 'EUR'
      },
      emissions: {
        scope1: summary.scope1Emissions,
        scope2: summary.scope2Emissions,
        scope3: summary.scope3Emissions,
        total: summary.totalEmissions
      },
      categories: [
        ...scopeAnalysis.scope1.categories.map(cat => ({
          name: cat.category,
          scope: 1,
          emissions: cat.emissions,
          description: `Scope 1 emissions from ${cat.category}`
        })),
        ...scopeAnalysis.scope2.categories.map(cat => ({
          name: cat.category,
          scope: 2,
          emissions: cat.emissions,
          description: `Scope 2 emissions from ${cat.category}`
        })),
        ...scopeAnalysis.scope3.categories.map(cat => ({
          name: cat.category,
          scope: 3,
          emissions: cat.emissions,
          description: `Scope 3 emissions from ${cat.category}`
        }))
      ],
      methodology: {
        framework: 'GHG Protocol Corporate Standard',
        emissionFactors: 'DEFRA 2024 + Climatiq Database',
        calculationMethod: 'Spend-based approach with AI classification'
      }
    };

    // Generate XBRL file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `csrd-report-${timestamp}.xbrl`;
    const outputPath = path.join('reports', filename);

    await generateXBRLReport(xbrlData, outputPath);

    // Validate the generated XBRL
    const validation = validateXBRLDocument(outputPath);

    // Create report record
    const reportData = {
      userId,
      type: 'xbrl' as const,
      format: 'xml' as const,
      filename,
      filePath: outputPath,
      startDate: new Date(xbrlData.reportingPeriod.startDate),
      endDate: new Date(xbrlData.reportingPeriod.endDate),
      status: validation.isValid ? 'completed' as const : 'failed' as const,
      metadata: {
        validation,
        totalEmissions: summary.totalEmissions,
        transactionCount: summary.transactionCount
      }
    };

    const report = await storage.createReport(reportData);

    res.json({
      reportId: report.id,
      filename,
      downloadUrl: `/api/reports/${report.id}/download`,
      validation,
      summary: xbrlData.emissions
    });

  } catch (error) {
    console.error('XBRL generation error:', error);
    res.status(500).json({
      message: 'Failed to generate XBRL report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Advanced carbon accounting endpoints
router.get('/api/analytics/carbon-intensity', async (req, res) => {
  try {
    const userId = 'demo-user-id';
    const { revenue, startDate, endDate } = req.query;

    if (!revenue) {
      return res.status(400).json({ message: 'Revenue parameter is required' });
    }

    const intensity = await advancedAccounting.calculateCarbonIntensity(
      userId,
      Number(revenue),
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json(intensity);
  } catch (error) {
    console.error('Carbon intensity calculation error:', error);
    res.status(500).json({ message: 'Failed to calculate carbon intensity' });
  }
});

router.get('/api/analytics/trends', async (req, res) => {
  try {
    const userId = 'demo-user-id';
    const { periods = 12 } = req.query;

    const trends = await advancedAccounting.calculateEmissionTrends(
      userId,
      Number(periods)
    );

    res.json(trends);
  } catch (error) {
    console.error('Trend analysis error:', error);
    res.status(500).json({ message: 'Failed to calculate emission trends' });
  }
});

router.get('/api/analytics/carbon-budget', async (req, res) => {
  try {
    const userId = 'demo-user-id';
    const { annualTarget } = req.query;

    if (!annualTarget) {
      return res.status(400).json({ message: 'Annual target parameter is required' });
    }

    const budget = await advancedAccounting.calculateCarbonBudget(
      userId,
      Number(annualTarget)
    );

    res.json(budget);
  } catch (error) {
    console.error('Carbon budget calculation error:', error);
    res.status(500).json({ message: 'Failed to calculate carbon budget' });
  }
});

router.get('/api/analytics/benchmarking', async (req, res) => {
  try {
    const userId = 'demo-user-id';
    const { sector, revenue } = req.query;

    if (!sector || !revenue) {
      return res.status(400).json({ 
        message: 'Sector and revenue parameters are required' 
      });
    }

    const benchmark = await advancedAccounting.calculateSectorBenchmark(
      userId,
      sector as string,
      Number(revenue)
    );

    res.json(benchmark);
  } catch (error) {
    console.error('Benchmarking error:', error);
    res.status(500).json({ message: 'Failed to calculate sector benchmark' });
  }
});

router.get('/api/analytics/reduction-opportunities', async (req, res) => {
  try {
    const userId = 'demo-user-id';

    const opportunities = await advancedAccounting.identifyReductionOpportunities(userId);

    res.json(opportunities);
  } catch (error) {
    console.error('Reduction opportunities error:', error);
    res.status(500).json({ message: 'Failed to identify reduction opportunities' });
  }
});

router.get('/api/analytics/carbon-costs', async (req, res) => {
  try {
    const userId = 'demo-user-id';
    const { carbonPrice = 85, startDate, endDate } = req.query;

    const costs = await advancedAccounting.calculateCarbonCosts(
      userId,
      Number(carbonPrice),
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json(costs);
  } catch (error) {
    console.error('Carbon costs calculation error:', error);
    res.status(500).json({ message: 'Failed to calculate carbon costs' });
  }
});

// Climatiq emission factors search
router.get('/api/emission-factors/search', async (req, res) => {
  try {
    const { query, category, region = 'EU', year = 2024 } = req.query;

    const factors = await climatiqService.searchEmissionFactors({
      query: query as string,
      category: category as string,
      region: region as string,
      year: Number(year),
      limit: 20
    });

    res.json(factors);
  } catch (error) {
    console.error('Emission factors search error:', error);
    res.status(500).json({ message: 'Failed to search emission factors' });
  }
});

export { router as enhancedRoutes };