/*
  # Email Signups Table

  1. New Tables
    - `email_signups`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `created_at` (timestamp with timezone, default now)
      - `source` (text, default 'neomoji_landing')

  2. Security
    - Enable RLS on `email_signups` table
    - Add policy for public insert access (since this is a signup form)
    - Add policy for authenticated users to read all data
*/

CREATE TABLE IF NOT EXISTS email_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  source text DEFAULT 'neomoji_landing'
);

ALTER TABLE email_signups ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert email signups (public signup form)
CREATE POLICY "Anyone can insert email signups"
  ON email_signups
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read all signups
CREATE POLICY "Authenticated users can read all signups"
  ON email_signups
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index for better performance on email lookups
CREATE INDEX IF NOT EXISTS idx_email_signups_email ON email_signups(email);
CREATE INDEX IF NOT EXISTS idx_email_signups_created_at ON email_signups(created_at DESC);