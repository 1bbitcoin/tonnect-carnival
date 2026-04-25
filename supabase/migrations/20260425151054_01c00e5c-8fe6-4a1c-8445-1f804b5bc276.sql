CREATE OR REPLACE FUNCTION public.get_total_claimed()
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(total_balance), 0)::numeric FROM public.profiles;
$$;

GRANT EXECUTE ON FUNCTION public.get_total_claimed() TO anon, authenticated, service_role;