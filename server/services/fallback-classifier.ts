// Fallback classification when OpenAI is unavailable
export function classifyTransactionFallback(description: string, amount: number) {
  const desc = description.toLowerCase();
  
  // Scope 1 - Direct emissions
  if (desc.includes('fuel') || desc.includes('diesel') || desc.includes('petrol') || 
      desc.includes('shell') || desc.includes('bp') || desc.includes('total')) {
    return {
      category: 'Fuel and Energy',
      subcategory: 'Vehicle Fuel',
      scope: 1,
      confidence: 0.9
    };
  }
  
  // Scope 2 - Indirect energy emissions
  if (desc.includes('electricity') || desc.includes('gas') || desc.includes('energy') ||
      desc.includes('british gas') || desc.includes('edf') || desc.includes('sse') ||
      desc.includes('enel') || desc.includes('heating')) {
    return {
      category: 'Energy',
      subcategory: desc.includes('gas') || desc.includes('heating') ? 'Natural Gas' : 'Electricity',
      scope: 2,
      confidence: 0.85
    };
  }
  
  // Scope 3 - Business travel
  if (desc.includes('flight') || desc.includes('airline') || desc.includes('ryanair') ||
      desc.includes('lufthansa') || desc.includes('eurostar')) {
    return {
      category: 'Business Travel',
      subcategory: 'Air Travel',
      scope: 3,
      confidence: 0.9
    };
  }
  
  if (desc.includes('hotel') || desc.includes('hilton') || desc.includes('marriott')) {
    return {
      category: 'Business Travel',
      subcategory: 'Accommodation',
      scope: 3,
      confidence: 0.85
    };
  }
  
  if (desc.includes('uber') || desc.includes('taxi')) {
    return {
      category: 'Business Travel',
      subcategory: 'Ground Transport',
      scope: 3,
      confidence: 0.8
    };
  }
  
  // Scope 3 - Other categories
  if (desc.includes('office') || desc.includes('depot') || desc.includes('paper') ||
      desc.includes('supplies')) {
    return {
      category: 'Purchased Goods',
      subcategory: 'Office Supplies',
      scope: 3,
      confidence: 0.75
    };
  }
  
  if (desc.includes('microsoft') || desc.includes('google') || desc.includes('aws') ||
      desc.includes('workspace') || desc.includes('cloud')) {
    return {
      category: 'Purchased Services',
      subcategory: 'IT Services',
      scope: 3,
      confidence: 0.8
    };
  }
  
  if (desc.includes('waste') || desc.includes('management')) {
    return {
      category: 'Waste',
      subcategory: 'Waste Treatment',
      scope: 3,
      confidence: 0.85
    };
  }
  
  if (desc.includes('shipping') || desc.includes('dhl') || desc.includes('delivery')) {
    return {
      category: 'Transportation',
      subcategory: 'Freight',
      scope: 3,
      confidence: 0.8
    };
  }
  
  if (desc.includes('office space') || desc.includes('rent') || desc.includes('wework')) {
    return {
      category: 'Facilities',
      subcategory: 'Office Space',
      scope: 3,
      confidence: 0.7
    };
  }
  
  // Default fallback
  return {
    category: 'Other',
    subcategory: 'Miscellaneous',
    scope: 3,
    confidence: 0.5
  };
}