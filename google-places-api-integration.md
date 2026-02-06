# Google Places API Integration for Tulum Discovery App

## Overview
Google Places API can provide rich data including reviews, photos, ratings, hours, and more for places in Tulum. This guide covers implementation, search strategies, and accessing photos/reviews.

---

## 1. Google Places API Setup

### Step 1: Get API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - **Places API (New)** - Recommended
   - **Places API** - Legacy (still works)
   - **Maps JavaScript API** - For map display
4. Create credentials → API Key
5. Restrict API key:
   - HTTP referrers: `yourdomain.com/*`, `localhost:*`
   - API restrictions: Select only the APIs you enabled

### Step 2: Install Dependencies

```bash
npm install @googlemaps/google-maps-services-js
# or
npm install axios
```

---

## 2. Search Strategies for Tulum

### Option A: Lat/Long + Radius (RECOMMENDED)

This is the most precise method for Tulum:

```javascript
// Tulum center coordinates
const TULUM_CENTER = {
  lat: 20.2114,
  lng: -87.4654
};

// Radius in meters (10km covers most of Tulum)
const TULUM_RADIUS = 10000; // 10km

// Search configuration
const searchConfig = {
  location: `${TULUM_CENTER.lat},${TULUM_CENTER.lng}`,
  radius: TULUM_RADIUS,
  type: 'restaurant', // or 'bar', 'night_club', 'tourist_attraction'
  keyword: 'beach club',
  language: 'en'
};
```

### Option B: Text Search with Location Bias

```javascript
const searchQuery = {
  query: 'beach clubs in Tulum',
  location: `${TULUM_CENTER.lat},${TULUM_CENTER.lng}`,
  radius: TULUM_RADIUS,
};
```

### Option C: Rectangular Bounds (Most Accurate)

Define a bounding box around Tulum:

```javascript
// Tulum bounding box
const TULUM_BOUNDS = {
  north: 20.2500,  // Northern edge
  south: 20.1500,  // Southern edge (beach area)
  east: -87.4200,  // Eastern edge (beach)
  west: -87.5200   // Western edge (inland)
};

const searchConfig = {
  query: 'restaurants',
  location: {
    bounds: TULUM_BOUNDS
  }
};
```

---

## 3. Backend API Implementation (Node.js/Express)

### Setup Backend Server

```javascript
// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const TULUM_CENTER = { lat: 20.2114, lng: -87.4654 };
const TULUM_RADIUS = 10000;

// Endpoint 1: Search Places (Nearby Search)
app.get('/api/places/nearby', async (req, res) => {
  try {
    const { type, keyword } = req.query;
    
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
      {
        params: {
          location: `${TULUM_CENTER.lat},${TULUM_CENTER.lng}`,
          radius: TULUM_RADIUS,
          type: type || 'restaurant',
          keyword: keyword || '',
          key: GOOGLE_PLACES_API_KEY,
          language: 'en'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Places API Error:', error);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
});

// Endpoint 2: Get Place Details (includes reviews & photos)
app.get('/api/places/details/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;
    
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/details/json',
      {
        params: {
          place_id: placeId,
          fields: 'name,formatted_address,geometry,photos,reviews,rating,user_ratings_total,opening_hours,website,formatted_phone_number,price_level,types',
          key: GOOGLE_PLACES_API_KEY,
          language: 'en'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Place Details API Error:', error);
    res.status(500).json({ error: 'Failed to fetch place details' });
  }
});

// Endpoint 3: Get Place Photo
app.get('/api/places/photo/:photoReference', async (req, res) => {
  try {
    const { photoReference } = req.params;
    const { maxwidth = 400 } = req.query;
    
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
    
    res.json({ photoUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate photo URL' });
  }
});

// Endpoint 4: Text Search (more flexible)
app.get('/api/places/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/textsearch/json',
      {
        params: {
          query: `${query} in Tulum`,
          location: `${TULUM_CENTER.lat},${TULUM_CENTER.lng}`,
          radius: TULUM_RADIUS,
          key: GOOGLE_PLACES_API_KEY,
          language: 'en'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search places' });
  }
});

// Endpoint 5: Find Place by Phone or Name
app.get('/api/places/find', async (req, res) => {
  try {
    const { input, inputtype } = req.query; // inputtype: 'textquery' or 'phonenumber'
    
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/findplacefromtext/json',
      {
        params: {
          input: input,
          inputtype: inputtype || 'textquery',
          fields: 'place_id,name,geometry,photos,rating',
          locationbias: `circle:${TULUM_RADIUS}@${TULUM_CENTER.lat},${TULUM_CENTER.lng}`,
          key: GOOGLE_PLACES_API_KEY
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to find place' });
  }
});

app.listen(3001, () => {
  console.log('Places API server running on port 3001');
});
```

