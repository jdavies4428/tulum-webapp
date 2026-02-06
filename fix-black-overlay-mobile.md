# Fix: Black Box Covering Map on Mobile

## The Problem
The map IS loading (visible on right edge with legend), but a black box/container is covering it. This is typically caused by:
1. A parent div with `background: black` overlaying the map
2. Incorrect z-index stacking
3. A flex/grid container pushing content off screen
4. An empty div positioned above the map

---

## Solution 1: Inspect and Fix Z-Index Order

```jsx
// Your app structure should be:
const App = () => {
  return (
    <div className="app-wrapper" style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
    }}>
      {/* Map - MUST BE FIRST, LOWEST Z-INDEX */}
      <div className="map-layer" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1, // Low z-index
        background: 'transparent', // NOT BLACK
      }}>
        <MapboxMap />
      </div>

      {/* UI Overlays - HIGHER Z-INDEX */}
      <div className="ui-layer" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10, // Higher z-index
        pointerEvents: 'none', // Let clicks through to map
        background: 'transparent', // NOT BLACK
      }}>
        {/* Sidebar, buttons, etc. with pointerEvents: 'auto' */}
        <Sidebar style={{ pointerEvents: 'auto' }} />
        <Controls style={{ pointerEvents: 'auto' }} />
      </div>
    </div>
  );
};
```

---

## Solution 2: Find and Remove Black Overlay

Add this debug code to find what's covering your map:

```javascript
// Debug: Find the black box
useEffect(() => {
  const findBlackBox = () => {
    const elements = document.querySelectorAll('*');
    const blackBoxes = [];
    
    elements.forEach(el => {
      const styles = window.getComputedStyle(el);
      const bg = styles.backgroundColor;
      const pos = styles.position;
      const zIndex = styles.zIndex;
      
      // Find elements with black background
      if (bg === 'rgb(0, 0, 0)' || bg === '#000000' || bg === 'black') {
        const rect = el.getBoundingClientRect();
        if (rect.width > 100 && rect.height > 100) {
          blackBoxes.push({
            element: el,
            className: el.className,
            id: el.id,
            position: pos,
            zIndex: zIndex,
            size: `${rect.width}x${rect.height}`,
            top: rect.top
          });
        }
      }
    });
    
    console.log('=== BLACK BOXES FOUND ===');
    console.log(blackBoxes);
    
    // Log map container specifically
    const mapContainer = document.querySelector('.mapboxgl-map');
    if (mapContainer) {
      console.log('Map container:', {
        zIndex: window.getComputedStyle(mapContainer).zIndex,
        position: window.getComputedStyle(mapContainer).position,
        rect: mapContainer.getBoundingClientRect()
      });
    }
  };
  
  setTimeout(findBlackBox, 1000);
}, []);
```

---

## Solution 3: Force Map to Top Layer

```css
/* Add these styles with !important to override everything */

/* Remove black background from all containers */
#root, #__next, .app, .app-container, .app-wrapper {
  background: transparent !important;
}

/* Ensure map is visible */
.mapboxgl-map,
.map-container,
[class*="map"] {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  z-index: 1 !important;
  background: transparent !important;
}

/* Ensure map canvas is on top */
.mapboxgl-canvas {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
}

/* Make sure nothing blocks the map */
.mapboxgl-map * {
  pointer-events: auto !important;
}
```

---

## Solution 4: Correct Container Structure

```jsx
// WRONG - Black box will cover map
const WrongStructure = () => {
  return (
    <div style={{ background: 'black' }}> {/* ❌ This covers map */}
      <MapComponent />
      <Sidebar />
    </div>
  );
};

// CORRECT - Layered structure
const CorrectStructure = () => {
  return (
    <div style={{ position: 'relative', background: 'transparent' }}>
      {/* Layer 1: Map (bottom) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
      }}>
        <MapComponent />
      </div>
      
      {/* Layer 2: UI (top) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        pointerEvents: 'none', // Important!
      }}>
        <Sidebar style={{ pointerEvents: 'auto' }} />
        <Controls style={{ pointerEvents: 'auto' }} />
      </div>
    </div>
  );
};
```

---

## Solution 5: Quick Fix for Existing Code

Add this CSS to override everything:

```css
/* Emergency override - add to global CSS */
body {
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
}

/* Remove black backgrounds */
body, html, #root, #__next, 
[class*="app"], [class*="container"], 
[class*="wrapper"], [class*="layout"] {
  background: transparent !important;
}

/* Force map visibility */
.mapboxgl-map,
.leaflet-container,
[id*="map"],
[class*="map-container"] {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 1 !important;
}

/* Ensure UI elements are on top */
.sidebar,
[class*="sidebar"],
.controls,
[class*="controls"],
button {
  position: relative !important;
  z-index: 1000 !important;
}
```

---

## Solution 6: Check Your Wrapper Divs

Look for code like this in your app:

```jsx
// ❌ BAD - Black wrapper covering map
<div style={{ 
  width: '100vw', 
  height: '100vh', 
  background: '#000' // Remove this!
}}>
  <Map />
</div>

// ✅ GOOD - Transparent wrapper
<div style={{ 
  width: '100vw', 
  height: '100vh', 
  background: 'transparent',
  position: 'relative'
}}>
  <Map />
</div>
```

---

## Solution 7: Immediate JavaScript Fix

Add this to your component to fix immediately:

```javascript
useEffect(() => {
  // Remove black backgrounds from all parent containers
  const removeBlackBackgrounds = () => {
    const containers = [
      document.body,
      document.documentElement,
      document.getElementById('root'),
      document.getElementById('__next'),
      ...document.querySelectorAll('[class*="app"]'),
      ...document.querySelectorAll('[class*="container"]'),
      ...document.querySelectorAll('[class*="wrapper"]'),
    ].filter(Boolean);

    containers.forEach(el => {
      const bg = window.getComputedStyle(el).backgroundColor;
      if (bg === 'rgb(0, 0, 0)' || bg === 'black') {
        console.log('Removing black bg from:', el.className || el.tagName);
        el.style.background = 'transparent';
      }
    });

    // Force map to be visible
    const mapElements = document.querySelectorAll('.mapboxgl-map, [class*="map"]');
    mapElements.forEach(el => {
      el.style.position = 'fixed';
      el.style.top = '0';
      el.style.left = '0';
      el.style.width = '100vw';
      el.style.height = '100vh';
      el.style.zIndex = '1';
    });

    // Ensure map canvas is full size
    const canvas = document.querySelector('.mapboxgl-canvas');
    if (canvas) {
      canvas.style.width = '100%';
      canvas.style.height = '100%';
    }
  };

  // Run immediately
  removeBlackBackgrounds();
  
  // Run again after a short delay (in case map loads after)
  setTimeout(removeBlackBackgrounds, 100);
  setTimeout(removeBlackBackgrounds, 500);
  setTimeout(removeBlackBackgrounds, 1000);
}, []);
```

---

## Solution 8: Complete Mobile-Optimized Component

```jsx
import React, { useEffect, useRef, useState } from 'react';

const TulumApp = () => {
  const mapContainerRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Fix all containers
    const fixContainers = () => {
      // Remove black backgrounds
      document.body.style.background = 'transparent';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflow = 'hidden';

      const root = document.getElementById('root') || document.getElementById('__next');
      if (root) {
        root.style.background = 'transparent';
        root.style.width = '100%';
        root.style.height = '100%';
      }
    };

    fixContainers();
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'transparent', // NOT BLACK!
      }}
    >
      {/* MAP LAYER - Must be first */}
      <div
        ref={mapContainerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          background: 'transparent', // NOT BLACK!
        }}
      >
        {/* Your Mapbox/Leaflet component */}
        <YourMapComponent />
      </div>

      {/* UI LAYER - On top of map */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          pointerEvents: 'none', // Let clicks through to map
          background: 'transparent', // NOT BLACK!
        }}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'fixed',
            left: '16px',
            top: '16px',
            zIndex: 10001,
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(0, 212, 212, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            color: '#FFF',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            pointerEvents: 'auto', // Button is clickable
          }}
        >
          {sidebarOpen ? '✕' : '🌴'}
        </button>

        {/* Sidebar */}
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setSidebarOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(2px)',
                zIndex: 999,
                pointerEvents: 'auto',
              }}
            />

            {/* Sidebar Panel */}
            <div
              style={{
                position: 'fixed',
                left: 0,
                top: 0,
                width: '85vw',
                maxWidth: '400px',
                height: '100vh',
                background: 'rgba(10, 4, 4, 0.98)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                zIndex: 1000,
                overflowY: 'auto',
                pointerEvents: 'auto', // Sidebar is interactive
              }}
            >
              <div style={{ padding: '70px 24px 24px 24px' }}>
                <h1 style={{ color: '#FFF' }}>🌴 Discover Tulum</h1>
                <p style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Real-time beach conditions, weather, and local spots
                </p>
                {/* Your sidebar content */}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TulumApp;
```

