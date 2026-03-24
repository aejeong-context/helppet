-- ========================================
-- HelpPet Supabase Schema
-- ========================================

-- 0. Profiles (auth.users 연동)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nickname TEXT NOT NULL DEFAULT 'User',
  profile_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, nickname)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'nickname', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 1. Pets
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat', 'other')),
  breed TEXT NOT NULL,
  birth_date DATE NOT NULL,
  weight NUMERIC NOT NULL,
  profile_image TEXT,
  conditions TEXT[] DEFAULT '{}',
  is_senior BOOLEAN DEFAULT false,
  special_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Medications
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  time_slots TEXT[] DEFAULT '{}',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Health Records
CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('checkup', 'vaccination', 'medication', 'surgery', 'emergency')),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  hospital TEXT,
  doctor TEXT,
  cost NUMERIC,
  next_date DATE,
  attachments TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Condition Logs
CREATE TABLE condition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  appetite SMALLINT NOT NULL CHECK (appetite BETWEEN 1 AND 5),
  activity SMALLINT NOT NULL CHECK (activity BETWEEN 1 AND 5),
  pain SMALLINT NOT NULL CHECK (pain BETWEEN 1 AND 5),
  mood SMALLINT NOT NULL CHECK (mood BETWEEN 1 AND 5),
  weight NUMERIC,
  symptoms TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('joint', 'heart', 'kidney', 'tumor', 'senior-care', 'hospital-review', 'general')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[],
  tags TEXT[] DEFAULT '{}',
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Adoptions
CREATE TABLE adoptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('adoption', 'foster')),
  pet_name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat', 'other')),
  breed TEXT NOT NULL,
  age TEXT NOT NULL,
  conditions TEXT[] DEFAULT '{}',
  description TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'pending', 'completed')),
  contact_info TEXT NOT NULL,
  medical_history TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- Auto-update updated_at trigger
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON pets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON medications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON health_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON condition_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON adoptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ========================================
-- Row Level Security
-- ========================================

-- Profiles: 본인만 읽기/수정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Pets: 본인 소유만
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own pets" ON pets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own pets" ON pets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pets" ON pets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pets" ON pets FOR DELETE USING (auth.uid() = user_id);

-- Medications: pet 소유자만
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own medications" ON medications FOR SELECT USING (
  EXISTS (SELECT 1 FROM pets WHERE pets.id = medications.pet_id AND pets.user_id = auth.uid())
);
CREATE POLICY "Users can create own medications" ON medications FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_id AND pets.user_id = auth.uid())
);
CREATE POLICY "Users can update own medications" ON medications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM pets WHERE pets.id = medications.pet_id AND pets.user_id = auth.uid())
);
CREATE POLICY "Users can delete own medications" ON medications FOR DELETE USING (
  EXISTS (SELECT 1 FROM pets WHERE pets.id = medications.pet_id AND pets.user_id = auth.uid())
);

-- Health Records: pet 소유자만
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own health_records" ON health_records FOR SELECT USING (
  EXISTS (SELECT 1 FROM pets WHERE pets.id = health_records.pet_id AND pets.user_id = auth.uid())
);
CREATE POLICY "Users can create own health_records" ON health_records FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_id AND pets.user_id = auth.uid())
);
CREATE POLICY "Users can update own health_records" ON health_records FOR UPDATE USING (
  EXISTS (SELECT 1 FROM pets WHERE pets.id = health_records.pet_id AND pets.user_id = auth.uid())
);
CREATE POLICY "Users can delete own health_records" ON health_records FOR DELETE USING (
  EXISTS (SELECT 1 FROM pets WHERE pets.id = health_records.pet_id AND pets.user_id = auth.uid())
);

-- Condition Logs: pet 소유자만
ALTER TABLE condition_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own condition_logs" ON condition_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM pets WHERE pets.id = condition_logs.pet_id AND pets.user_id = auth.uid())
);
CREATE POLICY "Users can create own condition_logs" ON condition_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_id AND pets.user_id = auth.uid())
);
CREATE POLICY "Users can update own condition_logs" ON condition_logs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM pets WHERE pets.id = condition_logs.pet_id AND pets.user_id = auth.uid())
);
CREATE POLICY "Users can delete own condition_logs" ON condition_logs FOR DELETE USING (
  EXISTS (SELECT 1 FROM pets WHERE pets.id = condition_logs.pet_id AND pets.user_id = auth.uid())
);

-- Posts: 읽기는 전체 공개, 쓰기는 본인만
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Comments: 읽기는 전체 공개, 쓰기는 본인만
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Adoptions: 읽기는 전체 공개, 쓰기는 본인만
ALTER TABLE adoptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read adoptions" ON adoptions FOR SELECT USING (true);
CREATE POLICY "Users can create own adoptions" ON adoptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own adoptions" ON adoptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own adoptions" ON adoptions FOR DELETE USING (auth.uid() = user_id);
