# Map Search Bar - Complete Implementation

## Overview
Add a powerful search bar to your Tulum map with autocomplete, category filtering, and smart suggestions.

---

## Solution 1: Floating Search Bar (Recommended)

### Complete Component

```jsx
import React, { useState, useEffect, useRef } from 'react';

const MapSearchBar = ({ 
  places = [], 
  onSelectPlace,
  onSearch,
  mapRef 
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);

  // Search categories for quick filters
  const categories = [
    { id: 'beach_clubs', label: 'Beach Clubs', icon: '🏖️', color: '#FF9966' },
    { id: 'restaurants', label: 'Restaurants', icon: '🍽️', color: '#50C878' },
    { id: 'cenotes', label: 'Cenotes', icon: '💧', color: '#4DD0E1' },
    { id: 'coffee', label: 'Coffee', icon: '☕', color: '#8B4513' },
    { id: 'cultural', label: 'Cultural', icon: '🏛️', color: '#9370DB' },
  ];

  // Popular searches
  const popularSearches = [
    { query: 'beach clubs', icon: '🏖️', category: 'beach_clubs' },
    { query: 'cenotes near me', icon: '💧', category: 'cenotes' },
    { query: 'vegan restaurants', icon: '🌱', category: 'restaurants' },
    { query: 'coffee shops', icon: '☕', category: 'coffee' },
    { query: 'ruins', icon: '🏛️', category: 'cultural' },
  ];

  // Search logic
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const filtered = places.filter(place => {
      const searchTerm = query.toLowerCase();
      return (
        place.name.toLowerCase().includes(searchTerm) ||
        place.category.toLowerCase().includes(searchTerm) ||
        place.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        place.description?.toLowerCase().includes(searchTerm)
      );
    });

    // Sort by relevance
    const sorted = filtered.sort((a, b) => {
      const aStartsWith = a.name.toLowerCase().startsWith(query.toLowerCase());
      const bStartsWith = b.name.toLowerCase().startsWith(query.toLowerCase());
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      return 0;
    });

    setSuggestions(sorted.slice(0, 8)); // Max 8 suggestions
  }, [query, places]);

  // Handle search submission
  const handleSearch = (searchQuery) => {
    if (onSearch) {
      onSearch(searchQuery);
    }
    setShowSuggestions(false);
    setQuery(searchQuery);
  };

  // Handle place selection
  const handleSelectPlace = (place) => {
    setQuery(place.name);
    setShowSuggestions(false);
    
    if (onSelectPlace) {
      onSelectPlace(place);
    }

    // Fly to location on map
    if (mapRef?.current) {
      mapRef.current.flyTo({
        center: [place.lng, place.lat],
        zoom: 15,
        duration: 1500
      });
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectPlace(suggestions[selectedIndex]);
        } else {
          handleSearch(query);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={searchRef}
      style={{
        position: 'absolute',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '500px',
        zIndex: 1000,
      }}
    >
      {/* Search Input */}
      <div style={{
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.98)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        border: '2px solid rgba(0, 206, 209, 0.3)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '14px 16px',
          gap: '12px',
        }}>
          {/* Search Icon */}
          <span style={{ fontSize: '20px' }}>🔍</span>

          {/* Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search beaches, restaurants, cenotes..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              fontWeight: '500',
              background: 'transparent',
              color: '#333',
            }}
          />

          {/* Clear Button */}
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSuggestions([]);
              }}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.1)',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Quick Filters */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '0 16px 12px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setQuery(cat.label);
                handleSearch(cat.label);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: 'none',
                background: `${cat.color}15`,
                color: cat.color,
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${cat.color}25`;
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${cat.color}15`;
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (query.length >= 2 || query.length === 0) && (
        <div style={{
          marginTop: '8px',
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          border: '2px solid rgba(0, 206, 209, 0.2)',
          backdropFilter: 'blur(20px)',
          maxHeight: '400px',
          overflowY: 'auto',
        }}>
          {/* Show suggestions if searching */}
          {query.length >= 2 && suggestions.length > 0 ? (
            <div style={{ padding: '8px 0' }}>
              <div style={{
                fontSize: '12px',
                fontWeight: '700',
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '8px 16px',
              }}>
                Places ({suggestions.length})
              </div>
              
              {suggestions.map((place, index) => (
                <SuggestionItem
                  key={place.id}
                  place={place}
                  isSelected={index === selectedIndex}
                  onClick={() => handleSelectPlace(place)}
                />
              ))}
            </div>
          ) : query.length >= 2 && suggestions.length === 0 ? (
            <div style={{
              padding: '32px 16px',
              textAlign: 'center',
              color: '#999',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>
                No results found
              </div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>
                Try searching for beaches, restaurants, or cenotes
              </div>
            </div>
          ) : (
            /* Show popular searches when not searching */
            <div style={{ padding: '8px 0' }}>
              <div style={{
                fontSize: '12px',
                fontWeight: '700',
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '8px 16px',
              }}>
                Popular Searches
              </div>
              
              {popularSearches.map((item, index) => (
                <PopularSearchItem
                  key={index}
                  item={item}
                  onClick={() => handleSearch(item.query)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Suggestion Item Component
const SuggestionItem = ({ place, isSelected, onClick }) => {
  const getCategoryColor = (category) => {
    const colors = {
      beach_clubs: '#FF9966',
      restaurants: '#50C878',
      cenotes: '#4DD0E1',
      coffee: '#8B4513',
      cultural: '#9370DB',
    };
    return colors[category] || '#00CED1';
  };

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '12px 16px',
        background: isSelected ? 'rgba(0, 206, 209, 0.08)' : 'transparent',
        border: 'none',
        borderLeft: isSelected ? '3px solid #00CED1' : '3px solid transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.2s',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = 'rgba(0, 206, 209, 0.04)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      {/* Icon */}
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: `${getCategoryColor(place.category)}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        flexShrink: 0,
      }}>
        {place.icon || '📍'}
      </div>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '15px',
          fontWeight: '600',
          color: '#333',
          marginBottom: '2px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {place.name}
        </div>
        <div style={{
          fontSize: '13px',
          color: '#666',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>{place.category}</span>
          {place.distance && (
            <>
              <span>•</span>
              <span>{place.distance}</span>
            </>
          )}
          {place.rating && (
            <>
              <span>•</span>
              <span>⭐ {place.rating}</span>
            </>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div style={{
        fontSize: '16px',
        color: '#999',
      }}>
        →
      </div>
    </button>
  );
};

// Popular Search Item Component
const PopularSearchItem = ({ item, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      padding: '12px 16px',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      transition: 'all 0.2s',
      textAlign: 'left',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgba(0, 206, 209, 0.04)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'transparent';
    }}
  >
    <div style={{
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      background: 'rgba(0, 206, 209, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
    }}>
      {item.icon}
    </div>
    <div style={{
      fontSize: '14px',
      fontWeight: '500',
      color: '#333',
    }}>
      {item.query}
    </div>
  </button>
);

export default MapSearchBar;
```

---

## Solution 2: Google Places Autocomplete Integration

For real address search and POI discovery:

```jsx
import React, { useEffect, useRef, useState } from 'react';

const GooglePlacesSearch = ({ onSelectPlace, mapRef }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (!window.google || !inputRef.current) return;

    // Initialize Google Places Autocomplete
    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        // Restrict to Tulum area
        bounds: {
          north: 20.2500,
          south: 20.1500,
          east: -87.4200,
          west: -87.5200,
        },
        strictBounds: true,
        componentRestrictions: { country: 'mx' },
        fields: ['name', 'geometry', 'place_id', 'formatted_address', 'types'],
      }
    );

    // Listen for place selection
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();

      if (!place.geometry) {
        console.log('No details available for this place');
        return;
      }

      const placeData = {
        name: place.name,
        address: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        placeId: place.place_id,
        types: place.types,
      };

      // Fly to location
      if (mapRef?.current) {
        mapRef.current.flyTo({
          center: [placeData.lng, placeData.lat],
          zoom: 16,
          duration: 1500,
        });
      }

      if (onSelectPlace) {
        onSelectPlace(placeData);
      }
    });
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Search Google Places..."
      style={{
        width: '100%',
        padding: '14px 16px',
        borderRadius: '12px',
        border: '2px solid rgba(0, 206, 209, 0.3)',
        fontSize: '15px',
        outline: 'none',
      }}
    />
  );
};
```

---

## Solution 3: Combined Search (Your Places + Google Places)

```jsx
const CombinedMapSearch = ({ 
  yourPlaces = [], 
  onSelectPlace,
  mapRef 
}) => {
  const [searchMode, setSearchMode] = useState('local'); // 'local' or 'google'
  const [query, setQuery] = useState('');

  return (
    <div style={{ position: 'relative' }}>
      {/* Mode Toggle */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '8px',
      }}>
        <button
          onClick={() => setSearchMode('local')}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '10px',
            background: searchMode === 'local' 
              ? 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)'
              : 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            color: searchMode === 'local' ? '#FFF' : '#333',
            fontWeight: '600',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          📍 Curated Places
        </button>
        <button
          onClick={() => setSearchMode('google')}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '10px',
            background: searchMode === 'google'
              ? 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)'
              : 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            color: searchMode === 'google' ? '#FFF' : '#333',
            fontWeight: '600',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          🌐 All Places
        </button>
      </div>

      {/* Search Input */}
      {searchMode === 'local' ? (
        <MapSearchBar 
          places={yourPlaces}
          onSelectPlace={onSelectPlace}
          mapRef={mapRef}
        />
      ) : (
        <GooglePlacesSearch
          onSelectPlace={onSelectPlace}
          mapRef={mapRef}
        />
      )}
    </div>
  );
};
```

---

## Solution 4: Mobile-Optimized Search

```jsx
const MobileMapSearch = ({ places, onSelectPlace }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Compact Search Button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            right: '16px',
            padding: '14px 16px',
            background: 'rgba(255, 255, 255, 0.98)',
            borderRadius: '12px',
            border: '2px solid rgba(0, 206, 209, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          }}
        >
          <span style={{ fontSize: '20px' }}>🔍</span>
          <span style={{
            fontSize: '15px',
            color: '#999',
            fontWeight: '500',
          }}>
            Search places...
          </span>
        </button>
      )}

      {/* Expanded Search */}
      {isExpanded && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#FFF',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          }}>
            <button
              onClick={() => setIsExpanded(false)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.05)',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
              }}
            >
              ←
            </button>
            
            <input
              type="text"
              placeholder="Search beaches, restaurants..."
              autoFocus
              style={{
                flex: 1,
                border: 'none',
                fontSize: '16px',
                outline: 'none',
              }}
            />
          </div>

          {/* Search Results */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
          }}>
            {/* Results go here */}
          </div>
        </div>
      )}
    </>
  );
};
```

---

## Integration Example

```jsx
// In your Map component
const MapWithSearch = () => {
  const mapRef = useRef(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
    
    // Add marker
    new mapboxgl.Marker({ color: '#00CED1' })
      .setLngLat([place.lng, place.lat])
      .setPopup(
        new mapboxgl.Popup().setHTML(`
          <strong>${place.name}</strong><br>
          ${place.category}
        `)
      )
      .addTo(mapRef.current);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* Map */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Search Bar */}
      <MapSearchBar
        places={allPlaces}
        onSelectPlace={handleSelectPlace}
        mapRef={mapRef}
      />
    </div>
  );
};
```

---

## Features Included

✅ **Autocomplete suggestions** as you type
✅ **Category quick filters** (one-tap)
✅ **Popular searches** when idle
✅ **Keyboard navigation** (arrow keys, enter, escape)
✅ **Clear button** to reset search
✅ **Click outside** to close
✅ **Fly to location** on selection
✅ **No results** state
✅ **Mobile-optimized** version
✅ **Loading states**
✅ **Google Places** integration option

Use Solution 1 for the best experience! 🗺️🔍
