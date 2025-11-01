-- Fix security warnings by setting search_path on functions

-- Update handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Update generate_referral_code function
CREATE OR REPLACE FUNCTION public.generate_referral_code(telegram_id BIGINT)
RETURNS TEXT AS $$
BEGIN
  RETURN 'REF' || telegram_id::TEXT;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;