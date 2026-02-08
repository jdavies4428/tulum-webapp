# Feature: Favorites & Lists System

## Overview
Allow users to save places, organize them into custom lists, and share their discoveries with friends. Includes quick favorite button, list management, and export to Google Maps.

---

## User Story
**As a** tourist planning my Tulum trip  
**I want to** save and organize places I want to visit  
**So that** I can easily find them later and plan my itinerary

---

## Design Specifications

### Visual Layout

```
┌─────────────────────────────────────────┐
│  ⭐ My Favorites                    [+] │
├─────────────────────────────────────────┤
│                                         │
│  📋 My Lists (3)                        │
│  ┌─────────────────────────────────┐   │
│  │  ❤️  Must Visit          12     │   │
│  │  Azulik, Cenote Dos Ojos...    │   │
│  ├─────────────────────────────────┤   │
│  │  🍽️  Food Spots          8      │   │
│  │  Hartwood, Kitchen Table...    │   │
│  ├─────────────────────────────────┤   │
│  │  💑  Date Night          5      │   │
│  │  Kin Toh, Casa Jaguar...       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  📍 All Saved Places (25)               │
│  ┌─────────────────────────────────┐   │
│  │  [🏖️] Azulik              ❤️   │   │
│  │      Beach Club • 4.2km         │   │
│  │      Lists: Must Visit          │   │
│  ├─────────────────────────────────┤   │
│  │  [💧] Cenote Dos Ojos     ❤️   │   │
│  │      Cenote • 15.3km            │   │
│  │      Lists: Must Visit          │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Component Implementation

```jsx
import React, { useState, useEffect } from 'react';

const FavoritesSystem = () => {
  const [favorites, setFavorites] = useState([]);
  const [lists, setLists] = useState([]);
  const [showCreateList, setShowCreateList] = useState(false);
  const [selectedList, setSelectedList] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const savedLists = JSON.parse(localStorage.getItem('lists') || '[]');
    
    setFavorites(savedFavorites);
    setLists(savedLists.length > 0 ? savedLists : getDefaultLists());
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
    localStorage.setItem('lists', JSON.stringify(lists));
  }, [favorites, lists]);

  const getDefaultLists = () => [
    { id: '1', name: 'Must Visit', icon: '❤️', places: [] },
    { id: '2', name: 'Food Spots', icon: '🍽️', places: [] },
    { id: '3', name: 'Date Night', icon: '💑', places: [] },
  ];

  return (
    <div style={{
      padding: '24px',
      background: 'linear-gradient(180deg, #FFF8E7 0%, #FFFFFF 100%)',
      minHeight: '100vh',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '32px' }}>⭐</span>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '800',
            margin: 0,
            background: 'linear-gradient(135deg, #0099CC 0%, #00CED1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            My Favorites
          </h2>
        </div>

        <button
          onClick={() => setShowCreateList(true)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)',
            border: 'none',
            fontSize: '24px',
            color: '#FFF',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0, 206, 209, 0.3)',
          }}
        >
          +
        </button>
      </div>

      {/* Lists Section */}
      <ListsSection
        lists={lists}
        onSelectList={setSelectedList}
        onDeleteList={(listId) => {
          setLists(lists.filter(l => l.id !== listId));
        }}
      />

      {/* All Favorites */}
      <AllFavorites
        favorites={favorites}
        lists={lists}
        onRemove={(placeId) => {
          setFavorites(favorites.filter(f => f.id !== placeId));
        }}
      />

      {/* Create List Modal */}
      {showCreateList && (
        <CreateListModal
          onClose={() => setShowCreateList(false)}
          onCreate={(newList) => {
            setLists([...lists, { ...newList, id: Date.now().toString() }]);
            setShowCreateList(false);
          }}
        />
      )}

      {/* List Detail View */}
      {selectedList && (
        <ListDetailModal
          list={lists.find(l => l.id === selectedList)}
          onClose={() => setSelectedList(null)}
        />
      )}
    </div>
  );
};

