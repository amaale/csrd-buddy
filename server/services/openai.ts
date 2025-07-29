import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface TransactionClassification {
  category: string;
  subcategory?: string;
  scope: 1 | 2 | 3;
  confidence: number;
  reasoning: string;
}

export async function classifyTransaction(
  description: string,
  amount: number
): Promise<TransactionClassification> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
Amount: €${amount}

Provide the classification in JSON format.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      category: result.category || "Unknown",
      subcategory: result.subcategory || undefined,
      scope: result.scope || 3,
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      reasoning: result.reasoning || "Classification based on transaction description"
    };
  } catch (error) {
    console.error("Error classifying transaction:", error);
    // Fallback classification
    return {
      category: "Unknown",
      scope: 3,
      confidence: 0.1,
      reasoning: "AI classification failed, manual review required"
    };
  }
}

export async function classifyTransactionsBatch(
  transactions: Array<{ description: string; amount: number }>
): Promise<TransactionClassification[]> {
  const classifications: TransactionClassification[] = [];
  
  // Process in batches to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    const batchPromises = batch.map(tx => classifyTransaction(tx.description, tx.amount));
    const batchResults = await Promise.all(batchPromises);
    classifications.push(...batchResults);
    
    // Small delay between batches
    if (i + batchSize < transactions.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return classifications;
}
