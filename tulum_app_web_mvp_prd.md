# Tulum Discovery - Web MVP Product Requirements Document

**Version:** 1.0 - Web First  
**Date:** February 3, 2026  
**Development Tool:** Cursor AI + Next.js  
**Timeline:** 8-10 weeks to launch  
**Status:** Ready for Development

---

## Executive Summary

Build a Progressive Web App (PWA) to validate the Tulum Discovery concept before investing in native mobile apps. Leverage existing web situation monitor code and Cursor AI to rapidly develop core features. Launch with minimal viable feature set, iterate based on user feedback, only build native apps if demand justifies it.

**Core Value:** Real-time Tulum intel + AI trip planning + social coordination, accessible from any device.

---

## Why Web First?

### Strategic Advantages
✅ **Speed:** 8 weeks to launch vs 6 months for native  
✅ **Cost:** ~$50/month vs $10K+ development  
✅ **Existing foundation:** Your GitHub Pages site is already 10% complete  
✅ **Cursor AI:** Can generate 70% of boilerplate code  
✅ **No app store:** Deploy instantly, iterate daily  
✅ **Cross-platform:** Works on iOS, Android, desktop immediately  
✅ **PWA:** Install like an app, works offline, push notifications (Android)

### What We're NOT Building (Yet)
❌ Native iOS/Android apps (save for Phase 2 if validated)  
❌ Live translation feature (complex, limited web support)  
❌ Advanced offline maps (basic caching is fine)  
❌ Gamification (nice-to-have, not MVP critical)  
❌ Complex photo features (basic camera/upload is enough)

---

## Tech Stack (Cursor-Friendly)

### Frontend
```javascript
Framework: Next.js 14 (App Router)
  - Why: Cursor excels at Next.js
  - Server components for performance
  - Built-in API routes (no separate backend needed)

Styling: Tailwind CSS + shadcn/ui
  - Why: Cursor knows these intimately
  - Copy/paste component examples
  - Rapid UI development

State: Zustand (lightweight) or React Context
  - Why: Simpler than Redux, Cursor generates clean code

Maps: Mapbox GL JS
  - Why: Great web support, free tier
  - Better than Google Maps for custom layers
```

### Backend & Database
```javascript
Database: Supabase (PostgreSQL + Auth + Storage)
  - Why: Free tier is generous
  - Built-in auth (Google, email)
  - Real-time subscriptions out of the box
  - Cursor has Supabase templates

Alternative: Firebase
  - Also works great with Cursor
  - Choose based on preference

API Integration:
  - Next.js API routes (/app/api/*)
  - Cursor generates clean API handlers
```

### External Services
```
Google Places API - Venue data ($200/month free)
Claude API (Anthropic) - AI itinerary
Open-Meteo API - Weather (free)
Sargassum data - Scrape/API (free)
Stripe - Payments (free + 2.9% + $0.30)
Socket.io - Real-time messaging
Vercel - Hosting (free tier)
```

---

## MVP Feature Set (8-Week Build)

### Week 1-2: Foundation & Migration
**Goal:** Port existing site to Next.js, set up infrastructure

#### Features
1. **Home Page with Live Map**
   - Current weather widget (already have this)
   - Sargassum indicator (already have this)
   - Interactive Mapbox map
   - Venue markers (from Google Places)
   - Basic filtering (restaurants, beaches, activities)

2. **Project Setup**
   - Next.js 14 with App Router
   - Supabase project initialization
   - Vercel deployment pipeline
   - Environment variables setup

#### Cursor Prompts for Week 1-2
```
"Create a Next.js 14 app with Tailwind CSS and shadcn/ui. 
Include a Mapbox GL map component that displays markers for 
restaurants and beaches in Tulum (lat: 20.2114, lng: -87.4654)"

"Create a weather widget component that fetches from Open-Meteo API 
for Tulum and displays current temp, conditions, wind, and humidity"

"Set up Supabase client in Next.js with environment variables 
and create a venues table with columns: id, name, place_id, 
location (point), category, rating, photos"
```

---

### Week 3-4: Venue Discovery & Details
**Goal:** Rich venue browsing experience

#### Features
3. **Venue List & Search**
   - Grid/list view toggle
   - Search by name or category
   - Filters: category, price level, rating
   - Sort: rating, distance, popular
   - Infinite scroll pagination