export default FavoritesSystem;
```

---

## Heart Button Component (for place cards)

```jsx
const FavoriteButton = ({ place, size = 'medium' }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.some(f => f.id === place.id));
  }, [place.id]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (isFavorite) {
      // Remove from favorites
      const updated = favorites.filter(f => f.id !== place.id);
      localStorage.setItem('favorites', JSON.stringify(updated));
      setIsFavorite(false);
    } else {
      // Add to favorites
      const updated = [...favorites, place];
      localStorage.setItem('favorites', JSON.stringify(updated));
      setIsFavorite(true);
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 600);
    }

    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const sizes = {
    small: '32px',
    medium: '40px',
    large: '48px',
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite();
      }}
      style={{
        width: sizes[size],
        height: sizes[size],
        borderRadius: '50%',
        background: isFavorite
          ? 'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)'
          : 'rgba(255, 255, 255, 0.9)',
        border: isFavorite ? 'none' : '2px solid rgba(255, 107, 107, 0.3)',
        fontSize: size === 'small' ? '16px' : size === 'medium' ? '20px' : '24px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s',
        boxShadow: isFavorite
          ? '0 4px 16px rgba(255, 107, 107, 0.4)'
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
        animation: showAnimation ? 'heartBeat 0.6s' : 'none',
      }}
    >
      {isFavorite ? '❤️' : '🤍'}
      
      <style>{`
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.3); }
          30% { transform: scale(0.9); }
          45% { transform: scale(1.2); }
          60% { transform: scale(1); }
        }
      `}</style>
    </button>
  );
};

export default FavoriteButton;
```

---

## Lists Section Component

```jsx
const ListsSection = ({ lists, onSelectList, onDeleteList }) => (
  <div style={{
    marginBottom: '32px',
  }}>
    <h3 style={{
      fontSize: '18px',
      fontWeight: '700',
      marginBottom: '16px',
      color: '#333',
    }}>
      📋 My Lists ({lists.length})
    </h3>

    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '16px',
    }}>
      {lists.map((list) => (
        <ListCard
          key={list.id}
          list={list}
          onClick={() => onSelectList(list.id)}
          onDelete={() => onDeleteList(list.id)}
        />
      ))}
    </div>
  </div>
);

const ListCard = ({ list, onClick, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '20px',
        padding: '20px',
        border: '2px solid rgba(0, 206, 209, 0.2)',
        cursor: 'pointer',
        transition: 'all 0.3s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 206, 209, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Three-dot menu */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.05)',
          border: 'none',
          fontSize: '18px',
          cursor: 'pointer',
        }}
      >
        ⋯
      </button>

      {showMenu && (
        <div
          style={{
            position: 'absolute',
            top: '48px',
            right: '12px',
            background: '#FFF',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            zIndex: 10,
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Edit list
              setShowMenu(false);
            }}
            style={{
              width: '100%',
              padding: '12px 20px',
              background: 'transparent',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setShowMenu(false);
            }}
            style={{
              width: '100%',
              padding: '12px 20px',
              background: 'transparent',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: '#FF6B6B',
            }}
          >
            🗑️ Delete
          </button>
        </div>
      )}

      {/* List content */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #FFE4CC 0%, #FFD4B8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
        }}>
          {list.icon}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#333',
            marginBottom: '2px',
          }}>
            {list.name}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
          }}>
            {list.places.length} places
          </div>
        </div>
      </div>

      {/* Place previews */}
      {list.places.length > 0 && (
        <div style={{
          fontSize: '13px',
          color: '#999',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {list.places.slice(0, 3).map(p => p.name).join(', ')}
          {list.places.length > 3 && '...'}
        </div>
      )}
    </div>
  );
};
```

---

## Create List Modal

```jsx
const CreateListModal = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('❤️');

  const icons = [
    '❤️', '⭐', '🏖️', '🍽️', '💑', '👨‍👩‍👧', '🎉', '🌅',
    '💧', '🏛️', '☕', '🌴', '🎨', '🏄', '🧘', '📸'
  ];

  const handleCreate = () => {
    if (name.trim()) {
      onCreate({
        name: name.trim(),
        icon: selectedIcon,
        places: [],
        createdAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFF',
          borderRadius: '24px',
          padding: '32px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.2)',
        }}
      >
        <h3 style={{
          fontSize: '24px',
          fontWeight: '800',
          marginBottom: '24px',
          color: '#333',
        }}>
          Create New List
        </h3>

        {/* List name input */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#666',
            marginBottom: '8px',
            display: 'block',
          }}>
            List Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Romantic Spots"
            autoFocus
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: '2px solid rgba(0, 206, 209, 0.3)',
              fontSize: '16px',
              outline: 'none',
            }}
          />
        </div>

        {/* Icon selector */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#666',
            marginBottom: '12px',
            display: 'block',
          }}>
            Choose Icon
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gap: '8px',
          }}>
            {icons.map((icon) => (
              <button
                key={icon}
                onClick={() => setSelectedIcon(icon)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: selectedIcon === icon
                    ? 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)'
                    : 'rgba(0, 0, 0, 0.05)',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: 'rgba(0, 0, 0, 0.05)',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              color: '#666',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: name.trim()
                ? 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)'
                : 'rgba(0, 206, 209, 0.3)',
              border: 'none',
              fontSize: '16px',
              fontWeight: '700',
              color: '#FFF',
              cursor: name.trim() ? 'pointer' : 'not-allowed',
              boxShadow: name.trim() ? '0 4px 16px rgba(0, 206, 209, 0.3)' : 'none',
            }}
          >
            Create List
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## Add to List Modal

