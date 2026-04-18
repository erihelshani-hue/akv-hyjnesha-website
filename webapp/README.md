# AKV "Hyjnesha" — Internes Koordinationssystem

Internal PWA for the Albanian cultural dance ensemble **Ansambli Kulturor Vendor Hyjnesha**, Graz.

---

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Supabase** (Auth, Postgres, RLS, Realtime)
- **Tailwind CSS** + **shadcn/ui** (dark theme, zinc base)
- **next-intl** (i18n: German `de` + Albanian `sq`)
- **next-pwa** (PWA manifest + service worker)

---

## Local Development Setup

### 1. Prerequisites

- Node.js ≥ 20
- A Supabase project (free tier works)

### 2. Clone & Install

```bash
cd webapp
npm install
```

### 3. Environment Variables

Copy the example file:

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials from the [Supabase dashboard](https://app.supabase.com) → Project Settings → API:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Supabase Database Setup

In your Supabase dashboard → **SQL Editor**, run the full contents of:

```
supabase/schema.sql
```

This creates all tables, enables RLS, and adds all policies.

### 5. Supabase Auth Configuration

In the Supabase dashboard → **Authentication** → **URL Configuration**:

- **Site URL**: `https://app.akv-hyjnesha.com` (or `http://localhost:3000` for local)
- **Redirect URLs**: add `https://app.akv-hyjnesha.com/auth/callback` and `http://localhost:3000/auth/callback`

In **Authentication** → **Email Templates**, you can customize the magic link email.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/de` (German locale).

---

## Setting Your First Admin

After signing in for the first time via magic link, run this in the Supabase SQL editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

Admins can then invite other members and promote them.

---

## PWA Icons

The app uses icons from the AKV Hyjnesha logo. Generate the required PNG icons and place them in `webapp/public/icons/`:

| File | Size |
|------|------|
| `icon-192x192.png` | 192×192 px |
| `icon-512x512.png` | 512×512 px |
| `apple-touch-icon.png` | 180×180 px |

You can generate them at [realfavicongenerator.net](https://realfavicongenerator.net/) using the logo from `https://akv-hyjnesha.com/images/Logo/470894537_17891580084134476_2369760557983885793_n.jpg`.

---

## Vercel Deployment

### 1. Push to GitHub

```bash
git add webapp/
git commit -m "feat: add AKV Hyjnesha PWA"
git push
```

### 2. Import in Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the repository
3. Set **Root Directory** to `webapp`
4. Add all environment variables from `.env.local`
5. Set `NEXT_PUBLIC_APP_URL` to `https://app.akv-hyjnesha.com`
6. Deploy

### 3. Custom Domain (IONOS)

In IONOS DNS settings for `akv-hyjnesha.com`, add a **CNAME record**:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | `app` | `cname.vercel-dns.com` | 3600 |

Then in Vercel → Project → Settings → Domains, add `app.akv-hyjnesha.com`.

---

## Supabase Realtime (Announcement Badge)

The announcements badge updates in real-time when an admin posts. This is handled via Supabase Realtime subscription on the `announcements` table. The `ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;` statement is already in the schema.

If the schema line fails (publication already exists), run manually in Supabase SQL editor:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
```

---

## Project Structure

```
webapp/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (auth)/login/       — Magic link login
│   │   │   └── (protected)/        — Auth-guarded routes
│   │   │       ├── page.tsx        — Dashboard
│   │   │       ├── rehearsals/     — Rehearsal list, detail, new
│   │   │       ├── events/         — Event list, detail, new
│   │   │       ├── announcements/  — Announcement list, new
│   │   │       ├── members/        — Member list + invite
│   │   │       └── settings/       — Profile & language
│   │   ├── auth/callback/          — Magic link callback
│   │   ├── api/invite/             — Admin invite endpoint
│   │   └── offline/                — PWA offline page
│   ├── components/
│   │   ├── ui/                     — shadcn/ui base components
│   │   ├── Header.tsx
│   │   ├── DashboardCard.tsx
│   │   ├── RSVPBar.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── supabase/               — Client, server, middleware
│   │   ├── recurring.ts            — Recurring rehearsal logic
│   │   └── utils.ts
│   ├── i18n/                       — next-intl routing & config
│   ├── middleware.ts                — Auth + i18n middleware
│   └── types/database.ts           — TypeScript types
├── messages/
│   ├── de.json                     — German translations
│   └── sq.json                     — Albanian translations
├── supabase/
│   └── schema.sql                  — Full DB schema + RLS
└── public/
    ├── manifest.json               — PWA manifest
    └── icons/                      — PWA icons (add manually)
```

---

## i18n

The app supports **German** (`de`, default) and **Albanian** (`sq`). The language switcher in the header persists the choice to:
- `localStorage` (instant)  
- `profiles.language_preference` (synced on next load)

All database content (titles, notes, announcements) is stored bilingual in separate `_sq` columns.

---

## License

Internal use only — AKV "Hyjnesha", Graz, Austria.
