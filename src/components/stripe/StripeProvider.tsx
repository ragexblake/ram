import React, { createContext, useContext, ReactNode } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';

interface StripeContextType {
  // Add any Stripe-related context values here
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
};

interface StripeProviderProps {
  children: ReactNode;
}

const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const contextValue: StripeContextType = {
    // Add context values here
  };

  return (
    <Elements stripe={stripePromise}>
      <StripeContext.Provider value={contextValue}>
        {children}
      </StripeContext.Provider>
    </Elements>
  );
};

export default StripeProvider;