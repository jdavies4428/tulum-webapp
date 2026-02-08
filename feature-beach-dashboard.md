# Feature: Beach Conditions Dashboard

## Overview
A comprehensive real-time dashboard showing beach conditions with a "Tulum Score" algorithm that tells users which beaches are best to visit today based on sargassum, weather, crowding, and other factors.

---

## User Story
**As a** tourist in Tulum  
**I want to** know which beach is best to visit today  
**So that** I don't waste time going to a beach with poor conditions

---

## Design Specifications

### Visual Layout

```
┌─────────────────────────────────────────┐
│  🏖️ BEACH CONDITIONS                    │
├─────────────────────────────────────────┤
│                                         │
│  🌟 Best Beach Today                    │
│  ┌─────────────────────────────────┐   │
│  │  Playa Paraiso        9.2/10    │   │
│  │  ──────────────────────         │   │
│  │  🌊 Low Sargassum               │   │
│  │  ☀️ Perfect Weather             │   │
│  │  👥 Not Crowded                 │   │
│  │  📍 4.2km away                  │   │
│  │                                 │   │
│  │  [Get Directions]               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  📊 All Beaches                         │
│  ┌─────────────────────────────────┐   │
│  │  ⭐ Secret Beach       8.9/10   │   │
│  │  🌊 Minimal • 6.1km             │   │
│  ├─────────────────────────────────┤   │
│  │  ⭐ Hotel Zone         8.5/10   │   │
│  │  🌊 Low • 2.3km                 │   │
│  ├─────────────────────────────────┤   │
│  │  ⚠️  Ruins Beach       6.2/10   │   │
│  │  🌊 Medium • 7.8km              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  📅 3-Day Forecast                      │
│  ┌──────┬──────┬──────┐               │
│  │ Fri  │ Sat  │ Sun  │               │
│  │ 9.1  │ 8.8  │ 7.5  │               │
│  │ ⭐   │ ⭐   │ ✨   │               │
│  └──────┴──────┴──────┘               │
└─────────────────────────────────────────┘
```

---

## Tulum Score Algorithm

### Calculation (0-10 scale)

```javascript
const calculateTulumScore = (beach) => {
  const weights = {
    sargassum: 0.40,    // 40% - Most important
    weather: 0.20,      // 20% - Very important
    crowding: 0.20,     // 20% - Important
    facilities: 0.10,   // 10% - Nice to have
    accessibility: 0.10 // 10% - Convenience
  };

  // Sargassum Score (0-10)
  const sargassumScore = {
    'none': 10,
    'minimal': 9,
    'low': 8,
    'moderate': 6,
    'medium': 4,
    'high': 2,
    'severe': 0
  }[beach.sargassumLevel];

  // Weather Score (0-10)
  const weatherScore = calculateWeatherScore({
    temperature: beach.temperature,
    precipitation: beach.precipitation,
    windSpeed: beach.windSpeed,
    uvIndex: beach.uvIndex,
    cloudCover: beach.cloudCover
  });

  // Crowding Score (0-10)
  const crowdingScore = {
    'empty': 10,
    'quiet': 9,
    'moderate': 7,
    'busy': 5,
    'crowded': 3,
    'packed': 1
  }[beach.crowdLevel];

  // Facilities Score (0-10)
  const facilitiesScore = calculateFacilitiesScore({
    hasRestrooms: beach.hasRestrooms,
    hasShowers: beach.hasShowers,
    hasFood: beach.hasFood,
    hasUmbrellas: beach.hasUmbrellas,
    hasLifeguard: beach.hasLifeguard
  });

  // Accessibility Score (0-10)
  const accessibilityScore = calculateAccessScore({
    distance: beach.distanceFromUser,
    parking: beach.parkingAvailable,
    publicTransport: beach.publicTransportNearby,
    walkable: beach.walkable
  });

  // Calculate weighted score
  const totalScore = 
    (sargassumScore * weights.sargassum) +
    (weatherScore * weights.weather) +
    (crowdingScore * weights.crowding) +
    (facilitiesScore * weights.facilities) +
    (accessibilityScore * weights.accessibility);

  return {
    score: Math.round(totalScore * 10) / 10, // Round to 1 decimal
    rating: getScoreRating(totalScore),
    emoji: getScoreEmoji(totalScore),
    factors: {
      sargassum: sargassumScore,
      weather: weatherScore,
      crowding: crowdingScore,
      facilities: facilitiesScore,
      accessibility: accessibilityScore
    }
  };
};

const getScoreRating = (score) => {
  if (score >= 9.0) return 'Perfect';
  if (score >= 8.0) return 'Excellent';
  if (score >= 7.0) return 'Great';
  if (score >= 6.0) return 'Good';
  if (score >= 5.0) return 'Fair';
  return 'Skip Today';
};

const getScoreEmoji = (score) => {
  if (score >= 9.0) return '🌟';
  if (score >= 8.0) return '⭐';
  if (score >= 7.0) return '✨';
  if (score >= 6.0) return '💫';
  return '⚠️';
};
```

