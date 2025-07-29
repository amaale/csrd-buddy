import { Header } from "@/components/dashboard/header";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { FileUpload } from "@/components/ui/file-upload";
import { EmissionsChart } from "@/components/ui/emissions-chart";
import { TrendChart } from "@/components/ui/trend-chart";
import { TransactionClassification } from "@/components/dashboard/transaction-classification";
import { ReportGeneration } from "@/components/dashboard/report-generation";
import { useQuery } from "@tanstack/react-query";
import { type Transaction, type Upload, type Report } from "@shared/schema";

interface EmissionsSummary {
  totalEmissions: number;
  scope1Emissions: number;
  scope2Emissions: number;
  scope3Emissions: number;
  transactionCount: number;
}

interface EmissionsTrend {
  month: string;
  totalEmissions: number;
  scope1: number;
  scope2: number;
  scope3: number;
}

export default function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useQuery<EmissionsSummary>({
    queryKey: ["/api/emissions/summary"],
  });

  const { data: trend, isLoading: trendLoading } = useQuery<EmissionsTrend[]>({
    queryKey: ["/api/emissions/trend"],
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: uploads, isLoading: uploadsLoading } = useQuery<Upload[]>({
    queryKey: ["/api/uploads"],
  });

  const { data: reports, isLoading: reportsLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">ESG Dashboard</h1>
              <p className="mt-1 text-sm text-neutral-500">Monitor your carbon footprint and sustainability metrics</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <QuickStats summary={summary} isLoading={summaryLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* File Upload */}
          <div className="lg:col-span-1">
            <FileUpload uploads={uploads} isLoading={uploadsLoading} />
          </div>

          {/* Emissions Chart */}
          <div className="lg:col-span-2">
            <EmissionsChart summary={summary} isLoading={summaryLoading} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Transaction Classification */}
          <TransactionClassification 
            transactions={transactions} 
            isLoading={transactionsLoading} 
          />

          {/* Emissions Trend */}
          <TrendChart trend={trend} isLoading={trendLoading} />
        </div>

        {/* Report Generation */}
        <ReportGeneration reports={reports} isLoading={reportsLoading} />
      </main>
    </div>
  );
}
