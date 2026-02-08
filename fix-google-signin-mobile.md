# Fix: Google Sign-In Failing on Mobile

> **Note:** This doc has two sections: (1) Firebase Auth, (2) Supabase Auth. Tulum Discovery uses **Supabase Auth**.

---

## Supabase Auth (Tulum Discovery)

### If you see 500 "unexpected_failure" from Supabase

**Root cause:** The 500 occurs at Supabase's callback when exchanging with Google—usually a **configuration mismatch**, not app code.

**Supabase already uses redirect** (no popup), so popup-related fixes don't apply.

### Checklist

1. **Supabase Dashboard** → Authentication → URL Configuration
   - Site URL: `https://tulum-webapp.vercel.app` (or your prod URL)
   - Redirect URLs must include:
     - `https://tulum-webapp.vercel.app/auth/callback`
     - `https://tulum-webapp.vercel.app/**`
     - `http://localhost:3011/auth/callback`
     - `http://localhost:3011/**`

2. **Supabase Dashboard** → Authentication → Providers → Google
   - Client ID and Client Secret must match your Google Cloud OAuth 2.0 Client
   - Copy from: [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials

3. **Google Cloud Console** → APIs & Services → Credentials → OAuth 2.0 Client ID
   - Authorized redirect URIs must include **exactly**:
     - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Find `YOUR_PROJECT_REF` in Supabase Dashboard → Settings → General

4. **OAuth consent screen**
   - If in Testing mode: add your email as a test user, or publish the app

### Recent changes applied (app code)

- Auth callback now surfaces OAuth and exchange errors
- Sign-in page shows actionable error messages from URL params
- Redirect `next` preserved so users return to the page they started from

---

## Firebase Auth (reference only)

## Problem Analysis

**Symptoms:**
- ✅ Google Sign-In works on desktop
- ❌ Google Sign-In fails on mobile (ERR_CONNECTION_FAILED)
- ❌ Screen goes black/white after clicking "Sign in with Google"

**Root Cause:**
Google OAuth popup is trying to open but fails on mobile browsers due to:
1. Popup blockers on mobile
2. OAuth redirect URI not configured for mobile
3. Firebase auth using popup method (doesn't work well on mobile)
4. Missing authorized domains in Firebase/Google Console

---

## Solution 1: Use Redirect Instead of Popup (BEST FIX)

### The Problem:
```javascript
// ❌ Current code (popup method)
signInWithPopup(auth, googleProvider)
```

**Why it fails on mobile:**
- Mobile browsers block popups aggressively
- Safari especially hates popups
- Redirect is the mobile-friendly approach

### The Fix:
```javascript
// ✅ Use redirect on mobile, popup on desktop
import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult 
} from 'firebase/auth';

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const signInWithGoogle = async () => {
  try {
    if (isMobile) {
      // Mobile: Use redirect
      await signInWithRedirect(auth, googleProvider);
    } else {
      // Desktop: Use popup
      const result = await signInWithPopup(auth, googleProvider);
      handleSignInSuccess(result.user);
    }
  } catch (error) {
    console.error('Sign-in error:', error);
  }
};

// Handle redirect result when user returns
useEffect(() => {
  getRedirectResult(auth)
    .then((result) => {
      if (result) {
        handleSignInSuccess(result.user);
      }
    })
    .catch((error) => {
      console.error('Redirect error:', error);
    });
}, []);
```

---

## Complete Updated Auth Component

```jsx
import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  OAuthProvider 
} from 'firebase/auth';
import { auth, googleProvider, appleProvider } from './firebase';

const AuthScreen = ({ onSignInComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Detect mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Check for redirect result on mount (mobile flow)
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('Redirect sign-in successful:', result.user);
          await handleSignInSuccess(result.user);
        }
      } catch (error) {
        console.error('Redirect result error:', error);
        setError(getErrorMessage(error.code));
      }
    };

    handleRedirectResult();
  }, []);

  const handleSignInSuccess = async (user) => {
    // Create/update user in database
    await createOrUpdateUser({
      id: user.uid,
      email: user.email,
      name: user.displayName,
      photo: user.photoURL,
      provider: user.providerData[0].providerId,
    });

    // Analytics
    analytics.track('user_signed_in', {
      provider: user.providerData[0].providerId,
      method: isMobile ? 'redirect' : 'popup',
    });

    // Complete onboarding
    onSignInComplete(user);
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isMobile) {
        // Mobile: Use redirect method
        console.log('Using redirect method for mobile');
        await signInWithRedirect(auth, googleProvider);
        // User will be redirected away, then back
        // Result handled in useEffect above
      } else {
        // Desktop: Use popup method
        console.log('Using popup method for desktop');
        const result = await signInWithPopup(auth, googleProvider);
        await handleSignInSuccess(result.user);
        setLoading(false);
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(getErrorMessage(error.code));
      setLoading(false);
    }
  };

  const signInWithApple = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isMobile) {
        await signInWithRedirect(auth, appleProvider);
      } else {
        const result = await signInWithPopup(auth, appleProvider);
        await handleSignInSuccess(result.user);
        setLoading(false);
      }
    } catch (error) {
      console.error('Apple sign-in error:', error);
      setError(getErrorMessage(error.code));
      setLoading(false);
    }
  };

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
      {/* Logo */}
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

      {/* Sign-in buttons */}
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

        {/* Error message */}
        {error && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(255, 107, 107, 0.1)',
            border: '2px solid rgba(255, 107, 107, 0.3)',
            borderRadius: '12px',
            color: '#FF6B6B',
            fontSize: '14px',
            fontWeight: '600',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Loading indicator for mobile redirect */}
      {loading && isMobile && (
        <div style={{
          marginTop: '24px',
          fontSize: '14px',
          color: '#666',
          textAlign: 'center',
        }}>
          Redirecting to Google...
        </div>
      )}

      {/* Privacy */}
      <p style={{
        marginTop: '32px',
        fontSize: '13px',
        color: '#999',
        textAlign: 'center',
        maxWidth: '400px',
      }}>
        By continuing, you agree to our{' '}
        <a href="/terms" style={{ color: '#00CED1', textDecoration: 'none' }}>
          Terms of Service
        </a>
        {' '}and{' '}
        <a href="/privacy" style={{ color: '#00CED1', textDecoration: 'none' }}>
          Privacy Policy
        </a>
      </p>
    </div>
  );
};

const getErrorMessage = (errorCode) => {
  const messages = {
    'auth/popup-blocked': 'Popup was blocked. Please allow popups for this site.',
    'auth/popup-closed-by-user': 'Sign-in cancelled',
    'auth/cancelled-popup-request': 'Sign-in cancelled',
    'auth/unauthorized-domain': 'This domain is not authorized. Please add it in Firebase Console.',
  };
  return messages[errorCode] || 'Sign-in failed. Please try again.';
};

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
    <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
    <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
    <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
    <path d="M16.93 11.73c-.03 3.29 2.91 4.38 2.94 4.39-.02.08-.46 1.58-1.52 3.13-.91 1.34-1.86 2.68-3.36 2.71-1.47.03-1.95-.87-3.63-.87s-2.22.84-3.62.9c-1.45.05-2.55-1.46-3.47-2.79-1.89-2.73-3.33-7.71-1.39-11.08.96-1.68 2.68-2.74 4.55-2.77 1.42-.03 2.76.95 3.63.95.87 0 2.5-1.18 4.22-1 .72.03 2.73.29 4.02 2.18-.1.06-2.4 1.4-2.37 4.19M13.36 3.43c.76-.92 1.27-2.19 1.13-3.46-1.09.04-2.41.73-3.19 1.64-.7.81-1.31 2.1-1.15 3.34 1.22.09 2.46-.62 3.21-1.52"/>
  </svg>
);

export default AuthScreen;
```

---

## Solution 2: Add Authorized Domains in Firebase

### Step 1: Go to Firebase Console

1. Go to: https://console.firebase.google.com/
2. Select your project: `tulum-webapp`
3. Go to: **Authentication** → **Settings** → **Authorized domains**

### Step 2: Add Your Vercel Domain

Click **"Add domain"** and add:
```
tulum-webapp.vercel.app
```

Also add any preview URLs if needed:
```
tulum-webapp-git-main.vercel.app
*.vercel.app
```

### Step 3: Save and Wait

Wait 5-10 minutes for changes to propagate.

---

## Solution 3: Update Firebase Config

Make sure your Firebase config has the correct `authDomain`:

```javascript
// firebase.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "tulum-webapp.firebaseapp.com", // ← Important!
  projectId: "tulum-webapp",
  // ... other config
};
```

**NOT:**
```javascript
authDomain: "tulum-webapp.vercel.app" // ❌ Wrong!
```

**Use:**
```javascript
authDomain: "YOUR-PROJECT.firebaseapp.com" // ✅ Correct!
```

---

## Solution 4: Check Google Cloud Console OAuth Settings

### Step 1: Go to Google Cloud Console

1. https://console.cloud.google.com/
2. Select your project
3. **APIs & Services** → **Credentials**

### Step 2: Find Your OAuth 2.0 Client ID

Click on your OAuth client (Web client)

### Step 3: Add Authorized Redirect URIs

Add these URIs:
```
https://tulum-webapp.vercel.app/__/auth/handler
https://tulum-webapp.firebaseapp.com/__/auth/handler
http://localhost:3000/__/auth/handler
```

### Step 4: Add Authorized JavaScript Origins

```
https://tulum-webapp.vercel.app
https://tulum-webapp.firebaseapp.com
http://localhost:3000
```

### Step 5: Save

Click **Save** and wait a few minutes.

---

## Testing Checklist

### On Desktop:
- [ ] Open https://tulum-webapp.vercel.app
- [ ] Click "Continue with Google"
- [ ] Popup opens
- [ ] Sign in works ✅

### On Mobile:
- [ ] Open https://tulum-webapp.vercel.app on phone
- [ ] Click "Continue with Google"
- [ ] Redirects to Google
- [ ] Redirects back to app
- [ ] Sign in works ✅

---

## Debug Logging

Add this to see what's happening:

```javascript
const signInWithGoogle = async () => {
  console.log('🔵 Sign-in started');
  console.log('📱 Is mobile:', isMobile);
  console.log('🌐 Using method:', isMobile ? 'redirect' : 'popup');

  try {
    if (isMobile) {
      console.log('🔀 Starting redirect...');
      await signInWithRedirect(auth, googleProvider);
      console.log('✅ Redirect initiated');
    } else {
      console.log('🪟 Opening popup...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Popup sign-in successful:', result.user.email);
    }
  } catch (error) {
    console.error('❌ Sign-in error:', error.code, error.message);
  }
};

// Check redirect result
useEffect(() => {
  console.log('🔍 Checking for redirect result...');
  getRedirectResult(auth)
    .then((result) => {
      if (result) {
        console.log('✅ Redirect result found:', result.user.email);
      } else {
        console.log('ℹ️ No redirect result');
      }
    })
    .catch((error) => {
      console.error('❌ Redirect error:', error.code, error.message);
    });
}, []);
```

---

## Common Errors & Fixes

### Error: "auth/unauthorized-domain"
**Fix:** Add domain to Firebase Console → Authentication → Authorized domains

### Error: "auth/popup-blocked"
**Fix:** Use redirect method on mobile (already fixed in code above)

### Error: "auth/operation-not-allowed"
**Fix:** Enable Google sign-in in Firebase Console → Authentication → Sign-in method

### Error: Infinite redirect loop
**Fix:** Make sure you're not calling signInWithRedirect in a useEffect without conditions

---

## Quick Implementation Steps

### 1. Update Your Auth Component
Replace popup-only code with the redirect-aware code above

### 2. Add Domains to Firebase
Firebase Console → Authentication → Authorized domains → Add `tulum-webapp.vercel.app`

### 3. Deploy
```bash
git add .
git commit -m "Fix mobile Google Sign-In"
git push
```

Vercel auto-deploys

### 4. Test on Mobile
Open https://tulum-webapp.vercel.app on phone → Click Google → Should work! ✅

---

## Key Differences: Popup vs Redirect

### Popup (Desktop):
```
User clicks → Popup opens → User signs in → Popup closes → User back on your site
```

### Redirect (Mobile):
```
User clicks → Leaves your site → Signs in on Google → Redirects back → User on your site
```

The redirect method is more reliable on mobile!

---

## Complete Working Example

```javascript
// AuthPage.jsx
import { signInWithRedirect, signInWithPopup, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const AuthPage = () => {
  useEffect(() => {
    // Handle redirect result (mobile)
    getRedirectResult(auth)
      .then(result => {
        if (result) {
          // Success! User is signed in
          console.log('Signed in:', result.user);
        }
      })
      .catch(error => console.error(error));
  }, []);

  const handleSignIn = () => {
    if (isMobile) {
      signInWithRedirect(auth, googleProvider);
    } else {
      signInWithPopup(auth, googleProvider)
        .then(result => console.log('Signed in:', result.user))
        .catch(error => console.error(error));
    }
  };

  return (
    <button onClick={handleSignIn}>
      Sign in with Google
    </button>
  );
};
```

This should fix your mobile sign-in issue! 🚀
