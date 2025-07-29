// Advanced carbon accounting features
import { db } from '../db';
import { transactions, emissionFactors } from '@shared/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';

interface CarbonIntensity {
  totalEmissions: number;
  revenue: number;
  intensity: number; // kg CO2e per EUR revenue
  unit: string;
}

interface EmissionTrend {
  period: string;
  emissions: number;
  percentageChange: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface CarbonBudget {
  annualTarget: number;
  currentEmissions: number;
  remainingBudget: number;
  projectedAnnual: number;
  onTrack: boolean;
  daysRemaining: number;
}

interface Benchmark {
  sector: string;
  averageIntensity: number;
  companyIntensity: number;
  percentile: number;
  performance: 'above_average' | 'average' | 'below_average';
}

export class AdvancedCarbonAccounting {
  // Carbon intensity analysis
  async calculateCarbonIntensity(
    userId: string,
    revenue: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<CarbonIntensity> {
    const totalEmissions = await this.getTotalEmissions(userId, startDate, endDate);
    
    const intensity = revenue > 0 ? totalEmissions / revenue : 0;
    
    return {
      totalEmissions,
      revenue,
      intensity,
      unit: 'kg CO2e/EUR'
    };
  }

  // Emission trend analysis with statistical significance
  async calculateEmissionTrends(
    userId: string,
    periods: number = 12
  ): Promise<EmissionTrend[]> {
    const trends: EmissionTrend[] = [];
    
    for (let i = 0; i < periods; i++) {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() - i);
      const startDate = new Date(endDate);
      startDate.setMonth(startDate.getMonth() - 1);
      
      const emissions = await this.getTotalEmissions(userId, startDate, endDate);
      
      let percentageChange = 0;
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      
      if (i < periods - 1) {
        const prevEndDate = new Date(endDate);
        prevEndDate.setMonth(prevEndDate.getMonth() - 1);
        const prevStartDate = new Date(prevEndDate);
        prevStartDate.setMonth(prevStartDate.getMonth() - 1);
        
        const prevEmissions = await this.getTotalEmissions(userId, prevStartDate, prevEndDate);
        
        if (prevEmissions > 0) {
          percentageChange = ((emissions - prevEmissions) / prevEmissions) * 100;
          
          if (Math.abs(percentageChange) < 5) {
            trend = 'stable';
          } else if (percentageChange > 0) {
            trend = 'increasing';
          } else {
            trend = 'decreasing';
          }
        }
      }
      
      trends.push({
        period: `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`,
        emissions,
        percentageChange,
        trend
      });
    }
    
    return trends.reverse();
  }