---

## Component Implementation

```jsx
import React, { useState, useEffect } from 'react';

const BeachDashboard = () => {
  const [beaches, setBeaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadBeachConditions();
  }, [selectedDate, userLocation]);

  const loadBeachConditions = async () => {
    setLoading(true);
    try {
      // Fetch beach data
      const beachData = await fetchBeachData();
      
      // Get sargassum levels
      const sargassumData = await fetchSargassumData();
      
      // Get weather data
      const weatherData = await fetchWeatherData();
      
      // Get crowding data (from user reports or estimates)
      const crowdingData = await fetchCrowdingData();

      // Combine data and calculate scores
      const scoredBeaches = beachData.map(beach => {
        const conditions = {
          ...beach,
          sargassumLevel: sargassumData[beach.id],
          weather: weatherData[beach.id],
          crowdLevel: crowdingData[beach.id],
          distanceFromUser: calculateDistance(userLocation, beach.location)
        };

        return {
          ...conditions,
          tulumScore: calculateTulumScore(conditions)
        };
      });

      // Sort by score
      const sorted = scoredBeaches.sort((a, b) => 
        b.tulumScore.score - a.tulumScore.score
      );

      setBeaches(sorted);
    } catch (error) {
      console.error('Error loading beach conditions:', error);
    } finally {
      setLoading(false);
    }
  };

  const bestBeach = beaches[0];

  return (
    <div style={{
      padding: '24px',
      background: 'linear-gradient(180deg, #E0F7FA 0%, #FFF8E7 100%)',
      minHeight: '100vh',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <span style={{ fontSize: '32px' }}>🏖️</span>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '800',
          margin: 0,
          background: 'linear-gradient(135deg, #0099CC 0%, #00CED1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Beach Conditions
        </h2>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Best Beach Card */}
          <BestBeachCard beach={bestBeach} />

          {/* All Beaches List */}
          <AllBeachesList beaches={beaches} />

          {/* 3-Day Forecast */}
          <BeachForecast />
        </>
      )}
    </div>
  );
};

// Best Beach Card Component
const BestBeachCard = ({ beach }) => (
  <div style={{
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 12px 48px rgba(255, 215, 0, 0.3)',
    border: '3px solid rgba(255, 255, 255, 0.5)',
  }}>
    <div style={{
      fontSize: '14px',
      fontWeight: '700',
      color: 'rgba(0, 0, 0, 0.6)',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '12px',
    }}>
      🌟 Best Beach Today
    </div>

    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    }}>
      <h3 style={{
        fontSize: '28px',
        fontWeight: '800',
        margin: 0,
        color: '#FFF',
        textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      }}>
        {beach.name}
      </h3>

      <div style={{
        fontSize: '48px',
        fontWeight: '800',
        color: '#FFF',
        textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'baseline',
        gap: '4px',
      }}>
        <span>{beach.tulumScore.score}</span>
        <span style={{ fontSize: '24px' }}>/10</span>
      </div>
    </div>

    {/* Conditions Grid */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
      marginBottom: '20px',
    }}>
      <ConditionBadge
        icon="🌊"
        label={beach.sargassumLevel}
        color="rgba(255, 255, 255, 0.9)"
      />
      <ConditionBadge
        icon="☀️"
        label="Perfect Weather"
        color="rgba(255, 255, 255, 0.9)"
      />
      <ConditionBadge
        icon="👥"
        label={beach.crowdLevel}
        color="rgba(255, 255, 255, 0.9)"
      />
      <ConditionBadge
        icon="📍"
        label={`${beach.distance}km away`}
        color="rgba(255, 255, 255, 0.9)"
      />
    </div>

    {/* Actions */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
    }}>
      <button style={{
        padding: '14px',
        background: '#FFF',
        border: 'none',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: '700',
        color: '#FF9500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}>
        <span>🗺️</span>
        <span>Directions</span>
      </button>

      <button style={{
        padding: '14px',
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: '700',
        color: '#FFF',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}>
        <span>ℹ️</span>
        <span>Details</span>
      </button>
    </div>
  </div>
);

// All Beaches List Component
const AllBeachesList = ({ beaches }) => (
  <div style={{
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '24px',
    padding: '20px',
    marginBottom: '24px',
    border: '2px solid rgba(0, 206, 209, 0.2)',
  }}>
    <h3 style={{
      fontSize: '18px',
      fontWeight: '700',
      marginBottom: '16px',
      color: '#333',
    }}>
      📊 All Beaches
    </h3>

    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      {beaches.map((beach, index) => (
        <BeachListItem key={beach.id} beach={beach} rank={index + 1} />
      ))}
    </div>
  </div>
);

// Beach List Item Component
const BeachListItem = ({ beach, rank }) => {
  const scoreColor = 
    beach.tulumScore.score >= 8 ? '#50C878' :
    beach.tulumScore.score >= 6 ? '#FFD700' : '#FF6B6B';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      background: 'rgba(255, 255, 255, 0.6)',
      borderRadius: '12px',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      cursor: 'pointer',
      transition: 'all 0.2s',
    }}>
      {/* Rank */}
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: rank === 1 ? '#FFD700' : 'rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '700',
        color: rank === 1 ? '#FFF' : '#666',
      }}>
        {rank}
      </div>

      {/* Beach Info */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '16px',
          fontWeight: '700',
          color: '#333',
          marginBottom: '4px',
        }}>
          {beach.name}
        </div>
        <div style={{
          fontSize: '13px',
          color: '#666',
        }}>
          🌊 {beach.sargassumLevel} • 📍 {beach.distance}km
        </div>
      </div>

      {/* Score */}
      <div style={{
        fontSize: '24px',
        fontWeight: '800',
        color: scoreColor,
      }}>
        {beach.tulumScore.score}
      </div>
    </div>
  );
};

// Condition Badge Component
const ConditionBadge = ({ icon, label, color }) => (
  <div style={{
    padding: '10px 12px',
    background: color,
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  }}>
    <span style={{ fontSize: '18px' }}>{icon}</span>
    <span>{label}</span>
  </div>
);

export default BeachDashboard;
```

