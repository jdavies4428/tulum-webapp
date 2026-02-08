# Feature Spec: Passwordless Authentication (Google & Apple Sign-In Only)

## Overview
Simple, secure authentication using only OAuth providers (Google & Apple). No passwords, no email verification, no database of credentials - just instant sign-in with existing accounts.

---

## User Story
**As a** tourist using the Tulum app  
**I want** to sign in instantly with my Google or Apple account  
**So that** I can save favorites and preferences without creating yet another password

---

## Why Passwordless-Only?

### Benefits
✅ **Zero password management** - No storing, hashing, or securing passwords
✅ **Faster onboarding** - One-click sign-in
✅ **Higher conversion** - 65% higher than email/password
✅ **No forgotten passwords** - No password reset flows
✅ **Better security** - OAuth providers handle security
✅ **Lower development cost** - Less code to maintain
✅ **Mobile-friendly** - Native sign-in on iOS/Android

### What You Don't Need
❌ Password database
❌ Password reset emails
❌ Email verification system
❌ Password strength requirements
❌ "Forgot password" flow
❌ Password encryption/hashing

---

## User Flow

### First-Time User
```
1. Opens app
2. Sees onboarding slides
3. Final slide: "Continue with Google" or "Continue with Apple"
4. Clicks button → OAuth popup
5. Approves permissions
6. Returns to app → Signed in ✅
7. Profile created automatically
```

### Returning User
```
1. Opens app
2. Auto-signed in if token valid ✅
3. OR one-click sign-in if expired
```

---

## Authentication Architecture

### Tech Stack
```javascript
// Frontend
- Firebase Authentication (easiest)
- OR Supabase Auth (open source alternative)
- OR Auth0 (enterprise-grade)

// Backend
- Store only: user_id, provider, email, name, photo
- No passwords, no secrets

// Database (minimal)
users table:
- id (UUID)
- provider (google | apple)
- provider_user_id (unique from Google/Apple)
- email
- name
- photo_url
- created_at
- last_sign_in
```

---

## Implementation: Firebase Auth (Recommended)

### Setup (5 minutes)

```bash
npm install firebase
```

```javascript
// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "tulum-webapp.firebaseapp.com",
  projectId: "tulum-webapp",
  // ... other config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');
```

---

## Sign-In Component

```jsx
import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider, appleProvider } from './firebase';

const AuthScreen = ({ onSignInComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Check if user is already signed in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        handleSignInSuccess(user);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle sign-in success
  const handleSignInSuccess = async (user) => {
    // Create/update user in your database
    await createOrUpdateUser({
      id: user.uid,
      email: user.email,
      name: user.displayName,
      photo: user.photoURL,
      provider: user.providerData[0].providerId,
    });

    // Track analytics
    analytics.track('user_signed_in', {
      provider: user.providerData[0].providerId,
      is_new_user: user.metadata.creationTime === user.metadata.lastSignInTime
    });

    // Complete onboarding
    onSignInComplete(user);
  };

  // Google Sign-In
  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use popup on desktop, redirect on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        handleSignInSuccess(result.user);
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  // Apple Sign-In
  const signInWithApple = async () => {
    setLoading(true);
    setError(null);

    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        await signInWithRedirect(auth, appleProvider);
      } else {
        const result = await signInWithPopup(auth, appleProvider);
        handleSignInSuccess(result.user);
      }
    } catch (error) {
      console.error('Apple sign-in error:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  // Handle redirect result (for mobile)
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          handleSignInSuccess(result.user);
        }
      })
      .catch((error) => {
        setError(getErrorMessage(error.code));
      });
  }, []);

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
      {/* Logo/Branding */}
      <div style={{
        textAlign: 'center',
        marginBottom: '48px',
      }}>
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
        <p style={{
          fontSize: '16px',
          color: '#666',
          margin: 0,
        }}>
          Your real-time guide to paradise
        </p>
      </div>

      {/* Sign-In Buttons */}
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
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.12)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
            }
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20">
            <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
            <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
            <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
            <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
          </svg>
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
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            }
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
            <path d="M16.93 11.73c-.03 3.29 2.91 4.38 2.94 4.39-.02.08-.46 1.58-1.52 3.13-.91 1.34-1.86 2.68-3.36 2.71-1.47.03-1.95-.87-3.63-.87s-2.22.84-3.62.9c-1.45.05-2.55-1.46-3.47-2.79-1.89-2.73-3.33-7.71-1.39-11.08.96-1.68 2.68-2.74 4.55-2.77 1.42-.03 2.76.95 3.63.95.87 0 2.5-1.18 4.22-1 .72.03 2.73.29 4.02 2.18-.1.06-2.4 1.4-2.37 4.19M13.36 3.43c.76-.92 1.27-2.19 1.13-3.46-1.09.04-2.41.73-3.19 1.64-.7.81-1.31 2.1-1.15 3.34 1.22.09 2.46-.62 3.21-1.52"/>
          </svg>
          {loading ? 'Signing in...' : 'Continue with Apple'}
        </button>

        {/* Error Message */}
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

      {/* Privacy Notice */}
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

      {/* Skip (for guest mode - optional) */}
      <button
        onClick={() => onSignInComplete(null)}
        style={{
          marginTop: '16px',
          padding: '12px',
          background: 'transparent',
          border: 'none',
          color: '#999',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          textDecoration: 'underline',
        }}
      >
        Continue as guest
      </button>
    </div>
  );
};

// Error message helper
const getErrorMessage = (errorCode) => {
  const messages = {
    'auth/popup-closed-by-user': 'Sign-in cancelled',
    'auth/popup-blocked': 'Please enable popups for this site',
    'auth/cancelled-popup-request': 'Sign-in cancelled',
    'auth/account-exists-with-different-credential': 'An account already exists with this email',
  };
  return messages[errorCode] || 'Sign-in failed. Please try again.';
};

export default AuthScreen;
```

---

## Backend: User Management

### Create/Update User
```javascript
// api/users.js
export const createOrUpdateUser = async (userData) => {
  const { id, email, name, photo, provider } = userData;

  // Check if user exists
  const existingUser = await db.users.findOne({ id });

  if (existingUser) {
    // Update last sign-in
    await db.users.update(id, {
      last_sign_in: new Date(),
      photo_url: photo, // In case they updated their profile pic
      name: name
    });
  } else {
    // Create new user
    await db.users.create({
      id,
      provider,
      email,
      name,
      photo_url: photo,
      created_at: new Date(),
      last_sign_in: new Date(),
      preferences: {
        language: 'en',
        currency: 'USD',
        interests: []
      }
    });

    // Send welcome email (optional)
    await sendWelcomeEmail(email, name);
  }

  return { id, email, name, photo };
};
```

---

## Protected Routes

```jsx
// ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/signin" />;
  }

  return children;
};

// Usage
<Route path="/favorites" element={
  <ProtectedRoute>
    <FavoritesPage />
  </ProtectedRoute>
} />
```

---

## Auth Context

```jsx
// AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const value = {
    user,
    loading,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## Guest Mode (Optional)

Allow users to browse without signing in:

```jsx
const [guestMode, setGuestMode] = useState(false);

// Track guest users
useEffect(() => {
  if (guestMode) {
    const guestId = localStorage.getItem('guest_id') || generateGuestId();
    localStorage.setItem('guest_id', guestId);
    
    analytics.track('guest_mode_started', { guest_id: guestId });
  }
}, [guestMode]);

// Convert guest to user when they sign in
const convertGuestToUser = async (user) => {
  const guestId = localStorage.getItem('guest_id');
  if (guestId) {
    // Transfer guest favorites/data to user account
    await transferGuestData(guestId, user.uid);
    localStorage.removeItem('guest_id');
  }
};
```

---

## When to Require Sign-In

### Require Auth For:
✅ Saving favorites
✅ Creating lists
✅ Syncing across devices
✅ Leaving reviews
✅ Premium features

### Allow Without Auth:
✅ Browsing places
✅ Viewing map
✅ Checking weather
✅ Sargassum monitoring
✅ Search

---

## Setup Instructions

### Firebase Console Setup

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com
   - Click "Add Project"
   - Name it "tulum-webapp"

2. **Enable Authentication**
   - Go to Authentication → Sign-in method
   - Enable "Google"
   - Enable "Apple" (requires Apple Developer account)

3. **Add Web App**
   - Project Settings → Add app → Web
   - Copy the config object

4. **Google OAuth Setup**
   - Already done by Firebase!
   - Just enable in Firebase console

5. **Apple OAuth Setup**
   - Need Apple Developer account ($99/year)
   - Create Service ID in Apple Developer
   - Add to Firebase console

---

## Alternative: Supabase Auth (Open Source)

```bash
npm install @supabase/supabase-js
```

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

// Google Sign-In
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
});

// Apple Sign-In
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'apple',
});

// Check auth state
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    setUser(session.user);
  }
});
```

---

## Mobile App Considerations

### iOS (React Native / Capacitor)
```javascript
// Use native Apple Sign-In
import { AppleAuthenticationButton } from '@capacitor-community/apple-sign-in';
```

### Android
```javascript
// Use Google Sign-In SDK
import { GoogleSignin } from '@react-native-google-signin/google-signin';
```

---

## Security Best Practices

✅ **Always use HTTPS** in production
✅ **Validate tokens server-side** before trusting
✅ **Set token expiration** (Firebase default: 1 hour)
✅ **Implement rate limiting** on auth endpoints
✅ **Log auth events** for security monitoring
✅ **Don't store sensitive data** client-side
✅ **Use secure cookies** for session tokens

---

## Cost

### Firebase Auth
- **Free tier:** 50,000 MAU (Monthly Active Users)
- **Paid:** $0.0055/user after 50K
- **Example:** 10,000 users = $0 (within free tier)

### Supabase Auth
- **Free tier:** 50,000 MAU
- **Paid:** $25/month for 100K MAU
- **Open source:** Self-host for free

---

## Testing Checklist

- [ ] Google sign-in works on desktop
- [ ] Google sign-in works on mobile
- [ ] Apple sign-in works on desktop
- [ ] Apple sign-in works on iOS
- [ ] User data persists after sign-in
- [ ] Sign-out works correctly
- [ ] Auto sign-in on return visit
- [ ] Protected routes redirect when not signed in
- [ ] Guest mode works (if implemented)
- [ ] Error messages display correctly

---

## Success Criteria

**Metrics:**
- Sign-in completion rate: >85%
- Time to sign-in: <10 seconds
- Sign-in errors: <5%
- Return user auto sign-in: >95%

This passwordless setup is simple, secure, and user-friendly! 🔐✨