  // Carbon budget tracking and projections
  async calculateCarbonBudget(
    userId: string,
    annualTarget: number
  ): Promise<CarbonBudget> {
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const today = new Date();
    const yearEnd = new Date(new Date().getFullYear(), 11, 31);
    
    const currentEmissions = await this.getTotalEmissions(userId, yearStart, today);
    const remainingBudget = Math.max(0, annualTarget - currentEmissions);
    
    // Calculate projection based on current rate
    const daysElapsed = Math.floor((today.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.floor((yearEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const totalDaysInYear = Math.floor((yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
    
    const currentRate = daysElapsed > 0 ? currentEmissions / daysElapsed : 0;
    const projectedAnnual = currentRate * totalDaysInYear;
    
    const onTrack = projectedAnnual <= annualTarget;
    
    return {
      annualTarget,
      currentEmissions,
      remainingBudget,
      projectedAnnual,
      onTrack,
      daysRemaining
    };
  }

  // Sector benchmarking
  async calculateSectorBenchmark(
    userId: string,
    sector: string,
    revenue: number
  ): Promise<Benchmark> {
    // Sector average intensities (kg CO2e/EUR revenue) - these would come from industry databases
    const sectorAverages: Record<string, number> = {
      'manufacturing': 0.45,
      'technology': 0.12,
      'retail': 0.18,
      'finance': 0.08,
      'healthcare': 0.22,
      'construction': 0.65,
      'transportation': 0.85,
      'energy': 1.20,
      'agriculture': 0.55,
      'hospitality': 0.35,
      'default': 0.25
    };
    
    const averageIntensity = sectorAverages[sector.toLowerCase()] || sectorAverages['default'];
    const intensity = await this.calculateCarbonIntensity(userId, revenue);
    const companyIntensity = intensity.intensity;
    
    // Calculate percentile (simplified - real implementation would use industry data)
    const ratio = companyIntensity / averageIntensity;
    let percentile: number;
    let performance: 'above_average' | 'average' | 'below_average';
    
    if (ratio <= 0.8) {
      percentile = 90; // Top 10% (lower emissions)
      performance = 'above_average';
    } else if (ratio <= 1.2) {
      percentile = 50; // Average
      performance = 'average';
    } else {
      percentile = 10; // Bottom 10% (higher emissions)
      performance = 'below_average';
    }
    
    return {
      sector,
      averageIntensity,
      companyIntensity,
      percentile,
      performance
    };
  }

  // Scope-based analysis with detailed categorization
  async calculateScopeAnalysis(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    scope1: { total: number; categories: Array<{ category: string; emissions: number; percentage: number }> };
    scope2: { total: number; categories: Array<{ category: string; emissions: number; percentage: number }> };
    scope3: { total: number; categories: Array<{ category: string; emissions: number; percentage: number }> };
  }> {
    const conditions = [eq(transactions.userId, userId)];
    
    if (startDate) {
      conditions.push(gte(transactions.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(transactions.date, endDate));
    }
    
    const [scope1Data, scope2Data, scope3Data] = await Promise.all([
      this.getScopeBreakdown(userId, 1, startDate, endDate),
      this.getScopeBreakdown(userId, 2, startDate, endDate),
      this.getScopeBreakdown(userId, 3, startDate, endDate)
    ]);
    
    return {
      scope1: scope1Data,
      scope2: scope2Data,
      scope3: scope3Data
    };
  }

  // Emission reduction opportunities identification
  async identifyReductionOpportunities(
    userId: string
  ): Promise<Array<{
    category: string;
    currentEmissions: number;
    potentialReduction: number;
    cost: number;
    roi: number; // EUR saved per EUR invested
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    recommendation: string;
  }>> {
    const scopeAnalysis = await this.calculateScopeAnalysis(userId);
    const opportunities = [];
    
    // Analyze each major category for reduction potential
    const allCategories = [
      ...scopeAnalysis.scope1.categories,
      ...scopeAnalysis.scope2.categories,
      ...scopeAnalysis.scope3.categories
    ];
    
    for (const category of allCategories) {
      if (category.emissions > 100) { // Only consider significant emission sources
        const opportunity = this.generateReductionOpportunity(category);
        if (opportunity) {
          opportunities.push(opportunity);
        }
      }
    }
    
    // Sort by ROI descending
    return opportunities.sort((a, b) => b.roi - a.roi);
  }

  // Carbon pricing and financial impact analysis
  async calculateCarbonCosts(
    userId: string,
    carbonPrice: number = 85, // EUR per tonne CO2e (EU ETS average 2024)
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalCost: number;
    costByScope: { scope1: number; scope2: number; scope3: number };
    monthlyAverage: number;
    projectedAnnual: number;
  }> {
    const scopeAnalysis = await this.calculateScopeAnalysis(userId, startDate, endDate);
    
    const scope1Cost = (scopeAnalysis.scope1.total / 1000) * carbonPrice;
    const scope2Cost = (scopeAnalysis.scope2.total / 1000) * carbonPrice;
    const scope3Cost = (scopeAnalysis.scope3.total / 1000) * carbonPrice;
    
    const totalCost = scope1Cost + scope2Cost + scope3Cost;
    
    // Calculate time period for monthly average
    const end = endDate || new Date();
    const start = startDate || new Date(end.getFullYear(), 0, 1);
    const months = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    
    const monthlyAverage = totalCost / months;
    const projectedAnnual = monthlyAverage * 12;
    
    return {
      totalCost,
      costByScope: {
        scope1: scope1Cost,
        scope2: scope2Cost,
        scope3: scope3Cost
      },
      monthlyAverage,
      projectedAnnual
    };
  }

  // Private helper methods
  private async getTotalEmissions(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    const conditions = [eq(transactions.userId, userId)];
    
    if (startDate) {
      conditions.push(gte(transactions.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(transactions.date, endDate));
    }
    
    const result = await db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(${transactions.co2Emissions} AS NUMERIC)), 0)`
      })
      .from(transactions)
      .where(and(...conditions));
    
    return result[0]?.total || 0;
  }

  private async getScopeBreakdown(
    userId: string,
    scope: number,
    startDate?: Date,
    endDate?: Date
  ) {
    const conditions = [
      eq(transactions.userId, userId),
      eq(transactions.scope, scope)
    ];
    
    if (startDate) {
      conditions.push(gte(transactions.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(transactions.date, endDate));
    }
    
    const categoryBreakdown = await db
      .select({
        category: transactions.category,
        emissions: sql<number>`COALESCE(SUM(CAST(${transactions.co2Emissions} AS NUMERIC)), 0)`
      })
      .from(transactions)
      .where(and(...conditions))
      .groupBy(transactions.category)
      .orderBy(desc(sql`SUM(CAST(${transactions.co2Emissions} AS NUMERIC))`));
    
    const total = categoryBreakdown.reduce((sum, cat) => sum + cat.emissions, 0);
    
    const categories = categoryBreakdown.map(cat => ({
      category: cat.category || 'Unknown',
      emissions: Number(cat.emissions) || 0,
      percentage: total > 0 ? (Number(cat.emissions) / total) * 100 : 0
    }));
    
    return { total, categories };
  }

  private generateReductionOpportunity(category: { category: string; emissions: number }) {
    // Reduction opportunity database - real implementation would be more sophisticated
    const opportunities: Record<string, any> = {
      'Fuel and Energy': {
        potentialReduction: 0.3, // 30% reduction possible
        cost: 5000, // Initial investment
        roi: 2.5,
        effort: 'medium',
        impact: 'high',
        recommendation: 'Switch to electric vehicles and optimize route planning'
      },
      'Energy': {
        potentialReduction: 0.4,
        cost: 3000,
        roi: 3.2,
        effort: 'low',
        impact: 'high',
        recommendation: 'Switch to renewable energy supplier and improve energy efficiency'
      },
      'Business Travel': {
        potentialReduction: 0.5,
        cost: 1000,
        roi: 4.1,
        effort: 'low',
        impact: 'medium',
        recommendation: 'Implement virtual meeting policy and carbon-conscious travel booking'
      }
    };
    
    const opp = opportunities[category.category];
    if (!opp) return null;
    
    return {
      category: category.category,
      currentEmissions: category.emissions,
      potentialReduction: category.emissions * opp.potentialReduction,
      cost: opp.cost,
      roi: opp.roi,
      effort: opp.effort,
      impact: opp.impact,
      recommendation: opp.recommendation
    };
  }
}

export const advancedAccounting = new AdvancedCarbonAccounting();