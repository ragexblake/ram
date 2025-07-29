import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  HeadphonesIcon,
  Check,
  Mail,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PricingPage: React.FC = () => {
  const [pricingOptions, setPricingOptions] = useState({
    billing: 'monthly',
    users: 5,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const freeFeatures = [
    { id: 'users', icon: Users, label: '1 User', highlight: false },
    { id: 'courses', icon: BookOpen, label: '1 Course/Day', highlight: false },
    { id: 'support', icon: HeadphonesIcon, label: 'Email Support', highlight: false }
  ];

  const proFeatures = [
    { id: 'users', icon: Users, label: 'Unlimited Users', highlight: true },
    { id: 'courses', icon: BookOpen, label: 'Unlimited Courses', highlight: true },
    { id: 'analytics', icon: BarChart3, label: 'Advanced Analytics', highlight: true },
    { id: 'support', icon: HeadphonesIcon, label: 'Priority Support', highlight: false }
  ];

  const enterpriseFeatures = [
    { id: 'users', icon: Users, label: '10,000+ Users', highlight: true },
    { id: 'courses', icon: BookOpen, label: 'Custom Courses', highlight: true },
    { id: 'analytics', icon: BarChart3, label: 'Enterprise Analytics', highlight: true },
    { id: 'support', icon: HeadphonesIcon, label: 'Dedicated Support', highlight: true }
  ];

  const sendSupportEmail = () => {
    const subject = 'Support Request - ONEGO Learning';
    const body = 'Hi, I need help with...';
    window.location.href = `mailto:hello@onego.ai?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const sendEnterpriseEmail = () => {
    const subject = 'Enterprise Plan Enquiry - ONEGO Learning';
    const body = 'Hi, I would like to learn more about the Enterprise plan...';
    window.location.href = `mailto:hello@onego.ai?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleUsersChange = (value: string) => {
    const numValue = parseInt(value) || 1;
    const clampedValue = Math.max(1, numValue);
    setPricingOptions(prev => ({ ...prev, users: clampedValue }));
  };

  const handleUpgradeToPro = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to upgrade to Pro plan.",
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke('create-checkout', {
        body: {
          users: pricingOptions.users,
          billing: pricingOptions.billing
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.url) {
        // Open Stripe checkout in a new tab
        window.open(response.data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Checkout Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">Scale your learning with the right plan for your team</p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setPricingOptions(prev => ({ ...prev, billing: 'monthly' }))}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                pricingOptions.billing === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setPricingOptions(prev => ({ ...prev, billing: 'yearly' }))}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                pricingOptions.billing === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Free Plan */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
              <p className="text-gray-600">Forever free</p>
            </div>
            <ul className="space-y-4 mb-8">
              {freeFeatures.map((feature) => (
                <li key={feature.id} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className={feature.highlight ? 'font-semibold' : ''}>{feature.label}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={sendSupportEmail}
              className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center justify-center space-x-2"
            >
              <Mail className="h-4 w-4" />
              <span>Contact Support</span>
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-lg border-2 border-green-500 p-8 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                ${pricingOptions.billing === 'monthly' ? '19' : '15.20'}
              </div>
              <p className="text-gray-600">per user/month</p>
              {pricingOptions.billing === 'yearly' && (
                <p className="text-green-600 font-medium mt-2">Save 20%</p>
              )}
            </div>
            <ul className="space-y-4 mb-8">
              {proFeatures.map((feature) => (
                <li key={feature.id} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className={feature.highlight ? 'font-semibold' : ''}>{feature.label}</span>
                </li>
              ))}
            </ul>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700">Number of users:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPricingOptions(prev => ({ ...prev, users: Math.max(1, prev.users - 1) }))}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                  >
                    -
                  </button>
                  <Input
                    type="number"
                    min="1"
                    value={pricingOptions.users}
                    onChange={(e) => handleUsersChange(e.target.value)}
                    className="w-20 text-center"
                  />
                  <button
                    onClick={() => setPricingOptions(prev => ({ ...prev, users: prev.users + 1 }))}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ${(pricingOptions.users * (pricingOptions.billing === 'monthly' ? 19 : 15.20)).toFixed(2)}
                </div>
                <p className="text-gray-600">total per month</p>
              </div>
            </div>
            <button 
              onClick={handleUpgradeToPro}
              disabled={loading}
              className="w-full py-3 px-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Upgrade to Pro</span>
              )}
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">Custom</div>
              <p className="text-gray-600">For 10,000+ users</p>
            </div>
            <ul className="space-y-4 mb-8">
              {enterpriseFeatures.map((feature) => (
                <li key={feature.id} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className={feature.highlight ? 'font-semibold' : ''}>{feature.label}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={sendEnterpriseEmail}
              className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 flex items-center justify-center space-x-2"
            >
              <Mail className="h-4 w-4" />
              <span>Contact Sales</span>
            </button>
          </div>
        </div>

        {/* USD Note */}
        <div className="text-center">
          <p className="text-sm text-gray-400">All pricing is in USD</p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
