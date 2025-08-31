import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ContentPlan {
  id: string;
  title: string;
  description?: string;
  content_type: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  priority: number;
  planned_date: string;
  due_date?: string;
  platform?: string;
  category?: string;
  tags?: string[];
  assigned_to?: string;
  estimated_hours?: number;
  actual_hours?: number;
  notes?: string;
  related_csv_job_id?: string;
  related_blog_post_id?: string;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface UseContentPlannerReturn {
  plans: ContentPlan[];
  loading: boolean;
  error: string | null;
  createPlan: (plan: Omit<ContentPlan, 'id' | 'created_at' | 'updated_at'>) => Promise<ContentPlan | null>;
  updatePlan: (id: string, updates: Partial<ContentPlan>) => Promise<ContentPlan | null>;
  deletePlan: (id: string) => Promise<boolean>;
  fetchPlans: (filters?: { start_date?: string; end_date?: string; status?: string }) => Promise<void>;
  getPlansForDate: (date: Date) => ContentPlan[];
}

export const useContentPlanner = (): UseContentPlannerReturn => {
  const [plans, setPlans] = useState<ContentPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const fetchPlans = async (filters?: { start_date?: string; end_date?: string; status?: string }) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('content-planner', {
        method: 'GET',
        body: null,
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch content plans');
      }

      setPlans(data.plans || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch plans';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async (planData: Omit<ContentPlan, 'id' | 'created_at' | 'updated_at'>): Promise<ContentPlan | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('content-planner', {
        method: 'POST',
        body: planData,
      });

      if (error) {
        throw new Error(error.message || 'Failed to create content plan');
      }

      const newPlan = data.plan;
      setPlans(prev => [...prev, newPlan]);
      
      toast({
        title: 'Success',
        description: 'Content plan created successfully',
      });

      return newPlan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create plan';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = async (id: string, updates: Partial<ContentPlan>): Promise<ContentPlan | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('content-planner', {
        method: 'PUT',
        body: { ...updates, id },
      });

      if (error) {
        throw new Error(error.message || 'Failed to update content plan');
      }

      const updatedPlan = data.plan;
      setPlans(prev => prev.map(plan => plan.id === id ? updatedPlan : plan));
      
      toast({
        title: 'Success',
        description: 'Content plan updated successfully',
      });

      return updatedPlan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update plan';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.functions.invoke('content-planner', {
        method: 'DELETE',
        body: { id },
      });

      if (error) {
        throw new Error(error.message || 'Failed to delete content plan');
      }

      setPlans(prev => prev.filter(plan => plan.id !== id));
      
      toast({
        title: 'Success',
        description: 'Content plan deleted successfully',
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete plan';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getPlansForDate = (date: Date): ContentPlan[] => {
    const dateString = formatDate(date);
    return plans.filter(plan => plan.planned_date === dateString);
  };

  // Load plans on mount
  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    loading,
    error,
    createPlan,
    updatePlan,
    deletePlan,
    fetchPlans,
    getPlansForDate,
  };
};