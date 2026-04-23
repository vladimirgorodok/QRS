# ContactShare - Supabase Setup Guide

This guide will help you set up the Supabase backend for the ContactShare app.

## Step 1: Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign up/login
2. Create a new project
3. Wait for the project to be initialized
4. Go to Settings → API to find:
   - **Project URL** (VITE_SUPABASE_URL)
   - **Anon Key** (VITE_SUPABASE_ANON_KEY)

## Step 2: Set Environment Variables

Add your Supabase credentials to the `.env` file:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Create Database Tables

Go to Supabase Dashboard → SQL Editor and run the following SQL:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  messenger_link TEXT DEFAULT '',
  note TEXT DEFAULT '',
  avatar_url TEXT,
  visibility_settings JSONB DEFAULT '{"phone": true, "email": true, "messenger_link": true, "note": true, "avatar": true}',
  is_active BOOLEAN DEFAULT true,
  scan_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id)
);

-- Create scans table (optional, for analytics)
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_hash TEXT
);

-- Create indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);
CREATE INDEX idx_scans_profile_id ON scans(profile_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own profiles
CREATE POLICY "Users can view own profiles"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own profiles
CREATE POLICY "Users can create own profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own profiles
CREATE POLICY "Users can update own profiles"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own profiles
CREATE POLICY "Users can delete own profiles"
  ON profiles FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policy: Public can view active profiles (for /view/[id] page)
CREATE POLICY "Public can view active profiles"
  ON profiles FOR SELECT
  USING (is_active = true);

-- RLS Policy: Anyone can insert scans (for analytics)
CREATE POLICY "Anyone can record scans"
  ON scans FOR INSERT
  WITH CHECK (true);

-- Create function to increment scan count
CREATE OR REPLACE FUNCTION increment_scan_count(profile_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET scan_count = scan_count + 1 WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Step 4: Enable Email Authentication

In Supabase Dashboard:
1. Go to Authentication → Providers
2. Enable "Email" provider (should be enabled by default)
3. Optionally configure email templates

## Step 5: Configure CORS (Optional)

If deploying to a different domain, add it to Supabase CORS settings:
1. Go to Settings → API
2. Add your domain to "API Settings → CORS"

## Step 6: Test the Setup

1. Start the dev server: `pnpm dev`
2. Navigate to `/login`
3. Sign up with an email
4. Create your first profile
5. Generate a QR code
6. Scan it or copy the public URL to test the public view

## Troubleshooting

### "Supabase credentials missing" error
- Make sure `.env` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the dev server after adding environment variables

### Authentication not working
- Check that Email provider is enabled in Supabase
- Verify the anon key is correct

### "insert or update on table profiles violates foreign key constraint"
- Make sure you're logged in with a valid Supabase auth user

### Can't see profiles in dashboard
- Check that RLS policies are created correctly
- Verify `user_id` in profiles table matches `auth.uid()`

## Production Deployment

When deploying to production:
1. Use Vercel or Netlify environment variable settings
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` there too
3. Test thoroughly before going live
