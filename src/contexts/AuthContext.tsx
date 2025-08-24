import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  onboarding_completed: boolean;
}

interface UserRole {
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userRole: 'admin' | 'user' | null;
  loading: boolean;
  credits: number;
  refreshCredits: () => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  userRole: null,
  loading: true,
  credits: 0,
  refreshCredits: async () => {},
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  updateProfile: async () => ({ error: null }),
  refreshProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle to avoid errors if no profile exists yet

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('role', { ascending: false }); // admin komt voor user alfabetisch

      if (roleError) {
        console.error('Role fetch error:', roleError);
        // Don't throw, just default to user role
      }

      // Neem de hoogste rol (admin heeft prioriteit)
      const userRole = roleData && roleData.length > 0 ? 
        (roleData.find(r => r.role === 'admin') || roleData[0]).role : 'user';

      console.log('Profile fetched:', { profile: !!profileData, role: userRole });
      
      setProfile(profileData);
      setUserRole(userRole);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Set default values for new users
      setUserRole('user');
    }
  };

  // Optimize credits refresh to prevent blocking
  const refreshCredits = async () => {
    if (!session?.access_token) {
      console.log('No session token available for credits refresh');
      return;
    }
    
    try {
      console.log('Refreshing credits...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Credits refresh timeout')), 10000)
      );
      
      const creditsPromise = supabase.functions.invoke('check-credits', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      const { data, error } = await Promise.race([creditsPromise, timeoutPromise]) as any;
      
      if (!error && data) {
        console.log('Credits refreshed:', data);
        setCredits(data.credits_remaining || 0);
      } else if (error) {
        console.error('Credits refresh error:', error);
        
        // Handle session expiry gracefully
        if (error.message?.includes('SESSION_EXPIRED') || 
            error.message?.includes('session_not_found') ||
            error.message?.includes('timeout')) {
          console.log('Session expired or timeout during credits refresh');
          // Set default credits for failed refresh
          setCredits(0);
          return;
        }
      }
    } catch (error) {
      console.error('Error refreshing credits:', error);
      // Set default credits on error
      setCredits(0);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Don't wait for profile and credits - set loading to false first
          setLoading(false);
          
          // Fetch profile and credits in background
          setTimeout(async () => {
            try {
              await fetchProfile(session.user.id);
              // Don't wait for credits - let it load in background
              refreshCredits().catch(console.error);
            } catch (error) {
              console.error('Error fetching user data:', error);
            }
          }, 0);
        } else {
          setProfile(null);
          setUserRole(null);
          setCredits(0);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        
        if (!mounted) return;
        
        console.log('Initial session check:', session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Set loading to false first, then fetch data in background
          setLoading(false);
          
          setTimeout(async () => {
            try {
              await fetchProfile(session.user.id);
              refreshCredits().catch(console.error);
            } catch (error) {
              console.error('Error initializing user data:', error);
            }
          }, 0);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: displayName ? { display_name: displayName } : undefined,
      },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Registratie mislukt",
        description: error.message,
      });
    } else {
      toast({
        title: "Registratie succesvol",
        description: "Controleer je email voor de bevestigingslink.",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Inloggen mislukt",
        description: error.message,
      });
    } else {
      toast({
        title: "Welkom terug!",
        description: "Je bent succesvol ingelogd.",
      });
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Uitloggen mislukt",
        description: error.message,
      });
    } else {
      setCredits(0);
      toast({
        title: "Tot ziens!",
        description: "Je bent succesvol uitgelogd.",
      });
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Geen gebruiker ingelogd') };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Profiel bijwerken mislukt",
        description: error.message,
      });
    } else {
      await refreshProfile();
      toast({
        title: "Profiel bijgewerkt",
        description: "Je profiel is succesvol bijgewerkt.",
      });
    }

    return { error };
  };

  const value = {
    user,
    session,
    profile,
    userRole,
    loading,
    credits,
    refreshCredits,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};