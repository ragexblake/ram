import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';
import CompanyBrandingSettings from './branding/CompanyBrandingSettings';
import SubscriptionManager from './SubscriptionManager';

const AccountSettings: React.FC = () => {
  const { user, profile, session } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [licenseInfo, setLicenseInfo] = useState<{ purchased: number; used: number } | null>(null);
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const { toast } = useToast();

  useEffect(() => {
    if (user && session) {
      loadSubscriptionData();
      loadLicenseInfo();
      loadAdminInfo();
    }
  }, [user, session, refreshKey]);

  const loadAdminInfo = async () => {
    if (!profile?.group_id) return;

    try {
      const { data: groupData, error } = await supabase
        .from('groups')
        .select(`
          *,
          admin:profiles!groups_admin_id_fkey(*)
        `)
        .eq('id', profile.group_id)
        .single();

      if (error) {
        console.error('Error loading admin info:', error);
        return;
      }

      setAdminInfo(groupData?.admin);
    } catch (error) {
      console.error('Error in loadAdminInfo:', error);
    }
  };

  const loadSubscriptionData = async () => {
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching subscription data:', error);
        return;
      }

      setSubscriptionData(data);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLicenseInfo = async () => {
    try {
      const { data: subData, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error loading subscription:', error);
        return;
      }

      if (subData) {
        // Fix: Count all group members including admin
        const { data: groupMembers } = await supabase
          .from('profiles')
          .select('id')
          .eq('group_id', profile?.group_id);

        const actualUsedLicenses = groupMembers?.length || 1;

        setLicenseInfo({
          purchased: subData.licenses_purchased || 10,
          used: actualUsedLicenses
        });

        // Update the database with correct count
        if (actualUsedLicenses !== subData.licenses_used) {
          await supabase
            .from('subscribers')
            .update({ licenses_used: actualUsedLicenses })
            .eq('user_id', user?.id);
        }
      }
    } catch (error: any) {
      console.error('❌ Error in loadLicenseInfo:', error);
    }
  };

  const handleBrandingUpdate = () => {
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Branding Updated",
      description: "Your changes have been saved successfully.",
    });
  };

  if (loading) {
    return <div className="p-8">Loading account settings...</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Company Branding Settings - Admin Only */}
        {profile?.role === 'Admin' && (
          <CompanyBrandingSettings 
            profile={profile} 
            onBrandingUpdate={handleBrandingUpdate}
          />
        )}

        {/* Subscription Management - Admin Only */}
        {profile?.role === 'Admin' && subscriptionData && (
          <SubscriptionManager user={profile} />
        )}
      </div>
    </div>
  );
};

export default AccountSettings;