4. **Venue Detail Pages**
   - Photo gallery (from Google Places)
   - Name, description, rating, reviews
   - Hours, phone, website
   - Location on map
   - WhatsApp reservation button
   - "Save" to favorites
   - Share button (link, SMS, email)

5. **Google Places Integration**
   - Backend API route to proxy Google Places
   - Grid-based nearby search (6 points covering Tulum)
   - Lazy load full details on venue view
   - Cache in Supabase for 7 days

#### Database Schema
```sql
-- Supabase tables
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50),
  location GEOGRAPHY(POINT),
  rating DECIMAL(2,1),
  price_level VARCHAR(10),
  formatted_address TEXT,
  phone VARCHAR(50),
  website TEXT,
  google_data JSONB,  -- Store full Google response
  last_synced_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_venues_location ON venues USING GIST(location);
CREATE INDEX idx_venues_category ON venues(category);
```

#### Cursor Prompts for Week 3-4
```
"Create a VenueCard component with an image, name, category badge, 
rating stars, and price level indicator. Use shadcn/ui Card component. 
Make it responsive."

"Create a venue detail page at /venues/[id] that fetches venue data 
from Supabase, displays a photo carousel, info section, map, and a 
WhatsApp button that opens wa.me with pre-filled reservation message"

"Create an API route at /api/places/nearby that calls Google Places 
Nearby Search, filters for Tulum area, and stores results in Supabase"

"Add search functionality to venue list with debounced input that 
filters by name and category in real-time"
```

---

### Week 5-6: AI Itinerary & User Accounts
**Goal:** Personalization and core differentiator

#### Features
6. **User Authentication**
   - Sign up / Sign in with Google
   - Email/password option
   - User profile page
   - Saved venues list
   - Created itineraries list

7. **AI Itinerary Planner**
   - Conversational form: dates, interests, budget
   - Claude API integration for generation
   - Display day-by-day plan with venue cards
   - Save itinerary to account
   - Export as PDF or share link
   - Edit/regenerate options

8. **User Dashboard**
   - Saved venues grid
   - My itineraries
   - Account settings
   - Notification preferences

#### Database Schema
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE saved_venues (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  saved_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, venue_id)
);

CREATE TABLE itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  days INTEGER,
  content JSONB,  -- Store AI-generated plan
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Cursor Prompts for Week 5-6
```
"Set up Supabase Auth with Google OAuth provider. Create a login 
page with Google Sign In button and email/password form. Redirect 
to dashboard after login."

"Create an itinerary planner page with a multi-step form: 
1) Trip dates, 2) Interests (checkboxes), 3) Budget level. 
Submit to /api/itinerary/generate which calls Claude API"

"Create an API route that takes user preferences and generates an 
itinerary using Claude API. System prompt should include Tulum venue 
data from Supabase. Return structured day-by-day JSON."

"Create an itinerary display component that shows days as tabs, 
with venue cards for each activity, time suggestions, and travel tips. 
Include Save and Share buttons."
```

---

### Week 7: Events & Social Features
**Goal:** Enable coordination and business content

#### Features
9. **Event Calendar**
   - Browse upcoming events (list + calendar view)
   - Filter by category (parties, wellness, food, culture)
   - Event detail pages
   - RSVP / Save event
   - WhatsApp link to venue for questions

10. **Basic Messaging**
   - Friend connections (search by email/username)
   - 1-on-1 chat
   - Send venue links in messages (rich preview card)
   - Send event invites
   - Real-time with Socket.io or Supabase Realtime

11. **Share Functionality**
   - Share venue → generates public link
   - Share itinerary → read-only view
   - Share event → RSVP page

#### Database Schema
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  venue_id UUID REFERENCES venues(id),
  start_datetime TIMESTAMP NOT NULL,
  end_datetime TIMESTAMP,
  category VARCHAR(50),
  cover_photo_url TEXT,
  price_level VARCHAR(20),
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) DEFAULT 'direct',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT,
  message_type VARCHAR(20) DEFAULT 'text',
  metadata JSONB,  -- For venue/event shares
  sent_at TIMESTAMP DEFAULT NOW()
);
```

#### Cursor Prompts for Week 7
```
"Create an events page with calendar view (react-big-calendar) and 
list view toggle. Fetch events from Supabase, filter by category, 
and display event cards with cover image and RSVP button"

"Create a messaging interface with conversation list (left sidebar) 
and chat window (right). Use Supabase Realtime to listen for new 
messages. Display venue shares as rich cards with image and Open button"

