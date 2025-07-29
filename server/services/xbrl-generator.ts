import fs from 'fs';
import path from 'path';
import { xml2js, js2xml } from 'xml-js';

interface XBRLData {
  reportingPeriod: {
    startDate: string;
    endDate: string;
  };
  entity: {
    name: string;
    identifier: string;
    currency: string;
  };
  emissions: {
    scope1: number;
    scope2: number;
    scope3: number;
    total: number;
  };
  categories: Array<{
    name: string;
    scope: number;
    emissions: number;
    description: string;
  }>;
  methodology: {
    framework: string;
    emissionFactors: string;
    calculationMethod: string;
  };
}

export async function generateXBRLReport(
  data: XBRLData,
  outputPath: string
): Promise<string> {
  try {
    const xbrlDocument = createXBRLStructure(data);
    const xmlString = js2xml(xbrlDocument, { 
      compact: false, 
      spaces: 2,
      declaration: { encoding: 'UTF-8' }
    });
    
    // Ensure reports directory exists
    const reportsDir = path.dirname(outputPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, xmlString, 'utf8');
    return outputPath;
  } catch (error) {
    throw new Error(`Failed to generate XBRL report: ${error.message}`);
  }
}

function createXBRLStructure(data: XBRLData) {
  const currentDate = new Date().toISOString();
  
  return {
    declaration: {
      attributes: {
        version: '1.0',
        encoding: 'UTF-8'
      }
    },
    elements: [
      {
        type: 'element',
        name: 'xbrl',
        attributes: {
          'xmlns': 'http://www.xbrl.org/2003/instance',
          'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          'xmlns:link': 'http://www.xbrl.org/2003/linkbase',
          'xmlns:xlink': 'http://www.w3.org/1999/xlink',
          'xmlns:csrd': 'http://eba.europa.eu/xbrl/csrd',
          'xmlns:iso4217': 'http://www.xbrl.org/2003/iso4217',
          'xsi:schemaLocation': 'http://www.xbrl.org/2003/instance http://www.xbrl.org/2003/xbrl-instance-2003-12-31.xsd'
        },
        elements: [
          // Document information
          {
            type: 'element',
            name: 'link:schemaRef',
            attributes: {
              'xlink:type': 'simple',
              'xlink:href': 'https://eba.europa.eu/xbrl/csrd/csrd-2024-12-31.xsd'
            }
          },
          
          // Entity information
          {
            type: 'element',
            name: 'context',
            attributes: { id: 'entity-context' },
            elements: [
              {
                type: 'element',
                name: 'entity',
                elements: [
                  {
                    type: 'element',
                    name: 'identifier',
                    attributes: { scheme: 'http://standards.iso.org/iso/17442' },
                    elements: [{ type: 'text', text: data.entity.identifier }]
                  }
                ]
              },
              {
                type: 'element',
                name: 'period',
                elements: [
                  {
                    type: 'element',
                    name: 'startDate',
                    elements: [{ type: 'text', text: data.reportingPeriod.startDate }]
                  },
                  {
                    type: 'element',
                    name: 'endDate',
                    elements: [{ type: 'text', text: data.reportingPeriod.endDate }]
                  }
                ]
              }
            ]
          },
          
          // Reporting entity name
          {
            type: 'element',
            name: 'csrd:EntityName',
            attributes: {
              contextRef: 'entity-context',
              unitRef: 'pure'
            },
            elements: [{ type: 'text', text: data.entity.name }]
          },
          
          // Monetary unit
          {
            type: 'element',
            name: 'unit',
            attributes: { id: data.entity.currency.toLowerCase() },
            elements: [
              {
                type: 'element',
                name: 'measure',
                elements: [{ type: 'text', text: `iso4217:${data.entity.currency}` }]
              }
            ]
          },
          
          // Pure unit for ratios and percentages
          {
            type: 'element',
            name: 'unit',
            attributes: { id: 'pure' },
            elements: [
              {
                type: 'element',
                name: 'measure',
                elements: [{ type: 'text', text: 'pure' }]
              }
            ]
          },
          
          // CO2 equivalent unit
          {
            type: 'element',
            name: 'unit',
            attributes: { id: 'co2e-kg' },
            elements: [
              {
                type: 'element',
                name: 'measure',
                elements: [{ type: 'text', text: 'csrd:CO2EquivalentKilograms' }]
              }
            ]
          },
          
          // Scope 1 Emissions
          {
            type: 'element',
            name: 'csrd:Scope1GHGEmissions',
            attributes: {
              contextRef: 'entity-context',
              unitRef: 'co2e-kg',
              decimals: '2'
            },
            elements: [{ type: 'text', text: data.emissions.scope1.toFixed(2) }]
          },
          
          // Scope 2 Emissions
          {
            type: 'element',
            name: 'csrd:Scope2GHGEmissions',
            attributes: {
              contextRef: 'entity-context',
              unitRef: 'co2e-kg',
              decimals: '2'
            },
            elements: [{ type: 'text', text: data.emissions.scope2.toFixed(2) }]
          },
          
          // Scope 3 Emissions
          {
            type: 'element',
            name: 'csrd:Scope3GHGEmissions',
            attributes: {
              contextRef: 'entity-context',
              unitRef: 'co2e-kg',
              decimals: '2'
            },
            elements: [{ type: 'text', text: data.emissions.scope3.toFixed(2) }]
          },
          
          // Total GHG Emissions
          {
            type: 'element',
            name: 'csrd:TotalGHGEmissions',
            attributes: {
              contextRef: 'entity-context',
              unitRef: 'co2e-kg',
              decimals: '2'
            },
            elements: [{ type: 'text', text: data.emissions.total.toFixed(2) }]
          },
          
          // Methodology framework
          {
            type: 'element',
            name: 'csrd:GHGAccountingMethodology',
            attributes: {
              contextRef: 'entity-context',
              unitRef: 'pure'
            },
            elements: [{ type: 'text', text: data.methodology.framework }]
          },
          
          // Emission factors source
          {
            type: 'element',
            name: 'csrd:EmissionFactorsSource',
            attributes: {
              contextRef: 'entity-context',
              unitRef: 'pure'
            },
            elements: [{ type: 'text', text: data.methodology.emissionFactors }]
          },
          
          // Calculation method
          {
            type: 'element',
            name: 'csrd:CalculationMethod',
            attributes: {
              contextRef: 'entity-context',
              unitRef: 'pure'
            },
            elements: [{ type: 'text', text: data.methodology.calculationMethod }]
          },
          
          // Category breakdowns
          ...data.categories.map((category, index) => ({
            type: 'element',
            name: 'csrd:EmissionCategoryBreakdown',
            attributes: {
              contextRef: 'entity-context',
              unitRef: 'co2e-kg',
              decimals: '2',
              id: `category-${index + 1}`
            },
            elements: [
              {
                type: 'element',
                name: 'csrd:CategoryName',
                elements: [{ type: 'text', text: category.name }]
              },
              {
                type: 'element',
                name: 'csrd:Scope',
                elements: [{ type: 'text', text: category.scope.toString() }]
              },
              {
                type: 'element',
                name: 'csrd:Emissions',
                elements: [{ type: 'text', text: category.emissions.toFixed(2) }]
              },
              {
                type: 'element',
                name: 'csrd:Description',
                elements: [{ type: 'text', text: category.description }]
              }
            ]
          })),
          
          // Report generation metadata
          {
            type: 'element',
            name: 'csrd:ReportGenerationDate',
            attributes: {
              contextRef: 'entity-context',
              unitRef: 'pure'
            },
            elements: [{ type: 'text', text: currentDate }]
          },
          
          // Software information
          {
            type: 'element',
            name: 'csrd:ReportingTool',
            attributes: {
              contextRef: 'entity-context',
              unitRef: 'pure'
            },
            elements: [{ type: 'text', text: 'CSRD Buddy v1.0 - Carbon Emissions Tracking Platform' }]
          }
        ]
      }
    ]
  };
}

