import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  HeadphonesIcon,
  Check,
  Mail,
  Loader2,
  Infinity,
  Shield,
  Crown
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PricingPage: React.FC = () => {
  const [pricingOptions, setPricingOptions] = useState({
    billing: 'monthly',
    users: 5,
  });
  const [loadingStates, setLoadingStates] = useState({
    standard: false,
    pro: false,
    business: false
  });
  const { toast } = useToast();

  const freeFeatures = [
    { id: 'users', icon: Users, label: 'Up to 5 users', highlight: false },
    { id: 'courses', icon: BookOpen, label: '3 Courses Max', highlight: false },
    { id: 'ai-builder', icon: BookOpen, label: 'AI Course Builder', highlight: true },
    { id: 'people', icon: Users, label: 'People Management', highlight: true },
    { id: 'honestbox', icon: Mail, label: 'HonestBox', highlight: true },
    { id: 'analytics', icon: BarChart3, label: 'Basic Analytics', highlight: false },
    { id: 'support', icon: HeadphonesIcon, label: 'Email Support', highlight: false },
    { id: 'branding', icon: Crown, label: 'ONEGO Branding', highlight: false },
    { id: 'security', icon: Shield, label: 'Data Privacy & Security', highlight: true },
    { id: 'admin', icon: Users, label: '1 Admin Account', highlight: false }
  ];

  const standardFeatures = [
    { id: 'users', icon: Users, label: 'Up to 25 users', highlight: false },
    { id: 'courses', icon: BookOpen, label: '20 Courses Max', highlight: false },
    { id: 'ai-builder', icon: BookOpen, label: 'AI Course Builder', highlight: true },
    { id: 'people', icon: Users, label: 'People Management', highlight: true },
    { id: 'honestbox', icon: Mail, label: 'HonestBox', highlight: true },
    { id: 'analytics', icon: BarChart3, label: 'Advanced Analytics', highlight: true },
    { id: 'support', icon: HeadphonesIcon, label: 'Priority Support', highlight: true },
    { id: 'branding', icon: Crown, label: 'Custom Branding', highlight: true },
    { id: 'security', icon: Shield, label: 'Data Privacy & Security', highlight: true },
    { id: 'admin', icon: Users, label: '2 Admin Accounts', highlight: false }
  ];

  const proFeatures = [
    { id: 'users', icon: Users, label: 'Up to 50 users', highlight: false },
    { id: 'courses', icon: BookOpen, label: '40 Courses Max', highlight: false },
    { id: 'everything', icon: Check, label: 'Everything in Standard', highlight: true },
    { id: 'performance', icon: BarChart3, label: 'Performance Tracking', highlight: true },
    { id: 'admin', icon: Users, label: '5 Admin Accounts', highlight: false }
  ];

  const businessFeatures = [
    { id: 'users', icon: Users, label: 'Up to 250 users', highlight: false },
    { id: 'courses', icon: BookOpen, label: 'Unlimited Courses', highlight: true },
    { id: 'everything', icon: Check, label: 'Everything in Pro', highlight: true },
    { id: 'security', icon: Shield, label: 'Enterprise Security', highlight: true },
    { id: 'support', icon: HeadphonesIcon, label: 'Dedicated Support', highlight: true },
    { id: 'admin', icon: Users, label: '10 Admin Accounts', highlight: false }
  ];

  const enterpriseFeatures = [
    { id: 'everything', icon: Check, label: 'Everything in Business +', highlight: true },
    { id: 'limits', icon: Infinity, label: 'Higher Limits', highlight: true },
    { id: 'support', icon: HeadphonesIcon, label: 'Priority Support', highlight: true },
    { id: 'slas', icon: Shield, label: 'SLAs', highlight: true },
    { id: 'csm', icon: Users, label: 'Success Manager (CSM)', highlight: true },
    { id: 'whitelabel', icon: Crown, label: 'White Labeling', highlight: true },
    { id: 'custom', icon: BookOpen, label: 'Custom Development', highlight: true },
    { id: 'integrations', icon: Check, label: 'Integrations', highlight: true },
    { id: 'api', icon: Check, label: 'API Access', highlight: true },
    { id: 'custom-integrations', icon: Check, label: 'Custom Integrations', highlight: true }
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
    setLoadingStates(prev => ({ ...prev, standard: true }));
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
      setLoadingStates(prev => ({ ...prev, standard: false }));
    }
  };

  const handleStandardCheckout = async () => {
    setLoadingStates(prev => ({ ...prev, standard: true }));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to upgrade to Standard plan.",
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke('create-checkout', {
        body: {
          plan: 'standard',
          billing: pricingOptions.billing,
          price: pricingOptions.billing === 'monthly' ? 149 : 119.20,
          users: 1
        }
      });

      if (response.error) {
        console.error('Checkout error:', response.error);
        throw new Error(response.error.message);
      }

      if (response.data?.url) {
        window.open(response.data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, standard: false }));
    }
  };

  const handleProCheckout = async () => {
    setLoadingStates(prev => ({ ...prev, pro: true }));
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
          plan: 'pro',
          billing: pricingOptions.billing,
          price: pricingOptions.billing === 'monthly' ? 299 : 239.20,
          users: 1
        }
      });

      if (response.error) {
        console.error('Checkout error:', response.error);
        throw new Error(response.error.message);
      }

      if (response.data?.url) {
        window.open(response.data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, pro: false }));
    }
  };

  const handleBusinessCheckout = async () => {
    setLoadingStates(prev => ({ ...prev, business: true }));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to upgrade to Business plan.",
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke('create-checkout', {
        body: {
          plan: 'business',
          billing: pricingOptions.billing,
          price: pricingOptions.billing === 'monthly' ? 699 : 559.20,
          users: 1
        }
      });

      if (response.error) {
        console.error('Checkout error:', response.error);
        throw new Error(response.error.message);
      }

      if (response.data?.url) {
        window.open(response.data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, business: false }));
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Predictable pricing, scalable plans</h1>
          <p className="text-xl text-gray-600">Designed for every stage of your learning journey at ONEGO.ai</p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1 flex items-center">
            <button
              onClick={() => setPricingOptions(prev => ({ ...prev, billing: 'monthly' }))}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                pricingOptions.billing === 'monthly'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setPricingOptions(prev => ({ ...prev, billing: 'yearly' }))}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                pricingOptions.billing === 'yearly'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
            </button>
            {pricingOptions.billing === 'yearly' && (
              <div className="ml-4 bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Save 20% with Annual Plans
              </div>
            )}
          </div>
        </div>

        {/* How Credits Work Section */}
        <div className="bg-gray-100 rounded-lg p-6 mb-12 max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">How Credits Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <span className="text-gray-900">1 Credit = 1 AI Course Creation</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <span className="text-gray-900">1 Credit = 1 Course Session</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Infinity className="h-4 w-4 text-white" />
              </div>
              <span className="text-gray-900">Credits Reset Monthly</span>
            </div>
          </div>
          <p className="text-gray-500 text-sm text-center mt-4">*1 Credit = 1000 Words Generated</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Free Plan */}
          <div className="bg-white rounded-lg border-2 border-yellow-500 p-6 shadow-sm">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <p className="text-gray-600 text-sm mb-4">Perfect for trying out ONEGO</p>
              <div className="text-4xl font-bold text-green-600 mb-2">$0</div>
              <p className="text-gray-600 text-sm">Forever free</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 mb-6">
              <p className="text-gray-900 text-sm text-center">50 Credits per month</p>
            </div>
            <ul className="space-y-3 mb-6">
              {freeFeatures.map((feature) => (
                <li key={feature.id} className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className={`text-sm ${feature.highlight ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{feature.label}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={sendSupportEmail}
              className="w-full py-3 px-4 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400 flex items-center justify-center"
            >
              Get Started Free
            </button>
            <p className="text-gray-500 text-xs text-center mt-2">Risk-Free, No Credit Card Required.</p>
          </div>

          {/* Standard Plan */}
          <div className="bg-white rounded-lg border-2 border-green-500 p-6 shadow-sm">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Standard</h3>
              <p className="text-gray-600 text-sm mb-4">Great for small businesses</p>
              <div className="text-4xl font-bold text-green-600 mb-2">
                ${pricingOptions.billing === 'monthly' ? '149' : '119.20'}
              </div>
              <p className="text-gray-600 text-sm">per month</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 mb-6">
              <p className="text-gray-900 text-sm text-center">500 Credits per month + $0.20/extra credit</p>
            </div>
            <ul className="space-y-3 mb-6">
              {standardFeatures.map((feature) => (
                <li key={feature.id} className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className={`text-sm ${feature.highlight ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{feature.label}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={handleStandardCheckout}
              disabled={loadingStates.standard}
              className="w-full py-3 px-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-400 disabled:opacity-50 flex items-center justify-center"
            >
              {loadingStates.standard ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Get Started'
              )}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-lg border-2 border-green-500 p-6 shadow-sm relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
              <p className="text-gray-600 text-sm mb-4">Perfect for growing companies</p>
              <div className="text-4xl font-bold text-green-600 mb-2">
                ${pricingOptions.billing === 'monthly' ? '299' : '239.20'}
              </div>
              <p className="text-gray-600 text-sm">per month</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 mb-6">
              <p className="text-gray-900 text-sm text-center">1,500 Credits per month + $0.20/extra credit</p>
            </div>
            <ul className="space-y-3 mb-6">
              {proFeatures.map((feature) => (
                <li key={feature.id} className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className={`text-sm ${feature.highlight ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{feature.label}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={handleProCheckout}
              disabled={loadingStates.pro}
              className="w-full py-3 px-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-400 disabled:opacity-50 flex items-center justify-center"
            >
              {loadingStates.pro ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Get Started'
              )}
            </button>
          </div>

          {/* Business Plan */}
          <div className="bg-white rounded-lg border-2 border-orange-500 p-6 shadow-sm">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Business</h3>
              <p className="text-gray-600 text-sm mb-4">Ideal for larger organizations</p>
              <div className="text-4xl font-bold text-green-600 mb-2">
                ${pricingOptions.billing === 'monthly' ? '699' : '559.20'}
              </div>
              <p className="text-gray-600 text-sm">per month</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 mb-6">
              <p className="text-gray-900 text-sm text-center">4,000 Credits per month + $0.20/extra credit</p>
            </div>
            <ul className="space-y-3 mb-6">
              {businessFeatures.map((feature) => (
                <li key={feature.id} className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className={`text-sm ${feature.highlight ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{feature.label}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={handleBusinessCheckout}
              disabled={loadingStates.business}
              className="w-full py-3 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-400 flex items-center justify-center"
            >
              {loadingStates.business ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Get Started'
              )}
            </button>
          </div>
        </div>

        {/* Enterprise Plan */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg border-2 border-purple-500 p-8 max-w-md shadow-sm">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <p className="text-gray-600 text-sm mb-4">For large-scale deployments</p>
              <div className="mb-6">
                <p className="text-purple-600 font-medium mb-2">Let's Talk</p>
                <p className="text-gray-600 text-sm">Contact us for custom pricing</p>
              </div>
            </div>
            <button 
              onClick={sendEnterpriseEmail}
              className="w-full py-3 px-4 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-400 flex items-center justify-center mb-6"
            >
              Contact Sales
            </button>
            <ul className="space-y-3">
              {enterpriseFeatures.map((feature) => (
                <li key={feature.id} className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className={`text-sm ${feature.highlight ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{feature.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Flexible Credit System */}
        <div className="bg-gray-100 rounded-lg p-8 mb-8 max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-green-600 mb-4">Flexible Credit System</h3>
            <p className="text-gray-900 text-lg">Need more credits? Purchase additional credits anytime to scale your usage</p>
          </div>
          <div className="flex items-center justify-center space-x-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">$0.20</div>
              <p className="text-gray-600 text-sm">per additional credit</p>
            </div>
            <div className="text-center">
              <p className="text-green-600 font-medium">Volume Discounts</p>
              <p className="text-gray-600 text-sm">available for Enterprise</p>
            </div>
          </div>
        </div>

        {/* USD Note */}
        <div className="text-center">
          <p className="text-sm text-gray-500">All pricing is in USD</p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