---

## Data Sources

### 1. Sargassum Data
```javascript
const fetchSargassumData = async () => {
  // Use your existing USF satellite data
  const response = await fetch('/api/sargassum/current');
  return response.json();
};
```

### 2. Weather Data
```javascript
const fetchWeatherData = async () => {
  // Use OpenWeather or similar API
  const response = await fetch('/api/weather/beach-zones');
  return response.json();
};
```

### 3. Crowding Data
```javascript
const fetchCrowdingData = async () => {
  // Option 1: User-reported data
  // Option 2: Time-based estimates
  // Option 3: Google Popular Times API
  
  const dayOfWeek = new Date().getDay();
  const hour = new Date().getHours();
  
  // Simple algorithm
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isPeakHours = hour >= 11 && hour <= 15;
  
  if (isWeekend && isPeakHours) return 'busy';
  if (isWeekend || isPeakHours) return 'moderate';
  return 'quiet';
};
```

---

## API Endpoints

```javascript
// GET /api/beach-conditions
// Returns all beaches with current conditions

// GET /api/beach-conditions/:beachId
// Returns specific beach details

// POST /api/beach-conditions/report
// Submit user condition report
{
  beachId: 'playa-paraiso',
  sargassumLevel: 'low',
  crowdLevel: 'moderate',
  timestamp: '2026-02-07T10:30:00Z'
}
```

---

## Features

✅ **Tulum Score** - 0-10 rating algorithm
✅ **Real-time data** - Sargassum + weather + crowding
✅ **Best beach highlight** - Gold card for #1
✅ **Ranked list** - All beaches sorted by score
✅ **Quick actions** - Directions, details, save
✅ **3-day forecast** - Plan ahead
✅ **Distance calculation** - From user location
✅ **Color-coded scores** - Visual quick reference

---

## Testing Checklist

- [ ] Scores calculate correctly
- [ ] Best beach appears first
- [ ] All beaches sorted by score
- [ ] Distance shows from user location
- [ ] Sargassum data integrates
- [ ] Weather data integrates
- [ ] Directions button works
- [ ] Mobile responsive
- [ ] Updates when date changes
- [ ] Loading states work

---

## Success Metrics

- Daily active users checking conditions
- Click-through rate to directions
- Average session time on dashboard
- User reports submitted
- Correlation: high scores → more visits

**Estimated Implementation Time:** 12-16 hours
