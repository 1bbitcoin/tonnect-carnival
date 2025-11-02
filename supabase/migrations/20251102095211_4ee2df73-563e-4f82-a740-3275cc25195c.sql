-- Add photo_url column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;