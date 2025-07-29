import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Chart from "chart.js/auto";

interface EmissionsTrend {
  month: string;
  totalEmissions: number;
  scope1: number;
  scope2: number;
  scope3: number;
}

interface TrendChartProps {
  trend?: EmissionsTrend[];
  isLoading: boolean;
}

export function TrendChart({ trend, isLoading }: TrendChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || isLoading || !trend) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Transform data for chart
    const labels = trend.map(t => {
      const [year, month] = t.month.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { month: 'short' });
    });

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Total Emissions',
          data: trend.map(t => t.totalEmissions),
          borderColor: 'hsl(207, 90%, 54%)',
          backgroundColor: 'hsla(207, 90%, 54%, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'hsl(0, 0%, 88%)'
            },
            ticks: {
              callback: function(value) {
                return value + ' tCO₂e';
              }
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [trend, isLoading]);

  if (isLoading) {
    return (
      <Card className="material-shadow-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <div className="flex space-x-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full mb-4" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="h-3 w-20 mx-auto" />
                <Skeleton className="h-6 w-16 mx-auto" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics from trend data
  const avgMonthly = trend ? trend.reduce((sum, t) => sum + t.totalEmissions, 0) / trend.length : 0;
  const peakMonth = trend ? Math.max(...trend.map(t => t.totalEmissions)) : 0;

  return (
    <Card className="material-shadow-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-neutral-900">Emissions Trend</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="bg-primary/10 text-primary border-primary/20">
              Monthly
            </Button>
            <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-primary">
              Quarterly
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 mb-4">
          <canvas ref={chartRef} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-neutral-500 mb-1">Average Monthly</p>
            <p className="text-lg font-semibold text-neutral-900">{avgMonthly.toFixed(1)}</p>
            <p className="text-xs text-neutral-500">tCO₂e</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-500 mb-1">Peak Month</p>
            <p className="text-lg font-semibold text-error">{peakMonth.toFixed(1)}</p>
            <p className="text-xs text-neutral-500">tCO₂e</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-500 mb-1">Reduction Target</p>
            <p className="text-lg font-semibold text-success">-15%</p>
            <p className="text-xs text-neutral-500">by 2025</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
