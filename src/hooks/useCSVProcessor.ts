import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Enhanced TypeScript interfaces
export interface CSVProcessingJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  csv_url: string;
  total_rows: number;
  processed_rows: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface ProcessingProgress {
  step: 'download' | 'validate' | 'parse' | 'generate' | 'store';
  progress: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  message?: string;
  details?: Record<string, any>;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: Array<{
    row?: number;
    column?: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  warnings: Array<{
    row?: number;
    column?: string;
    message: string;
  }>;
  metadata: {
    totalRows: number;
    totalColumns: number;
    estimatedProcessingTime: number;
    fileSize: number;
  };
}

export interface CSVProcessorState {
  isProcessing: boolean;
  currentJob: CSVProcessingJob | null;
  progress: ProcessingProgress[];
  error: string | null;
  validationResult: FileValidationResult | null;
}

// Query keys for CSV processing
export const csvQueryKeys = {
  jobs: (userId: string) => ['csv-jobs', userId] as const,
  job: (jobId: string) => ['csv-job', jobId] as const,
  validation: (fileHash: string) => ['csv-validation', fileHash] as const,
} as const;

export const useCSVProcessor = (userId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const [state, setState] = useState<CSVProcessorState>({
    isProcessing: false,
    currentJob: null,
    progress: [],
    error: null,
    validationResult: null,
  });

  // Enhanced file validation with local processing instead of non-existent edge function
  const validateFile = useCallback(async (file: File): Promise<FileValidationResult> => {
    try {
      // Local file validation instead of calling non-existent edge function
      const errors: Array<{ row?: number; column?: string; message: string; severity: 'error' | 'warning' }> = [];
      const warnings: Array<{ row?: number; column?: string; message: string }> = [];
      
      // Basic file type validation
      if (!file.name.toLowerCase().endsWith('.csv') && !file.type.includes('csv')) {
        errors.push({
          message: 'File moet een CSV bestand zijn',
          severity: 'error'
        });
      }
      
      // File size validation (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        errors.push({
          message: `Bestand is te groot (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum: 10MB`,
          severity: 'error'
        });
      }
      
      // File size warning for large files
      if (file.size > 5 * 1024 * 1024) { // 5MB
        warnings.push({
          message: `Groot bestand gedetecteerd (${(file.size / 1024 / 1024).toFixed(1)}MB). Verwerking kan langer duren.`
        });
      }
      
      // Basic CSV structure validation by reading first few lines
      let totalRows = 0;
      let totalColumns = 0;
      
      try {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        totalRows = lines.length;
        
        if (lines.length > 0) {
          const firstLine = lines[0];
          totalColumns = firstLine.split(',').length;
          
          // Check if header row seems valid
          if (totalColumns < 2) {
            warnings.push({
              message: 'CSV lijkt maar één kolom te hebben. Zorg ervoor dat je komma\'s gebruikt als separator.'
            });
          }
          
          // Check for required columns in header
          const header = firstLine.toLowerCase();
          const requiredColumns = ['title', 'slug', 'status', 'publish_date'];
          const missingColumns = requiredColumns.filter(col => !header.includes(col));
          
          if (missingColumns.length > 0) {
            warnings.push({
              message: `Mogelijke ontbrekende kolommen: ${missingColumns.join(', ')}`
            });
          }
        }
        
        if (totalRows === 0) {
          errors.push({
            message: 'CSV bestand is leeg',
            severity: 'error'
          });
        }
        
        if (totalRows > 1000) {
          warnings.push({
            message: `Groot aantal rijen (${totalRows}). Verwerking kan lang duren.`
          });
        }
        
      } catch (parseError) {
        errors.push({
          message: 'Kan CSV bestand niet lezen. Controleer of het bestand geldig is.',
          severity: 'error'
        });
      }

      const result: FileValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings,
        metadata: {
          totalRows,
          totalColumns,
          estimatedProcessingTime: Math.ceil(totalRows / 10), // ~10 rows per second
          fileSize: file.size,
        }
      };

      setState(prev => ({ ...prev, validationResult: result }));
      return result;
      
    } catch (error: any) {
      console.error('File validation error:', error);
      
      const fallbackResult: FileValidationResult = {
        isValid: false,
        errors: [{ message: `Validatie fout: ${error.message}`, severity: 'error' as const }],
        warnings: [],
        metadata: {
          totalRows: 0,
          totalColumns: 0,
          estimatedProcessingTime: 0,
          fileSize: file.size,
        }
      };
      
      setState(prev => ({ ...prev, validationResult: fallbackResult }));
      return fallbackResult;
    }
  }, []);

  // Process CSV with enhanced error handling and retry logic
  const processCSVMutation = useMutation<CSVProcessingJob | null, Error, { csvUrl: string; retryCount?: number }>({
    mutationFn: async ({ csvUrl, retryCount = 0 }: { csvUrl: string; retryCount?: number }) => {
      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();
      
      setState(prev => ({
        ...prev,
        isProcessing: true,
        error: null,
        progress: initializeProgress()
      }));

      try {
        updateProgress('download', 'running', 25, 'Downloading CSV file...');

        const { data, error } = await supabase.functions.invoke('process-csv', {
          body: { csvUrl, retryCount }
        });

        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || 'Processing failed');

        const jobId = data.jobId;
        updateProgress('download', 'completed', 100, 'CSV downloaded successfully');
        
        // Start real-time job monitoring
        return await monitorJobProgress(jobId);
        
      } catch (error: any) {
        if (error.name === 'AbortError') {
          setState(prev => ({ ...prev, isProcessing: false }));
          return null;
        }

        // Exponential backoff retry logic
        if (retryCount < 3 && !error.message.includes('validation')) {
          const delay = Math.pow(2, retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          
          toast({
            title: `Retry attempt ${retryCount + 1}`,
            description: 'Retrying CSV processing...'
          });
          
          return processCSVMutation.mutateAsync({ csvUrl, retryCount: retryCount + 1 });
        }

        throw error;
      }
    },
    onError: (error: any) => {
      console.error('CSV Processing error:', error);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: error.message || 'An unknown error occurred'
      }));
      
      toast({
        title: 'Processing Failed',
        description: error.message || 'Failed to process CSV file',
        variant: 'destructive'
      });
    },
    onSuccess: (job: CSVProcessingJob | null) => {
      if (job) {
        setState(prev => ({ 
          ...prev, 
          isProcessing: false, 
          currentJob: job 
        }));
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: csvQueryKeys.jobs(userId) });
        queryClient.invalidateQueries({ queryKey: ['blog-posts', userId] });
      }
    }
  });

  // Enhanced job monitoring with WebSocket-like efficiency
  const monitorJobProgress = async (jobId: string): Promise<CSVProcessingJob | null> => {
    return new Promise((resolve, reject) => {
      let pollCount = 0;
      const maxPolls = 180; // 6 minutes timeout
      const pollInterval = 2000; // 2 seconds

      const poll = async () => {
        try {
          pollCount++;
          
          if (pollCount >= maxPolls) {
            reject(new Error('Job monitoring timeout'));
            return;
          }

          const { data: job, error } = await supabase
            .from('csv_processing_jobs')
            .select('*')
            .eq('id', jobId)
            .maybeSingle();

          if (error) throw error;
          if (!job) throw new Error('Job not found');

          const typedJob = job as CSVProcessingJob;

          // Update progress based on job status
          updateProgressFromJob(typedJob);
          setState(prev => ({ ...prev, currentJob: typedJob }));

          if (typedJob.status === 'completed') {
            updateProgress('store', 'completed', 100, 'Processing completed successfully!');
            resolve(typedJob);
            return;
          }

          if (typedJob.status === 'failed') {
            reject(new Error(typedJob.error_message || 'Job processing failed'));
            return;
          }

          // Continue polling
          setTimeout(poll, pollInterval);
          
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  };

  // Utility functions
  const generateFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const initializeProgress = (): ProcessingProgress[] => [
    { step: 'download', progress: 0, status: 'pending', message: 'Preparing to download...' },
    { step: 'validate', progress: 0, status: 'pending', message: 'Waiting for validation...' },
    { step: 'parse', progress: 0, status: 'pending', message: 'Ready to parse data...' },
    { step: 'generate', progress: 0, status: 'pending', message: 'AI content generation pending...' },
    { step: 'store', progress: 0, status: 'pending', message: 'Database storage pending...' }
  ];

  const updateProgress = (
    step: ProcessingProgress['step'], 
    status: ProcessingProgress['status'], 
    progress: number, 
    message?: string,
    details?: Record<string, any>
  ) => {
    setState(prev => ({
      ...prev,
      progress: prev.progress.map(p => 
        p.step === step 
          ? { ...p, status, progress, message, details }
          : p
      )
    }));
  };

  const updateProgressFromJob = (job: CSVProcessingJob) => {
    const completedProgress = job.total_rows > 0 ? 
      (job.processed_rows / job.total_rows) * 100 : 0;

    if (job.status === 'processing') {
      updateProgress('validate', 'completed', 100);
      updateProgress('parse', 'completed', 100);
      updateProgress('generate', 'running', completedProgress, 
        `Processing ${job.processed_rows}/${job.total_rows} rows...`);
    } else if (job.status === 'completed') {
      updateProgress('validate', 'completed', 100);
      updateProgress('parse', 'completed', 100);
      updateProgress('generate', 'completed', 100);
      updateProgress('store', 'completed', 100, 'All data stored successfully');
    }
  };

  // Cancel processing
  const cancelProcessing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(prev => ({ 
        ...prev, 
        isProcessing: false,
        error: 'Processing cancelled by user'
      }));
      
      toast({
        title: 'Processing Cancelled',
        description: 'CSV processing has been cancelled',
        variant: 'default'
      });
    }
  }, [toast]);

  // Query for user's CSV jobs with caching
  const jobsQuery = useQuery({
    queryKey: csvQueryKeys.jobs(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('csv_processing_jobs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as CSVProcessingJob[];
    },
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: state.isProcessing ? 5000 : false, // Poll while processing
  });

  return {
    // State
    ...state,
    jobs: jobsQuery.data || [],
    isLoadingJobs: jobsQuery.isLoading,
    
    // Actions
    validateFile,
    processCSV: processCSVMutation.mutateAsync,
    cancelProcessing,
    
    // Status
    isProcessingCSV: processCSVMutation.isPending || state.isProcessing,
    
    // Utils
    getProgressPercentage: () => {
      const completed = state.progress.filter(p => p.status === 'completed').length;
      return (completed / state.progress.length) * 100;
    },
    
    getCurrentStep: () => {
      return state.progress.find(p => p.status === 'running') || 
             state.progress.find(p => p.status === 'pending');
    }
  };
};