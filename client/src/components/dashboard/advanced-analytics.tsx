import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, DollarSign, BarChart3, PieChart } from 'lucide-react';

interface CarbonIntensity {
  totalEmissions: number;
  revenue: number;
  intensity: number;
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

interface ReductionOpportunity {
  category: string;
  currentEmissions: number;
  potentialReduction: number;
  cost: number;
  roi: number;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  recommendation: string;
}

export function AdvancedAnalytics() {
  const { t } = useTranslation();
  const [revenue, setRevenue] = useState(1000000);
  const [sector, setSector] = useState('technology');
  const [annualTarget, setAnnualTarget] = useState(5000);
  const [carbonPrice, setCarbonPrice] = useState(85);

  // Carbon intensity analysis
  const { data: carbonIntensity } = useQuery({
    queryKey: ['/api/analytics/carbon-intensity', revenue],
    enabled: revenue > 0,
    queryFn: async () => {
      const response = await fetch(`/api/analytics/carbon-intensity?revenue=${revenue}`);
      if (!response.ok) throw new Error('Failed to fetch carbon intensity');
      return response.json() as Promise<CarbonIntensity>;
    }
  });

  // Emission trends
  const { data: trends } = useQuery({
    queryKey: ['/api/analytics/trends'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/trends');
      if (!response.ok) throw new Error('Failed to fetch trends');
      return response.json() as Promise<EmissionTrend[]>;
    }
  });

  // Carbon budget tracking
  const { data: carbonBudget } = useQuery({
    queryKey: ['/api/analytics/carbon-budget', annualTarget],
    enabled: annualTarget > 0,
    queryFn: async () => {
      const response = await fetch(`/api/analytics/carbon-budget?annualTarget=${annualTarget}`);
      if (!response.ok) throw new Error('Failed to fetch carbon budget');
      return response.json() as Promise<CarbonBudget>;
    }
  });

  // Sector benchmarking
  const { data: benchmark } = useQuery({
    queryKey: ['/api/analytics/benchmarking', sector, revenue],
    enabled: Boolean(sector) && revenue > 0,
    queryFn: async () => {
      const response = await fetch(`/api/analytics/benchmarking?sector=${sector}&revenue=${revenue}`);
      if (!response.ok) throw new Error('Failed to fetch benchmark data');
      return response.json() as Promise<Benchmark>;
    }
  });

  // Reduction opportunities
  const { data: opportunities } = useQuery({
    queryKey: ['/api/analytics/reduction-opportunities'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/reduction-opportunities');
      if (!response.ok) throw new Error('Failed to fetch opportunities');
      return response.json() as Promise<ReductionOpportunity[]>;
    }
  });

  // Carbon costs
  const { data: carbonCosts } = useQuery({
    queryKey: ['/api/analytics/carbon-costs', carbonPrice],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/carbon-costs?carbonPrice=${carbonPrice}`);
      if (!response.ok) throw new Error('Failed to fetch carbon costs');
      return response.json() as Promise<{
        totalCost: number;
        costByScope: { scope1: number; scope2: number; scope3: number };
        monthlyAverage: number;
        projectedAnnual: number;
      }>;
    }
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <BarChart3 className="w-4 h-4 text-neutral-500" />;
    }
  };

  const getPerformanceBadge = (performance: string) => {
    const badges = {
      above_average: 'bg-green-100 text-green-800',
      average: 'bg-yellow-100 text-yellow-800',
      below_average: 'bg-red-100 text-red-800'
    };
    return badges[performance as keyof typeof badges] || badges.average;
  };

  const getEffortBadge = (effort: string) => {
    const badges = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return badges[effort as keyof typeof badges] || badges.medium;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-900">{t('advanced.carbonAccounting')}</h2>
      </div>

      <Tabs defaultValue="intensity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="intensity">{t('advanced.intensity')}</TabsTrigger>
          <TabsTrigger value="trends">{t('advanced.trends')}</TabsTrigger>
          <TabsTrigger value="budget">{t('advanced.budget')}</TabsTrigger>
          <TabsTrigger value="benchmarking">{t('advanced.benchmarking')}</TabsTrigger>
          <TabsTrigger value="opportunities">{t('advanced.opportunities')}</TabsTrigger>
          <TabsTrigger value="pricing">{t('advanced.pricing')}</TabsTrigger>
        </TabsList>

        <TabsContent value="intensity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                {t('advanced.intensity')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">
                    Annual Revenue (€)
                  </label>
                  <Input
                    type="number"
                    value={revenue}
                    onChange={(e) => setRevenue(Number(e.target.value))}
                    min="0"
                  />
                </div>
              </div>

              {carbonIntensity && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-neutral-50 rounded-lg">
                    <div className="text-2xl font-bold text-neutral-900">
                      {carbonIntensity.totalEmissions.toFixed(1)}
                    </div>
                    <div className="text-sm text-neutral-600">{t('units.kgCO2e')}</div>
                    <div className="text-xs text-neutral-500">{t('dashboard.totalEmissions')}</div>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-lg">
                    <div className="text-2xl font-bold text-neutral-900">
                      {carbonIntensity.intensity.toFixed(3)}
                    </div>
                    <div className="text-sm text-neutral-600">{carbonIntensity.unit}</div>
                    <div className="text-xs text-neutral-500">{t('advanced.intensity')}</div>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-lg">
                    <div className="text-2xl font-bold text-neutral-900">
                      €{revenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-neutral-600">Revenue</div>
                    <div className="text-xs text-neutral-500">Annual</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {t('advanced.trends')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trends && trends.length > 0 ? (
                <div className="space-y-2">
                  {trends.slice(0, 6).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTrendIcon(trend.trend)}
                        <span className="font-medium">{trend.period}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {trend.emissions.toFixed(1)} {t('units.kgCO2e')}
                        </div>
                        <div className={`text-sm ${
                          trend.percentageChange > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {trend.percentageChange > 0 ? '+' : ''}{trend.percentageChange.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-neutral-500 py-8">
                  {t('messages.noData')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {t('advanced.budget')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">
                    {t('advanced.targets')} ({t('units.kgCO2e')})
                  </label>
                  <Input
                    type="number"
                    value={annualTarget}
                    onChange={(e) => setAnnualTarget(Number(e.target.value))}
                    min="0"
                  />
                </div>
              </div>

              {carbonBudget && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-neutral-50 rounded-lg">
                      <div className="text-2xl font-bold text-neutral-900">
                        {carbonBudget.currentEmissions.toFixed(1)}
                      </div>
                      <div className="text-sm text-neutral-600">Current Emissions</div>
                    </div>
                    <div className="text-center p-4 bg-neutral-50 rounded-lg">
                      <div className="text-2xl font-bold text-neutral-900">
                        {carbonBudget.remainingBudget.toFixed(1)}
                      </div>
                      <div className="text-sm text-neutral-600">Remaining Budget</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress to Target</span>
                      <span>{((carbonBudget.currentEmissions / carbonBudget.annualTarget) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={(carbonBudget.currentEmissions / carbonBudget.annualTarget) * 100}
                      className="h-2"
                    />
                  </div>

                  <div className={`p-3 rounded-lg ${
                    carbonBudget.onTrack ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="font-medium">
                      {carbonBudget.onTrack ? '✅ On Track' : '⚠️ Over Budget'}
                    </div>
                    <div className="text-sm text-neutral-600 mt-1">
                      Projected annual: {carbonBudget.projectedAnnual.toFixed(1)} {t('units.kgCO2e')}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('advanced.benchmarking')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Sector</label>
                  <Select value={sector} onValueChange={setSector}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {benchmark && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-neutral-50 rounded-lg">
                      <div className="text-lg font-bold">
                        {benchmark.companyIntensity?.toFixed(3) || '0.000'}
                      </div>
                      <div className="text-sm text-neutral-600">Your Intensity</div>
                    </div>
                    <div className="text-center p-4 bg-neutral-50 rounded-lg">
                      <div className="text-lg font-bold">
                        {benchmark.averageIntensity?.toFixed(3) || '0.000'}
                      </div>
                      <div className="text-sm text-neutral-600">Sector Average</div>
                    </div>
                    <div className="text-center p-4 bg-neutral-50 rounded-lg">
                      <div className="text-lg font-bold">
                        {benchmark.percentile || 0}th
                      </div>
                      <div className="text-sm text-neutral-600">Percentile</div>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg text-center ${getPerformanceBadge(benchmark.performance || 'average')}`}>
                    <span className="font-medium capitalize">
                      {(benchmark.performance || 'average').replace('_', ' ')} Performance
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('advanced.opportunities')}</CardTitle>
            </CardHeader>
            <CardContent>
              {opportunities && opportunities.length > 0 ? (
                <div className="space-y-4">
                  {opportunities.map((opp, index) => (
                    <div key={index} className="p-4 border border-neutral-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{opp.category}</h4>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 text-xs rounded ${getEffortBadge(opp.effort)}`}>
                            {opp.effort} effort
                          </span>
                          <span className={`px-2 py-1 text-xs rounded ${getEffortBadge(opp.impact)}`}>
                            {opp.impact} impact
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                        <div>
                          <div className="font-medium">{opp.currentEmissions.toFixed(1)} kg CO₂e</div>
                          <div className="text-neutral-600">Current</div>
                        </div>
                        <div>
                          <div className="font-medium text-green-600">-{opp.potentialReduction.toFixed(1)} kg CO₂e</div>
                          <div className="text-neutral-600">Reduction</div>
                        </div>
                        <div>
                          <div className="font-medium">€{opp.cost.toLocaleString()}</div>
                          <div className="text-neutral-600">Investment</div>
                        </div>
                        <div>
                          <div className="font-medium">{opp.roi.toFixed(1)}x</div>
                          <div className="text-neutral-600">ROI</div>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-700">{opp.recommendation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-neutral-500 py-8">
                  {t('messages.noData')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                {t('advanced.pricing')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">
                    Carbon Price (€ per tonne CO₂e)
                  </label>
                  <Input
                    type="number"
                    value={carbonPrice}
                    onChange={(e) => setCarbonPrice(Number(e.target.value))}
                    min="0"
                  />
                </div>
              </div>

              {carbonCosts && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-neutral-50 rounded-lg">
                    <div className="text-2xl font-bold text-neutral-900">
                      €{carbonCosts.totalCost?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-sm text-neutral-600">Total Carbon Cost</div>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-lg">
                    <div className="text-2xl font-bold text-neutral-900">
                      €{carbonCosts.projectedAnnual?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-sm text-neutral-600">Projected Annual</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
