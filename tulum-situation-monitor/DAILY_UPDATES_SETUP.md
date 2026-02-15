# Daily Beach Updates - SMS Feature Setup

This feature allows users to subscribe to daily SMS/MMS updates with:
- 📸 Webcam photos from Casa Malca and Akumal
- 🌤️ Weather forecast
- 🌊 Sargassum conditions
- 🌊 Tide information

## Setup Steps

### 1. Run Database Migration

Execute the migration in Supabase SQL Editor:

```bash
# The migration file is located at:
# supabase/migrations/011_daily_updates_subscriptions.sql
```

Or run via Supabase CLI:
```bash
supabase db push
```

### 2. Add Twilio Credentials

Add these environment variables to `.env.local`:

```bash
# Twilio credentials (get from https://console.twilio.com)
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio phone number
```

### 3. Get Twilio Account

1. Sign up at https://www.twilio.com
2. Get a phone number with SMS/MMS capabilities
3. Copy Account SID and Auth Token from the console
4. Add credentials to `.env.local`

### 4. Find Webcam URLs

Update these webcam URLs in the send script:
- **Casa Malca**: [URL needed]
- **Akumal**: [URL needed]

### 5. Set Up Cron Job (Vercel)

For production deployment on Vercel:

1. Create `/src/app/api/cron/daily-updates/route.ts`
2. Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-updates",
      "schedule": "0 6-9 * * *"
    }
  ]
}
```

### 6. Alternative: Manual Cron Setup

If not using Vercel Cron, set up a system cron job:

```bash
# Run every hour from 6am-9am Cancun time (America/Cancun)
0 6-9 * * * curl -X POST https://yourdomain.com/api/cron/daily-updates
```

## Cost Estimates

### Twilio Pricing (as of 2024)
- **SMS**: ~$0.0079 per message (US/Canada)
- **MMS** (with images): ~$0.02 per message
- **Phone number**: $1/month

### Example Monthly Cost
If 100 users subscribe for 7 days average:
- 100 users × 7 days × $0.02/MMS = **$14/month**
- Plus $1/month for phone number = **$15 total**

## Testing Locally

1. Run migration in Supabase
2. Add Twilio credentials to `.env.local`
3. Start dev server: `npm run dev`
4. Click 📱 "Daily Beach Updates" button in Quick Actions FAB
5. Subscribe with your phone number
6. Test the cron endpoint manually:

```bash
curl -X POST http://localhost:3000/api/cron/daily-updates
```

## Features Implemented

✅ Frontend modal for subscription (phone, dates, time)
✅ API endpoint for creating subscriptions
✅ Database schema with migrations
✅ Validation (phone format, date ranges, time slots)
✅ Duplicate subscription prevention

## TODO (Next Steps)

- [ ] Implement Twilio SMS/MMS sending
- [ ] Create cron job endpoint (`/api/cron/daily-updates/route.ts`)
- [ ] Add webcam image fetching
- [ ] Add weather data formatting for SMS
- [ ] Add sargassum data to messages
- [ ] Add tide information
- [ ] Implement STOP/unsubscribe handling
- [ ] Add confirmation SMS on subscription
- [ ] Add reminder SMS 1 day before subscription starts

## User Flow

1. User clicks 📱 "Daily Beach Updates" in Quick Actions menu
2. User enters phone number with country code (e.g., +12345678900)
3. User selects date range (start/end dates)
4. User picks send time (6am, 7am, 8am, or 9am Cancun time)
5. User clicks "Subscribe"
6. Subscription saved to database
7. (TODO) Confirmation SMS sent via Twilio
8. Daily at selected time, cron job:
   - Fetches active subscriptions for today
   - Retrieves webcam images
   - Fetches weather forecast
   - Gets sargassum conditions
   - Sends MMS with images and text via Twilio

## Database Schema

```sql
daily_updates_subscriptions (
  id UUID PRIMARY KEY,
  phone_number TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  send_time TIME NOT NULL,
  timezone TEXT DEFAULT 'America/Cancun',
  status TEXT DEFAULT 'active',  -- active, paused, cancelled, completed
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

## Security Notes

- Phone numbers validated to include country code
- Duplicate subscriptions prevented (same phone + overlapping dates)
- Rate limiting recommended on subscribe endpoint
- RLS policies: public can insert, service role can manage
- Twilio credentials stored in environment variables (never committed)
