// Climatiq API integration for enhanced emission factors
interface ClimatiqEmissionFactor {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  factor: number;
  unit: string;
  region: string;
  year: number;
  source: string;
  uncertainty?: number;
}

interface ClimatiqSearchRequest {
  query?: string;
  category?: string;
  region?: string;
  year?: number;
  unit_type?: string;
  limit?: number;
}

interface ClimatiqCalculationRequest {
  emission_factor_id: string;
  activity_data: {
    amount: number;
    unit: string;
  };
}

class ClimatiqService {
  private apiKey: string;
  private baseUrl = 'https://api.climatiq.io/v1';

  constructor() {
    this.apiKey = process.env.CLIMATIQ_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Climatiq API key not found. Using fallback emission factors.');
    }
  }

  async searchEmissionFactors(request: ClimatiqSearchRequest): Promise<ClimatiqEmissionFactor[]> {
    if (!this.apiKey) {
      return this.getFallbackFactors(request);
    }

    try {
      const params = new URLSearchParams();
      if (request.query) params.append('query', request.query);
      if (request.category) params.append('category', request.category);
      if (request.region) params.append('region', request.region);
      if (request.year) params.append('year', request.year.toString());
      if (request.unit_type) params.append('unit_type', request.unit_type);
      if (request.limit) params.append('limit', request.limit.toString());

      const response = await fetch(`${this.baseUrl}/emission-factors?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Climatiq API error: ${response.status}`);
      }

      const data = await response.json();
      return data.results.map(this.mapClimatiqFactor);
    } catch (error) {
      console.error('Climatiq search failed:', error);
      return this.getFallbackFactors(request);
    }
  }

  async calculateEmissions(request: ClimatiqCalculationRequest): Promise<{
    emissions: number;
    unit: string;
    factor_id: string;
  }> {
    if (!this.apiKey) {
      return this.calculateFallbackEmissions(request);
    }

    try {
      const response = await fetch(`${this.baseUrl}/calculations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Climatiq calculation error: ${response.status}`);
      }

      const data = await response.json();
      return {
        emissions: data.co2e,
        unit: data.co2e_unit,
        factor_id: request.emission_factor_id
      };
    } catch (error) {
      console.error('Climatiq calculation failed:', error);
      return this.calculateFallbackEmissions(request);
    }
  }

  async findBestEmissionFactor(category: string, subcategory?: string, region: string = 'EU'): Promise<ClimatiqEmissionFactor | null> {
    const searchQueries = [
      `${category} ${subcategory || ''}`.trim(),
      category
    ];

    for (const query of searchQueries) {
      const factors = await this.searchEmissionFactors({
        query,
        region,
        year: 2024,
        limit: 5
      });

      if (factors.length > 0) {
        // Prefer factors that match both category and subcategory
        const exactMatch = factors.find(f => 
          f.category.toLowerCase().includes(category.toLowerCase()) &&
          (!subcategory || f.subcategory?.toLowerCase().includes(subcategory.toLowerCase()))
        );
        
        return exactMatch || factors[0];
      }
    }

    return null;
  }

  private mapClimatiqFactor(data: any): ClimatiqEmissionFactor {
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      subcategory: data.subcategory,
      factor: data.factor,
      unit: data.unit,
      region: data.region,
      year: data.year,
      source: data.source,
      uncertainty: data.uncertainty
    };
  }

  private getFallbackFactors(request: ClimatiqSearchRequest): ClimatiqEmissionFactor[] {
    // Enhanced fallback factors based on DEFRA 2024 and IPCC guidelines
    const fallbackFactors: ClimatiqEmissionFactor[] = [
      {
        id: 'fuel-diesel-fallback',
        name: 'Diesel Fuel - Road Transport',
        category: 'fuel',
        subcategory: 'diesel',
        factor: 2.687,
        unit: 'kg CO2e/liter',
        region: 'EU',
        year: 2024,
        source: 'DEFRA 2024'
      },
      {
        id: 'fuel-petrol-fallback',
        name: 'Petrol Fuel - Road Transport',
        category: 'fuel',
        subcategory: 'petrol',
        factor: 2.296,
        unit: 'kg CO2e/liter',
        region: 'EU',
        year: 2024,
        source: 'DEFRA 2024'
      },
      {
        id: 'electricity-eu-fallback',
        name: 'Electricity - EU Grid Average',
        category: 'electricity',
        factor: 0.275,
        unit: 'kg CO2e/kWh',
        region: 'EU',
        year: 2024,
        source: 'EU ETS 2024'
      },
      {
        id: 'natural-gas-fallback',
        name: 'Natural Gas - Commercial Use',
        category: 'energy',
        subcategory: 'natural_gas',
        factor: 0.184,
        unit: 'kg CO2e/kWh',
        region: 'EU',
        year: 2024,
        source: 'DEFRA 2024'
      },
      {
        id: 'air-travel-short-fallback',
        name: 'Air Travel - Short Haul (<500km)',
        category: 'transport',
        subcategory: 'air_travel',
        factor: 0.158,
        unit: 'kg CO2e/km',
        region: 'EU',
        year: 2024,
        source: 'DEFRA 2024'
      },
      {
        id: 'air-travel-medium-fallback',
        name: 'Air Travel - Medium Haul (500-1600km)',
        category: 'transport',
        subcategory: 'air_travel',
        factor: 0.102,
        unit: 'kg CO2e/km',
        region: 'EU',
        year: 2024,
        source: 'DEFRA 2024'
      },
      {
        id: 'hotel-accommodation-fallback',
        name: 'Hotel Accommodation - EU Average',
        category: 'accommodation',
        factor: 39.5,
        unit: 'kg CO2e/night',
        region: 'EU',
        year: 2024,
        source: 'Cornell Hotel Research'
      }
    ];

    return fallbackFactors.filter(factor => {
      if (request.category && !factor.category.includes(request.category)) return false;
      if (request.region && factor.region !== request.region) return false;
      if (request.year && Math.abs(factor.year - request.year) > 2) return false;
      return true;
    });
  }

  private calculateFallbackEmissions(request: ClimatiqCalculationRequest): {
    emissions: number;
    unit: string;
    factor_id: string;
  } {
    // Simple fallback calculation - 0.5 kg CO2e per unit
    const fallbackFactor = 0.5;
    
    return {
      emissions: request.activity_data.amount * fallbackFactor,
      unit: 'kg CO2e',
      factor_id: request.emission_factor_id
    };
  }
}

