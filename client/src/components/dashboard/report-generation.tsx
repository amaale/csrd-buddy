import { useState } from "react";
import { FileText, Plus, Download, Code, MoreHorizontal, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { type Report } from "@shared/schema";

interface ReportGenerationProps {
  reports?: Report[];
  isLoading: boolean;
}

const reportFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  period: z.string().min(1, "Period is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

type ReportFormData = z.infer<typeof reportFormSchema>;

export function ReportGeneration({ reports, isLoading }: ReportGenerationProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: "",
      period: "",
      startDate: "",
      endDate: "",
    },
  });

  const createReportMutation = useMutation({
    mutationFn: async (data: ReportFormData) => {
      const response = await apiRequest('POST', '/api/reports', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      toast({
        title: "Report generation started",
        description: "Your report is being generated and will be available shortly.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to create report",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const handleDownloadPDF = async (reportId: string, title: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/download`);
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: ReportFormData) => {
    createReportMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success/10 text-success border-success/20">Complete</Badge>;
      case 'generating':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Generating</Badge>;
      case 'failed':
        return <Badge className="bg-error/10 text-error border-error/20">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="material-shadow-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="space-y-2 mb-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="material-shadow-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-neutral-900">CSRD Reports</CardTitle>
            <p className="text-sm text-neutral-500">Generate compliant sustainability reports</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-secondary hover:bg-secondary-dark text-white material-shadow-1">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Generate New Report</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Report Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Q4 2024 ESG Report" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Period</FormLabel>
                        <FormControl>
                          <Input placeholder="Q4 2024" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createReportMutation.isPending}
                      className="bg-secondary hover:bg-secondary-dark text-white"
                    >
                      {createReportMutation.isPending ? "Generating..." : "Generate Report"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Existing Reports */}
          {reports?.map((report) => (
            <div key={report.id} className="border border-neutral-200 rounded-lg p-4 hover:material-shadow-1 transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="text-primary w-4 h-4" />
                  <span className="text-sm font-medium text-neutral-900">{report.title}</span>
                </div>
                {getStatusBadge(report.status)}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Period:</span>
                  <span className="text-neutral-900">{report.period}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Total Emissions:</span>
                  <span className="text-neutral-900">{parseFloat(report.totalEmissions).toFixed(1)} tCO₂e</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Generated:</span>
                  <span className="text-neutral-900">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => handleDownloadPDF(report.id, report.title)}
                  disabled={report.status !== 'completed'}
                >
                  <Download className="w-3 h-3 mr-1" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  disabled={report.status !== 'completed'}
                >
                  <Code className="w-3 h-3 mr-1" />
                  XBRL
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}

          {/* Create New Report Card */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 flex flex-col items-center justify-center text-center min-h-[200px] hover:border-primary transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <Plus className="text-primary w-6 h-6" />
                </div>
                <h4 className="text-sm font-medium text-neutral-900 mb-1">Create New Report</h4>
                <p className="text-xs text-neutral-500">Generate a new CSRD compliance report</p>
              </div>
            </DialogTrigger>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
