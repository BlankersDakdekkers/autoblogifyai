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

  // Enhanced file validation with preprocessing
  const validateFile = useCallback(async (file: File): Promise<FileValidationResult> => {
    const fileHash = await generateFileHash(file);
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-csv', {
        body: { 
          fileSize: file.size,
          fileName: file.name,
          fileHash,
        }
      });

      if (error) throw error;

      const result: FileValidationResult = {
        isValid: data.errors.length === 0,
        errors: data.errors || [],
        warnings: data.warnings || [],
        metadata: {
          totalRows: data.totalRows || 0,
          totalColumns: data.totalColumns || 0,
          estimatedProcessingTime: data.estimatedTime || 0,
          fileSize: file.size,
        }
      };

      setState(prev => ({ ...prev, validationResult: result }));
      return result;
    } catch (error) {
      const fallbackResult: FileValidationResult = {
        isValid: false,
        errors: [{ message: 'Validation failed', severity: 'error' as const }],
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