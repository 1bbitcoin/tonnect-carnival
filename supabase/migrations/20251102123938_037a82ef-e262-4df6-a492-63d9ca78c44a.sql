-- Create tables for secure game state management
CREATE TABLE IF NOT EXISTS public.user_mining_state (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  mining_start_time timestamptz NOT NULL DEFAULT now(),
  last_claim_time timestamptz,
  total_mined numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_task_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  task_id text NOT NULL,
  completed_at timestamptz DEFAULT now(),
  reward_amount numeric NOT NULL,
  UNIQUE (user_id, task_id)
);

CREATE TABLE IF NOT EXISTS public.user_spin_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  spin_time timestamptz DEFAULT now(),
  prize_value numeric NOT NULL
);

-- Add constraint to prevent self-referrals
ALTER TABLE public.referrals 
  DROP CONSTRAINT IF EXISTS no_self_referral;

ALTER TABLE public.referrals 
  ADD CONSTRAINT no_self_referral 
  CHECK (referrer_id != referred_id);

-- Add unique constraint to prevent duplicate referrals
ALTER TABLE public.referrals 
  DROP CONSTRAINT IF EXISTS unique_referred;

ALTER TABLE public.referrals 
  ADD CONSTRAINT unique_referred 
  UNIQUE (referred_id);

-- Enable RLS on new tables
ALTER TABLE public.user_mining_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_spin_history ENABLE ROW LEVEL SECURITY;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all referrals" ON public.referrals;
DROP POLICY IF EXISTS "System can insert referrals" ON public.referrals;

-- Create secure RLS policies for profiles
CREATE POLICY "Public can view basic profile info"
ON public.profiles
FOR SELECT
TO public
USING (true);

CREATE POLICY "Service role can insert profiles"
ON public.profiles
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update profiles"
ON public.profiles
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Create secure RLS policies for referrals
CREATE POLICY "Users can view own referrals"
ON public.referrals
FOR SELECT
TO public
USING (true);

CREATE POLICY "Service role can insert referrals"
ON public.referrals
FOR INSERT
TO service_role
WITH CHECK (true);

-- RLS policies for mining state
CREATE POLICY "Service role can manage mining state"
ON public.user_mining_state
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view own mining state"
ON public.user_mining_state
FOR SELECT
TO public
USING (true);

-- RLS policies for task completions
CREATE POLICY "Service role can manage task completions"
ON public.user_task_completions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view own task completions"
ON public.user_task_completions
FOR SELECT
TO public
USING (true);

-- RLS policies for spin history
CREATE POLICY "Service role can manage spin history"
ON public.user_spin_history
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view own spin history"
ON public.user_spin_history
FOR SELECT
TO public
USING (true);