import { Header } from "@/components/dashboard/header";
import { ReportGeneration } from "@/components/dashboard/report-generation";
import { useQuery } from "@tanstack/react-query";
import { type Report } from "@shared/schema";

export default function Reports() {
  const { data: reports, isLoading: reportsLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">Reports</h1>
              <p className="mt-1 text-sm text-neutral-500">Generate and manage CSRD compliance reports</p>
            </div>
          </div>
        </div>

        <ReportGeneration reports={reports} isLoading={reportsLoading} />
      </main>
    </div>
  );
}