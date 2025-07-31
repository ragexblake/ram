/*
  # Upgrade Current User to Pro Subscription

  1. Updates
    - Updates current user's profile plan to 'Pro'
    - Creates/updates subscriber record with Pro subscription details
    - Sets 25 licenses for testing team features
    - Marks subscription as active

  2. Security
    - Uses auth.uid() to target only the current authenticated user
    - Safe to run multiple times with UPSERT operations
*/

-- Update the current user's profile to Pro plan
UPDATE profiles 
SET 
  plan = 'Pro'::subscription_plan,
  updated_at = now()
WHERE id = auth.uid();

-- Create or update subscriber record for Pro subscription
INSERT INTO subscribers (
  user_id,
  email,
  subscribed,
  subscription_tier,
  licenses_purchased,
  licenses_used,
  stripe_customer_id,
  subscription_end,
  created_at,
  updated_at
)
SELECT 
  auth.uid(),
  auth.email(),
  true,
  'Pro',
  25,
  GREATEST(1, COALESCE(s.licenses_used, 1)),
  COALESCE(s.stripe_customer_id, 'test_customer_' || auth.uid()),
  (now() + interval '1 year'),
  now(),
  now()
FROM (
  SELECT licenses_used, stripe_customer_id
  FROM subscribers 
  WHERE user_id = auth.uid()
  UNION ALL
  SELECT 1, null
  LIMIT 1
) s
ON CONFLICT (user_id) 
DO UPDATE SET
  subscribed = true,
  subscription_tier = 'Pro',
  licenses_purchased = 25,
  licenses_used = GREATEST(1, subscribers.licenses_used),
  subscription_end = (now() + interval '1 year'),
  updated_at = now();