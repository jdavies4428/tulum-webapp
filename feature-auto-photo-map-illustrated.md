# Feature Spec: Automatic Photo Memory Map (Illustrated Style)

## Overview
Automatically scan user's photo library (with permission), detect Tulum photos via GPS, and display them on a fun, illustrated cartoonish map of Tulum. Click location dots to see all photos taken at that spot in a beautiful photo viewer.

---

## User Flow

### 1. Permission Request
```
User navigates to "My Photos" tab
    ↓
Sees prompt: "Create your Tulum photo map?"
    ↓
Explains: "We'll scan your photos for Tulum memories"
    ↓
User clicks "Create My Map"
    ↓
Browser requests file system access
    ↓
User allows access
    ↓
App scans photos in background
    ↓
Shows illustrated map with photo dots
```

---

## Visual Design

### Illustrated Map Style

Think **Google Maps Playful Style** meets **Adventure Map**:

```
┌──────────────────────────────────────┐
│  🎨 My Tulum Adventures              │
│  47 photos • 5 locations             │
├──────────────────────────────────────┤
│                                      │
│        🌊 Caribbean Sea 🌊          │
│                                      │
│    Beach Zone  🏖️                   │
│    [📸 15]  ← Grouped photos        │
│                                      │
│         🌴  Downtown  🌴            │
│              [📸 8]                 │
│                                      │
│    Cenote Zone  💧                  │
│    [📸 12]  [📸 7]                  │
│                                      │
│         Jungle  🌿                  │
│         [📸 5]                      │
│                                      │
└──────────────────────────────────────┘
```

**Visual Elements:**
- Hand-drawn style buildings
- Watercolor ocean
- Illustrated palm trees
- Cartoon roads/paths
- Playful icons
- Soft pastel colors

---

## Complete Implementation

### 1. Permission & Scanning Screen

```jsx
import React, { useState } from 'react';

const PhotoMapOnboarding = ({ onStart }) => {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleCreateMap = async () => {
    setScanning(true);

    try {
      // Request file system access
      const dirHandle = await window.showDirectoryPicker({
        mode: 'read',
        startIn: 'pictures'
      });

      // Scan photos
      const photos = await scanPhotosForTulum(dirHandle, setProgress);

      // Show map
      onStart(photos);
    } catch (error) {
      if (error.name === 'AbortError') {
        alert('Permission denied. We need access to create your photo map.');
      } else {
        console.error('Error:', error);
        alert('Something went wrong. Please try again.');
      }
      setScanning(false);
    }
  };

  if (scanning) {
    return <ScanningProgress progress={progress} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)',
    }}>
      <div style={{
        maxWidth: '600px',
        textAlign: 'center',
        padding: '48px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '32px',
        border: '3px solid rgba(0, 206, 209, 0.2)',
        boxShadow: '0 16px 64px rgba(0, 0, 0, 0.1)',
      }}>
        {/* Illustration */}
        <div style={{
          fontSize: '120px',
          marginBottom: '24px',
          filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1))',
        }}>
          🗺️📸
        </div>

        <h1 style={{
          fontSize: '36px',
          fontWeight: '800',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #0099CC 0%, #00CED1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Create Your Tulum Map
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#666',
          marginBottom: '32px',
          lineHeight: '1.6',
        }}>
          We'll scan your photos for Tulum memories and create a beautiful illustrated map 
          showing where you've been! 🌴
        </p>

        {/* Features */}
        <div style={{
          textAlign: 'left',
          marginBottom: '32px',
          padding: '24px',
          background: 'rgba(0, 206, 209, 0.05)',
          borderRadius: '20px',
        }}>
          <Feature icon="🔒" text="100% private - photos never leave your device" />
          <Feature icon="🤖" text="Automatic - we find your Tulum photos" />
          <Feature icon="🎨" text="Beautiful illustrated map view" />
          <Feature icon="📍" text="Photos grouped by location" />
        </div>

        <button
          onClick={handleCreateMap}
          style={{
            width: '100%',
            padding: '20px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)',
            border: 'none',
            color: '#FFF',
            fontSize: '18px',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0, 206, 209, 0.3)',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 48px rgba(0, 206, 209, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 206, 209, 0.3)';
          }}
        >
          🚀 Create My Map
        </button>

        <p style={{
          fontSize: '13px',
          color: '#999',
          marginTop: '24px',
        }}>
          You'll be asked to select your Photos folder
        </p>
      </div>
    </div>
  );
};

const Feature = ({ icon, text }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  }}>
    <span style={{ fontSize: '24px' }}>{icon}</span>
    <span style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>
      {text}
    </span>
  </div>
);

const ScanningProgress = ({ progress }) => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: 'linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)',
  }}>
    <div style={{
      textAlign: 'center',
      padding: '48px',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '32px',
      maxWidth: '500px',
    }}>
      <div style={{
        fontSize: '80px',
        marginBottom: '24px',
        animation: 'bounce 1s infinite',
      }}>
        🔍
      </div>

      <h2 style={{
        fontSize: '24px',
        fontWeight: '700',
        marginBottom: '16px',
        color: '#333',
      }}>
        Finding Your Tulum Photos...
      </h2>

      {/* Progress bar */}
      <div style={{
        width: '100%',
        height: '12px',
        background: 'rgba(0, 206, 209, 0.1)',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '16px',
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #00CED1 0%, #00BABA 100%)',
          transition: 'width 0.3s',
        }} />
      </div>

      <div style={{
        fontSize: '18px',
        fontWeight: '700',
        color: '#00CED1',
      }}>
        {progress}%
      </div>

      <p style={{
        fontSize: '14px',
        color: '#666',
        marginTop: '16px',
      }}>
        Scanning photos for GPS data...
      </p>
    </div>
  </div>
);
```

