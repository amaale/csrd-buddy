import { storage } from "../storage";
import { type EmissionFactor } from "@shared/schema";

// Default emission factors based on DEFRA 2024 guidelines
const DEFAULT_EMISSION_FACTORS: Record<string, { factor: number; unit: string; scope: number }> = {
  "fuel_diesel": { factor: 2.687, unit: "kg CO2e per litre", scope: 1 },
  "fuel_petrol": { factor: 2.315, unit: "kg CO2e per litre", scope: 1 },
  "electricity_uk": { factor: 0.193, unit: "kg CO2e per kWh", scope: 2 },
  "natural_gas": { factor: 0.184, unit: "kg CO2e per kWh", scope: 2 },
  "flight_domestic": { factor: 0.255, unit: "kg CO2e per km", scope: 3 },
  "flight_international": { factor: 0.195, unit: "kg CO2e per km", scope: 3 },
  "hotel_night": { factor: 24.3, unit: "kg CO2e per night", scope: 3 },
  "taxi_km": { factor: 0.211, unit: "kg CO2e per km", scope: 3 },
  "office_supplies": { factor: 0.5, unit: "kg CO2e per €", scope: 3 },
  "consulting_services": { factor: 0.1, unit: "kg CO2e per €", scope: 3 },
  "waste_general": { factor: 0.475, unit: "kg CO2e per kg", scope: 3 },
};

export interface EmissionsCalculation {
  co2Emissions: number;
  emissionsFactor: number;
  unit: string;
  source: string;
  confidence: 'high' | 'medium' | 'low';
}

export async function calculateEmissions(
  category: string,
  subcategory: string | undefined,
  amount: number,
  scope: number
): Promise<EmissionsCalculation> {
  try {
    // First try to get factor from database
    let emissionFactor = await storage.getEmissionFactorByCategory(category, subcategory);
    
    if (!emissionFactor) {
      // Fallback to default factors
      const factorKey = getDefaultFactorKey(category, subcategory);
      const defaultFactor = DEFAULT_EMISSION_FACTORS[factorKey];
      
      if (defaultFactor) {
        // Create and store the default factor
        emissionFactor = await storage.createEmissionFactor({
          category,
          subcategory: subcategory || null,
          scope: defaultFactor.scope,
          factor: defaultFactor.factor.toString(),
          unit: defaultFactor.unit,
          source: "DEFRA 2024",
          year: 2024,
          description: `Default factor for ${category}${subcategory ? ` - ${subcategory}` : ''}`
        });
      }
    }

    if (!emissionFactor) {
      // Use a generic factor based on scope
      const genericFactor = getGenericFactor(scope);
      return {
        co2Emissions: amount * genericFactor,
        emissionsFactor: genericFactor,
        unit: "kg CO2e per €",
        source: "Generic estimate",
        confidence: 'low'
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
    
    // Fallback calculation
    const genericFactor = getGenericFactor(scope);
    return {
      co2Emissions: amount * genericFactor,
      emissionsFactor: genericFactor,
      unit: "kg CO2e per €",
      source: "Fallback estimate",
      confidence: 'low'
    };
  }
}

function getDefaultFactorKey(category: string, subcategory?: string): string {
  const cat = category.toLowerCase();
  const subcat = subcategory?.toLowerCase();
  
  if (cat.includes('fuel') || cat.includes('transport')) {
    if (subcat?.includes('diesel')) return 'fuel_diesel';
    if (subcat?.includes('petrol') || subcat?.includes('gasoline')) return 'fuel_petrol';
    return 'fuel_diesel'; // default to diesel
  }
  
  if (cat.includes('electricity') || cat.includes('energy')) {
    if (subcat?.includes('gas') || subcat?.includes('natural gas')) return 'natural_gas';
    return 'electricity_uk';
  }
  
  if (cat.includes('travel') || cat.includes('flight')) {
    if (subcat?.includes('domestic')) return 'flight_domestic';
    return 'flight_international';
  }
  
  if (cat.includes('hotel') || cat.includes('accommodation')) {
    return 'hotel_night';
  }
  
  if (cat.includes('taxi') || cat.includes('uber')) {
    return 'taxi_km';
  }
  
  if (cat.includes('office') || cat.includes('supplies')) {
    return 'office_supplies';
  }
  
  if (cat.includes('consulting') || cat.includes('services')) {
    return 'consulting_services';
  }
  
  if (cat.includes('waste')) {
    return 'waste_general';
  }
  
  return 'office_supplies'; // default fallback
}

function calculateEmissionsByCategory(category: string, amount: number, factor: number): number {
  const cat = category.toLowerCase();
  
  // For fuel, assume amount in € converts to approximate litres
  if (cat.includes('fuel')) {
    // Rough estimate: €1.5 per litre
    const litres = amount / 1.5;
    return litres * factor;
  }
  
  // For energy bills, estimate kWh from amount
  if (cat.includes('electricity') || cat.includes('energy')) {
    // Rough estimate: €0.25 per kWh
    const kWh = amount / 0.25;
    return kWh * factor;
  }
  
  // For travel, use monetary amount as proxy
  if (cat.includes('travel') || cat.includes('flight')) {
    // Rough estimate based on cost per km
    const estimatedKm = amount / 0.5; // €0.5 per km average
    return estimatedKm * factor;
  }
  
  // For accommodation
  if (cat.includes('hotel')) {
    const nights = amount / 100; // €100 per night average
    return nights * factor;
  }
  
  // Default: monetary factor
  return amount * factor;
}

function getGenericFactor(scope: number): number {
  switch (scope) {
    case 1: return 0.3; // kg CO2e per €
    case 2: return 0.2; // kg CO2e per €
    case 3: return 0.15; // kg CO2e per €
    default: return 0.2;
  }
}

function getConfidence(source: string): 'high' | 'medium' | 'low' {
  if (source.includes('DEFRA') || source.includes('Climatiq')) return 'high';
  if (source.includes('Default') || source.includes('2024')) return 'medium';
  return 'low';
}

export async function initializeDefaultEmissionFactors(): Promise<void> {
  try {
    const existingFactors = await storage.getEmissionFactors();
    
    if (existingFactors.length === 0) {
      console.log("Initializing default emission factors...");
      
      for (const [key, data] of Object.entries(DEFAULT_EMISSION_FACTORS)) {
        const [category, subcategory] = key.split('_');
        
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
