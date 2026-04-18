-- ============================================================
-- AKV Hyjnesha App — Supabase Schema
-- Run this in the Supabase SQL editor
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

-- profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     text NOT NULL,
  email         text NOT NULL,
  role          text NOT NULL DEFAULT 'member'
                  CHECK (role IN ('admin', 'member')),
  avatar_url    text,
  language_preference text DEFAULT 'de',
  created_at    timestamptz DEFAULT now()
);

-- rehearsals
CREATE TABLE IF NOT EXISTS public.rehearsals (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text NOT NULL,
  title_sq       text NOT NULL,
  date           date NOT NULL,
  time           time NOT NULL,
  location       text NOT NULL,
  notes          text,
  notes_sq       text,
  is_recurring   boolean DEFAULT false,
  recurrence_day text CHECK (recurrence_day IN ('MON','TUE','WED','THU','FRI','SAT','SUN')),
  recurrence_time time,
  created_by     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at     timestamptz DEFAULT now()
);

-- events
CREATE TABLE IF NOT EXISTS public.events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  title_sq     text NOT NULL,
  date         date NOT NULL,
  time         time NOT NULL,
  location     text NOT NULL,
  event_type   text DEFAULT 'performance'
                 CHECK (event_type IN ('performance','wedding','festival','other')),
  dress_code   text,
  meetup_time  time,
  location_url text,
  notes        text,
  notes_sq     text,
  created_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   timestamptz DEFAULT now()
);

-- attendances
CREATE TABLE IF NOT EXISTS public.attendances (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('rehearsal','event')),
  entity_id   uuid NOT NULL,
  entity_date date,
  status      text NOT NULL CHECK (status IN ('yes','no','maybe')),
  created_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, entity_type, entity_id, entity_date)
);

-- announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL,
  title_sq   text NOT NULL,
  body       text NOT NULL,
  body_sq    text NOT NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- announcement_reads
CREATE TABLE IF NOT EXISTS public.announcement_reads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  announcement_id uuid NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  read_at         timestamptz DEFAULT now(),
  UNIQUE(user_id, announcement_id)
);

-- ============================================================
-- 2. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rehearsals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;

-- Helper function: is current user admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ── profiles ──────────────────────────────────────────────────
-- Any authenticated user can read profiles
CREATE POLICY "profiles: authenticated can select"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can only update their own profile
CREATE POLICY "profiles: own update"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can update any profile (for role changes)
CREATE POLICY "profiles: admin update"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Allow insert on first login (callback creates profile)
CREATE POLICY "profiles: self insert"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- ── rehearsals ────────────────────────────────────────────────
CREATE POLICY "rehearsals: authenticated select"
  ON public.rehearsals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "rehearsals: admin insert"
  ON public.rehearsals FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "rehearsals: admin update"
  ON public.rehearsals FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "rehearsals: admin delete"
  ON public.rehearsals FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ── events ────────────────────────────────────────────────────
CREATE POLICY "events: authenticated select"
  ON public.events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "events: admin insert"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "events: admin update"
  ON public.events FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "events: admin delete"
  ON public.events FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ── attendances ───────────────────────────────────────────────
-- Members see only their own attendance; admins see all
CREATE POLICY "attendances: own select"
  ON public.attendances FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "attendances: own insert"
  ON public.attendances FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "attendances: own update"
  ON public.attendances FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "attendances: own delete"
  ON public.attendances FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ── announcements ─────────────────────────────────────────────
CREATE POLICY "announcements: authenticated select"
  ON public.announcements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "announcements: admin insert"
  ON public.announcements FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "announcements: admin update"
  ON public.announcements FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "announcements: admin delete"
  ON public.announcements FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ── announcement_reads ────────────────────────────────────────
CREATE POLICY "reads: own select"
  ON public.announcement_reads FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "reads: own insert"
  ON public.announcement_reads FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 3. REALTIME
-- ============================================================
-- Enable Realtime for announcements (run in Supabase dashboard → Database → Replication)
-- Or via SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;

-- ============================================================
-- 4. STORAGE (optional: avatars)
-- ============================================================
-- Run in Supabase dashboard → Storage → Create bucket "avatars" (public: true)
-- Then add policy: authenticated users can upload to their own folder

-- ============================================================
-- 5. HOW TO SET YOUR FIRST ADMIN
-- ============================================================
-- After you sign in for the first time, run in the SQL editor:
--
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'your-email@example.com';
--
-- ============================================================
