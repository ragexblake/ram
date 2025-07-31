/*
  # Debug User Subscription Status

  This migration helps debug subscription issues by:
  1. Checking current user's profile and subscription data
  2. Ensuring proper Pro subscription setup
  3. Fixing any data inconsistencies
*/

-- First, let's see what we have for the current user
DO $$
DECLARE
    current_user_id uuid;
    user_email text;
    current_profile record;
    current_subscriber record;
BEGIN
    -- Get current user info
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE NOTICE 'No authenticated user found';
        RETURN;
    END IF;
    
    -- Get user email
    SELECT email INTO user_email FROM auth.users WHERE id = current_user_id;
    
    RAISE NOTICE 'Current User ID: %', current_user_id;
    RAISE NOTICE 'Current User Email: %', user_email;
    
    -- Check current profile
    SELECT * INTO current_profile FROM profiles WHERE id = current_user_id;
    
    IF current_profile IS NOT NULL THEN
        RAISE NOTICE 'Profile found - Plan: %, Role: %', current_profile.plan, current_profile.role;
    ELSE
        RAISE NOTICE 'No profile found for user';
    END IF;
    
    -- Check current subscriber
    SELECT * INTO current_subscriber FROM subscribers WHERE user_id = current_user_id;
    
    IF current_subscriber IS NOT NULL THEN
        RAISE NOTICE 'Subscriber found - Tier: %, Subscribed: %, Licenses: %/%', 
                     current_subscriber.subscription_tier, 
                     current_subscriber.subscribed,
                     current_subscriber.licenses_used,
                     current_subscriber.licenses_purchased;
    ELSE
        RAISE NOTICE 'No subscriber record found';
    END IF;
    
    -- Force update to Pro if user exists
    IF current_user_id IS NOT NULL AND user_email IS NOT NULL THEN
        -- Update profile to Pro
        UPDATE profiles 
        SET plan = 'Pro', updated_at = now()
        WHERE id = current_user_id;
        
        -- Insert or update subscriber record
        INSERT INTO subscribers (
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
            user_email,
            'manual_pro_upgrade',
            true,
            'Pro',
            25,
            1,
            (now() + interval '1 year'),
            now(),
            now()
        )
        ON CONFLICT (user_id) DO UPDATE SET
            subscription_tier = 'Pro',
            subscribed = true,
            licenses_purchased = GREATEST(EXCLUDED.licenses_purchased, subscribers.licenses_purchased),
            licenses_used = LEAST(subscribers.licenses_used, EXCLUDED.licenses_purchased),
            updated_at = now();
        
        RAISE NOTICE 'Successfully upgraded user to Pro subscription';
    END IF;
END $$;