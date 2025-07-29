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

        {/* Advanced Features Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">Enterprise Features</h2>
                <p className="text-sm text-neutral-600">
                  Advanced carbon accounting and CSRD compliance tools
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-green-800">PDF Processing</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Extract expenses from PDF documents with AI classification
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-blue-800">XBRL Reports</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Generate CSRD-compliant structured reports in XBRL format
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="font-medium text-purple-800">Enhanced Database</span>
                  </div>
                  <p className="text-sm text-purple-700">
                    Climatiq integration for industry-specific emission factors
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-neutral-50 rounded-lg">
                  <div className="text-lg font-semibold text-neutral-900">
                    {summary ? `${(summary.totalEmissions / 1000).toFixed(2)}` : '0.00'}
                  </div>
                  <div className="text-sm text-neutral-600">tonnes CO₂e</div>
                  <div className="text-xs text-neutral-500">Total Footprint</div>
                </div>
                
                <div className="text-center p-3 bg-neutral-50 rounded-lg">
                  <div className="text-lg font-semibold text-neutral-900">
                    {summary ? `€${((summary.totalEmissions / 1000) * 85).toFixed(0)}` : '€0'}
                  </div>
                  <div className="text-sm text-neutral-600">Carbon Cost</div>
                  <div className="text-xs text-neutral-500">@ €85/tonne</div>
                </div>
                
                <div className="text-center p-3 bg-neutral-50 rounded-lg">
                  <div className="text-lg font-semibold text-neutral-900">
                    {transactions ? transactions.length : 0}
                  </div>
                  <div className="text-sm text-neutral-600">Transactions</div>
                  <div className="text-xs text-neutral-500">AI Classified</div>
                </div>
                
                <div className="text-center p-3 bg-neutral-50 rounded-lg">
                  <div className="text-lg font-semibold text-neutral-900">
                    {reports ? reports.length : 0}
                  </div>
                  <div className="text-sm text-neutral-600">Reports</div>
                  <div className="text-xs text-neutral-500">Generated</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Generation */}
        <ReportGeneration reports={reports} isLoading={reportsLoading} />
      </main>
    </div>
  );
}
