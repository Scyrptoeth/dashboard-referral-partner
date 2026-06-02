-- Enum for User Roles
CREATE TYPE user_role AS ENUM ('developer', 'partner');

-- Enum for Referral Status
CREATE TYPE referral_status AS ENUM ('pending', 'confirmed');

-- Enum for Payment Status
CREATE TYPE payment_status AS ENUM ('pending', 'paid');

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. PROFILES Table (Extends Auth.Users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    whatsapp TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'partner',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 2. REFERRALS Table
CREATE TABLE referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    pendaftar_name TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    status referral_status NOT NULL DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_referrals_updated_at
BEFORE UPDATE ON referrals
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 3. PAYMENTS Table
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    paid_at TIMESTAMPTZ,
    status payment_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 4. REWARD_CONFIGS Table
CREATE TABLE reward_configs (
    rank INT PRIMARY KEY,
    percentage DECIMAL(5, 2) NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FEEDBACK Table (Anonymous)
CREATE TABLE feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Profiles: 
CREATE POLICY "Profiles are viewable by everyone authenticated" 
ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Profiles can be updated by developers" 
ON profiles FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'developer')
);

CREATE POLICY "Profiles can be inserted by developers" 
ON profiles FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'developer')
);

-- Referrals:
CREATE POLICY "Referrals: Developer full access"
ON referrals FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'developer')
);

CREATE POLICY "Referrals: Partner view own"
ON referrals FOR SELECT TO authenticated USING (
    partner_id = auth.uid()
);

-- Payments:
CREATE POLICY "Payments: Developer full access"
ON payments FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'developer')
);

CREATE POLICY "Payments: Partner view own"
ON payments FOR SELECT TO authenticated USING (
    partner_id = auth.uid()
);

-- Reward Configs:
CREATE POLICY "Reward Configs: Authenticated view"
ON reward_configs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Reward Configs: Developer update"
ON reward_configs FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'developer')
);

-- Feedback:
CREATE POLICY "Feedback: Authenticated insert"
ON feedback FOR INSERT TO authenticated WITH CHECK (true);
-- Feedback: Developer view
CREATE POLICY "Feedback: Developer view" 
ON feedback FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'developer')
);

-- RPC: Atomic Settlement
CREATE OR REPLACE FUNCTION settle_partner_payments(
  p_partner_id UUID,
  p_referral_ids UUID[],
  p_total_amount DECIMAL(12, 2)
) RETURNS UUID AS $$
DECLARE
  v_payment_id UUID;
BEGIN
  -- 1. Insert into payments
  INSERT INTO payments (partner_id, amount, status, paid_at)
  VALUES (p_partner_id, p_total_amount, 'paid', NOW())
  RETURNING id INTO v_payment_id;

  -- 2. Update referrals
  UPDATE referrals
  SET status = 'settled',
      payment_id = v_payment_id
  WHERE id = ANY(p_referral_ids)
    AND partner_id = p_partner_id;

  RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed Reward Config
INSERT INTO reward_configs (rank, percentage, description) VALUES
(1, 50.00, 'Reward Peringkat 1'),
(2, 40.00, 'Reward Peringkat 2'),
(3, 30.00, 'Reward Peringkat 3'),
(4, 20.00, 'Reward Peringkat 4'),
(5, 20.00, 'Reward Peringkat 5')
ON CONFLICT (rank) DO UPDATE SET percentage = EXCLUDED.percentage;
