
import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: any;
  profile: any;
  session: any;
  loading: boolean;
  authInitialized: boolean;
  licenseCount: number;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [licenseCount, setLicenseCount] = useState<number>(0);
  const [authInitialized, setAuthInitialized] = useState(false);

  const refreshProfile = async () => {
    if (!user?.id) {
      console.log('No user ID available for profile refresh');
      return;
    }

    try {
      console.log('🔄 Manually refreshing profile for user:', user.id);
      
      // Fetch fresh profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('❌ Error refreshing profile:', profileError);
        return;
      }

      console.log('✅ Fresh profile data loaded:', profileData);
      setProfile(profileData);
      
      // Also refresh subscription data for license count
      if (profileData.role === 'Admin') {
        try {
          const { data: subscriber, error: subError } = await supabase
            .from('subscribers')
            .select('*')
            .eq('user_id', user.id)
            .single();
        
          if (subError) {
            console.log('⚠️ No subscriber record found, error:', subError.code, subError.message);
            
            // If no subscriber record exists, create one for Pro users
            if (profileData.plan === 'Pro') {
              console.log('🔄 Creating subscriber record for Pro user...');
              
              const { data: newSubscriber, error: createError } = await supabase
                .from('subscribers')
                .insert({
                  user_id: user.id,
                  email: user.email,
                  stripe_customer_id: `manual_${user.id}`,
                  subscribed: true,
                  subscription_tier: 'Pro',
                  licenses_purchased: 25,
                  licenses_used: 1,
                  subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                })
                .select()
                .single();
              
              if (createError) {
                console.error('❌ Error creating subscriber record:', createError);
              } else {
                console.log('✅ Created new subscriber record:', newSubscriber);
                setLicenseCount(newSubscriber.licenses_purchased);
              }
            }
          } else {
            console.log('✅ Fresh subscriber data:', subscriber);
            if (subscriber) {
              setLicenseCount(subscriber.licenses_purchased);
              
              // Update profile plan if subscriber has different plan
              if (subscriber.subscription_tier && subscriber.subscription_tier !== profileData.plan) {
                console.log('🔄 Updating profile plan to match subscription:', subscriber.subscription_tier);
                
                const { error: updateError } = await supabase
                  .from('profiles')
                  .update({ plan: subscriber.subscription_tier })
                  .eq('id', user.id);
                  
                if (!updateError) {
                  setProfile(prev => ({ ...prev, plan: subscriber.subscription_tier }));
                }
              }
            }
          }
        } catch (subscriberError) {
          console.error('❌ Error handling subscriber data:', subscriberError);
        }
      }
      
      console.log('✅ Profile refresh completed');
    } catch (error) {
      console.error('❌ Error in refreshProfile:', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    let sessionFetched = false;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get the current session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
        }

        if (mounted && !sessionFetched) {
          sessionFetched = true;
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user) {
            await fetchUserProfile(currentSession.user);
          }
          
          setAuthInitialized(true);
          setLoading(false);
          console.log('Auth initialization complete');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setAuthInitialized(true);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;

        // Handle token refresh separately to prevent unnecessary profile fetches
        if (event === 'TOKEN_REFRESHED' && sessionFetched) {
          setSession(session);
          return;
        }

        // Handle other auth events
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Only fetch profile for actual sign in events, not token refreshes
            setTimeout(() => {
              if (mounted) {
                fetchUserProfile(session.user);
              }
            }, 0);
          } else if (!session?.user) {
            setProfile(null);
            setLicenseCount(0);
          }

          // Only set loading to false after initial setup
          if (authInitialized) {
            setLoading(false);
          }
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove authInitialized dependency to prevent loops

  const fetchUserProfile = async (user: any) => {
    try {
      console.log('Fetching profile for user:', user.id);
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      console.log('Profile loaded:', {
        plan: profileData?.plan,
        role: profileData?.role,
        id: profileData?.id,
        full_name: profileData?.full_name
      });
      setProfile(profileData);
      
      // Fetch subscription data for license count
      if (profileData.role === 'Admin') {
        const { data: subscriber, error: subError } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        console.log('Subscriber data:', subscriber, 'Error:', subError);
        if (subscriber && !subError) {
          setLicenseCount(subscriber.licenses_purchased);
          
          // Sync profile plan with subscription tier if different
          if (subscriber.subscription_tier && subscriber.subscription_tier !== profileData.plan) {
            console.log('🔄 Profile plan mismatch detected. Updating profile plan to:', subscriber.subscription_tier);
            
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ plan: subscriber.subscription_tier })
              .eq('id', user.id);
              
            if (!updateError) {
              setProfile(prev => ({ ...prev, plan: subscriber.subscription_tier }));
              console.log('✅ Profile plan updated to match subscription');
            }
          }
        } else if (subError && subError.code !== 'PGRST116') {
          console.error('Error fetching subscriber data:', subError);
        }
      }
    } catch (error) {
      console.error('Error in profile fetch:', error);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    authInitialized,
    licenseCount,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
