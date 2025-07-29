import pdf from 'pdf-parse';
import fs from 'fs';
import { classifyTransactionFallback } from './fallback-classifier';
import { classifyTransaction } from './openai';

interface ExtractedExpense {
  date?: string;
  description: string;
  amount: number;
  vendor?: string;
  category?: string;
}

export async function processPDFExpenses(filePath: string): Promise<{
  expenses: ExtractedExpense[];
  confidence: number;
  errors: string[];
}> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    
    return extractExpensesFromText(pdfData.text);
  } catch (error) {
    return {
      expenses: [],
      confidence: 0,
      errors: [`Failed to process PDF: ${error.message}`]
    };
  }
}

function extractExpensesFromText(text: string): {
  expenses: ExtractedExpense[];
  confidence: number;
  errors: string[];
} {
  const expenses: ExtractedExpense[] = [];
  const errors: string[] = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  // Common patterns for expense documents
  const amountPatterns = [
    /[\$€£¥]\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/g,  // Currency symbols
    /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:EUR|USD|GBP|CHF)/gi,  // Amount with currency
    /Total[:\s]+(\d+(?:,\d{3})*(?:\.\d{2})?)/gi,  // Total amounts
    /Amount[:\s]+(\d+(?:,\d{3})*(?:\.\d{2})?)/gi  // Amount labels
  ];
  
  const datePatterns = [
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g,  // DD/MM/YYYY or MM/DD/YYYY
    /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/g,    // YYYY/MM/DD
    /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/gi  // DD Month YYYY
  ];
  
  // Try to extract structured data
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Look for amount patterns
    for (const pattern of amountPatterns) {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        const amountStr = match[1] || match[0];
        const amount = parseFloat(amountStr.replace(/,/g, '').replace(/[^\d.]/g, ''));
        
        if (amount > 0 && amount < 100000) {  // Reasonable expense range
          // Look for description in surrounding lines
          const description = extractDescription(lines, i);
          const date = extractDate(lines, i, datePatterns);
          
          expenses.push({
            date,
            description: description || line,
            amount,
            vendor: extractVendor(line)
          });
        }
      }
    }
  }
  
  // Remove duplicates and invalid entries
  const uniqueExpenses = expenses.filter((expense, index, self) => 
    index === self.findIndex(e => 
      Math.abs(e.amount - expense.amount) < 0.01 && 
      e.description === expense.description
    )
  );
  
  return {
    expenses: uniqueExpenses,
    confidence: calculateConfidence(uniqueExpenses, text),
    errors: uniqueExpenses.length === 0 ? ['No valid expenses found in PDF'] : []
  };
}

function extractDescription(lines: string[], currentIndex: number): string {
  // Look for description in current line and surrounding lines
  const searchLines = [
    lines[currentIndex - 2],
    lines[currentIndex - 1],
    lines[currentIndex],
    lines[currentIndex + 1],
    lines[currentIndex + 2]
  ].filter(Boolean);
  
  for (const line of searchLines) {
    // Skip lines that are just amounts or dates
    if (!/^\s*[\d\$€£¥,.\s]+$/.test(line) && 
        !/^\s*\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\s*$/.test(line)) {
      return line.trim();
    }
  }
  
  return '';
}

function extractDate(lines: string[], currentIndex: number, patterns: RegExp[]): string | undefined {
  // Look for dates in surrounding lines
  const searchLines = [
    lines[currentIndex - 2],
    lines[currentIndex - 1],
    lines[currentIndex],
    lines[currentIndex + 1],
    lines[currentIndex + 2]
  ].filter(Boolean);
  
  for (const line of searchLines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        return normalizeDate(match[0]);
      }
    }
  }
  
  return undefined;
}

function extractVendor(line: string): string | undefined {
  // Common vendor patterns
  const vendorPatterns = [
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,  // Capitalized words at start
    /((?:[A-Z]+\s*)+)(?:[-\s])/,          // All caps followed by separator
  ];
  
  for (const pattern of vendorPatterns) {
    const match = line.match(pattern);
    if (match && match[1].length > 2) {
      return match[1].trim();
    }
  }
  
  return undefined;
}

function normalizeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];  // YYYY-MM-DD format
    }
  } catch {
    // Fallback to original string if parsing fails
  }
  
  return dateStr;
}

function calculateConfidence(expenses: ExtractedExpense[], originalText: string): number {
  if (expenses.length === 0) return 0;
  
  let score = 0.3;  // Base score
  
  // More expenses found = higher confidence
  score += Math.min(expenses.length * 0.1, 0.4);
  
  // Presence of dates increases confidence
  const withDates = expenses.filter(e => e.date).length;
  score += (withDates / expenses.length) * 0.2;
  
  // Presence of vendors increases confidence
  const withVendors = expenses.filter(e => e.vendor).length;
  score += (withVendors / expenses.length) * 0.1;
  
  return Math.min(score, 1.0);
}

export async function classifyPDFExpenses(expenses: ExtractedExpense[]): Promise<ExtractedExpense[]> {
  const classifiedExpenses = [];
  
  for (const expense of expenses) {
    try {
      // Try OpenAI first, fallback to rule-based
      let classification;
      try {
        classification = await classifyTransaction(expense.description, expense.amount);
      } catch (error) {
        console.log('OpenAI classification failed, using fallback:', error.message);
        classification = classifyTransactionFallback(expense.description, expense.amount);
      }
      
      classifiedExpenses.push({
        ...expense,
        category: classification.category
      });
    } catch (error) {
      console.error('Classification error:', error);
      classifiedExpenses.push(expense);
    }
  }
  
  return classifiedExpenses;
}