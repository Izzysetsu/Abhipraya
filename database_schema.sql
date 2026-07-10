-- Copy dan paste script ini ke dalam "SQL Editor" di Supabase Dashboard Anda.
-- Script ini akan otomatis membuat tabel dan mengisikan 1 data contoh.

-- 1. Membuat Tabel
CREATE TABLE public.invitations (
  id text PRIMARY KEY,
  theme_id text,
  cover_title text,
  cover_groom_bride_name text,
  cover_date_text text,
  cover_bg_image text,
  opening_quote text,
  groom_name text,
  groom_parent text,
  groom_photo text,
  bride_name text,
  bride_parent text,
  bride_photo text,
  akad_title text,
  akad_date text,
  akad_time text,
  akad_location text,
  resepsi_title text,
  resepsi_date text,
  resepsi_time text,
  resepsi_location text,
  map_url text,
  gallery_images text,
  love_story text,
  bank_accounts text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Mengaktifkan Row Level Security (RLS) agar API bisa diakses secara publik (Read Only)
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" 
ON public.invitations 
FOR SELECT 
USING (true);

-- 3. Memasukkan Data Dummy Pertama (Galih & Ratna dengan ID 123)
INSERT INTO public.invitations (
  id, theme_id, cover_title, cover_groom_bride_name, cover_date_text, cover_bg_image,
  opening_quote, groom_name, groom_parent, groom_photo, bride_name, bride_parent, bride_photo,
  akad_title, akad_date, akad_time, akad_location,
  resepsi_title, resepsi_date, resepsi_time, resepsi_location, map_url
) VALUES (
  '123', 
  'sage_earth', 
  'The Wedding Of', 
  'Galih & Ratna', 
  '15 . 08 . 2026', 
  'assets/cover_bg.png',
  '"Cinta tidak berupa tatapan satu sama lain, tetapi memandang keluar bersama ke arah yang sama."',
  'Galih Rakasiwi', 
  'Putra dari Bapak Haryo & Ibu Siti', 
  'assets/groom_avatar.png',
  'Ratna Suminar', 
  'Putri dari Bapak Budi & Ibu Wati', 
  'assets/bride_avatar.png',
  'Akad Nikah', 
  'Sabtu, 15 Agustus 2026', 
  '08:00 - 10:00 WIB', 
  'Masjid Raya Bintaro',
  'Resepsi', 
  'Sabtu, 15 Agustus 2026', 
  '11:00 - 14:00 WIB', 
  'Bintaro Jaya Xchange Mall',
  'https://maps.google.com'
);