```jsx
const AddToListModal = ({ place, lists, onClose }) => {
  const [selectedLists, setSelectedLists] = useState([]);

  const toggleList = (listId) => {
    setSelectedLists(prev =>
      prev.includes(listId)
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
    );
  };

  const handleSave = () => {
    // Update lists with the place
    const updatedLists = lists.map(list => {
      if (selectedLists.includes(list.id)) {
        // Add place if not already in list
        if (!list.places.some(p => p.id === place.id)) {
          return {
            ...list,
            places: [...list.places, place],
          };
        }
      }
      return list;
    });

    localStorage.setItem('lists', JSON.stringify(updatedLists));
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFF',
          borderRadius: '24px 24px 0 0',
          padding: '24px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          marginBottom: '16px',
        }}>
          Add to List
        </h3>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '24px',
        }}>
          {lists.map((list) => (
            <button
              key={list.id}
              onClick={() => toggleList(list.id)}
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: selectedLists.includes(list.id)
                  ? 'rgba(0, 206, 209, 0.1)'
                  : 'rgba(0, 0, 0, 0.03)',
                border: selectedLists.includes(list.id)
                  ? '2px solid #00CED1'
                  : '2px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '24px' }}>{list.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#333',
                }}>
                  {list.name}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#666',
                }}>
                  {list.places.length} places
                </div>
              </div>
              {selectedLists.includes(list.id) && (
                <div style={{ fontSize: '20px', color: '#00CED1' }}>✓</div>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)',
            border: 'none',
            fontSize: '16px',
            fontWeight: '700',
            color: '#FFF',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0, 206, 209, 0.3)',
          }}
        >
          Save to Lists
        </button>
      </div>
    </div>
  );
};
```

---

## Export to Google Maps

```jsx
const exportToGoogleMaps = (places) => {
  // Create Google Maps URL with multiple waypoints
  const baseUrl = 'https://www.google.com/maps/dir/';
  
  const waypoints = places
    .map(place => `${place.lat},${place.lng}`)
    .join('/');
  
  const url = `${baseUrl}${waypoints}`;
  
  window.open(url, '_blank');
};

// Export Button Component
const ExportButton = ({ places }) => (
  <button
    onClick={() => exportToGoogleMaps(places)}
    style={{
      padding: '12px 20px',
      borderRadius: '12px',
      background: '#4285F4', // Google Maps blue
      border: 'none',
      color: '#FFF',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}
  >
    <span>🗺️</span>
    <span>Open in Google Maps</span>
  </button>
);
```

---

## Share List Feature

```jsx
const shareList = async (list) => {
  const shareData = {
    title: `${list.name} - Tulum`,
    text: `Check out my ${list.name} list for Tulum: ${list.places.map(p => p.name).join(', ')}`,
    url: `${window.location.origin}/shared-list/${list.id}`,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      console.log('Share cancelled');
    }
  } else {
    // Fallback: Copy link
    navigator.clipboard.writeText(shareData.url);
    alert('Link copied to clipboard!');
  }
};
```

---

## Features

✅ **Quick favorite** - Heart button on all place cards
✅ **Custom lists** - Create unlimited lists with icons
✅ **Organize places** - Add places to multiple lists
✅ **List previews** - See first 3 places in each list
✅ **Search favorites** - Find saved places quickly
✅ **Export to Google Maps** - Open route with all places
✅ **Share lists** - Send to friends via link
✅ **Persistent storage** - localStorage + optional cloud sync
✅ **Haptic feedback** - Vibration on mobile
✅ **Animations** - Heart beat on favorite

---

## Data Structure

```javascript
// Favorites
{
  id: 'azulik-1',
  name: 'Azulik',
  category: 'beach_clubs',
  lat: 20.2114,
  lng: -87.4654,
  savedAt: '2026-02-07T10:30:00Z'
}

// Lists
{
  id: '1',
  name: 'Must Visit',
  icon: '❤️',
  places: [...],
  createdAt: '2026-02-07T10:30:00Z',
  updatedAt: '2026-02-07T14:22:00Z'
}
```

---

## Testing Checklist

- [ ] Heart button toggles favorite status
- [ ] Favorites persist after page reload
- [ ] Create new list works
- [ ] Add place to multiple lists
- [ ] Delete list works
- [ ] Export to Google Maps works
- [ ] Share list generates link
- [ ] Heart animation plays
- [ ] Haptic feedback on mobile
- [ ] Search favorites works

**Estimated Implementation Time:** 8-10 hours
