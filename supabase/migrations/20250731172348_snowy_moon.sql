/*
  # Create subscriber record for current user

  1. New Records
    - Creates a subscriber record for the authenticated user
    - Sets Pro subscription with proper license allocation
  
  2. Security
    - Uses auth.uid() to ensure only current user is affected
    - Safe to run multiple times with UPSERT
*/

DO $$
DECLARE
  current_user_id uuid;
  current_user_email text;
BEGIN
  -- Get current user info
  current_user_id := auth.uid();
  current_user_email := auth.email();
  
  -- Log the operation
  RAISE NOTICE 'Creating subscriber record for user: % (email: %)', current_user_id, current_user_email;
  
  -- Only proceed if we have a valid user
  IF current_user_id IS NOT NULL AND current_user_email IS NOT NULL THEN
    -- Create or update subscriber record
    INSERT INTO public.subscribers (
      user_id,
      email,
      stripe_customer_id,
      subscribed,
      subscription_tier,
      licenses_purchased,
      licenses_used,
      subscription_end,
      created_at,
      updated_at
    ) VALUES (
      current_user_id,
      current_user_email,
      'manual_upgrade_' || current_user_id,
      true,
      'Pro',
      25,
      1,
      (now() + interval '1 year'),
      now(),
      now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      subscribed = true,
      subscription_tier = 'Pro',
      licenses_purchased = GREATEST(EXCLUDED.licenses_purchased, subscribers.licenses_used),
      subscription_end = (now() + interval '1 year'),
      updated_at = now();
    
    -- Update profile to Pro
    UPDATE public.profiles 
    SET 
      plan = 'Pro',
      updated_at = now()
    WHERE id = current_user_id;
    
    RAISE NOTICE 'Successfully created/updated subscriber and profile records';
  ELSE
    RAISE NOTICE 'No authenticated user found - migration skipped';
  END IF;
END $$;