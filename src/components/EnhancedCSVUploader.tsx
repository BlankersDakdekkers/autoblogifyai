import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  X,
  FileX,
  Loader2,
  Link as LinkIcon,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCSVProcessor } from '@/hooks/useCSVProcessor';
import { ProcessingProgress } from './ProcessingProgress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CSVPreviewItem {
  title: string;
  content: string;
  category: string;
  type: string;
  author: string;
  tags: string[];
}

interface EnhancedCSVUploaderProps {
  onPreviewGenerated?: (items: CSVPreviewItem[], fileName: string) => void;
  onProcessingComplete?: (jobId: string) => void;
}

export const EnhancedCSVUploader: React.FC<EnhancedCSVUploaderProps> = ({
  onPreviewGenerated,
  onProcessingComplete
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [csvUrl, setCsvUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');

  const {
    isProcessingCSV,
    progress,
    error,
    validationResult,
    currentJob,
    validateFile,
    processCSV,
    cancelProcessing,
    getProgressPercentage,
    getCurrentStep
  } = useCSVProcessor(user?.id || '');

  // Enhanced file processing with validation
  const handleFileUpload = useCallback(async (file: File) => {
    try {
      // Pre-validate file
      const validation = await validateFile(file);
      
      if (!validation.isValid) {
        const errorMessages = validation.errors
          .filter(e => e.severity === 'error')
          .map(e => e.message)
          .join(', ');
        
        toast({
          title: 'Bestand Validatie Gefaald',
          description: errorMessages,
          variant: 'destructive'
        });
        return;
      }

      // Show warnings if any
      if (validation.warnings.length > 0) {
        toast({
          title: 'Validatie Waarschuwingen',
          description: `${validation.warnings.length} waarschuwing(en) gevonden. Verwerking kan doorgaan.`,
          variant: 'default'
        });
      }

      // Process file upload to get URL
      const formData = new FormData();
      formData.append('file', file);

      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.access_token) {
        throw new Error('Niet ingelogd');
      }

      const response = await fetch(`https://pmhplzqfdmgkkosapkit.supabase.co/functions/v1/parse-excel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // If we have preview data, call the callback
      if (onPreviewGenerated && result.preview) {
        onPreviewGenerated(result.preview, result.fileName);
      }

      // Start CSV processing with the uploaded file
      if (result.csvUrl) {
        const job = await processCSV(result.csvUrl);
        if (job && onProcessingComplete) {
          onProcessingComplete(job.id);
        }
      }

      toast({
        title: 'Bestand Succesvol Verwerkt! 🎉',
        description: `${result.preview?.length || 0} items gevonden en verwerking gestart`
      });

    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: 'Upload Fout',
        description: error instanceof Error ? error.message : 'Er is een onbekende fout opgetreden',
        variant: 'destructive'
      });
    }
  }, [validateFile, processCSV, onPreviewGenerated, onProcessingComplete, toast]);

  // Handle URL processing
  const handleUrlProcessing = useCallback(async () => {
    if (!csvUrl.trim()) {
      toast({
        title: 'CSV URL Vereist',
        description: 'Voer een geldige CSV URL in',
        variant: 'destructive'
      });
      return;
    }

    try {
      const job = await processCSV({ csvUrl });
      if (job && onProcessingComplete) {
        onProcessingComplete(job.id);
      }
    } catch (error) {
      console.error('URL processing error:', error);
    }
  }, [csvUrl, processCSV, onProcessingComplete, toast]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    e.target.value = '';
  }, [handleFileUpload]);

  return (
    <div className="space-y-6">
      {/* Upload Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-6 w-6 text-primary" />
            <span className="font-bold">📁 CSV Upload & Verwerking</span>
          </CardTitle>
          <CardDescription>
            Upload een CSV bestand of gebruik een URL voor automatische verwerking met AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Method Toggle */}
          <div className="flex gap-2">
            <Button
              variant={uploadMethod === 'file' ? 'default' : 'outline'}
              onClick={() => setUploadMethod('file')}
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Bestand Upload
            </Button>
            <Button
              variant={uploadMethod === 'url' ? 'default' : 'outline'}
              onClick={() => setUploadMethod('url')}
              size="sm"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              CSV URL
            </Button>
          </div>

          {/* File Upload */}
          {uploadMethod === 'file' && (
            <div 
              className={`
                relative flex items-center justify-center border-4 border-dashed rounded-2xl p-12 
                transition-all duration-300 cursor-pointer
                ${isDragOver 
                  ? 'border-primary bg-primary/10 scale-105 shadow-lg' 
                  : 'border-primary/30 hover:border-primary hover:bg-primary/5 hover:shadow-md'
                }
                ${isProcessingCSV ? 'pointer-events-none opacity-60' : ''}
                bg-gradient-to-br from-blue-50 to-purple-50
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <div className="text-center space-y-6">
                <div className={`mx-auto transition-all duration-300 ${isDragOver ? 'scale-125 animate-bounce' : ''}`}>
                  <FileSpreadsheet className={`mx-auto h-20 w-20 ${isDragOver ? 'text-primary animate-pulse' : 'text-primary/70'}`} />
                </div>
                
                {!isProcessingCSV ? (
                  <>
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-primary">
                        {isDragOver ? '🎯 Laat bestand hier vallen!' : '📁 Upload je CSV of Excel bestand'}
                      </h3>
                      <p className="text-base text-muted-foreground font-medium">
                        Sleep en laat vallen of klik om te selecteren
                      </p>
                    </div>
                    
                    <Button 
                      type="button" 
                      size="lg"
                      className="mt-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold px-8 py-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById('file-upload')?.click();
                      }}
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      Selecteer Bestand
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <div>
                      <p className="text-xl font-bold text-primary">⚡ Bestand wordt verwerkt...</p>
                      <p className="text-base text-muted-foreground">AI content generatie actief</p>
                    </div>
                  </div>
                )}
                
                <input
                  id="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={isProcessingCSV}
                />
              </div>
            </div>
          )}

          {/* URL Input */}
          {uploadMethod === 'url' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="csv-url">CSV URL</Label>
                <Input
                  id="csv-url"
                  type="url"
                  placeholder="https://example.com/data.csv"
                  value={csvUrl}
                  onChange={(e) => setCsvUrl(e.target.value)}
                  disabled={isProcessingCSV}
                />
              </div>
              <Button 
                onClick={handleUrlProcessing}
                disabled={isProcessingCSV || !csvUrl.trim()}
                className="w-full"
              >
                {isProcessingCSV ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verwerken...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Start Verwerking
                  </>
                )}
              </Button>
            </div>
          )}

          {/* File Format Support */}
          <div className="flex flex-col sm:flex-row gap-2 text-xs text-muted-foreground justify-center">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Ondersteunt CSV, XLS, XLSX
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Maximaal 50MB</span>
            <span className="hidden sm:inline">•</span>
            <span>AI-powered content generatie</span>
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationResult && !validationResult.isValid && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Validatie Fouten:</strong><br />
            {validationResult.errors.map((error, index) => (
              <div key={index}>
                {error.row ? `Rij ${error.row}: ` : ''}{error.message}
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Processing Progress */}
      {(isProcessingCSV || progress.length > 0) && (
        <ProcessingProgress
          progress={progress}
          overallProgress={getProgressPercentage()}
          isProcessing={isProcessingCSV}
          onCancel={cancelProcessing}
          currentStep={getCurrentStep()}
        />
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Fout:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Processing Complete */}
      {currentJob?.status === 'completed' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Verwerking Voltooid!</strong><br />
            {currentJob.processed_rows} rijen succesvol verwerkt en opgeslagen.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};