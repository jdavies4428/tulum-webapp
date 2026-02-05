# Supabase Setup for Tulum Discovery

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Pick org, name (e.g. `tulum-discovery`), region (closest to users)
4. Set a database password (store it safely)
5. Wait for the project to be created

## 2. Run the Migration

1. Open your project in the Supabase dashboard
2. Go to **SQL Editor** → **New query**
3. Paste the contents of `migrations/001_initial_schema.sql`
4. Click **Run**

## 3. Get Your Keys

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (for backend only, never expose to client)

## 4. Configure Environment

```bash
cp .env.local.example .env.local
# Edit .env.local and add your Supabase URL and anon key
```

## Schema Overview

| Table        | Purpose                                      |
|--------------|----------------------------------------------|
| `venues`     | Beach clubs, restaurants, cultural spots     |
| `profiles`   | User profiles (extends Supabase Auth)        |
| `saved_venues` | User favorites (when auth is added)        |

## 4. Seed Venues

**Option A – SQL (recommended):** Run `supabase/seed.sql` in the SQL Editor.

**Option B – Script:** After adding your keys to `.env.local`:

```bash
npm run seed:venues
```

## Next Steps

- Add Google Places API integration to fetch more venues
- Add auth (Google sign-in) to enable saved venues
