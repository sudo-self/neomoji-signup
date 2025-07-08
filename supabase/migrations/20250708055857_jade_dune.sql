/*
  # Email Signups Table Setup

  1. New Tables
    - `email_signups`
      - `id` (uuid, primary key) - Unique identifier for each signup
      - `email` (text, unique, not null) - User's email address
      - `created_at` (timestamptz) - Timestamp when signup was created
      - `source` (text) - Source of the signup (defaults to 'neomoji_landing')

  2. Security
    - Enable RLS on `email_signups` table
    - Add policy for anonymous users to insert signups (public form access)
    - Add policy for authenticated users to read all signups (admin access)

  3. Performance
    - Add index on email column for fast lookups
    - Add index on created_at column for chronological queries

  This migration sets up the complete email signup system for the NeoMoji landing page,
  allowing public users to sign up while maintaining proper security controls.
*/

-- Create the email_signups table
CREATE TABLE IF NOT EXISTS email_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  source text DEFAULT 'neomoji_landing'
);

-- Enable Row Level Security
ALTER TABLE email_signups ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to insert email signups (for public signup form)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'email_signups' 
    AND policyname = 'Anyone can insert email signups'
  ) THEN
    CREATE POLICY "Anyone can insert email signups"
      ON email_signups
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- Policy: Allow authenticated users to read all signups (for admin dashboard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'email_signups' 
    AND policyname = 'Authenticated users can read all signups'
  ) THEN
    CREATE POLICY "Authenticated users can read all signups"
      ON email_signups
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_email_signups_email ON email_signups(email);
CREATE INDEX IF NOT EXISTS idx_email_signups_created_at ON email_signups(created_at DESC);