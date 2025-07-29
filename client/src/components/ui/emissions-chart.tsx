import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Chart from "chart.js/auto";

interface EmissionsSummary {
  totalEmissions: number;
  scope1Emissions: number;
  scope2Emissions: number;
  scope3Emissions: number;
  transactionCount: number;
}

interface EmissionsChartProps {
  summary?: EmissionsSummary;
  isLoading: boolean;
}

export function EmissionsChart({ summary, isLoading }: EmissionsChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || isLoading || !summary) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Scope 1', 'Scope 2', 'Scope 3'],
        datasets: [{
          data: [
            parseFloat(summary.scope1Emissions.toString()), 
            parseFloat(summary.scope2Emissions.toString()), 
            parseFloat(summary.scope3Emissions.toString())
          ],
          backgroundColor: ['hsl(4, 90%, 58%)', 'hsl(36, 100%, 50%)', 'hsl(207, 90%, 54%)'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [summary, isLoading]);

  if (isLoading) {
    return (
      <Card className="material-shadow-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <Skeleton className="h-48 w-48 rounded-full mx-auto" />
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const scopes = [
    {
      name: "Scope 1",
      description: "Direct emissions",
      value: summary ? parseFloat(summary.scope1Emissions.toString()) : 0,
      color: "bg-error",
      bgColor: "bg-neutral-50"
    },
    {
      name: "Scope 2", 
      description: "Indirect energy",
      value: summary ? parseFloat(summary.scope2Emissions.toString()) : 0,
      color: "bg-warning",
      bgColor: "bg-neutral-50"
    },
    {
      name: "Scope 3",
      description: "Value chain", 
      value: summary ? parseFloat(summary.scope3Emissions.toString()) : 0,
      color: "bg-primary",
      bgColor: "bg-neutral-50"
    }
  ];

  return (
    <Card className="material-shadow-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-neutral-900">Emissions by Scope</CardTitle>
          <Select defaultValue="this-quarter">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="last-quarter">Last Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative h-48">
            <canvas ref={chartRef} />
          </div>

          <div className="space-y-4">
            {scopes.map((scope, index) => (
              <div key={index} className={`flex items-center justify-between p-4 ${scope.bgColor} rounded-lg`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 ${scope.color} rounded-full`}></div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{scope.name}</p>
                    <p className="text-xs text-neutral-500">{scope.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-neutral-900">{Number(scope.value).toFixed(1)}</p>
                  <p className="text-xs text-neutral-500">tonnes CO₂e</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