---

### 2. Photo Scanning Logic

```javascript
import EXIF from 'exif-js';

// Tulum bounding box
const TULUM_BOUNDS = {
  north: 20.25,
  south: 20.15,
  east: -87.42,
  west: -87.52,
};

const scanPhotosForTulum = async (dirHandle, onProgress) => {
  const tulumPhotos = [];
  const allFiles = [];

  // Recursively get all files
  await getAllFiles(dirHandle, allFiles);

  let processed = 0;
  const total = allFiles.length;

  for (const file of allFiles) {
    // Only process images
    if (!file.type.startsWith('image/')) {
      processed++;
      continue;
    }

    try {
      const photoData = await readPhotoGPS(file);

      if (photoData && isInTulum(photoData.latitude, photoData.longitude)) {
        tulumPhotos.push(photoData);
      }
    } catch (error) {
      console.error('Error reading photo:', file.name, error);
    }

    processed++;
    onProgress(Math.round((processed / total) * 100));
  }

  // Group photos by location (cluster nearby photos)
  const clusteredPhotos = clusterPhotosByLocation(tulumPhotos);

  return clusteredPhotos;
};

// Recursively get all files from directory
const getAllFiles = async (dirHandle, fileList) => {
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file') {
      const file = await entry.getFile();
      fileList.push(file);
    } else if (entry.kind === 'directory') {
      await getAllFiles(entry, fileList);
    }
  }
};

// Check if coordinates are in Tulum
const isInTulum = (lat, lng) => {
  return (
    lat >= TULUM_BOUNDS.south &&
    lat <= TULUM_BOUNDS.north &&
    lng >= TULUM_BOUNDS.west &&
    lng <= TULUM_BOUNDS.east
  );
};

// Read GPS data from photo
const readPhotoGPS = async (file) => {
  return new Promise((resolve) => {
    EXIF.getData(file, function() {
      const lat = EXIF.getTag(this, 'GPSLatitude');
      const latRef = EXIF.getTag(this, 'GPSLatitudeRef');
      const lng = EXIF.getTag(this, 'GPSLongitude');
      const lngRef = EXIF.getTag(this, 'GPSLongitudeRef');
      const timestamp = EXIF.getTag(this, 'DateTime');

      if (lat && lng) {
        resolve({
          id: Math.random().toString(36),
          filename: file.name,
          imageUrl: URL.createObjectURL(file),
          latitude: convertDMSToDD(lat, latRef),
          longitude: convertDMSToDD(lng, lngRef),
          timestamp: parseEXIFDate(timestamp),
          file: file,
        });
      } else {
        resolve(null);
      }
    });
  });
};

// Cluster photos that are close together (within 100m)
const clusterPhotosByLocation = (photos) => {
  const clusters = [];
  const processed = new Set();

  photos.forEach((photo) => {
    if (processed.has(photo.id)) return;

    const cluster = {
      id: Math.random().toString(36),
      latitude: photo.latitude,
      longitude: photo.longitude,
      photos: [photo],
    };

    // Find nearby photos
    photos.forEach((otherPhoto) => {
      if (processed.has(otherPhoto.id)) return;
      if (photo.id === otherPhoto.id) return;

      const distance = calculateDistance(
        photo.latitude,
        photo.longitude,
        otherPhoto.latitude,
        otherPhoto.longitude
      );

      // Group if within 100 meters
      if (distance < 0.1) {
        cluster.photos.push(otherPhoto);
        processed.add(otherPhoto.id);
      }
    });

    processed.add(photo.id);

    // Calculate cluster center (average)
    const avgLat = cluster.photos.reduce((sum, p) => sum + p.latitude, 0) / cluster.photos.length;
    const avgLng = cluster.photos.reduce((sum, p) => sum + p.longitude, 0) / cluster.photos.length;
    cluster.latitude = avgLat;
    cluster.longitude = avgLng;

    clusters.push(cluster);
  });

  return clusters;
};

// Convert DMS to Decimal Degrees
const convertDMSToDD = (dms, ref) => {
  const degrees = dms[0];
  const minutes = dms[1];
  const seconds = dms[2];
  let dd = degrees + minutes / 60 + seconds / 3600;
  if (ref === 'S' || ref === 'W') dd = dd * -1;
  return dd;
};

const parseEXIFDate = (exifDate) => {
  if (!exifDate) return new Date();
  const [date, time] = exifDate.split(' ');
  const [year, month, day] = date.split(':');
  return new Date(`${year}-${month}-${day}T${time}`);
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
```