"Create a share modal that generates a public URL for venues and 
itineraries. Copy to clipboard button. Also add email and SMS share options"
```

---

### Week 8: Business Portal & Polish
**Goal:** Revenue stream and launch readiness

#### Features
12. **Business Account Portal** (Separate route: `/business`)
   - Business signup form
   - Claim venue (search + verification)
   - Publish events form
   - Basic analytics dashboard (views, clicks)
   - Subscription plans page
   - Stripe payment integration

13. **PWA Configuration**
   - Service worker for offline caching
   - manifest.json for "Add to Home Screen"
   - Offline fallback pages
   - Cache venue data and images
   - Push notification setup (for Android)

14. **Polish & Performance**
   - Image optimization (next/image)
   - Lazy loading
   - Skeleton loaders
   - Error boundaries
   - SEO meta tags
   - Analytics (Vercel Analytics or Plausible)
   - Sitemap.xml

#### Database Schema
```sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  subscription_status VARCHAR(20) DEFAULT 'trial',
  stripe_customer_id VARCHAR(255),
  claimed_venue_ids UUID[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE business_users (
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'admin',
  PRIMARY KEY (business_id, user_id)
);
```

#### Cursor Prompts for Week 8
```
"Create a business dashboard at /business with sidebar navigation. 
Include overview stats (venue views, event RSVPs), publish event form, 
and subscription management page with Stripe Checkout integration"

"Configure next-pwa plugin to create a Progressive Web App. Add 
manifest.json with Tulum branding, service worker for caching 
venue images and data, and offline fallback page"

"Optimize all images with next/image. Add loading skeletons to venue 
cards and detail pages. Implement error boundaries and add SEO meta 
tags to all pages. Set up Vercel Analytics."
```

---

## File Structure (for Cursor context)

```
tulum-web/
├── app/
│   ├── (main)/
│   │   ├── page.tsx                    # Home (map + weather)
│   │   ├── venues/
│   │   │   ├── page.tsx                # Venue browse/search
│   │   │   └── [id]/page.tsx           # Venue detail
│   │   ├── events/
│   │   │   ├── page.tsx                # Event calendar
│   │   │   └── [id]/page.tsx           # Event detail
│   │   ├── itinerary/
│   │   │   ├── page.tsx                # AI planner form
│   │   │   └── [id]/page.tsx           # View itinerary
│   │   ├── messages/page.tsx           # Messaging
│   │   └── profile/page.tsx            # User dashboard
│   ├── business/
│   │   ├── layout.tsx                  # Business portal layout
│   │   ├── page.tsx                    # Dashboard
│   │   ├── events/page.tsx             # Publish events
│   │   ├── venues/page.tsx             # Claim venues
│   │   └── subscription/page.tsx       # Billing
│   ├── api/
│   │   ├── places/
│   │   │   ├── nearby/route.ts         # Google Places proxy
│   │   │   └── details/route.ts        # Place details
│   │   ├── itinerary/
│   │   │   └── generate/route.ts       # Claude API integration
│   │   ├── events/route.ts             # CRUD events
│   │   └── messages/route.ts           # Send/receive messages
│   ├── layout.tsx                      # Root layout
│   └── globals.css                     # Global styles
├── components/
│   ├── ui/                             # shadcn/ui components
│   ├── Map.tsx                         # Mapbox component
│   ├── VenueCard.tsx                   # Reusable venue card
│   ├── EventCard.tsx                   # Event card
│   ├── WeatherWidget.tsx               # Weather display
│   ├── SargassumIndicator.tsx          # Sargassum status
│   ├── ChatInterface.tsx               # Messaging UI
│   └── ItineraryDisplay.tsx            # AI plan display
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Supabase client
│   │   └── server.ts                   # Server-side client
│   ├── google-places.ts                # Google API wrapper
│   ├── claude.ts                       # Claude API wrapper
│   └── utils.ts                        # Helper functions
├── public/
│   ├── manifest.json                   # PWA manifest
│   └── icons/                          # App icons
├── .env.local                          # Environment variables
├── next.config.js                      # Next.js config + PWA
├── tailwind.config.ts                  # Tailwind config
└── package.json
```

---

## Environment Variables Setup

```bash
# .env.local (for Cursor to reference)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Google Maps & Places
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoi...
GOOGLE_MAPS_API_KEY=AIzaSy...

# AI
ANTHROPIC_API_KEY=sk-ant-api...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# URLs
NEXT_PUBLIC_APP_URL=https://tulum-discovery.vercel.app
```

---

## Development Workflow with Cursor

### Week 1: Getting Started

**Day 1: Project Setup**
```bash
# In terminal
npx create-next-app@latest tulum-web --typescript --tailwind --app
cd tulum-web
npm install @supabase/supabase-js mapbox-gl @anthropic-ai/sdk stripe
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input dialog select

# Open in Cursor
cursor .
```

**Day 1-2: Cursor Workflow**
1. Create `.cursorrules` file with project context:
```
This is a Next.js 14 Progressive Web App for Tulum tourism.
Tech stack: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Mapbox.
Use App Router, Server Components where possible.
Follow Next.js best practices for performance.
All API calls should go through /app/api routes (never expose keys in client).
```

2. Use Cursor Chat to generate components:
```
Cmd+K: "Create a responsive navbar with logo, search bar, and user menu"
Cmd+K: "Create a Mapbox map component that displays markers for venues"
Cmd+K: "Create API route to fetch venues from Supabase with pagination"
```

3. Use Cursor Composer for multi-file changes:
```
Cmd+Shift+I: "Set up Supabase client configuration for both client 
and server components. Create auth context provider. Add login page."
```

**Day 3-7: Build Core Pages**
- Use existing GitHub Pages code as reference
- Let Cursor convert vanilla JS to Next.js components
- Ask Cursor to create API routes for each external service
- Test locally with `npm run dev`

---

### Week-by-Week Cursor Strategies

**Week 2: Venue System**
- Ask Cursor to generate the entire venues table schema
- Have Cursor create CRUD operations as API routes
- Generate venue components from design inspiration (show Cursor screenshots)
- Use Cursor to integrate Google Places API with caching

**Week 3-4: UI Components**
- Use shadcn/ui heavily (Cursor knows every component)
- Ask for variants: "Make this card more Tulum-themed with beach colors"
- Generate loading states, error states, empty states automatically
- Create responsive layouts with Cursor's help

**Week 5-6: AI Integration**
- Cursor can write Claude API integration easily
- Provide example venue data, let Cursor create the prompt
- Ask Cursor to handle streaming responses for real-time itinerary generation
- Generate PDF export with Cursor's library recommendations

**Week 7: Real-time Features**
- Cursor knows Supabase Realtime well
- Ask for messaging implementation with Supabase
- Generate notification system
- Create rich message cards for venue/event sharing

**Week 8: Business Portal**
- Cursor can scaffold entire admin panel
- Ask for Stripe integration with Checkout
- Generate analytics dashboards with charts
- Create forms with validation using react-hook-form

---

## Cursor Power Tips

### 1. Context Files
Create `.cursorrules` and `CONTEXT.md` at project root:

```markdown
# CONTEXT.md
## Project Overview
Tulum Discovery is a web app for tourists visiting Tulum, Mexico.

## Key Features
- Real-time weather and sargassum monitoring
- Venue discovery powered by Google Places API
- AI itinerary planning using Claude
- Social messaging for group coordination
- Business portal for event publishing

## Tech Decisions
- Use Server Components for data fetching
- Client Components only for interactivity
- Supabase for database and auth
- Mapbox over Google Maps (better web performance)
- Socket.io for real-time if Supabase Realtime insufficient

## Design System
- Colors: Tulum teal (#00B4A8), sand (#F5E6D3), coral (#FF6B6B)
- Font: Inter for UI, Playfair Display for headings
- Mobile-first responsive design
- Consistent 8px spacing grid
```

### 2. Effective Prompts

**Bad Prompt:**
"Make a venue page"

**Good Prompt:**
"Create a venue detail page at /venues/[id] that:
- Fetches venue from Supabase using the place_id
- Displays a photo carousel using embla-carousel
- Shows name, rating, category, address, phone
- Has a WhatsApp reservation button that opens wa.me with pre-filled text
- Displays Google Maps embed of location
- Shows 'Save' and 'Share' buttons
- Use shadcn/ui components and Tailwind
- Make it responsive for mobile and desktop"

### 3. Multi-File Edits
Use Composer (Cmd+Shift+I) for:
- Database schema + API routes + components together
- Feature additions that touch multiple files
- Refactoring that affects many components

### 4. Learning from Examples
```
"Look at app/venues/page.tsx and create a similar page for events 
at app/events/page.tsx. Use the same layout pattern but fetch from 
events table instead."
```

### 5. Debugging with Cursor
```
"This map component isn't rendering. Check for missing dependencies, 
incorrect prop types, and make sure Mapbox token is loaded correctly."
```

---

## Week 1-2 Detailed Playbook

### Day 1: Project Foundation

**Morning (3 hours)**
```bash
# Terminal commands
npx create-next-app@latest tulum-web --typescript --tailwind --app
cd tulum-web
npm install @supabase/supabase-js@latest mapbox-gl @types/mapbox-gl
npm install date-fns axios
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input badge avatar
code .
```

**Cursor Prompt:**
```
Create a basic Next.js 14 app structure with:
1. Root layout with navbar (logo, search, login button)
2. Home page with hero section and map placeholder
3. Set up Tailwind with custom colors: teal (#00B4A8), sand (#F5E6D3)
4. Add Inter font from Google Fonts
```

**Afternoon (3 hours)**
- Set up Supabase project at supabase.com
- Create `.env.local` with Supabase credentials
- Create `lib/supabase/client.ts` and `lib/supabase/server.ts`

**Cursor Prompt:**
```
Set up Supabase client for Next.js 14:
- Create client-side client in lib/supabase/client.ts
- Create server-side client in lib/supabase/server.ts using cookies
- Add TypeScript types for database tables
```

### Day 2: Map Implementation

**Morning**
- Copy your existing map code from GitHub Pages
- Convert to Next.js component

**Cursor Prompt:**
```
Create a Mapbox GL map component at components/Map.tsx that:
- Takes center coordinates and zoom as props
- Displays venue markers from a markers array prop
- Uses Mapbox GL JS (not React wrapper)
- Has proper TypeScript types
- Shows a popup on marker click
- Is responsive and fills its container
```

**Afternoon**
- Create weather widget
- Copy sargassum indicator logic

**Cursor Prompt:**
```
Create a WeatherWidget component that:
- Fetches from Open-Meteo API for Tulum (20.2114, -87.4654)
- Displays: current temp, conditions icon, wind, humidity
- Updates every 10 minutes
- Shows loading state
- Handles errors gracefully
- Uses shadcn/ui Card component
```

### Day 3: Database Setup

**Supabase SQL Editor:**
```sql
-- Run this in Supabase SQL Editor
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50),
  location GEOGRAPHY(POINT),
  rating DECIMAL(2,1),
  price_level VARCHAR(10),
  formatted_address TEXT,
  phone VARCHAR(50),
  website TEXT,
  google_data JSONB,
  last_synced_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_venues_location ON venues USING GIST(location);
CREATE INDEX idx_venues_category ON venues(category);
CREATE INDEX idx_venues_place_id ON venues(place_id);

-- Enable Row Level Security
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Venues are viewable by everyone"
  ON venues FOR SELECT
  USING (true);
```

**Cursor Prompt:**
```
Create TypeScript types for our Supabase database in lib/types/database.ts.
Include Venue type with all fields from the venues table.
Export a Database type that matches our Supabase schema.
```

### Day 4: Google Places Integration

**Cursor Prompt:**
```
Create an API route at app/api/places/nearby/route.ts that:
1. Takes lat, lng, radius, types as query params
2. Calls Google Places Nearby Search API
3. Transforms results to our venue schema
4. Upserts into Supabase venues table (if place_id doesn't exist)
5. Returns the venues as JSON
6. Handles errors and rate limits
7. Never exposes the Google API key to client
```

Then:
```
Create a function lib/google-places.ts with methods:
- searchNearby(lat, lng, radius, types)
- getPlaceDetails(placeId)
- fetchAndStoreVenues(grid of coordinates)

Use these in the API route.
```

### Day 5: Venue List Page

**Cursor Prompt:**
```
Create a venue browse page at app/venues/page.tsx with:
- Grid of VenueCard components (4 cols desktop, 2 tablet, 1 mobile)
- Category filter buttons (All, Restaurants, Beaches, Activities)
- Search input with debouncing
- Sort dropdown (Rating, Distance, Popular)
- Infinite scroll pagination (load 20 at a time)
- Loading skeletons while fetching
- Fetch from Supabase venues table
- Use Server Components for initial data, Client for interactions
```

### Day 6-7: Venue Detail Page

**Cursor Prompt:**
```
Create a venue detail page at app/venues/[id]/page.tsx that:
- Fetches venue from Supabase by ID
- Shows photo carousel (if multiple photos)
- Displays: name, category badge, rating stars, price level
- Shows description, hours, phone, website
- Has WhatsApp button: wa.me/{phone}?text=I'd like to make a reservation
- Embeds Google Maps showing location
- Shows "Save" heart button (requires auth)
- Has Share button (copy link, SMS, email)
- Displays related venues at bottom
- Use Server Component for data, Client for interactivity
```

**End of Week 1-2 Deliverable:**
- Working Next.js app deployed to Vercel
- Map showing Tulum with venue markers
- Venue browsing with search and filters
- Venue detail pages with WhatsApp integration
- ~20-50 venues populated from Google Places

---

## Deployment Checklist

### Vercel Setup (Free Tier)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Then deploy production
vercel --prod
```

**What you get free:**
- Unlimited deployments
- Auto-preview for each git push
- SSL certificate
- CDN globally
- 100GB bandwidth/month
- Custom domain support

### Custom Domain (Optional - $12/year)
1. Buy domain: `tulum-discovery.com` (Namecheap, Google Domains)
2. Add to Vercel project settings
3. Update DNS records (Vercel provides instructions)
4. SSL auto-configured

---

## Testing Strategy

### Week 1-2: Internal Testing
- You test all features daily
- Deploy to Vercel preview URLs
- Share with 2-3 friends for feedback

### Week 3-6: Alpha Testing
- Share with 10-20 Tulum expats/digital nomads
- Create Google Form for feedback
- Track usage with Vercel Analytics
- Weekly iteration based on feedback

### Week 7-8: Beta Launch
- Post in Tulum Facebook groups
- Reach out to 3-5 venues for partnerships
- Promote in Tulum coworking spaces
- Get first 100 users
- Monitor errors with Sentry (free tier)

### Success Criteria for Full Launch
- 100+ weekly active users
- <2s average page load
- <5% error rate
- Positive feedback (>4/5 average)
- 10+ saved venues per active user

---

## Launch Checklist (Week 8)

### Technical
- [ ] All pages load in <2 seconds
- [ ] Mobile responsive on iOS and Android
- [ ] PWA manifest configured
- [ ] Service worker caching venue data
- [ ] Error tracking with Sentry
- [ ] Analytics configured
- [ ] SEO meta tags on all pages
- [ ] Sitemap.xml generated
- [ ] robots.txt configured
- [ ] SSL certificate active
- [ ] Environment variables secured

### Content
- [ ] 100+ venues populated
- [ ] 20+ events listed
- [ ] All images optimized
- [ ] About page with story
- [ ] FAQ page
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Contact form

### Marketing
- [ ] Instagram account created
- [ ] Facebook page created
- [ ] Launch post written
- [ ] 5 partner venues secured
- [ ] Press release to Tulum blogs
- [ ] Promotional flyers designed
- [ ] QR codes for physical distribution

### Business
- [ ] Stripe account activated
- [ ] Pricing page for businesses
- [ ] Business onboarding flow tested
- [ ] First business customer signed
- [ ] Support email configured
- [ ] Feedback system live

---

## Post-Launch Roadmap

### Month 1: Stabilize & Learn
- Fix critical bugs
- Respond to user feedback
- Add most-requested features
- Optimize performance
- Track: DAU, session length, top venues

### Month 2: Growth
- Content marketing (blog posts)
- Influencer partnerships
- Referral program
- Email collection & newsletter
- Track: Week-over-week growth, retention

### Month 3: Monetization
- Launch business subscriptions
- Get 5 paying business customers
- Test pricing and features
- Track: MRR, churn rate

### Months 4-6: Native Apps Decision Point
**Build native IF:**
- 5,000+ weekly active users
- 25%+ week-over-week growth
- 20+ business subscriptions
- $2K+ MRR
- Users requesting mobile app features

**Stay web-only IF:**
- Growth is steady but modest
- PWA is working well
- Resources are limited
- Can focus on other Tulum locations

---

## Cost Breakdown (Monthly)

### Development Phase (Weeks 1-8)
```
Vercel: $0 (free tier)
Supabase: $0 (free tier, 500MB DB)
Google Places API: $0-50 (within free tier initially)
Claude API: $20-50 (AI itinerary generation)
Domain: $1/month (if purchased yearly)
Tools: $0 (Cursor free tier or existing license)

Total: $20-100/month
```

### Post-Launch (1,000 users)
```
Vercel: $0-20 (likely still free)
Supabase: $0-25 (may need Pro at $25/mo)
Google Places API: $50-150
Claude API: $50-100
Stripe: 2.9% of revenue
Domain: $1/month
Monitoring (Sentry): $0 (free tier)

Total: ~$100-300/month
```

### Scale (5,000 users)
```
Vercel: $20 (Pro tier)
Supabase: $25 (Pro tier)
Google Places API: $300-500
Claude API: $200-300
Stripe: 2.9% of revenue
CDN/Images: $20-50
Monitoring: $0-25

Total: ~$565-920/month
Revenue needed to break even: $1,000 MRR
(5 business subs at $80/mo = $400, or 200 premium users at $5/mo = $1,000)
```

---

## Success Metrics Dashboard

Track these in Vercel Analytics + Supabase:

```javascript
// Key metrics to monitor
const metrics = {
  // Acquisition
  weekly_signups: 0,
  traffic_sources: {},
  
  // Activation
  percent_who_save_venue: 0,
  percent_who_create_itinerary: 0,
  
  // Engagement
  daily_active_users: 0,
  avg_session_duration: 0,
  venues_viewed_per_session: 0,
  
  // Retention
  day_1_retention: 0,
  day_7_retention: 0,
  day_30_retention: 0,
  
  // Revenue
  business_signups: 0,
  monthly_recurring_revenue: 0,
  average_revenue_per_user: 0,
  
  // Product
  most_viewed_venues: [],
  most_created_itineraries: [],
  popular_search_terms: []
};
```

---

## Cursor AI Tips for Success

### 1. Start Every Session with Context
When opening Cursor each day:
```
Cmd+L (Chat): "I'm working on the venue detail page today. 
Show me the current implementation and suggest improvements 
for SEO and performance."
```

### 2. Use Inline Prompts for Quick Edits
```
Cmd+K on a function: "Add error handling and TypeScript types"
Cmd+K on a component: "Make this responsive for mobile"
Cmd+K on CSS: "Use Tailwind classes instead of custom CSS"
```

### 3. Composer for Complex Features
```
Cmd+Shift+I: "Add user authentication to the app:
- Create login/signup pages
- Add Supabase Auth
- Protect venue saving and itinerary creation
- Add user profile page
- Update navbar with user menu"
```

### 4. Reference Existing Patterns
```
"Create a new EventCard component similar to VenueCard but 
optimized for events (show date/time instead of rating)"
```

### 5. Ask for Alternatives
```
"I want to add real-time messaging. What are my options 
with Supabase? Pros and cons of each approach?"
```

---

## Getting Started TODAY

### Immediate Next Steps (This Week):

**Day 1 (Today):**
1. Create Supabase account
2. Create Vercel account
3. Get Google Maps API key
4. Get Anthropic Claude API key
5. Initialize Next.js project (30 min)

**Day 2:**
6. Port your existing map to Next.js (2 hours)
7. Deploy to Vercel (30 min)
8. You now have a live URL to share!

**Day 3:**
9. Set up Supabase database
10. Create venues table
11. Write Google Places integration

**Day 4-7:**
12. Build venue browsing and details
13. Populate 50 venues
14. You have a functional MVP!

**Week 2:**
15. Add AI itinerary planner
16. Add user accounts
17. Soft launch to friends

---

## Final Recommendations

### DO:
✅ Start with web, iterate fast  
✅ Use Cursor aggressively (it's amazing at Next.js)  
✅ Deploy early, deploy often (Vercel makes this trivial)  
✅ Get real users by Week 3  
✅ Focus on core value: venues + AI planning + coordination  
✅ Keep it simple: cut features ruthlessly  

### DON'T:
❌ Build native apps first (waste of time)  
❌ Over-engineer (you need users, not perfect code)  
❌ Build all features before launch (ship Week 3-4)  
❌ Ignore feedback (users will tell you what to build)  
❌ Optimize prematurely (get to 100 users first)  

### REMEMBER:
> "The best way to validate an idea is to ship something people can use."

Your GitHub Pages site proves the concept works. Now make it better with AI and social features, ship it in 8 weeks, and let users tell you if it's worth building native apps.

---

**You've got this! Cursor + Next.js + your existing code = launch in 8 weeks.**

Ready to start? Open Cursor and let's build. 🚀
