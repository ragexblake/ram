/*
  # Add Test Pro Subscriber

  1. Updates
    - Update current user's profile to Pro plan
    - Create/update subscriber record with Pro subscription
    - Set license count for testing team features

  2. Security
    - Uses auth.uid() to target current authenticated user
    - Safe to run multiple times (uses UPSERT)
*/

-- Update the current user's profile to Pro plan
UPDATE profiles 
SET 
  plan = 'Pro',
  updated_at = now()
WHERE id = auth.uid();

-- Create or update subscriber record for current user
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
  auth.email(),
  true,
  'Pro',
  25, -- 25 licenses for testing
  1,  -- Admin counts as 1 used license
  now(),
  now()
ON CONFLICT (user_id) 
DO UPDATE SET
  subscribed = true,
  subscription_tier = 'Pro',
  licenses_purchased = 25,
  licenses_used = GREATEST(subscribers.licenses_used, 1), -- Keep existing usage or set to 1
  updated_at = now();