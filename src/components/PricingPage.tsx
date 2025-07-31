import React, { useState } from 'react';
import { Check, Infinity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CheckoutButton from '@/components/stripe/CheckoutButton';

const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const pricingPlans = [
    {
      name: 'Free',
      subtitle: 'Perfect for trying out ONEGO',
      price: '$0',
      billing: 'Forever free',
      credits: '50 Credits per month',
      features: [
        'Up to 5 users',
        '3 Courses Max',
        'AI Course Builder',
        'People Management',
        'HonestBox',
        'Basic Analytics',
        'Email Support',
        'ONEGO Branding',
        'Data Privacy & Security',
        '1 Admin Account'
      ],
      buttonText: 'Get Started Free',
      buttonVariant: 'default' as const,
      borderColor: 'border-yellow-400',
      buttonColor: 'bg-yellow-500 hover:bg-yellow-600',
      disclaimer: 'Risk-Free, No Credit Card Required.',
      isFree: true
    },
    {
      name: 'Standard',
      subtitle: 'Great for small businesses',
      price: '$149',
      billing: 'per month',
      credits: '500 Credits per month + $0.20/extra credit',
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
      ],
      buttonText: 'Get Started',
      buttonVariant: 'default' as const,
      borderColor: 'border-green-500',
      buttonColor: 'bg-green-500 hover:bg-green-600',
      plan: 'standard' as const
    },
    {
      name: 'Pro',
      subtitle: 'Perfect for growing companies',
      price: '$299',
      billing: 'per month',
      credits: '1,500 Credits per month + $0.20/extra credit',
      features: [
        'Up to 50 users',
        '40 Courses Max',
        'Everything in Standard',
        'Performance Tracking',
        '5 Admin Accounts'
      ],
      buttonText: 'Get Started',
      buttonVariant: 'default' as const,
      borderColor: 'border-green-500',
      buttonColor: 'bg-green-500 hover:bg-green-600',
      plan: 'pro' as const,
      isPopular: true
    },
    {
      name: 'Business',
      subtitle: 'Ideal for larger organizations',
      price: '$699',
      billing: 'per month',
      credits: '4,000 Credits per month + $0.20/extra credit',
      features: [
        'Up to 250 users',
        'Unlimited Courses',
        'Everything in Pro',
        'Enterprise Security',
        'Dedicated Support',
        '10 Admin Accounts'
      ],
      buttonText: 'Get Started',
      buttonVariant: 'default' as const,
      borderColor: 'border-orange-500',
      buttonColor: 'bg-orange-500 hover:bg-orange-600',
      plan: 'business' as const
    }
  ];

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Predictable pricing, scalable plans
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Designed for every stage of your learning journey at ONEGO.ai
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex bg-gray-100 rounded-lg p-1 mb-12">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* How Credits Work Section */}
        <div className="bg-gray-50 rounded-xl p-8 mb-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            How Credits Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <p className="text-gray-900 font-medium">1 Credit = 1 AI Course Creation</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <p className="text-gray-900 font-medium">1 Credit = 1 Course Session</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Infinity className="text-white w-6 h-6" />
              </div>
              <p className="text-gray-900 font-medium">Credits Reset Monthly</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            *1 Credit = 1000 Words Generated
          </p>
        </div>

                 {/* Pricing Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           {pricingPlans.map((plan, index) => (
             <Card key={index} className={`relative ${plan.borderColor} border-2 shadow-lg flex flex-col h-full`}>
               {plan.isPopular && (
                 <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1">
                   Most Popular
                 </Badge>
               )}
               
               <CardHeader className="text-center pb-4">
                 <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                 <p className="text-gray-600 text-sm">{plan.subtitle}</p>
                 <div className="mt-4">
                   <div className="text-4xl font-bold text-gray-900">{plan.price}</div>
                   <p className="text-gray-600 text-sm">{plan.billing}</p>
                 </div>
               </CardHeader>
               
               <CardContent className="space-y-4 flex-1 flex flex-col">
                 {/* Credits Box */}
                 <div className="bg-gray-100 rounded-lg p-3 text-center">
                   <p className="text-gray-900 text-sm font-medium">{plan.credits}</p>
                 </div>
                 
                 {/* Features List */}
                 <ul className="space-y-3 flex-1">
                   {plan.features.map((feature, featureIndex) => (
                     <li key={featureIndex} className="flex items-start">
                       <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                       <span className="text-sm text-gray-700">{feature}</span>
                     </li>
                   ))}
                 </ul>
                 
                 {/* CTA Button */}
                 <div className="pt-4 mt-auto">
                   {plan.isFree ? (
                     <Button 
                       className={`w-full ${plan.buttonColor} text-white font-medium`}
                       variant="default"
                     >
                       {plan.buttonText}
                     </Button>
                   ) : (
                     <CheckoutButton
                       plan={plan.plan}
                       billing={billingCycle}
                       price={billingCycle === 'monthly' ? 
                         parseInt(plan.price.replace('$', '')) : 
                         parseInt(plan.price.replace('$', '')) * 0.8
                       }
                       users={1}
                       className={`w-full ${plan.buttonColor} text-white font-medium`}
                     >
                       {plan.buttonText}
                     </CheckoutButton>
                   )}
                   
                   {plan.disclaimer && (
                     <p className="text-xs text-gray-500 text-center mt-2">
                       {plan.disclaimer}
                     </p>
                   )}
                 </div>
               </CardContent>
             </Card>
           ))}
         </div>

         {/* Enterprise Card */}
         <div className="max-w-md mx-auto mb-12">
           <Card className="border-2 border-purple-500 shadow-lg flex flex-col h-full">
             <CardHeader className="text-center pb-4">
               <h3 className="text-2xl font-bold text-gray-900">Enterprise</h3>
               <p className="text-gray-600 text-sm mb-4">For large-scale deployments</p>
               <div className="mb-6">
                 <p className="text-purple-600 font-medium mb-2">Let's Talk</p>
                 <p className="text-gray-600 text-sm">Contact us for custom pricing</p>
               </div>
             </CardHeader>
             
             <CardContent className="space-y-4 flex-1 flex flex-col">
               {/* CTA Button */}
               <div className="pt-4">
                 <Button 
                   className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium"
                   variant="default"
                   onClick={() => {
                     const subject = 'Enterprise Plan Enquiry - ONEGO Learning';
                     const body = 'Hi, I would like to learn more about the Enterprise plan...';
                     window.location.href = `mailto:hello@onego.ai?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                   }}
                 >
                   Contact Sales
                 </Button>
               </div>
               
               {/* Features List */}
               <ul className="space-y-3 flex-1">
                 <li className="flex items-start">
                   <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                   <span className="text-sm text-gray-700">Everything in Business +</span>
                 </li>
                 <li className="flex items-start">
                   <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                   <span className="text-sm text-gray-700">Higher Limits</span>
                 </li>
                 <li className="flex items-start">
                   <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                   <span className="text-sm text-gray-700">Priority Support</span>
                 </li>
                 <li className="flex items-start">
                   <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                   <span className="text-sm text-gray-700">SLAs</span>
                 </li>
                 <li className="flex items-start">
                   <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                   <span className="text-sm text-gray-700">Success Manager (CSM)</span>
                 </li>
                 <li className="flex items-start">
                   <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                   <span className="text-sm text-gray-700">White Labeling</span>
                 </li>
                 <li className="flex items-start">
                   <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                   <span className="text-sm text-gray-700">Custom Development</span>
                 </li>
                 <li className="flex items-start">
                   <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                   <span className="text-sm text-gray-700">Integrations</span>
                 </li>
                 <li className="flex items-start">
                   <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                   <span className="text-sm text-gray-700">API Access</span>
                 </li>
                 <li className="flex items-start">
                   <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                   <span className="text-sm text-gray-700">Custom Integrations</span>
                 </li>
               </ul>
             </CardContent>
           </Card>
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
