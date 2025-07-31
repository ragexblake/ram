import React, { useState } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface CheckoutButtonProps {
  plan: 'standard' | 'pro' | 'business';
  billing: 'monthly' | 'yearly';
  price: number;
  users?: number;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  plan,
  billing,
  price,
  users = 1,
  children,
  className,
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to upgrade your plan.",
          variant: "destructive",
        });
        return;
      }

      console.log('Creating checkout session:', { plan, billing, price, users });

      const response = await supabase.functions.invoke('create-checkout', {
        body: {
          plan,
          billing,
          price,
          users
        }
      });

      console.log('Checkout response:', response);

      if (response.error) {
        console.error('Checkout error:', response.error);
        throw new Error(response.error.message || 'Failed to create checkout session');
      }

      if (response.data?.url) {
        // Open Stripe checkout in a new tab
        window.open(response.data.url, '_blank');
      } else {
        throw new Error('No checkout URL received from server');
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading || disabled}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Processing...
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default CheckoutButton;