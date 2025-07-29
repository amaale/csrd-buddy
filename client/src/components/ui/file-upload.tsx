import { useState, useCallback } from "react";
import { CloudUpload, FolderOpen, FileCheck, FileX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { type Upload } from "@shared/schema";

interface FileUploadProps {
  uploads?: Upload[];
  isLoading: boolean;
}

export function FileUpload({ uploads, isLoading }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await apiRequest('POST', '/api/uploads', formData);
      const result = await response.json();

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Invalidate uploads query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/uploads'] });

      toast({
        title: "File uploaded successfully",
        description: `${result.validRows} transactions found and are being processed.`,
      });

      // Reset progress after delay
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1500);

    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  const recentUploads = uploads?.slice(0, 3) || [];

  return (
    <Card className="material-shadow-1">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-neutral-900">Upload Expense Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-neutral-300 hover:border-primary"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CloudUpload className="text-primary w-8 h-8" />
          </div>
          <h4 className="text-lg font-medium text-neutral-900 mb-2">Drop your files here</h4>
          <p className="text-sm text-neutral-500 mb-4">or click to browse</p>
          <p className="text-xs text-neutral-400 mb-4">Supports CSV files up to 10MB</p>
          
          <Button className="bg-primary hover:bg-primary-dark text-white">
            <FolderOpen className="w-4 h-4 mr-2" />
            Browse Files
          </Button>
          
          <input
            id="file-input"
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {isUploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700">Processing...</span>
              <span className="text-sm text-neutral-500">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {recentUploads.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-neutral-900 mb-3">Recent Uploads</h4>
            <div className="space-y-2">
              {recentUploads.map((upload) => (
                <div key={upload.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                      {upload.status === 'completed' ? (
                        <FileCheck className="text-success w-4 h-4" />
                      ) : upload.status === 'failed' ? (
                        <FileX className="text-error w-4 h-4" />
                      ) : (
                        <CloudUpload className="text-warning w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{upload.filename}</p>
                      <p className="text-xs text-neutral-500">
                        {upload.status === 'completed' 
                          ? `${upload.processedRows} transactions processed`
                          : upload.status === 'failed'
                          ? 'Failed to process'
                          : 'Processing...'
                        }
                      </p>
                    </div>
                  </div>
                  {upload.status === 'completed' && (
                    <FileCheck className="text-success w-4 h-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