export function validateXBRLDocument(filePath: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  try {
    const xmlContent = fs.readFileSync(filePath, 'utf8');
    const result = xml2js(xmlContent, { compact: false });
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Basic validation checks
    if (!result.elements || !result.elements[0] || result.elements[0].name !== 'xbrl') {
      errors.push('Invalid XBRL root element');
    }
    
    // Check for required namespaces
    const xbrlElement = result.elements[0];
    const requiredNamespaces = ['xmlns', 'xmlns:xsi', 'xmlns:csrd'];
    
    for (const ns of requiredNamespaces) {
      if (!xbrlElement.attributes || !xbrlElement.attributes[ns]) {
        errors.push(`Missing required namespace: ${ns}`);
      }
    }
    
    // Check for required elements
    const requiredElements = [
      'csrd:Scope1GHGEmissions',
      'csrd:Scope2GHGEmissions', 
      'csrd:Scope3GHGEmissions',
      'csrd:TotalGHGEmissions'
    ];
    
    const elementNames = extractElementNames(xbrlElement);
    for (const required of requiredElements) {
      if (!elementNames.includes(required)) {
        warnings.push(`Missing recommended element: ${required}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [`Failed to validate XBRL: ${error.message}`],
      warnings: []
    };
  }
}

function extractElementNames(element: any): string[] {
  const names: string[] = [];
  
  if (element.name) {
    names.push(element.name);
  }
  
  if (element.elements) {
    for (const child of element.elements) {
      names.push(...extractElementNames(child));
    }
  }
  
  return names;
}