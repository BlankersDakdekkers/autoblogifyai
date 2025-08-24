import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ApiCallOptions {
  body?: any;
  retryOnAuth?: boolean;
  showErrorToast?: boolean;
}

export const callEdgeFunction = async (
  functionName: string, 
  options: ApiCallOptions = {}
) => {
  const { body, retryOnAuth = true, showErrorToast = true } = options;
  
  try {
    console.log(`=== CALLING EDGE FUNCTION: ${functionName} ===`);
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Session validation failed');
    }
    
    if (!session?.access_token) {
      console.error('No valid session token available');
      throw new Error('Authentication required');
    }
    
    console.log('Session token available, making function call');
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    
    // Handle specific error codes from edge functions
    if (error) {
      console.error(`Edge function ${functionName} error:`, error);
      
      // Handle authentication errors
      if (error.message?.includes('SESSION_EXPIRED') || 
          error.message?.includes('session_not_found') ||
          error.message?.includes('Authentication failed')) {
        
        console.log('Authentication error detected, attempting refresh...');
        
        if (retryOnAuth) {
          // Try to refresh session and retry once
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError || !refreshData.session) {
            console.error('Session refresh failed:', refreshError);
            
            if (showErrorToast) {
              toast.error('Sessie verlopen - log opnieuw in');
            }
            
            // Redirect to login if session refresh fails
            window.location.href = '/auth';
            return { data: null, error: { message: 'Session expired' } };
          }
          
          console.log('Session refreshed, retrying function call');
          
          // Retry with new token
          const retryResult = await supabase.functions.invoke(functionName, {
            body,
            headers: {
              Authorization: `Bearer ${refreshData.session.access_token}`,
            },
          });
          
          if (retryResult.error && showErrorToast) {
            toast.error(`Fout bij ${functionName}: ${retryResult.error.message}`);
          }
          
          return retryResult;
        }
        
        if (showErrorToast) {
          toast.error('Authenticatie vereist - log opnieuw in');
        }
      } else if (showErrorToast) {
        toast.error(`Fout bij ${functionName}: ${error.message}`);
      }
      
      return { data: null, error };
    }
    
    console.log(`Edge function ${functionName} completed successfully`);
    return { data, error: null };
    
  } catch (error: any) {
    console.error(`Exception in callEdgeFunction for ${functionName}:`, error);
    
    if (showErrorToast) {
      toast.error(`Onbekende fout bij ${functionName}: ${error.message}`);
    }
    
    return { data: null, error: { message: error.message || 'Unknown error' } };
  }
};

// Convenience functions for common operations
export const checkCredits = () => callEdgeFunction('check-credits');

export const checkSubscription = () => callEdgeFunction('check-subscription');

export const createCheckout = (body: any) => callEdgeFunction('create-checkout', { body });

export const createCustomerPortal = () => callEdgeFunction('customer-portal');

// Function to handle edge function calls with loading states
export const callEdgeFunctionWithLoading = async <T>(
  functionName: string,
  setLoading: (loading: boolean) => void,
  options: ApiCallOptions = {}
): Promise<{ data: T | null; error: any }> => {
  setLoading(true);
  
  try {
    const result = await callEdgeFunction(functionName, options);
    return result as { data: T | null; error: any };
  } finally {
    setLoading(false);
  }
};