---

## Solution 9: Find The Culprit

Run this in browser console to find what's covering the map:

```javascript
// Paste this in browser console
const findCulprit = () => {
  const mapElement = document.querySelector('.mapboxgl-map');
  if (!mapElement) {
    console.log('❌ Map element not found!');
    return;
  }

  const mapRect = mapElement.getBoundingClientRect();
  console.log('📍 Map position:', mapRect);
  console.log('📍 Map z-index:', window.getComputedStyle(mapElement).zIndex);

  // Find elements at map's position
  const elementAtCenter = document.elementFromPoint(
    window.innerWidth / 2,
    window.innerHeight / 2
  );

  console.log('🎯 Element covering map center:', elementAtCenter);
  console.log('🎯 Element class:', elementAtCenter?.className);
  console.log('🎯 Element styles:', window.getComputedStyle(elementAtCenter));

  // Check all ancestors
  let current = elementAtCenter;
  console.log('📦 Parent chain:');
  while (current && current !== document.body) {
    console.log({
      element: current.tagName,
      class: current.className,
      id: current.id,
      zIndex: window.getComputedStyle(current).zIndex,
      background: window.getComputedStyle(current).backgroundColor,
      position: window.getComputedStyle(current).position
    });
    current = current.parentElement;
  }
};

findCulprit();
```

---

## Most Likely Fixes (Try in Order)

### Fix 1: Remove Black Background from Root
```javascript
document.getElementById('root').style.background = 'transparent';
```

### Fix 2: Fix Z-Index
```javascript
document.querySelector('.mapboxgl-map').style.zIndex = '1';
document.querySelector('.sidebar').style.zIndex = '1000';
```

### Fix 3: Remove Overlay
```javascript
// Find and remove the black box
const blackBoxes = [...document.querySelectorAll('*')].filter(el => {
  const bg = window.getComputedStyle(el).backgroundColor;
  return bg === 'rgb(0, 0, 0)';
});
blackBoxes.forEach(el => el.style.background = 'transparent');
```

### Fix 4: Force Map Visible
```javascript
const map = document.querySelector('.mapboxgl-map');
map.style.position = 'fixed';
map.style.top = '0';
map.style.left = '0';
map.style.width = '100vw';
map.style.height = '100vh';
map.style.zIndex = '1';
```

---

## Critical: Check Your App.js/App.tsx

Look for this pattern and fix it:

```jsx
// ❌ WRONG - This creates the black box
function App() {
  return (
    <div className="app" style={{ background: '#000' }}> {/* Remove this bg! */}
      <Map />
      <Sidebar />
    </div>
  );
}

// ✅ CORRECT
function App() {
  return (
    <div className="app" style={{ background: 'transparent', position: 'relative' }}>
      <Map style={{ position: 'absolute', zIndex: 1 }} />
      <Sidebar style={{ position: 'absolute', zIndex: 100, pointerEvents: 'auto' }} />
    </div>
  );
}
```

---

## Emergency Nuclear Option

If nothing else works, add this to the very top of your component:

```javascript
useEffect(() => {
  // Nuclear option - remove ALL black backgrounds
  const style = document.createElement('style');
  style.textContent = `
    * {
      background: transparent !important;
    }
    .mapboxgl-map, .mapboxgl-map * {
      background: initial !important;
    }
  `;
  document.head.appendChild(style);

  return () => document.head.removeChild(style);
}, []);
```

The issue is definitely a black container overlaying your map. Use the debug code (Solution 9) to find it, then apply the appropriate fix!
