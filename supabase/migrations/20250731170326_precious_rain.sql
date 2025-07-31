/*
  # Force Pro upgrade for current user

  1. Updates
    - Set current user's plan to 'Pro' in profiles table
    - Create/update subscriber record with Pro status
    - Set licenses to 25 for testing

  2. Security
    - Uses auth.uid() to target only current authenticated user
    - Safe to run multiple times with UPSERT
*/

-- Update profile to Pro plan
UPDATE profiles 
SET 
  plan = 'Pro'::subscription_plan,
  updated_at = now()
WHERE id = auth.uid();

-- Create or update subscriber record
INSERT INTO subscribers (
  user_id,
  email,
  subscribed,
  subscription_tier,
  licenses_purchased,
  licenses_used,
  created_at,
  updated_at
)
SELECT 
  auth.uid(),
  (SELECT email FROM auth.users WHERE id = auth.uid()),
  true,
  'Pro',
  25,
  1,
  now(),
  now()
ON CONFLICT (user_id) 
DO UPDATE SET
  subscribed = true,
  subscription_tier = 'Pro',
  licenses_purchased = 25,
  updated_at = now();