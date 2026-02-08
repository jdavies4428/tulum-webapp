# Fix: Supabase OAuth Callback Error (500)

## Problem Analysis

**Error:** 500 status on `/callback` route in Supabase Auth logs

**What's happening:**
1. User clicks "Sign in with Google"
2. Redirects to Google successfully
3. Google redirects back to your site at `/callback`
4. Supabase Auth callback fails with 500 error
5. User sees error screen

**Root causes:**
- Missing callback route in your app
- Incorrect redirect URL configuration
- Supabase Auth URL mismatch

---

## Solution 1: Add Callback Route (Critical!)

Supabase needs a callback route to handle the OAuth redirect. You're missing this!

### For Next.js App Router (app directory)

Create: `app/auth/callback/route.js`

```javascript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to home page or wherever you want after sign-in
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
```

### For Next.js Pages Router (pages directory)

Create: `pages/api/auth/callback.js`

```javascript
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(req, res) {
  const { code } = req.query

  if (code) {
    const supabase = createPagesServerClient({ req, res })
    await supabase.auth.exchangeCodeForSession(code)
  }

  res.redirect('/')
}
```

### For Vite/React (SPA)

Create: `src/pages/AuthCallback.jsx`

```jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase automatically handles the callback
        // Just redirect to home
        navigate('/')
      } catch (error) {
        console.error('Callback error:', error)
        navigate('/login')
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px',
          animation: 'spin 1s linear infinite',
        }}>
          ⚙️
        </div>
        <div style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#333',
        }}>
          Signing you in...
        </div>
      </div>
    </div>
  )
}

export default AuthCallback
```

And add route:
```jsx
// App.jsx or router config
<Route path="/auth/callback" element={<AuthCallback />} />
```

---

## Solution 2: Configure Supabase Redirect URLs

### Step 1: Go to Supabase Dashboard

1. https://app.supabase.com/
2. Select your project
3. **Authentication** → **URL Configuration**

### Step 2: Set Site URL

```
https://tulum-webapp.vercel.app
```

### Step 3: Add Redirect URLs

Add these to **Redirect URLs**:
```
https://tulum-webapp.vercel.app/auth/callback
https://tulum-webapp.vercel.app/*
http://localhost:3000/auth/callback
http://localhost:3000/*
```

### Step 4: Save Changes

Click **Save** and wait a minute.

---

## Solution 3: Fix Your Sign-In Code

### Correct Supabase OAuth Implementation

```javascript
// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

```jsx
// AuthScreen.jsx
import { supabase } from './supabaseClient'

const AuthScreen = () => {
  const [loading, setLoading] = useState(false)

  const signInWithGoogle = async () => {
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          // Optional: request specific scopes
          scopes: 'email profile',
        }
      })

      if (error) {
        console.error('Sign-in error:', error)
        alert(error.message)
      }
      // User will be redirected to Google
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const signInWithApple = async () => {
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      })

      if (error) {
        console.error('Sign-in error:', error)
        alert(error.message)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🌴</div>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '800',
          margin: '0 0 12px 0',
          background: 'linear-gradient(135deg, #0099CC 0%, #00CED1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Tulum Discovery
        </h1>
        <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
          Your real-time guide to paradise
        </p>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {/* Google Sign-In */}
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px 24px',
            borderRadius: '12px',
            background: '#FFFFFF',
            border: '2px solid rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          }}
        >
          <GoogleIcon />
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        {/* Apple Sign-In */}
        <button
          onClick={signInWithApple}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px 24px',
            borderRadius: '12px',
            background: '#000000',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
        >
          <AppleIcon />
          {loading ? 'Signing in...' : 'Continue with Apple'}
        </button>
      </div>
    </div>
  )
}

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
    <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
    <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
    <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
  </svg>
)

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
    <path d="M16.93 11.73c-.03 3.29 2.91 4.38 2.94 4.39-.02.08-.46 1.58-1.52 3.13-.91 1.34-1.86 2.68-3.36 2.71-1.47.03-1.95-.87-3.63-.87s-2.22.84-3.62.9c-1.45.05-2.55-1.46-3.47-2.79-1.89-2.73-3.33-7.71-1.39-11.08.96-1.68 2.68-2.74 4.55-2.77 1.42-.03 2.76.95 3.63.95.87 0 2.5-1.18 4.22-1 .72.03 2.73.29 4.02 2.18-.1.06-2.4 1.4-2.37 4.19M13.36 3.43c.76-.92 1.27-2.19 1.13-3.46-1.09.04-2.41.73-3.19 1.64-.7.81-1.31 2.1-1.15 3.34 1.22.09 2.46-.62 3.21-1.52"/>
  </svg>
)

