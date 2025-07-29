import { parse } from "csv-parse/sync";

export interface ParsedTransaction {
  description: string;
  amount: number;
  date: Date;
  rawData: Record<string, any>;
}

export interface CSVParseResult {
  transactions: ParsedTransaction[];
  errors: string[];
  totalRows: number;
  validRows: number;
}

export async function parseCSV(csvContent: string): Promise<CSVParseResult> {
  const errors: string[] = [];
  const transactions: ParsedTransaction[] = [];
  
  try {
    // Parse CSV with automatic header detection
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true
    });

    const totalRows = records.length;
    
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNumber = i + 2; // +2 because CSV is 1-indexed and has header
      
      try {
        const transaction = parseTransactionRow(record as Record<string, any>, rowNumber);
        if (transaction) {
          transactions.push(transaction);
        }
      } catch (error) {
        errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      transactions,
      errors,
      totalRows,
      validRows: transactions.length
    };
  } catch (error) {
    return {
      transactions: [],
      errors: [`CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      totalRows: 0,
      validRows: 0
    };
  }
}

function parseTransactionRow(record: Record<string, any>, rowNumber: number): ParsedTransaction | null {
  // Common field mappings for different CSV formats
  const descriptionFields = ['description', 'merchant', 'payee', 'details', 'transaction_details', 'memo'];
  const amountFields = ['amount', 'value', 'sum', 'total', 'debit', 'credit', 'transaction_amount'];
  const dateFields = ['date', 'transaction_date', 'payment_date', 'posting_date', 'value_date'];

  // Find description field
  const descriptionField = findFieldIgnoreCase(record, descriptionFields);
  if (!descriptionField || !record[descriptionField]) {
    throw new Error('Description field not found or empty');
  }

  // Find amount field
  const amountField = findFieldIgnoreCase(record, amountFields);
  if (!amountField || record[amountField] === undefined || record[amountField] === '') {
    throw new Error('Amount field not found or empty');
  }

  // Find date field
  const dateField = findFieldIgnoreCase(record, dateFields);
  if (!dateField || !record[dateField]) {
    throw new Error('Date field not found or empty');
  }

  // Parse amount - handle different formats
  const amountStr = String(record[amountField]).replace(/[€$£,\s]/g, '');
  const amount = parseFloat(amountStr);
  
  if (isNaN(amount) || amount <= 0) {
    throw new Error(`Invalid amount: ${record[amountField]}`);
  }

  // Parse date - handle different formats
  const dateStr = String(record[dateField]);
  const date = parseDate(dateStr);
  
  if (!date || isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${record[dateField]}`);
  }

  // Validate description
  const description = String(record[descriptionField]).trim();
  if (description.length < 3) {
    throw new Error('Description too short');
  }

  return {
    description,
    amount,
    date,
    rawData: record
  };
}

function findFieldIgnoreCase(record: Record<string, any>, possibleFields: string[]): string | null {
  const recordKeys = Object.keys(record);
  
  for (const field of possibleFields) {
    // Try exact match first
    if (record[field] !== undefined) {
      return field;
    }
    
    // Try case-insensitive match
    const matchingKey = recordKeys.find(key => 
      key.toLowerCase() === field.toLowerCase()
    );
    
    if (matchingKey) {
      return matchingKey;
    }
    
    // Try partial match
    const partialMatch = recordKeys.find(key => 
      key.toLowerCase().includes(field.toLowerCase()) ||
      field.toLowerCase().includes(key.toLowerCase())
    );
    
    if (partialMatch) {
      return partialMatch;
    }
  }
  
  return null;
}

function parseDate(dateStr: string): Date | null {
  // Remove extra whitespace
  const cleanStr = dateStr.trim();
  
  // Try different date formats
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

  // Try parsing as ISO date first
  let date = new Date(cleanStr);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try parsing European format (DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY)
  const europeanMatch = cleanStr.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (europeanMatch) {
    const [, day, month, year] = europeanMatch;
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Try parsing US format (MM/DD/YYYY)
  const usMatch = cleanStr.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    const fullYear = year.length === 2 ? 2000 + parseInt(year) : parseInt(year);
    date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

export function validateCSVStructure(csvContent: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      errors.push('CSV must have at least a header row and one data row');
      return { isValid: false, errors };
    }

    // Parse just the header to check structure
    const [header] = parse(csvContent, {
      columns: false,
      to_line: 1,
      trim: true,
      bom: true
    });

    if (!header || header.length < 3) {
      errors.push('CSV must have at least 3 columns (description, amount, date)');
      return { isValid: false, errors };
    }

    // Check for required field types
    const headerStr = header.join('|').toLowerCase();
    const hasDescription = /description|merchant|payee|details|memo/.test(headerStr);
    const hasAmount = /amount|value|sum|total|debit|credit/.test(headerStr);
    const hasDate = /date|payment|posting|value/.test(headerStr);

    if (!hasDescription) {
      errors.push('CSV must contain a description/merchant/payee column');
    }
    if (!hasAmount) {
      errors.push('CSV must contain an amount/value/sum column');
    }
    if (!hasDate) {
      errors.push('CSV must contain a date column');
    }

    return { isValid: errors.length === 0, errors };
  } catch (error) {
    errors.push(`CSV structure validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { isValid: false, errors };
  }
}