export const climatiqService = new ClimatiqService();

// Enhanced emission calculation with Climatiq integration
export async function calculateEnhancedEmissions(
  category: string,
  subcategory: string | undefined,
  amount: number,
  unit: string = 'EUR',
  region: string = 'EU'
): Promise<{
  emissions: number;
  factor: ClimatiqEmissionFactor | null;
  confidence: number;
}> {
  try {
    // Try to find the best emission factor
    const factor = await climatiqService.findBestEmissionFactor(category, subcategory, region);
    
    if (factor) {
      // Convert monetary amount to appropriate activity data
      const activityData = convertMonetaryToActivity(amount, category, subcategory);
      
      const calculation = await climatiqService.calculateEmissions({
        emission_factor_id: factor.id,
        activity_data: activityData
      });
      
      return {
        emissions: calculation.emissions,
        factor,
        confidence: factor.uncertainty ? (1 - factor.uncertainty) : 0.8
      };
    }
    
    // Fallback to basic calculation
    const fallbackEmissions = calculateBasicEmissions(category, amount, subcategory);
    
    return {
      emissions: fallbackEmissions,
      factor: null,
      confidence: 0.5
    };
  } catch (error) {
    console.error('Enhanced emissions calculation failed:', error);
    
    return {
      emissions: calculateBasicEmissions(category, amount, subcategory),
      factor: null,
      confidence: 0.3
    };
  }
}

function convertMonetaryToActivity(amount: number, category: string, subcategory?: string): {
  amount: number;
  unit: string;
} {
  // Convert monetary amounts to physical activity data based on category
  // These are rough estimates for demonstration - real implementation would use detailed conversion factors
  
  if (category.toLowerCase().includes('fuel')) {
    // Assume €1.50 per liter for fuel
    return {
      amount: amount / 1.5,
      unit: 'liter'
    };
  }
  
  if (category.toLowerCase().includes('electricity') || category.toLowerCase().includes('energy')) {
    // Assume €0.25 per kWh for electricity
    return {
      amount: amount / 0.25,
      unit: 'kWh'
    };
  }
  
  if (category.toLowerCase().includes('travel') || category.toLowerCase().includes('transport')) {
    if (subcategory?.toLowerCase().includes('air')) {
      // Assume €0.15 per km for air travel
      return {
        amount: amount / 0.15,
        unit: 'km'
      };
    } else {
      // Ground transport - assume €0.50 per km
      return {
        amount: amount / 0.50,
        unit: 'km'
      };
    }
  }
  
  if (category.toLowerCase().includes('accommodation') || category.toLowerCase().includes('hotel')) {
    // Assume €150 per night for hotels
    return {
      amount: amount / 150,
      unit: 'night'
    };
  }
  
  // Default: use monetary amount directly
  return {
    amount,
    unit: 'EUR'
  };
}

function calculateBasicEmissions(category: string, amount: number, subcategory?: string): number {
  // Basic emission factors (kg CO2e per EUR spent)
  const basicFactors: Record<string, number> = {
    'fuel': 2.5,
    'energy': 0.3,
    'electricity': 0.2,
    'transport': 0.4,
    'accommodation': 0.15,
    'business_travel': 0.3,
    'office_supplies': 0.1,
    'it_services': 0.05,
    'default': 0.2
  };
  
  const categoryKey = category.toLowerCase().replace(/[^a-z]/g, '_');
  const factor = basicFactors[categoryKey] || basicFactors['default'];
  
  return amount * factor;
}