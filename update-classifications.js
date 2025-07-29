// Quick script to reclassify existing transactions
import { db } from './server/db.js';
import { transactions } from './shared/schema.js';
import { eq } from 'drizzle-orm';
import { classifyTransactionFallback } from './server/services/fallback-classifier.js';
import { calculateEmissions } from './server/services/emissions.js';

async function updateClassifications() {
  const allTransactions = await db.select().from(transactions);
  
  for (const transaction of allTransactions) {
    const classification = classifyTransactionFallback(transaction.description, transaction.amount);
    const emissions = await calculateEmissions(classification.category, classification.subcategory, transaction.amount);
    
    await db.update(transactions)
      .set({
        category: classification.category,
        scope: classification.scope,
        co2Emissions: emissions,
        verified: true
      })
      .where(eq(transactions.id, transaction.id));
    
    console.log(`Updated: ${transaction.description} -> ${classification.category} (Scope ${classification.scope})`);
  }
  
  console.log('All transactions updated!');
}

updateClassifications().catch(console.error);