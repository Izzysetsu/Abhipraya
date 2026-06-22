-- ==========================================
-- 1. Membuat Tabel Memori Bot (bot_sessions)
-- ==========================================
CREATE TABLE public.bot_sessions (
  chat_id bigint PRIMARY KEY,
  step text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb
);

-- Mengaktifkan RLS agar API bisa diakses oleh Webhook Vercel
ALTER TABLE public.bot_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to bot_sessions" 
ON public.bot_sessions 
FOR ALL
USING (true)
WITH CHECK (true);

-- ==========================================
-- 2. PANDUAN MANUAL UNTUK SUPABASE STORAGE:
-- ==========================================
-- Skrip SQL tidak bisa otomatis membuat Storage Bucket karena alasan privasi dari Supabase. 
-- Anda WAJIB melakukannya secara manual di Dashboard Supabase:
-- 1. Buka menu "Storage" (ikon folder di menu sebelah kiri).
-- 2. Klik tombol hijau "New Bucket".
-- 3. Beri nama persis seperti ini: invitation_assets
-- 4. PENTING: Aktifkan (centang) opsi "Public bucket", lalu klik Save.
-- 5. Masuk ke bucket invitation_assets tersebut, lalu pilih tab "Policies".
-- 6. Di bawah "Other policies under storage.objects", klik "New Policy" -> "For full customization".
-- 7. Beri nama "Allow All", centang semua opsi (SELECT, INSERT, UPDATE, DELETE).
-- 8. Klik tombol "Review" lalu "Save policy".