---

## 4. Frontend React Implementation

### Service Layer

```javascript
// services/placesService.js
const API_BASE_URL = 'http://localhost:3001/api';

class PlacesService {
  // Fetch nearby places
  async getNearbyPlaces(type = 'restaurant', keyword = '') {
    try {
      const response = await fetch(
        `${API_BASE_URL}/places/nearby?type=${type}&keyword=${encodeURIComponent(keyword)}`
      );
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      return [];
    }
  }

  // Get detailed place information
  async getPlaceDetails(placeId) {
    try {
      const response = await fetch(`${API_BASE_URL}/places/details/${placeId}`);
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  }

  // Get photo URL
  getPhotoUrl(photoReference, maxWidth = 400) {
    return `${API_BASE_URL}/places/photo/${photoReference}?maxwidth=${maxWidth}`;
  }

  // Search places by text
  async searchPlaces(query) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/places/search?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  // Get multiple categories at once
  async getAllCategories() {
    const categories = [
      { type: 'restaurant', keyword: 'beach club' },
      { type: 'restaurant', keyword: '' },
      { type: 'tourist_attraction', keyword: 'cenote' },
      { type: 'night_club', keyword: '' },
      { type: 'bar', keyword: '' }
    ];

    const results = await Promise.all(
      categories.map(({ type, keyword }) => this.getNearbyPlaces(type, keyword))
    );

    return {
      beachClubs: results[0],
      restaurants: results[1],
      cenotes: results[2],
      nightclubs: results[3],
      bars: results[4]
    };
  }
}

export default new PlacesService();
```

### React Component Integration

```jsx
// components/PlacesMap.jsx
import React, { useState, useEffect } from 'react';
import placesService from '../services/placesService';

const PlacesMap = () => {
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeDetails, setPlaceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('beachClubs');

  // Load places on mount
  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    setLoading(true);
    try {
      // Load all categories
      const data = await placesService.getAllCategories();
      setPlaces(data);
    } catch (error) {
      console.error('Error loading places:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load detailed info when place is clicked
  const handlePlaceClick = async (place) => {
    setSelectedPlace(place);
    
    // Fetch full details including reviews and photos
    const details = await placesService.getPlaceDetails(place.place_id);
    setPlaceDetails(details);
  };

  // Search function
  const handleSearch = async (query) => {
    setLoading(true);
    const results = await placesService.searchPlaces(query);
    setPlaces({ searchResults: results });
    setActiveCategory('searchResults');
    setLoading(false);
  };

  return (
    <div className="places-map">
      {/* Search bar */}
      <SearchBar onSearch={handleSearch} />

      {/* Category filters */}
      <CategoryFilters 
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        placeCounts={{
          beachClubs: places.beachClubs?.length || 0,
          restaurants: places.restaurants?.length || 0,
          cenotes: places.cenotes?.length || 0,
        }}
      />

      {/* Map with markers */}
      <Map
        places={places[activeCategory] || []}
        onPlaceClick={handlePlaceClick}
      />

      {/* Place details popup */}
      {placeDetails && (
        <PlaceDetailsPopup
          place={placeDetails}
          onClose={() => {
            setSelectedPlace(null);
            setPlaceDetails(null);
          }}
        />
      )}
    </div>
  );
};

export default PlacesMap;
```

---

## 5. Accessing Reviews and Photos

### Place Details Response Structure

