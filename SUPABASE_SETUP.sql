-- ============================================
-- RENTER TRACKER — Run this in Supabase SQL Editor
-- ============================================

-- 1. Renters table
CREATE TABLE renters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flat_no TEXT NOT NULL,
  name TEXT NOT NULL,
  age INTEGER,
  aadhaar TEXT,
  pan TEXT,
  contact TEXT,
  security_deposit NUMERIC DEFAULT 0,
  monthly_rent NUMERIC DEFAULT 0,
  lease_start_date DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  renter_id UUID REFERENCES renters(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,         -- 1-12
  year INTEGER NOT NULL,
  amount_received NUMERIC DEFAULT 0,
  is_paid BOOLEAN DEFAULT false,
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(renter_id, month, year)
);

-- 3. Enable Row Level Security
ALTER TABLE renters ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 4. Policies — any logged-in user can do everything
CREATE POLICY "Authenticated users can do all on renters"
  ON renters FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can do all on payments"
  ON payments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER renters_updated_at
  BEFORE UPDATE ON renters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
