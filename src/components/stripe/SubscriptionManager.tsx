import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Users, Calendar, ExternalLink } from 'lucide-react';
import { formatPrice } from '@/lib/stripe';

interface SubscriptionManagerProps {
  userId: string;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ userId }) => {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSubscription();
  }, [userId]);

  const loadSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    setPortalLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        throw error;
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
        description: error.message || "Failed to open customer portal.",
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
          <div className="text-center">Loading subscription...</div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Subscription</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No active subscription found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Subscription Details</span>
          </div>
          <Badge variant={subscription.subscribed ? "default" : "secondary"}>
            {subscription.subscribed ? 'Active' : 'Inactive'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Plan</label>
            <p className="text-lg font-semibold">{subscription.subscription_tier || 'Free'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <p className={`text-lg font-semibold ${
              subscription.subscribed ? 'text-green-600' : 'text-gray-600'
            }`}>
              {subscription.subscribed ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>

        {subscription.subscription_end && (
          <div>
            <label className="text-sm font-medium text-gray-700">Next Billing Date</label>
            <p className="text-gray-900 flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(subscription.subscription_end).toLocaleDateString()}</span>
            </p>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">License Usage</label>
            <Users className="h-4 w-4 text-gray-500" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {subscription.licenses_purchased || 0} licenses purchased
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {subscription.licenses_used || 0}/{subscription.licenses_purchased || 0} licenses in use
            </p>
            
            <div className="bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(((subscription.licenses_used || 0) / (subscription.licenses_purchased || 1)) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {subscription.subscribed && (
          <div className="border-t pt-4">
            <Button
              onClick={openCustomerPortal}
              disabled={portalLoading}
              variant="outline"
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {portalLoading ? 'Opening...' : 'Manage Subscription'}
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Update payment method, view invoices, and manage your subscription
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionManager;