# Fix: Mobile Map Display Issue - Map Pushed Off Screen

## Problem
On mobile devices, the map is not visible or is being pushed off the screen, showing only black space. The sidebar and controls are visible but the map container is not rendering properly.

## Root Causes
1. Map container has incorrect height/width on mobile
2. Sidebar is overlaying the map instead of being positioned properly
3. Z-index issues causing map to be hidden
4. Viewport units (vh/vw) not accounting for mobile browser chrome
5. Map initialization happening before container is properly sized

---

## Solution 1: Fix Map Container & Viewport (CRITICAL)

```css
/* Global mobile fixes */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: fixed; /* Prevents scrolling issues on mobile */
  background: #000000;
}

#root, #__next, .app-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

/* Map container - CRITICAL FIX */
.map-container {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  /* Use dvh for mobile browsers if supported */
  height: 100dvh !important;
  z-index: 0 !important;
  background: #000000;
}

/* Ensure Mapbox/Leaflet canvas takes full space */
.mapboxgl-map,
.leaflet-container {
  width: 100% !important;
  height: 100% !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
}

.mapboxgl-canvas,
.leaflet-container canvas {
  width: 100% !important;
  height: 100% !important;
}
```

---

## Solution 2: Mobile Sidebar Positioning

```css
/* Mobile sidebar - should slide from left, not cover map */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    max-width: 85vw;
    height: 100vh;
    height: 100dvh; /* Dynamic viewport height for mobile */
    background: rgba(10, 4, 4, 0.98);
    backdrop-filter: blur(20px);
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
    overflow: hidden;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  /* Backdrop when sidebar is open */
  .sidebar-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    z-index: 999;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
  }

  .sidebar-backdrop.visible {
    opacity: 1;
    pointer-events: auto;
  }
}
```

---

## Solution 3: Complete Mobile-Optimized Layout

```jsx
import React, { useState, useEffect } from 'react';

const MobileOptimizedApp = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Fix viewport height on mobile
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  // Prevent body scroll when app is mounted
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  return (
    <>
      {/* Root container with proper sizing */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        height: 'calc(var(--vh, 1vh) * 100)', // Fallback for mobile
        overflow: 'hidden',
        background: '#000000',
      }}>
        {/* Map Container - LOWEST Z-INDEX */}
        <div 
          id="map-container"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            background: '#000000',
          }}
        >
          {/* Your map component goes here */}
          <YourMapComponent onReady={() => setMapReady(true)} />
        </div>

        {/* Toggle Button - Always Visible */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'fixed',
            left: sidebarOpen ? 'calc(85vw - 60px)' : '16px',
            top: '16px',
            zIndex: 10001,
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: sidebarOpen ? 'rgba(10, 4, 4, 0.95)' : 'rgba(0, 212, 212, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            color: '#FFF',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {sidebarOpen ? '✕' : '🌴'}
        </button>

        {/* Sidebar Backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(2px)',
              zIndex: 999,
              animation: 'fadeIn 0.3s',
            }}
          />
        )}

        {/* Sidebar */}
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '85vw',
            maxWidth: '400px',
            height: '100vh',
            height: 'calc(var(--vh, 1vh) * 100)',
            background: 'rgba(10, 4, 4, 0.98)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1000,
            overflow: 'hidden',
            boxShadow: sidebarOpen ? '2px 0 24px rgba(0, 0, 0, 0.5)' : 'none',
          }}
        >
          {/* Scrollable content */}
          <div style={{
            width: '100%',
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}>
            {/* Your sidebar content */}
            <div style={{ padding: '70px 24px 24px 24px' }}>
              <h1 style={{ color: '#FFF', fontSize: '28px', marginBottom: '8px' }}>
                🌴 Discover Tulum
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                Real-time beach conditions, weather, and local spots
              </p>
              
              {/* Rest of your sidebar content */}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Hide scrollbar for sidebar content */
        .sidebar-content::-webkit-scrollbar {
          display: none;
        }

        /* Smooth scrolling */
        * {
          -webkit-overflow-scrolling: touch;
        }

        /* Prevent iOS bounce */
        html, body {
          overscroll-behavior: none;
        }
      `}</style>
    </>
  );
};

export default MobileOptimizedApp;
```

---

## Solution 4: Map Initialization Fix

```javascript
// Ensure map initializes AFTER container is ready
import { useEffect, useRef, useState } from 'react';

const MapComponent = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Wait for container to be properly sized
    const initMap = async () => {
      if (!mapContainerRef.current) return;

      // Wait for next frame to ensure container is rendered
      await new Promise(resolve => requestAnimationFrame(resolve));

      // Check container size
      const rect = mapContainerRef.current.getBoundingClientRect();
      console.log('Map container size:', rect.width, 'x', rect.height);

      if (rect.width === 0 || rect.height === 0) {
        console.error('Map container has zero size!');
        // Retry after short delay
        setTimeout(initMap, 100);
        return;
      }

      // Initialize map (Mapbox example)
      const mapboxgl = require('mapbox-gl');
      mapboxgl.accessToken = 'YOUR_TOKEN';

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-87.4654, 20.2114],
        zoom: 12,
        attributionControl: false
      });

      mapRef.current.on('load', () => {
        console.log('Map loaded successfully');
        setMapLoaded(true);
        
        // Force resize after load
        setTimeout(() => {
          mapRef.current?.resize();
        }, 100);
      });
    };

    initMap();

    // Cleanup
    return () => {
      mapRef.current?.remove();
    };
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      mapRef.current?.resize();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    />
  );
};
```

---

## Solution 5: CSS Using Dynamic Viewport Units

```css
/* Use dvh (dynamic viewport height) for mobile browsers */
/* Falls back to vh for older browsers */

:root {
  /* Calculate actual viewport height */
  --app-height: 100vh;
}

@supports (height: 100dvh) {
  :root {
    --app-height: 100dvh;
  }
}

.app-container {
  width: 100vw;
  height: var(--app-height);
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
```

---

## Solution 6: JavaScript Viewport Height Calculator

```javascript
// utils/viewport.js
export const setViewportHeight = () => {
  // First we get the viewport height and multiply it by 1% to get a value for a vh unit
  const vh = window.innerHeight * 0.01;
  // Then we set the value in the --vh custom property to the root of the document
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// Call on mount and resize
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);
setViewportHeight();
```

Then use in CSS:
```css
.full-height {
  height: 100vh; /* Fallback */
  height: calc(var(--vh, 1vh) * 100);
}
```

---

## Solution 7: Debugging Checklist

Add this code to debug the issue:

```javascript
// Debug helper - add to your component
useEffect(() => {
  const debugLayout = () => {
    const mapContainer = document.getElementById('map-container');
    const root = document.getElementById('root');
    
    console.log('=== LAYOUT DEBUG ===');
    console.log('Window size:', window.innerWidth, 'x', window.innerHeight);
    console.log('Root element:', root?.getBoundingClientRect());
    console.log('Map container:', mapContainer?.getBoundingClientRect());
    console.log('Map container computed styles:', window.getComputedStyle(mapContainer));
    console.log('Body overflow:', document.body.style.overflow);
    console.log('HTML overflow:', document.documentElement.style.overflow);
  };

  debugLayout();
  window.addEventListener('resize', debugLayout);

  return () => window.removeEventListener('resize', debugLayout);
}, []);
```

---

## Solution 8: Quick Fix - Copy & Paste

If you need a quick fix, add this to your component:

```jsx
// Quick mobile fix
useEffect(() => {
  // Fix viewport
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  
  // Fix body
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  document.body.style.height = '100%';
  document.body.style.background = '#000000';
  
  // Fix root
  const root = document.getElementById('root');
  if (root) {
    root.style.width = '100%';
    root.style.height = '100%';
    root.style.overflow = 'hidden';
    root.style.position = 'relative';
  }
  
  // Fix map container
  const mapContainer = document.querySelector('.map-container');
  if (mapContainer) {
    mapContainer.style.position = 'fixed';
    mapContainer.style.top = '0';
    mapContainer.style.left = '0';
    mapContainer.style.right = '0';
    mapContainer.style.bottom = '0';
    mapContainer.style.width = '100vw';
    mapContainer.style.height = '100vh';
    mapContainer.style.zIndex = '0';
  }
  
  // Force map resize if Mapbox
  const map = mapboxMap?.current; // Your map reference
  if (map) {
    setTimeout(() => map.resize(), 100);
  }
}, []);
```

---

## Solution 9: Tailwind CSS Version

If using Tailwind:

```jsx
<div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
  {/* Map */}
  <div className="absolute inset-0 z-0">
    <YourMap />
  </div>
  
  {/* Sidebar */}
  <div className={`
    fixed left-0 top-0 
    w-[85vw] max-w-md 
    h-screen 
    bg-[rgba(10,4,4,0.98)] 
    backdrop-blur-xl
    transform transition-transform duration-300 ease-out
    z-[1000]
    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
  `}>
    {/* Content */}
  </div>
</div>
```

---

## Most Common Causes & Fixes

### Cause 1: Body/HTML has default margins
```css
html, body {
  margin: 0 !important;
  padding: 0 !important;
}
```

### Cause 2: Map container has no explicit height
```css
.map-container {
  height: 100vh !important;
  height: 100dvh !important;
}
```

### Cause 3: Sidebar covering map with higher z-index
```css
.map-container { z-index: 0; }
.sidebar { z-index: 1000; }
```

### Cause 4: Mobile browser UI hiding map
```javascript
// Use dynamic viewport height
height: calc(var(--vh, 1vh) * 100)
```

### Cause 5: Map not resizing on orientation change
```javascript
window.addEventListener('orientationchange', () => {
  map?.resize();
});
```

---

## Testing Checklist

Test on mobile device:
- ✅ Map visible on initial load
- ✅ Map fills entire screen
- ✅ No white/black space around map
- ✅ Sidebar slides over map (not push)
- ✅ Toggle button always visible
- ✅ Map responsive to pinch zoom
- ✅ No scrolling on page
- ✅ Works in portrait mode
- ✅ Works in landscape mode
- ✅ Works after orientation change

---

## Priority Implementation Order

1. **Add viewport height fix** (Solution 6)
2. **Fix body/html overflow** (Solution 1)
3. **Fix map container sizing** (Solution 1)
4. **Fix z-index layers** (Solution 2)
5. **Add map resize handler** (Solution 4)
6. **Test on actual device**

Feed this to Cursor to fix the mobile map display issue!
