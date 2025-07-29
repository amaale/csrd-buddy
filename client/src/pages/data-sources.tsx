import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { TransactionClassification } from "@/components/dashboard/transaction-classification";
import { useQuery } from "@tanstack/react-query";
import { type Transaction, type Upload } from "@shared/schema";
import { Database, FileUp, FileText, Zap } from "lucide-react";

export default function DataSources() {
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: uploads, isLoading: uploadsLoading } = useQuery<Upload[]>({
    queryKey: ["/api/uploads"],
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">Data Sources</h1>
              <p className="mt-1 text-sm text-neutral-500">Upload and manage your emissions data sources</p>
            </div>
          </div>
        </div>

        {/* Data Source Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">CSV Upload</h3>
                <p className="text-sm text-neutral-600">
                  Upload financial transaction data in CSV format for automatic classification
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <FileUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">PDF Processing</h3>
                <p className="text-sm text-neutral-600">
                  Extract expense data from PDF documents using AI-powered processing
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">API Integration</h3>
                <p className="text-sm text-neutral-600">
                  Connect directly to accounting systems and expense management platforms
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* File Upload */}
          <div className="lg:col-span-1">
            <FileUpload uploads={uploads} isLoading={uploadsLoading} />
          </div>

          {/* Transaction Management */}
          <div className="lg:col-span-2">
            <TransactionClassification 
              transactions={transactions} 
              isLoading={transactionsLoading} 
            />
          </div>
        </div>

        {/* Data Quality Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data Quality Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {transactions?.filter(t => t.verified).length || 0}
                </div>
                <div className="text-sm text-green-600">Verified</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">
                  {transactions?.filter(t => !t.verified).length || 0}
                </div>
                <div className="text-sm text-yellow-600">Pending Review</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">
                  {uploads?.length || 0}
                </div>
                <div className="text-sm text-blue-600">Data Sources</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">
                  {transactions?.length || 0}
                </div>
                <div className="text-sm text-purple-600">Total Transactions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}