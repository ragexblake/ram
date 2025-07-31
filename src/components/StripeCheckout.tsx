import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Users, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StripeCheckoutProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'pro' | 'business'>('pro');
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [userCount, setUserCount] = useState(5);
  const { toast } = useToast();

  const plans = {
    standard: {
      name: 'Standard',
      monthlyPrice: 149,
      yearlyPrice: 119.20,
      credits: 500,
      maxUsers: 25,
      maxCourses: 20,
      features: [
        'Up to 25 users',
        '20 Courses Max',
        'AI Course Builder',
        'People Management',
        'HonestBox',
        'Advanced Analytics',
        'Priority Support',
        'Custom Branding',
        'Data Privacy & Security',
        '2 Admin Accounts'
      ]
    },
    pro: {
      name: 'Pro',
      monthlyPrice: 299,
      yearlyPrice: 239.20,
      credits: 1500,
      maxUsers: 50,
      maxCourses: 40,
      features: [
        'Up to 50 users',
        '40 Courses Max',
        'Everything in Standard',
        'Performance Tracking',
        '5 Admin Accounts'
      ]
    },
    business: {
      name: 'Business',
      monthlyPrice: 699,
      yearlyPrice: 559.20,
      credits: 4000,
      maxUsers: 250,
      maxCourses: 'Unlimited',
      features: [
        'Up to 250 users',
        'Unlimited Courses',
        'Everything in Pro',
        'Enterprise Security',
        'Dedicated Support',
        '10 Admin Accounts'
      ]
    }
  };

  const currentPlan = plans[selectedPlan];
  const price = billing === 'monthly' ? currentPlan.monthlyPrice : currentPlan.yearlyPrice;
  const totalPrice = price * userCount;

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to continue with checkout.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          users: userCount,
          billing: billing,
          plan: selectedPlan
        }
      });

      if (error) {
        console.error('Checkout error:', error);
        throw new Error(error.message);
      }

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
        <p className="text-gray-600">Upgrade to unlock advanced features and scale your team</p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              billing === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              billing === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.entries(plans).map(([key, plan]) => (
          <Card 
            key={key}
            className={`cursor-pointer transition-all ${
              selectedPlan === key 
                ? 'ring-2 ring-green-500 border-green-500' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedPlan(key as any)}
          >
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold text-green-600">
                ${billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
              </div>
              <p className="text-gray-600">per month</p>
              <div className="bg-gray-100 rounded-lg p-3 mt-4">
                <p className="text-sm font-medium">{plan.credits} Credits per month</p>
                <p className="text-xs text-gray-600">+ $0.20/extra credit</p>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Count Selector */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Number of Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setUserCount(Math.max(1, userCount - 1))}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                -
              </button>
              <span className="text-xl font-semibold w-12 text-center">{userCount}</span>
              <button
                onClick={() => setUserCount(userCount + 1)}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                +
              </button>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                ${totalPrice.toFixed(2)}
              </div>
              <p className="text-gray-600">total per month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checkout Button */}
      <div className="text-center">
        <Button
          onClick={handleCheckout}
          disabled={loading}
          size="lg"
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Creating Checkout...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Upgrade to {currentPlan.name}
            </>
          )}
        </Button>
        
        <p className="text-sm text-gray-500 mt-4">
          Secure payment powered by Stripe • Cancel anytime
        </p>
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <div className="text-center mt-4">
          <Button variant="ghost" onClick={onCancel}>
            Maybe Later
          </Button>
        </div>
      )}
    </div>
  );
};

export default StripeCheckout;