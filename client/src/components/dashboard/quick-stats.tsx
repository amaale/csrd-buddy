import { Factory, Zap, FileText, Database, ArrowUp, ArrowDown, CheckCircle, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface EmissionsSummary {
  totalEmissions: number;
  scope1Emissions: number;
  scope2Emissions: number;
  scope3Emissions: number;
  transactionCount: number;
}

interface QuickStatsProps {
  summary?: EmissionsSummary;
  isLoading: boolean;
}

export function QuickStats({ summary, isLoading }: QuickStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="material-shadow-1">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="ml-4 flex-1">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-16 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
              <div className="mt-4">
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total CO₂e",
      value: summary ? parseFloat(summary.totalEmissions.toString()).toFixed(1) : "0.0",
      unit: "tonnes",
      icon: Factory,
      iconBg: "bg-error/10",
      iconColor: "text-error",
      trend: "+12.3%",
      trendIcon: ArrowUp,
      trendColor: "text-error"
    },
    {
      title: "Scope 2 Emissions",
      value: summary ? parseFloat(summary.scope2Emissions.toString()).toFixed(1) : "0.0",
      unit: "tonnes CO₂e",
      icon: Zap,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
      trend: "-5.2%",
      trendIcon: ArrowDown,
      trendColor: "text-success"
    },
    {
      title: "Reports Generated",
      value: "8",
      unit: "this quarter",
      icon: FileText,
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
      trend: "100%",
      trendIcon: CheckCircle,
      trendColor: "text-success"
    },
    {
      title: "Data Sources",
      value: summary?.transactionCount.toString() || "0",
      unit: "transactions",
      icon: Database,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      trend: "Active",
      trendIcon: RotateCcw,
      trendColor: "text-success"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="material-shadow-1">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`${stat.iconColor} w-6 h-6`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-500">{stat.title}</p>
                <p className="text-2xl font-semibold text-neutral-900">{stat.value}</p>
                <p className="text-xs text-neutral-500">{stat.unit}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <stat.trendIcon className={`${stat.trendColor} w-4 h-4 mr-1`} />
                <span className={`${stat.trendColor} font-medium`}>{stat.trend}</span>
                <span className="text-neutral-500 ml-1">
                  {index === 3 ? "last sync 2h ago" : "from last period"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
