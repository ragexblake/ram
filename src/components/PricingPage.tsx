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
import CheckoutButton from '@/components/stripe/CheckoutButton';
import { STRIPE_CONFIG, formatPrice } from '@/lib/stripe';

const PricingPage: React.FC = () => {
  const [pricingOptions, setPricingOptions] = useState({
    billing: 'monthly',
    users: 5,
  });

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
    <div>
      <div>
        <div>
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
            <CheckoutButton
              plan="business"
              billing={pricingOptions.billing}
              price={pricingOptions.billing === 'monthly' ? 699 : 559.20}
              users={1}
              className="w-full py-3 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-400"
            >
              Get Started
            </CheckoutButton>
          </div>
          
          {/* Enterprise Plan */}
          <div className="bg-white rounded-lg border-2 border-purple-500 p-6 shadow-sm">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <p className="text-gray-600 text-sm mb-4">For large-scale deployments</p>
              <div className="mb-6">
                <p className="text-purple-600 font-medium mb-2">Let's Talk</p>
              </div>
            </div>
            <button
              onClick={sendEnterpriseEmail}
              className="w-full py-3 px-4 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-400 mb-6"
            >
              Get Started
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
