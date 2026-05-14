-- ============================================
-- Sistem Wawancara Organisasi - Database Setup
-- Jalankan SQL ini di Supabase SQL Editor
-- ============================================

-- 1. Tabel Bidang
CREATE TABLE IF NOT EXISTS bidang (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabel Pertanyaan (Global + Khusus Bidang)
CREATE TABLE IF NOT EXISTS pertanyaan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bidang_id UUID REFERENCES bidang(id) ON DELETE CASCADE,
  teks TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'bidang' CHECK (scope IN ('global', 'bidang')),
  created_by_role TEXT NOT NULL DEFAULT 'user' CHECK (created_by_role IN ('admin', 'user')),
  urutan INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabel Kandidat
CREATE TABLE IF NOT EXISTS kandidat (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bidang_id UUID NOT NULL REFERENCES bidang(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  nim TEXT NOT NULL,
  pilihan INT DEFAULT 1 CHECK (pilihan IN (1, 2)),
  status TEXT DEFAULT 'Belum Wawancara' CHECK (status IN ('Belum Wawancara', 'Sedang Diproses', 'Selesai')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabel Penilaian
CREATE TABLE IF NOT EXISTS penilaian (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kandidat_id UUID NOT NULL REFERENCES kandidat(id) ON DELETE CASCADE,
  pertanyaan_id UUID NOT NULL REFERENCES pertanyaan(id) ON DELETE CASCADE,
  skor INT DEFAULT 0 CHECK (skor >= 0 AND skor <= 5),
  catatan TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(kandidat_id, pertanyaan_id)
);

-- 5. Tabel Settings
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT DEFAULT ''
);

-- Default Settings
INSERT INTO settings (key, value) VALUES 
  ('admin_pin', '1234'),
  ('google_sheets_url', '')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- Row Level Security (RLS) 
-- ============================================
ALTER TABLE bidang ENABLE ROW LEVEL SECURITY;
ALTER TABLE pertanyaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE kandidat ENABLE ROW LEVEL SECURITY;
ALTER TABLE penilaian ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policies: Allow all for anon (public app without auth)
CREATE POLICY "Allow all for anon" ON bidang FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON pertanyaan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON kandidat FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON penilaian FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON settings FOR ALL USING (true) WITH CHECK (true);