```javascript
// Example response from Place Details API
{
  "result": {
    "name": "La Guarida",
    "formatted_address": "Avenida Tulum, Tulum, Q.R., Mexico",
    "geometry": {
      "location": { "lat": 20.2114, "lng": -87.4654 }
    },
    "rating": 4.6,
    "user_ratings_total": 234,
    "price_level": 2, // 0-4 scale
    
    // PHOTOS ARRAY
    "photos": [
      {
        "photo_reference": "AeJBBa...", // Use this to fetch actual photo
        "height": 3024,
        "width": 4032,
        "html_attributions": ["<a href=\"...\">Contributor Name</a>"]
      }
      // ... more photos
    ],
    
    // REVIEWS ARRAY
    "reviews": [
      {
        "author_name": "John Doe",
        "author_url": "https://www.google.com/maps/contrib/...",
        "profile_photo_url": "https://lh3.googleusercontent.com/...",
        "rating": 5,
        "relative_time_description": "2 months ago",
        "text": "Amazing place! Great music and atmosphere...",
        "time": 1640000000,
        "language": "en"
      }
      // ... more reviews (up to 5 most relevant)
    ],
    
    "opening_hours": {
      "open_now": true,
      "weekday_text": [
        "Monday: 5:00 PM – 2:00 AM",
        "Tuesday: 5:00 PM – 2:00 AM",
        // ...
      ]
    },
    
    "website": "https://laguarida.com",
    "formatted_phone_number": "+52 984 123 4567",
    "types": ["bar", "restaurant", "point_of_interest"]
  }
}
```

### Display Photos Component

```jsx
// components/PlacePhotos.jsx
const PlacePhotos = ({ photos }) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return <div className="no-photos">No photos available</div>;
  }

  return (
    <div className="place-photos">
      {/* Main photo */}
      <div className="main-photo">
        <img
          src={placesService.getPhotoUrl(photos[selectedPhotoIndex].photo_reference, 800)}
          alt="Place"
          style={{
            width: '100%',
            height: '400px',
            objectFit: 'cover',
            borderRadius: '16px',
          }}
        />
        
        {/* Photo counter */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '6px 12px',
          borderRadius: '20px',
          color: 'white',
          fontSize: '13px',
          fontWeight: '600',
        }}>
          {selectedPhotoIndex + 1} / {photos.length}
        </div>
      </div>

      {/* Photo thumbnails */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '12px',
        overflowX: 'auto',
        paddingBottom: '8px',
      }}>
        {photos.map((photo, index) => (
          <img
            key={index}
            src={placesService.getPhotoUrl(photo.photo_reference, 150)}
            alt={`Thumbnail ${index + 1}`}
            onClick={() => setSelectedPhotoIndex(index)}
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'cover',
              borderRadius: '8px',
              cursor: 'pointer',
              border: selectedPhotoIndex === index ? '3px solid #00D4D4' : '3px solid transparent',
              transition: 'all 0.2s',
            }}
          />
        ))}
      </div>
    </div>
  );
};
```

### Display Reviews Component