export default AuthScreen
```

---

## Solution 4: Check Auth State

### Listen for Auth Changes

```jsx
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const App = () => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  return session ? <MainApp user={session.user} /> : <AuthScreen />
}
```

---

## Solution 5: Enable Google OAuth in Supabase

### Step 1: Get Google OAuth Credentials

1. Go to: https://console.cloud.google.com/
2. Create project (or use existing)
3. **APIs & Services** → **Credentials**
4. **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
   (Find YOUR_PROJECT_REF in Supabase dashboard)

7. Copy **Client ID** and **Client Secret**

### Step 2: Configure in Supabase

1. Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google**
3. Enable it
4. Paste **Client ID**
5. Paste **Client Secret**
6. Click **Save**

---

## Complete Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Debug Checklist

### 1. Verify Callback Route Exists
- [ ] Created `/auth/callback` route
- [ ] Route handles OAuth code exchange
- [ ] Route redirects after success

### 2. Verify Supabase Config
- [ ] Site URL set correctly
- [ ] Redirect URLs include `/auth/callback`
- [ ] Google OAuth enabled
- [ ] Client ID & Secret added

### 3. Verify Sign-In Code
- [ ] Using `signInWithOAuth`
- [ ] redirectTo points to `/auth/callback`
- [ ] No errors in console

### 4. Test Flow
- [ ] Click "Sign in with Google"
- [ ] Redirects to Google ✅
- [ ] Redirects back to your site ✅
- [ ] Callback route processes ✅
- [ ] User signed in ✅

---

## Common Errors & Fixes

### Error: "Invalid redirect URL"
**Fix:** Add the URL to Supabase → Authentication → URL Configuration → Redirect URLs

### Error: "redirect_uri_mismatch"
**Fix:** 
1. Google Console → Add redirect URI: `https://xxxxx.supabase.co/auth/v1/callback`
2. Use YOUR actual project ref from Supabase

### Error: 500 on callback
**Fix:** Make sure callback route exists and handles code exchange properly

### Error: "OAuth provider not enabled"
**Fix:** Supabase Dashboard → Authentication → Providers → Enable Google

---

## Quick Test

```javascript
// Test if Supabase is configured
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Callback URL:', `${window.location.origin}/auth/callback`)

// Test sign-in
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  }
})

console.log('Sign-in data:', data)
console.log('Sign-in error:', error)
```

---

## Working Flow Diagram

```
User clicks "Sign in with Google"
    ↓
Supabase redirects to Google
    ↓
User signs in on Google
    ↓
Google redirects to: https://xxxxx.supabase.co/auth/v1/callback?code=XXX
    ↓
Supabase exchanges code for session
    ↓
Supabase redirects to: https://tulum-webapp.vercel.app/auth/callback
    ↓
Your callback route handles it
    ↓
Redirects to homepage
    ↓
User signed in! ✅
```

---

## Installation Commands

```bash
# If using Next.js
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# If using Vite/React
npm install @supabase/supabase-js

# Deploy
git add .
git commit -m "Fix Supabase OAuth callback"
git push
```

The key issue is the **missing callback route**. Add that and configure the redirect URLs properly! 🚀
