import { useState } from "react";
import { FileText, Plus, Download, Code, MoreHorizontal, Calendar, Settings, Database, FileUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
  const [activeTab, setActiveTab] = useState("reports");
  const [dataSourceSettings, setDataSourceSettings] = useState({
    includeScope1: true,
    includeScope2: true,
    includeScope3: true,
    includeVerifiedOnly: false,
    emissionFactorSource: "defra_2024",
    reportFormat: "pdf",
    language: "en"
  });
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="datasources" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Data Sources
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="mt-6">
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
          </TabsContent>

          <TabsContent value="datasources" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Data Source Configuration</h3>
                <p className="text-sm text-neutral-600 mb-4">
                  Configure which data sources to include in your reports
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Emission Scopes */}
                <Card className="p-4">
                  <h4 className="font-medium text-neutral-900 mb-3">Emission Scopes</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Scope 1 (Direct)</span>
                        <p className="text-xs text-neutral-500">Company owned vehicles, facilities</p>
                      </div>
                      <Switch
                        checked={dataSourceSettings.includeScope1}
                        onCheckedChange={(checked) => 
                          setDataSourceSettings(prev => ({ ...prev, includeScope1: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Scope 2 (Indirect Energy)</span>
                        <p className="text-xs text-neutral-500">Purchased electricity, heating</p>
                      </div>
                      <Switch
                        checked={dataSourceSettings.includeScope2}
                        onCheckedChange={(checked) => 
                          setDataSourceSettings(prev => ({ ...prev, includeScope2: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Scope 3 (Value Chain)</span>
                        <p className="text-xs text-neutral-500">Business travel, purchased goods</p>
                      </div>
                      <Switch
                        checked={dataSourceSettings.includeScope3}
                        onCheckedChange={(checked) => 
                          setDataSourceSettings(prev => ({ ...prev, includeScope3: checked }))
                        }
                      />
                    </div>
                  </div>
                </Card>

                {/* Data Quality */}
                <Card className="p-4">
                  <h4 className="font-medium text-neutral-900 mb-3">Data Quality</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Verified Data Only</span>
                        <p className="text-xs text-neutral-500">Include only manually verified transactions</p>
                      </div>
                      <Switch
                        checked={dataSourceSettings.includeVerifiedOnly}
                        onCheckedChange={(checked) => 
                          setDataSourceSettings(prev => ({ ...prev, includeVerifiedOnly: checked }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Emission Factor Source</label>
                      <Select
                        value={dataSourceSettings.emissionFactorSource}
                        onValueChange={(value) => 
                          setDataSourceSettings(prev => ({ ...prev, emissionFactorSource: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="defra_2024">DEFRA 2024 (UK)</SelectItem>
                          <SelectItem value="climatiq">Climatiq Database</SelectItem>
                          <SelectItem value="epa_2024">EPA 2024 (US)</SelectItem>
                          <SelectItem value="ademe_2024">ADEME 2024 (France)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Preview */}
              <Card className="p-4 bg-neutral-50">
                <h4 className="font-medium text-neutral-900 mb-3">Data Source Preview</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {dataSourceSettings.includeScope1 ? '✓' : '✗'}
                    </div>
                    <div className="text-neutral-600">Scope 1</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {dataSourceSettings.includeScope2 ? '✓' : '✗'}
                    </div>
                    <div className="text-neutral-600">Scope 2</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600">
                      {dataSourceSettings.includeScope3 ? '✓' : '✗'}
                    </div>
                    <div className="text-neutral-600">Scope 3</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-orange-600">
                      {dataSourceSettings.includeVerifiedOnly ? 'Verified' : 'All Data'}
                    </div>
                    <div className="text-neutral-600">Quality</div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Report Settings</h3>
                <p className="text-sm text-neutral-600 mb-4">
                  Configure default settings for report generation
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-medium text-neutral-900 mb-3">Report Format</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Default Format</label>
                      <Select
                        value={dataSourceSettings.reportFormat}
                        onValueChange={(value) => 
                          setDataSourceSettings(prev => ({ ...prev, reportFormat: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF Report</SelectItem>
                          <SelectItem value="xbrl">XBRL (Structured)</SelectItem>
                          <SelectItem value="both">Both PDF & XBRL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Language</label>
                      <Select
                        value={dataSourceSettings.language}
                        onValueChange={(value) => 
                          setDataSourceSettings(prev => ({ ...prev, language: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">🇬🇧 English</SelectItem>
                          <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                          <SelectItem value="fr">🇫🇷 Français</SelectItem>
                          <SelectItem value="es">🇪🇸 Español</SelectItem>
                          <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                          <SelectItem value="nl">🇳🇱 Nederlands</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium text-neutral-900 mb-3">Advanced Options</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <FileUp className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-blue-800">PDF Processing</span>
                          <p className="text-xs text-blue-700">Extract expenses from PDF documents</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Code className="w-4 h-4 text-green-600 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-green-800">XBRL Export</span>
                          <p className="text-xs text-green-700">Generate structured compliance reports</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Database className="w-4 h-4 text-purple-600 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-purple-800">Enhanced Factors</span>
                          <p className="text-xs text-purple-700">Climatiq database integration</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => {
                    try {
                      localStorage.setItem('csrd-buddy-data-source-settings', JSON.stringify(dataSourceSettings));
                      // Show success feedback - you could add toast notification here too
                      console.log('Data source settings saved:', dataSourceSettings);
                    } catch (error) {
                      console.error('Failed to save data source settings:', error);
                    }
                  }}
                  className="bg-secondary hover:bg-secondary-dark text-white"
                >
                  Save Settings
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