```jsx
// components/PlaceReviews.jsx
const PlaceReviews = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return <div className="no-reviews">No reviews yet</div>;
  }

  // Sort by rating (highest first)
  const sortedReviews = [...reviews].sort((a, b) => b.rating - a.rating);

  return (
    <div className="place-reviews">
      <h3 style={{
        fontSize: '18px',
        fontWeight: '700',
        color: '#FFF',
        marginBottom: '16px',
      }}>
        Reviews ({reviews.length})
      </h3>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {sortedReviews.map((review, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Reviewer info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
            }}>
              <img
                src={review.profile_photo_url}
                alt={review.author_name}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
              
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: '600',
                  color: '#FFF',
                  fontSize: '15px',
                }}>
                  {review.author_name}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}>
                  {review.relative_time_description}
                </div>
              </div>

              {/* Star rating */}
              <div style={{
                display: 'flex',
                gap: '2px',
              }}>
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    style={{
                      color: i < review.rating ? '#FFD700' : 'rgba(255, 255, 255, 0.2)',
                      fontSize: '16px',
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            {/* Review text */}
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '14px',
              lineHeight: '1.6',
              margin: 0,
            }}>
              {review.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 6. Complete Place Details Modal with Photos & Reviews

```jsx
// components/PlaceDetailsModal.jsx
const PlaceDetailsModal = ({ placeDetails, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, photos, reviews

  if (!placeDetails) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(10, 4, 4, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          width: '90%',
          maxWidth: '700px',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            border: 'none',
            color: '#FFF',
            fontSize: '20px',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          ✕
        </button>

        {/* Header with cover photo */}
        <div style={{
          position: 'relative',
          height: '250px',
          background: placeDetails.photos?.[0] 
            ? `url(${placesService.getPhotoUrl(placeDetails.photos[0].photo_reference, 800)})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '24px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
          }}>
            <h2 style={{
              color: '#FFD700',
              fontSize: '28px',
              fontWeight: '700',
              margin: '0 0 8px 0',
            }}>
              {placeDetails.name}
            </h2>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}>
              {/* Rating */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span style={{ color: '#FFD700', fontSize: '18px' }}>★</span>
                <span style={{ color: '#FFF', fontWeight: '600' }}>
                  {placeDetails.rating}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                  ({placeDetails.user_ratings_total} reviews)
                </span>
              </div>

              {/* Price level */}
              {placeDetails.price_level && (
                <div style={{ color: '#50C878', fontWeight: '600' }}>
                  {'$'.repeat(placeDetails.price_level)}
                </div>
              )}

              {/* Open/Closed status */}
              {placeDetails.opening_hours && (
                <div style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  background: placeDetails.opening_hours.open_now 
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(239, 68, 68, 0.2)',
                  border: `1px solid ${placeDetails.opening_hours.open_now ? '#10B981' : '#EF4444'}`,
                  color: placeDetails.opening_hours.open_now ? '#10B981' : '#EF4444',
                  fontSize: '13px',
                  fontWeight: '600',
                }}>
                  {placeDetails.opening_hours.open_now ? 'Open Now' : 'Closed'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '0 24px',
          background: 'rgba(0, 0, 0, 0.3)',
        }}>
          {['overview', 'photos', 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '16px 20px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '3px solid #00D4D4' : '3px solid transparent',
                color: activeTab === tab ? '#FFF' : 'rgba(255,255,255,0.6)',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'capitalize',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab}
              {tab === 'photos' && placeDetails.photos && ` (${placeDetails.photos.length})`}
              {tab === 'reviews' && placeDetails.reviews && ` (${placeDetails.reviews.length})`}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
        }}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              {/* Address */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.5)',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Address
                </div>
                <div style={{ color: '#FFF', fontSize: '15px' }}>
                  {placeDetails.formatted_address}
                </div>
              </div>

              {/* Contact info */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.5)',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Contact
                </div>
                {placeDetails.formatted_phone_number && (
                  <div style={{ color: '#FFF', fontSize: '15px', marginBottom: '8px' }}>
                    📞 {placeDetails.formatted_phone_number}
                  </div>
                )}
                {placeDetails.website && (
                  <a
                    href={placeDetails.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#00D4D4',
                      fontSize: '15px',
                      textDecoration: 'none',
                    }}
                  >
                    🌐 Visit Website →
                  </a>
                )}
              </div>

              {/* Hours */}
              {placeDetails.opening_hours?.weekday_text && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.5)',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Hours
                  </div>
                  {placeDetails.opening_hours.weekday_text.map((day, i) => (
                    <div key={i} style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '14px',
                      marginBottom: '4px',
                    }}>
                      {day}
                    </div>
                  ))}
                </div>
              )}

              {/* Quick actions */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                marginTop: '24px',
              }}>
                <ActionButton
                  href={placeDetails.website}
                  icon="🌐"
                  label="Website"
                  color="#00D4D4"
                />
                <ActionButton
                  href={`tel:${placeDetails.formatted_phone_number}`}
                  icon="📞"
                  label="Call"
                  color="#4A90E2"
                />
                <ActionButton
                  href={`https://wa.me/${placeDetails.formatted_phone_number?.replace(/[^0-9]/g, '')}`}
                  icon="💬"
                  label="Chat"
                  color="#25D366"
                />
                <ActionButton
                  href={`https://www.google.com/maps/dir/?api=1&destination=${placeDetails.geometry.location.lat},${placeDetails.geometry.location.lng}`}
                  icon="🗺️"
                  label="Directions"
                  color="#FF9500"
                />
              </div>
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <PlacePhotos photos={placeDetails.photos} />
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <PlaceReviews reviews={placeDetails.reviews} />
          )}
        </div>
      </div>
    </>
  );
};

const ActionButton = ({ href, icon, label, color }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        padding: '16px',
        borderRadius: '12px',
        background: color,
        border: 'none',
        color: 'white',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        textDecoration: 'none',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <span style={{ fontSize: '24px' }}>{icon}</span>
      <span style={{ fontSize: '12px' }}>{label}</span>
    </a>
  );
};
```

---

## 7. Environment Variables (.env)

```bash
# Backend .env file
GOOGLE_PLACES_API_KEY=your_api_key_here
PORT=3001