---

### 3. Illustrated Map View

```jsx
const IllustratedPhotoMap = ({ photoClusters }) => {
  const [selectedCluster, setSelectedCluster] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // Initialize Mapbox with custom illustrated style
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/outdoors-v12', // Or custom illustrated style
      center: [-87.47, 20.2], // Tulum center
      zoom: 12,
      pitch: 0,
    });

    // Add custom illustrated elements
    map.on('load', () => {
      // Add illustrated background layers
      addIllustratedLayers(map);

      // Add photo cluster markers
      photoClusters.forEach((cluster) => {
        addClusterMarker(map, cluster, setSelectedCluster);
      });
    });

    return () => map.remove();
  }, [photoClusters]);

  return (
    <div style={{
      position: 'relative',
      height: '100vh',
      background: '#E0F7FA',
    }}>
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, transparent 100%)',
        zIndex: 10,
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          margin: '0 0 8px 0',
          background: 'linear-gradient(135deg, #0099CC 0%, #00CED1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '2px 2px 4px rgba(255,255,255,0.8)',
        }}>
          🎨 My Tulum Adventures
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666',
          margin: 0,
          fontWeight: '600',
        }}>
          {photoClusters.reduce((sum, c) => sum + c.photos.length, 0)} photos • {photoClusters.length} locations
        </p>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />

      {/* Photo Viewer Modal */}
      {selectedCluster && (
        <PhotoClusterViewer
          cluster={selectedCluster}
          onClose={() => setSelectedCluster(null)}
        />
      )}

      {/* Decorative elements */}
      <MapDecorations />
    </div>
  );
};

// Add custom illustrated marker
const addClusterMarker = (map, cluster, onSelect) => {
  const el = document.createElement('div');
  el.style.width = '60px';
  el.style.height = '60px';
  el.style.cursor = 'pointer';
  el.style.position = 'relative';
  el.style.transition = 'all 0.3s';

  // Create illustrated pin with photo count
  el.innerHTML = `
    <div style="
      position: relative;
      width: 100%;
      height: 100%;
    ">
      <!-- Pin shape (SVG) -->
      <svg width="60" height="60" viewBox="0 0 60 60" style="
        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
      ">
        <path d="M30 5 C 18 5, 10 13, 10 25 C 10 40, 30 55, 30 55 C 30 55, 50 40, 50 25 C 50 13, 42 5, 30 5 Z" 
              fill="#00CED1" 
              stroke="#FFF" 
              stroke-width="3"/>
      </svg>
      
      <!-- Photo count badge -->
      <div style="
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        background: #FFF;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 800;
        color: #00CED1;
        border: 3px solid #00CED1;
      ">
        📸${cluster.photos.length}
      </div>
    </div>
  `;

  // Hover effect
  el.addEventListener('mouseenter', () => {
    el.style.transform = 'scale(1.2) translateY(-5px)';
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = 'scale(1) translateY(0)';
  });

  // Click to view photos
  el.addEventListener('click', () => {
    onSelect(cluster);
  });

  new mapboxgl.Marker(el)
    .setLngLat([cluster.longitude, cluster.latitude])
    .addTo(map);
};

// Illustrated map decorations
const MapDecorations = () => (
  <>
    {/* Ocean waves illustration */}
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '120px',
      background: 'linear-gradient(to top, rgba(0, 206, 209, 0.2), transparent)',
      pointerEvents: 'none',
      zIndex: 1,
    }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', bottom: 0 }}>
        <path
          d="M0,50 Q25,30 50,50 T100,50 T150,50 T200,50 T250,50 T300,50 T350,50 T400,50 T450,50 T500,50 L500,120 L0,120 Z"
          fill="rgba(0, 206, 209, 0.15)"
        />
      </svg>
    </div>

    {/* Decorative palm trees */}
    <div style={{
      position: 'absolute',
      top: '100px',
      right: '40px',
      fontSize: '48px',
      opacity: 0.3,
      pointerEvents: 'none',
      zIndex: 1,
      filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))',
    }}>
      🌴
    </div>
  </>
);
```

---

### 4. Photo Cluster Viewer

```jsx
const PhotoClusterViewer = ({ cluster, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentPhoto = cluster.photos[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + cluster.photos.length) % cluster.photos.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % cluster.photos.length);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          zIndex: 998,
          backdropFilter: 'blur(10px)',
        }}
      />

      {/* Viewer */}
      <div style={{
        position: 'fixed',
        inset: '20px',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Header */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#FFF',
          }}>
            📍 {cluster.photos.length} photos at this location
          </div>

          <button
            onClick={onClose}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              color: '#FFF',
              fontSize: '24px',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            ✕
          </button>
        </div>

        {/* Main Photo */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          position: 'relative',
        }}>
          {/* Previous button */}
          {cluster.photos.length > 1 && (
            <button
              onClick={handlePrev}
              style={{
                position: 'absolute',
                left: '20px',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                zIndex: 10,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              }}
            >
              ←
            </button>
          )}

          {/* Photo */}
          <img
            src={currentPhoto.imageUrl}
            alt={currentPhoto.filename}
            style={{
              maxWidth: '90%',
              maxHeight: '70vh',
              objectFit: 'contain',
              borderRadius: '16px',
              boxShadow: '0 16px 64px rgba(0, 0, 0, 0.5)',
            }}
          />

          {/* Next button */}
          {cluster.photos.length > 1 && (
            <button
              onClick={handleNext}
              style={{
                position: 'absolute',
                right: '20px',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                zIndex: 10,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              }}
            >
              →
            </button>
          )}

          {/* Counter */}
          {cluster.photos.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '8px 16px',
              borderRadius: '20px',
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(20px)',
              color: '#FFF',
              fontSize: '14px',
              fontWeight: '700',
            }}>
              {currentIndex + 1} / {cluster.photos.length}
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {cluster.photos.length > 1 && (
          <div style={{
            padding: '20px',
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            maxWidth: '100%',
            scrollbarWidth: 'thin',
          }}>
            {cluster.photos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => setCurrentIndex(index)}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '12px',
                  backgroundImage: `url(${photo.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  cursor: 'pointer',
                  border: index === currentIndex
                    ? '3px solid #00CED1'
                    : '3px solid transparent',
                  opacity: index === currentIndex ? 1 : 0.6,
                  transition: 'all 0.3s',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  if (index !== currentIndex) {
                    e.currentTarget.style.opacity = '0.6';
                  }
                }}
              />
            ))}
          </div>
        )}

        {/* Photo info */}
        <div style={{
          padding: '16px',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          color: '#FFF',
          fontSize: '14px',
          textAlign: 'center',
          marginTop: '16px',
        }}>
          {currentPhoto.timestamp && (
            <div>📅 {currentPhoto.timestamp.toLocaleString()}</div>
          )}
        </div>
      </div>
    </>
  );
};
```

---

## Browser APIs Used

### File System Access API
```javascript
// Request directory access
const dirHandle = await window.showDirectoryPicker({
  mode: 'read',
  startIn: 'pictures' // Start in user's Pictures folder
});

