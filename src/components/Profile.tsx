
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useCompanyContext } from '@/hooks/useCompanyContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Profile: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { getCompanyContext, loading: companyLoading } = useCompanyContext();
  const [companyName, setCompanyName] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const capitalizeFirstLetter = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getFirstName = () => {
    const fullName = profile?.full_name || user?.full_name || '';
    const firstName = fullName.split(' ')[0] || '';
    return capitalizeFirstLetter(firstName);
  };

  const getLastName = () => {
    const fullName = profile?.full_name || user?.full_name || '';
    const nameParts = fullName.split(' ');
    const lastName = nameParts.slice(1).join(' ') || '';
    return capitalizeFirstLetter(lastName);
  };

  const getTeamDisplay = () => {
    const userTeams = profile?.team;
    
    if (!userTeams || (Array.isArray(userTeams) && userTeams.length === 0)) {
      return 'General';
    }
    
    if (Array.isArray(userTeams)) {
      return userTeams.join(', ');
    }
    
    if (typeof userTeams === 'string') {
      return userTeams || 'General';
    }
    
    return 'General';
  };

  useEffect(() => {
    const loadCompanyContext = async () => {
      if (profile) {
        try {
          const context = await getCompanyContext(profile);
          setCompanyName(context.company_name);
        } catch (error) {
          console.error('Error loading company context:', error);
          setCompanyName('Not specified');
        }
      }
    };

    loadCompanyContext();
  }, [profile, getCompanyContext]);

  const handleRefreshProfile = async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
      toast({
        title: "Profile Refreshed",
        description: "Your profile data has been updated from the database.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh profile data.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };
  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Debug Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-blue-900">Profile Debug Info</h3>
            <Button
              onClick={handleRefreshProfile}
              disabled={refreshing}
              size="sm"
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Profile'}</span>
            </Button>
          </div>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Current Plan:</strong> {profile?.plan || 'Not set'}</p>
            <p><strong>Role:</strong> {profile?.role || 'Not set'}</p>
            <p><strong>User ID:</strong> {user?.id || 'Not available'}</p>
            <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
            <p><strong>Group ID:</strong> {profile?.group_id || 'Not set'}</p>
            <p><strong>Company:</strong> {profile?.company_name || 'Not set'}</p>
            <p><strong>License Count:</strong> {licenseCount || 'Not set'}</p>
          </div>
          <div className="mt-3 p-3 bg-white rounded border">
            <p className="text-xs text-gray-600 mb-2"><strong>Instructions:</strong></p>
            <p className="text-xs text-gray-600">
              1. Run the migration below to create your subscriber record<br/>
              2. Click "Refresh Profile" above to sync the latest data<br/>
              3. If still showing Free, check browser console for errors
            </p>
          </div>
        </div>

        {/* Manual Subscriber Creation */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-900 mb-3">Create Subscriber Record</h3>
          <p className="text-sm text-green-800 mb-4">
            If you manually added yourself to the subscribers table but it's not working, 
            click this button to create a proper subscriber record:
          </p>
          <Button
            onClick={async () => {
              try {
                const { data, error } = await supabase.functions.invoke('create-manual-subscriber', {
                  body: { 
                    plan: 'Pro',
                    licenses: 25 
                  }
                });
                
                if (error) throw error;
                
                toast({
                  title: "Subscriber Record Created",
                  description: "Your Pro subscription has been activated. Refreshing profile...",
                });
                
                // Wait a moment then refresh
                setTimeout(() => {
                  handleRefreshProfile();
                }, 1000);
                
              } catch (error: any) {
                console.error('Error creating subscriber:', error);
                toast({
                  title: "Creation Failed",
                  description: error.message || "Failed to create subscriber record.",
                  variant: "destructive",
                });
              }
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Create Pro Subscriber Record
          </Button>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Personal Information
            </h3>
            <p className="text-sm text-muted-foreground">
              Your account information and group details.
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  value={getFirstName()}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm px-3 py-2"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  value={getLastName()}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm px-3 py-2"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm px-3 py-2"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyLoading ? 'Loading...' : companyName}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm px-3 py-2"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <input
                  type="text"
                  value={profile?.role || 'Not specified'}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm px-3 py-2"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Plan
                </label>
                <input
                  type="text"
                  value={profile?.plan || 'Free'}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm px-3 py-2"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teams
                </label>
                <input
                  type="text"
                  value={getTeamDisplay()}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm px-3 py-2"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