# Optional: Tulum coordinates (if you want to make them configurable)
TULUM_LAT=20.2114
TULUM_LNG=-87.4654
TULUM_RADIUS=10000
```

---

## 8. API Pricing & Optimization

### Google Places API Pricing (as of 2024)

- **Nearby Search**: $32 per 1000 requests
- **Text Search**: $32 per 1000 requests
- **Place Details**: $17 per 1000 requests (Basic), $17 per 1000 (Contact), $3 per 1000 (Atmosphere)
- **Place Photos**: $7 per 1000 requests

### Optimization Strategies

```javascript
// 1. Cache results in backend
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

app.get('/api/places/nearby', async (req, res) => {
  const cacheKey = `nearby_${req.query.type}_${req.query.keyword}`;
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }
  
  // Fetch from API
  const response = await axios.get(/* ... */);
  
  // Store in cache
  cache.set(cacheKey, response.data);
  
  res.json(response.data);
});

// 2. Batch requests
async function batchLoadPlaces() {
  const types = ['restaurant', 'bar', 'tourist_attraction'];
  const results = await Promise.all(
    types.map(type => fetchPlaces(type))
  );
  return results;
}

// 3. Use pagination wisely
// Places API returns 20 results per request
// Use pagetoken for next 20 results only when needed

// 4. Limit photo requests
// Only fetch photos when user clicks on a place
// Use smaller maxwidth for thumbnails (150px)
```

---

## 9. Alternative: Use Places API (New) - Text Search

The new Places API has better features:

```javascript
// New API endpoint (more powerful)
app.post('/api/places/search-new', async (req, res) => {
  try {
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      {
        textQuery: 'beach clubs in Tulum',
        locationBias: {
          circle: {
            center: {
              latitude: 20.2114,
              longitude: -87.4654
            },
            radius: 10000.0
          }
        },
        languageCode: 'en',
        maxResultCount: 20,
        rankPreference: 'DISTANCE' // or 'RELEVANCE'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.photos,places.location'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('New Places API Error:', error);
    res.status(500).json({ error: 'Failed to search places' });
  }
});
```

---

## 10. Complete Integration Example

```javascript
// Complete working example
import React, { useState, useEffect } from 'react';
import placesService from './services/placesService';
import PlaceDetailsModal from './components/PlaceDetailsModal';

const TulumDiscoveryApp = () => {
  const [places, setPlaces] = useState({
    beachClubs: [],
    restaurants: [],
    cenotes: [],
  });
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllPlaces();
  }, []);

  const loadAllPlaces = async () => {
    setLoading(true);
    try {
      const beachClubs = await placesService.getNearbyPlaces('restaurant', 'beach club');
      const restaurants = await placesService.getNearbyPlaces('restaurant', '');
      const cenotes = await placesService.searchPlaces('cenotes');

      setPlaces({
        beachClubs,
        restaurants,
        cenotes,
      });
    } catch (error) {
      console.error('Error loading places:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = async (place) => {
    // Fetch full details with reviews and photos
    const details = await placesService.getPlaceDetails(place.place_id);
    setSelectedPlace(details);
  };

  return (
    <div className="app">
      {loading ? (
        <div>Loading places...</div>
      ) : (
        <>
          {/* Map with markers */}
          <Map
            places={[...places.beachClubs, ...places.restaurants, ...places.cenotes]}
            onMarkerClick={handleMarkerClick}
          />

          {/* Details modal with photos and reviews */}
          {selectedPlace && (
            <PlaceDetailsModal
              placeDetails={selectedPlace}
              onClose={() => setSelectedPlace(null)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default TulumDiscoveryApp;
```

---

## Summary

### ✅ Search Methods for Tulum:
1. **Lat/Long + Radius** (20.2114, -87.4654 + 10km) - Most accurate
2. **Bounding Box** - Most precise for area coverage
3. **Text Search with bias** - Most flexible

### ✅ Accessing Data:
- **Photos**: Via `photo_reference` → photo URL endpoint
- **Reviews**: Included in Place Details (up to 5 most relevant)
- **Ratings**: Available in both search and details
- **Hours, Phone, Website**: Available in Place Details

### ✅ Best Practices:
- Cache API responses (1 hour)
- Batch requests when possible
- Load details only on user click
- Use smaller photo sizes for thumbnails
- Implement proper error handling

Feed this to Cursor to integrate Google Places API with full photo gallery and reviews functionality!
