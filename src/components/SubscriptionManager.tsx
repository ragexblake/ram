import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, ExternalLink, Loader2, Crown, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SubscriptionManagerProps {
  user: any;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ user }) => {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading subscription:', error);
        return;
      }

      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    setPortalLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Portal Error",
        description: error.message || "Failed to open customer portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading subscription...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription || !subscription.subscribed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="h-5 w-5 mr-2 text-yellow-500" />
            No Active Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            You're currently on the free plan. Upgrade to unlock advanced features.
          </p>
          <Button className="bg-green-500 hover:bg-green-600">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-green-500" />
              Current Subscription
            </div>
            <Badge className="bg-green-100 text-green-800">
              Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Plan</label>
              <p className="text-lg font-semibold text-gray-900">
                {subscription.subscription_tier}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Licenses</label>
              <p className="text-lg font-semibold text-gray-900">
                {subscription.licenses_used}/{subscription.licenses_purchased}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Next Billing</label>
              <p className="text-lg font-semibold text-gray-900">
                {subscription.subscription_end 
                  ? new Date(subscription.subscription_end).toLocaleDateString()
                  : 'N/A'
                }
              </p>
            </div>
          </div>

          {/* License Usage Bar */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>License Usage</span>
              <span>{Math.round((subscription.licenses_used / subscription.licenses_purchased) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((subscription.licenses_used / subscription.licenses_purchased) * 100, 100)}%` 
                }}
              />
            </div>
          </div>

          {/* Manage Subscription Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={openCustomerPortal}
              disabled={portalLoading}
              variant="outline"
              className="w-full"
            >
              {portalLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Opening Portal...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Manage Subscription
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Update payment method, billing info, or cancel subscription
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-500" />
            Usage Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Team Members</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {subscription.licenses_used}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Available Licenses</p>
                  <p className="text-2xl font-bold text-green-900">
                    {subscription.licenses_purchased - subscription.licenses_used}
                  </p>
                </div>
                <Crown className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-purple-500" />
            Billing Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Customer ID</span>
              <span className="font-mono text-sm">{subscription.stripe_customer_id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subscription Status</span>
              <Badge className="bg-green-100 text-green-800">
                {subscription.subscribed ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Updated</span>
              <span className="text-sm">
                {new Date(subscription.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManager;