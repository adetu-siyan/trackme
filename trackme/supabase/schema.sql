-- ============================================================
-- TRACKME - Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- Extended user info beyond Supabase Auth
-- ============================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  role TEXT DEFAULT 'mentee' CHECK (role IN ('mentor', 'mentee')),
  bio TEXT,
  field_of_study TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MENTOR RELATIONSHIPS TABLE
-- Links mentors to mentees
-- ============================================================
CREATE TABLE mentor_relationships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mentee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'ended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mentor_id, mentee_id)
);

-- ============================================================
-- PROJECTS TABLE
-- Projects a mentor can create and assign mentees to
-- ============================================================
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROJECT ASSIGNMENTS TABLE
-- Which mentees are on which projects
-- ============================================================
CREATE TABLE project_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  mentee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, mentee_id)
);

-- ============================================================
-- DAILY LOGS TABLE
-- Core of the app — what the mentee writes + AI restructuring
-- ============================================================
CREATE TABLE daily_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Raw input from mentee
  raw_content TEXT NOT NULL,
  
  -- AI restructured output
  structured_title TEXT,
  structured_topics TEXT[], -- array of topic strings
  structured_content TEXT,  -- full professional log
  
  -- Test data
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  verification_question TEXT,
  correct_answer TEXT,
  test_passed BOOLEAN DEFAULT FALSE,
  test_attempted BOOLEAN DEFAULT FALSE,
  
  -- Mentor signing
  mentor_id UUID REFERENCES profiles(id),
  signed BOOLEAN DEFAULT FALSE,
  signed_at TIMESTAMPTZ,
  mentor_sign_token TEXT UNIQUE, -- secure token in email link
  
  -- Status
  sent_to_mentor BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  
  -- Streak tracking
  log_date DATE DEFAULT CURRENT_DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('log_signed', 'project_assigned', 'mentor_request', 'test_passed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STREAKS TABLE
-- Track consecutive day logging
-- ============================================================
CREATE TABLE streaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_log_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, only edit their own
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Logs: users see their own logs; mentors see mentee logs
CREATE POLICY "logs_select_own" ON daily_logs FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = mentor_id);
CREATE POLICY "logs_insert_own" ON daily_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "logs_update_own" ON daily_logs FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = mentor_id);

-- Notifications: users see only their own
CREATE POLICY "notifs_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifs_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Streaks: users see their own
CREATE POLICY "streaks_all" ON streaks FOR ALL USING (auth.uid() = user_id);

-- Projects: creator sees their own, assignees see theirs
CREATE POLICY "projects_select" ON projects FOR SELECT
  USING (auth.uid() = creator_id OR id IN (
    SELECT project_id FROM project_assignments WHERE mentee_id = auth.uid()
  ));
CREATE POLICY "projects_insert" ON projects FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "projects_update" ON projects FOR UPDATE USING (auth.uid() = creator_id);

-- Project assignments
CREATE POLICY "assignments_select" ON project_assignments FOR SELECT
  USING (auth.uid() = mentee_id OR auth.uid() = assigned_by);
CREATE POLICY "assignments_insert" ON project_assignments FOR INSERT
  WITH CHECK (auth.uid() = assigned_by);

-- Mentor relationships
CREATE POLICY "relationships_select" ON mentor_relationships FOR SELECT
  USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);
CREATE POLICY "relationships_insert" ON mentor_relationships FOR INSERT
  WITH CHECK (auth.uid() = mentee_id OR auth.uid() = mentor_id);
CREATE POLICY "relationships_update" ON mentor_relationships FOR UPDATE
  USING (auth.uid() = mentor_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO streaks (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER logs_updated_at BEFORE UPDATE ON daily_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