// Supported in:
// ✅ Chrome/Edge 86+
// ✅ Safari 15.2+
// ❌ Firefox (not yet)
```

### Fallback for Unsupported Browsers
```javascript
// Use traditional file input
<input
  type="file"
  multiple
  accept="image/*"
  webkitdirectory  // Allow folder selection
  onChange={handleFiles}
/>
```

---

## Custom Illustrated Map Style

### Option 1: Mapbox Studio
Create custom illustrated style:
- Watercolor ocean
- Hand-drawn roads
- Illustrated landmarks
- Playful colors

### Option 2: SVG Overlay
```javascript
// Add illustrated SVG layer on top of map
const illustratedLayer = `
  <svg>
    <!-- Ocean waves -->
    <path d="..." fill="#B3E5FC" />
    
    <!-- Beach areas -->
    <path d="..." fill="#FFE082" />
    
    <!-- Jungle -->
    <path d="..." fill="#C8E6C9" />
  </svg>
`;
```

---

## Performance Considerations

### Lazy Loading
```javascript
// Don't load all photo URLs at once
const photos = clusters.map(c => ({
  ...c,
  photos: c.photos.map(p => ({
    ...p,
    imageUrl: null, // Load on demand
  }))
}));

// Load when cluster is clicked
const loadClusterPhotos = async (cluster) => {
  return Promise.all(
    cluster.photos.map(async (photo) => ({
      ...photo,
      imageUrl: URL.createObjectURL(photo.file)
    }))
  );
};
```

### Web Workers
```javascript
// Process photos in background thread
const worker = new Worker('photo-processor.js');
worker.postMessage({ files });
worker.onmessage = (e) => {
  setPhotoClusters(e.data);
};
```

---

## Success Metrics

- Scanning completion: >90%
- Photos with GPS: 60-80%
- Clustering accuracy: >95%
- User delight: 🤯 (priceless)

This feature would be INCREDIBLE! 🗺️📸✨
