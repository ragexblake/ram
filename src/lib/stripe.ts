import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with validation
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('VITE_STRIPE_PUBLISHABLE_KEY is not set. Stripe functionality will be disabled.');
}

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : Promise.resolve(null);

export { stripePromise };

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  currency: 'usd',
  plans: {
    standard: {
      name: 'Standard',
      monthly: 149,
      yearly: 119.20,
      features: ['25 users', '20 courses', 'Advanced analytics', 'Priority support']
    },
    pro: {
      name: 'Pro', 
      monthly: 299,
      yearly: 239.20,
      features: ['50 users', '40 courses', 'Performance tracking', '5 admin accounts']
    },
    business: {
      name: 'Business',
      monthly: 699,
      yearly: 559.20,
      features: ['250 users', 'Unlimited courses', 'Enterprise security', 'Dedicated support']
    }
  }
};

// Helper functions
export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const calculateYearlyDiscount = (monthlyPrice: number): number => {
  const yearlyPrice = monthlyPrice * 12 * 0.8; // 20% discount
  return Math.round((yearlyPrice / 12) * 100) / 100;
};