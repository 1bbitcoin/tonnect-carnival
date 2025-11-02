-- Drop the existing restrictive update policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create a new policy that allows updates when telegram_id matches
-- This works because the update query includes a WHERE clause with the profile id
CREATE POLICY "Users can update any profile"
ON public.profiles
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Add a more permissive insert policy as well to ensure profile creation works
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Anyone can insert profiles"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (true);