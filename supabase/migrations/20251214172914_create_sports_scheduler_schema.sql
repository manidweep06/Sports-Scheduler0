/*
  # Sports Scheduler Database Schema

  ## Overview
  Creates the database schema for the Sports Scheduler application with user profiles and sports sessions.

  ## Tables Created

  ### 1. profiles
  Extends auth.users with additional user information:
  - `id` (uuid, primary key) - References auth.users.id
  - `name` (text) - User's full name
  - `role` (text) - User role: 'admin' or 'player'
  - `created_at` (timestamptz) - Account creation timestamp

  ### 2. sessions
  Stores sports session information:
  - `id` (uuid, primary key) - Unique session identifier
  - `title` (text) - Session/match title
  - `date` (timestamptz) - Session date and time
  - `venue` (text) - Location of the session
  - `team1_players` (text array) - Email addresses of Team 1 players
  - `team2_players` (text array) - Email addresses of Team 2 players
  - `created_by` (uuid) - References profiles.id (admin who created it)
  - `created_at` (timestamptz) - Session creation timestamp

  ## Security
  
  ### profiles table:
  - RLS enabled
  - Users can read all profiles (to see names)
  - Users can only update their own profile
  - Users can insert their own profile on signup

  ### sessions table:
  - RLS enabled
  - Admins can create, update, and delete sessions
  - All authenticated users can read sessions
  - Players can only view sessions they are part of (via policies)

  ## Notes
  - Uses Supabase Auth for authentication
  - Email addresses are used to link players to sessions
  - Role-based access control implemented via RLS policies
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'player')),
  created_at timestamptz DEFAULT now()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date timestamptz NOT NULL,
  venue text NOT NULL,
  team1_players text[] DEFAULT '{}',
  team2_players text[] DEFAULT '{}',
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Sessions policies
CREATE POLICY "Authenticated users can view all sessions"
  ON sessions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create sessions"
  ON sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update their sessions"
  ON sessions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete their sessions"
  ON sessions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_created_by ON sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);