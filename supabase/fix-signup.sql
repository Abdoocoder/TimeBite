-- Run this in Supabase SQL Editor to fix signup issues
-- This script fixes the trigger and schema that causing the 500 error

-- 1. Ensure user_role type exists with all required roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('customer', 'restaurant', 'driver', 'admin');
    ELSE
        -- Ensure all roles are present if type already exists
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'customer';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'restaurant';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'driver';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
    END IF;
END $$;

-- 2. Ensure public.users table exists with correct schema
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS and setup Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'System can insert profiles') THEN
        CREATE POLICY "System can insert profiles" ON public.users FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- 4. Robust Trigger Function (with Error Handling to prevent 500 errors)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role;
  EXCEPTION WHEN OTHERS THEN
    -- Fallback to prevent blocking Auth signup if profile creation fails
    RETURN NEW; 
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Re-create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
