import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Query keys factory
export const queryKeys = {
  // User related
  userCredits: (userId: string) => ['user-credits', userId] as const,
  userProfile: (userId: string) => ['user-profile', userId] as const,
  userRoles: (userId: string) => ['user-roles', userId] as const,
  
  // Blog posts
  blogPosts: (userId: string, filters?: any) => ['blog-posts', userId, filters] as const,
  blogPost: (postId: string) => ['blog-post', postId] as const,
  
  // Admin
  allUsers: (search?: string) => ['admin-users', search] as const,
  systemHealth: () => ['system-health'] as const,
  
  // WordPress
  wordpressConfig: (userId: string) => ['wordpress-config', userId] as const,
} as const;

// Custom hooks for optimized queries
export const useUserCredits = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.userCredits(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useBlogPosts = (userId: string, filters?: any) => {
  return useQuery({
    queryKey: queryKeys.blogPosts(userId, filters),
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds for fresh data
  });
};

export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, updates }: { postId: string; updates: any }) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', postId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['blog-posts', data.user_id] 
      });
      queryClient.setQueryData(
        queryKeys.blogPost(data.id), 
        data
      );
    },
  });
};

// Prefetch utilities
export const prefetchUserData = async (queryClient: any, userId: string) => {
  const prefetchPromises = [
    queryClient.prefetchQuery({
      queryKey: queryKeys.userCredits(userId),
      queryFn: async () => {
        const { data } = await supabase
          .from('user_credits')
          .select('*')
          .eq('user_id', userId)
          .single();
        return data;
      },
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.blogPosts(userId),
      queryFn: async () => {
        const { data } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);
        return data;
      },
    }),
  ];
  
  await Promise.all(prefetchPromises);
};

// Real-time subscriptions
export const useRealtimeBlogPosts = (userId: string) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = supabase
      .channel('blog_posts_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'blog_posts',
          filter: `user_id=eq.${userId}`
        }, 
        (payload) => {
          console.log('Real-time blog post change:', payload);
          
          // Invalidate blog posts queries
          queryClient.invalidateQueries({ 
            queryKey: ['blog-posts', userId] 
          });
          
          // Update specific post if available
          if (payload.new && payload.eventType !== 'DELETE') {
            queryClient.setQueryData(
              queryKeys.blogPost(payload.new.id),
              payload.new
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
};