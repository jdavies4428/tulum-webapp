# AI Itinerary Generator with Google Gemini API

## Overview
Google's Gemini API is free (with generous limits) and perfect for creating personalized Tulum itineraries. This guide shows you how to implement it step-by-step.

---

## Step 1: Get Google Gemini API Key (FREE)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your key (starts with `AIza...`)

**Free Tier Limits:**
- 60 requests per minute
- 1,500 requests per day
- Plenty for testing and small-scale deployment!

---

## Step 2: Backend API Setup (Node.js/Express)

### Install Dependencies

```bash
npm install @google/generative-ai express cors dotenv
```

### Create Backend Server

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Itinerary generation endpoint
app.post('/api/itinerary/generate', async (req, res) => {
  try {
    const { 
      days, 
      interests, 
      budget, 
      groupType,
      startDate 
    } = req.body;

    // Create prompt
    const prompt = generateItineraryPrompt(days, interests, budget, groupType);

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const itinerary = response.text();

    // Parse response into structured format
    const structuredItinerary = parseItinerary(itinerary);

    res.json({
      success: true,
      itinerary: structuredItinerary,
      rawText: itinerary
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Helper: Generate prompt
function generateItineraryPrompt(days, interests, budget, groupType) {
  return `You are a local Tulum travel expert. Create a detailed ${days}-day itinerary for Tulum, Mexico.

TRAVELER PROFILE:
- Duration: ${days} days
- Interests: ${interests.join(', ')}
- Budget: ${budget} (low/medium/high)
- Group Type: ${groupType} (solo/couple/family/friends)

REQUIREMENTS:
1. Provide specific place names (real venues in Tulum)
2. Include mix of popular spots and hidden gems
3. Consider realistic timing and distances
4. Include morning, afternoon, and evening activities
5. Suggest specific restaurants and beach clubs
6. Add cenote recommendations
7. Include cultural/historical sites
8. Provide transportation tips between locations

FORMAT YOUR RESPONSE AS JSON:
{
  "title": "Your Tulum Adventure",
  "summary": "Brief overview of the itinerary",
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "activities": [
        {
          "time": "9:00 AM",
          "duration": "2 hours",
          "title": "Activity name",
          "location": "Specific place name",
          "description": "What to do and why",
          "tips": ["Tip 1", "Tip 2"],
          "estimated_cost": "$20-40",
          "coordinates": {"lat": 20.2114, "lng": -87.4654}
        }
      ]
    }
  ],
  "tips": ["General tip 1", "General tip 2"],
  "estimated_total_cost": "$500-800"
}

Only respond with valid JSON, no additional text.`;
}

// Helper: Parse Gemini response
function parseItinerary(text) {
  try {
    // Remove markdown code blocks if present
    let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse JSON, returning raw text');
    return {
      title: 'Your Tulum Itinerary',
      rawText: text,
      error: 'Could not parse structured format'
    };
  }
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Environment Variables (.env)

```bash
GEMINI_API_KEY=your_api_key_here
PORT=3001
```

---

## Step 3: Frontend React Component

```jsx
// components/AIItineraryGenerator.jsx
import React, { useState } from 'react';

const AIItineraryGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [formData, setFormData] = useState({
    days: 3,
    interests: [],
    budget: 'medium',
    groupType: 'couple'
  });

  const interestOptions = [
    { id: 'beaches', label: '🏖️ Beaches & Beach Clubs', icon: '🏖️' },
    { id: 'cenotes', label: '💧 Cenotes & Swimming', icon: '💧' },
    { id: 'ruins', label: '🏛️ Mayan Ruins & History', icon: '🏛️' },
    { id: 'food', label: '🍽️ Food & Dining', icon: '🍽️' },
    { id: 'nightlife', label: '🎉 Nightlife & Parties', icon: '🎉' },
    { id: 'wellness', label: '🧘 Yoga & Wellness', icon: '🧘' },
    { id: 'adventure', label: '🤿 Adventure Sports', icon: '🤿' },
    { id: 'nature', label: '🌿 Nature & Wildlife', icon: '🌿' },
  ];

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const generateItinerary = async () => {
    if (formData.interests.length === 0) {
      alert('Please select at least one interest');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/itinerary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setItinerary(data.itinerary);
      } else {
        alert('Failed to generate itinerary: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate itinerary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0404 0%, #1a0f0f 100%)',
      padding: '24px',
      color: '#FFF'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          <h1 style={{
            fontSize: '42px',
            fontWeight: '800',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #00D4D4 0%, #50C878 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            ✨ AI Itinerary Generator
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.7)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Let AI create your perfect Tulum adventure based on your preferences
          </p>
        </div>

        {!itinerary ? (
          // Form
          <div style={{
            background: 'rgba(20, 10, 10, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Days Selection */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#FFF',
                marginBottom: '12px',
                display: 'block'
              }}>
                How many days? 📅
              </label>
              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                {[1, 2, 3, 4, 5, 7].map(day => (
                  <button
                    key={day}
                    onClick={() => setFormData({ ...formData, days: day })}
                    style={{
                      flex: 1,
                      padding: '16px',
                      borderRadius: '12px',
                      background: formData.days === day 
                        ? 'linear-gradient(135deg, #00D4D4 0%, #00BABA 100%)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: formData.days === day 
                        ? '2px solid #00D4D4'
                        : '2px solid transparent',
                      color: '#FFF',
                      fontSize: '18px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Interests Selection */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#FFF',
                marginBottom: '12px',
                display: 'block'
              }}>
                What interests you? (Select all that apply) ✨
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                {interestOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => toggleInterest(option.id)}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: formData.interests.includes(option.id)
                        ? 'rgba(0, 212, 212, 0.15)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: formData.interests.includes(option.id)
                        ? '2px solid #00D4D4'
                        : '2px solid transparent',
                      color: '#FFF',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{option.icon}</span>
                    {option.label.split(' ').slice(1).join(' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Selection */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#FFF',
                marginBottom: '12px',
                display: 'block'
              }}>
                Budget 💰
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px'
              }}>
                {[
                  { value: 'low', label: 'Budget', desc: '$50-100/day' },
                  { value: 'medium', label: 'Moderate', desc: '$100-200/day' },
                  { value: 'high', label: 'Luxury', desc: '$200+/day' }
                ].map(budget => (
                  <button
                    key={budget.value}
                    onClick={() => setFormData({ ...formData, budget: budget.value })}
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      background: formData.budget === budget.value
                        ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: formData.budget === budget.value
                        ? '2px solid #FFD700'
                        : '2px solid transparent',
                      color: formData.budget === budget.value ? '#000' : '#FFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
                      {budget.label}
                    </div>
                    <div style={{ fontSize: '13px', opacity: 0.8 }}>
                      {budget.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Group Type Selection */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#FFF',
                marginBottom: '12px',
                display: 'block'
              }}>
                Traveling with? 👥
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px'
              }}>
                {[
                  { value: 'solo', label: 'Solo', icon: '🧳' },
                  { value: 'couple', label: 'Couple', icon: '💑' },
                  { value: 'family', label: 'Family', icon: '👨‍👩‍👧' },
                  { value: 'friends', label: 'Friends', icon: '👯' }
                ].map(group => (
                  <button
                    key={group.value}
                    onClick={() => setFormData({ ...formData, groupType: group.value })}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: formData.groupType === group.value
                        ? 'rgba(80, 200, 120, 0.15)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: formData.groupType === group.value
                        ? '2px solid #50C878'
                        : '2px solid transparent',
                      color: '#FFF',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>{group.icon}</div>
                    {group.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateItinerary}
              disabled={loading}
              style={{
                width: '100%',
                padding: '20px',
                borderRadius: '16px',
                background: loading 
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'linear-gradient(135deg, #00D4D4 0%, #50C878 100%)',
                border: 'none',
                color: '#FFF',
                fontSize: '20px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(0, 212, 212, 0.4)',
                transition: 'all 0.3s'
              }}
            >
              {loading ? (
                <>
                  <span className="spinner">⚙️</span>
                  Creating your itinerary...
                </>
              ) : (
                <>
                  ✨ Generate AI Itinerary
                </>
              )}
            </button>
          </div>
        ) : (
          // Itinerary Display
          <ItineraryDisplay 
            itinerary={itinerary} 
            onReset={() => setItinerary(null)}
          />
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinner {
          animation: spin 1s linear infinite;
          display: inline-block;
        }
      `}</style>
    </div>
  );
};

export default AIItineraryGenerator;
```

---

## Step 4: Itinerary Display Component

```jsx
// components/ItineraryDisplay.jsx
const ItineraryDisplay = ({ itinerary, onReset }) => {
  const [selectedDay, setSelectedDay] = useState(0);

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'rgba(20, 10, 10, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '32px',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            margin: 0
          }}>
            {itinerary.title}
          </h2>
          <button
            onClick={onReset}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFF',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🔄 Create New
          </button>
        </div>
        <p style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '16px',
          margin: 0
        }}>
          {itinerary.summary}
        </p>
        
        {itinerary.estimated_total_cost && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'rgba(0, 212, 212, 0.1)',
            borderRadius: '10px',
            display: 'inline-block'
          }}>
            <span style={{ fontSize: '14px', opacity: 0.8 }}>Estimated Cost: </span>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#00D4D4' }}>
              {itinerary.estimated_total_cost}
            </span>
          </div>
        )}
      </div>

      {/* Day Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        overflowX: 'auto',
        paddingBottom: '8px'
      }}>
        {itinerary.days.map((day, index) => (
          <button
            key={index}
            onClick={() => setSelectedDay(index)}
            style={{
              padding: '16px 24px',
              borderRadius: '12px',
              background: selectedDay === index
                ? 'linear-gradient(135deg, #00D4D4 0%, #00BABA 100%)'
                : 'rgba(255, 255, 255, 0.05)',
              border: selectedDay === index
                ? '2px solid #00D4D4'
                : '2px solid transparent',
              color: '#FFF',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            Day {day.day}
          </button>
        ))}
      </div>

      {/* Day Activities */}
      <div style={{
        background: 'rgba(20, 10, 10, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '32px'
      }}>
        <h3 style={{
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '24px'
        }}>
          {itinerary.days[selectedDay].title}
        </h3>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {itinerary.days[selectedDay].activities.map((activity, index) => (
            <ActivityCard key={index} activity={activity} />
          ))}
        </div>
      </div>

      {/* Tips */}
      {itinerary.tips && itinerary.tips.length > 0 && (
        <div style={{
          marginTop: '24px',
          background: 'rgba(255, 215, 0, 0.1)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <h4 style={{
            fontSize: '18px',
            fontWeight: '700',
            marginBottom: '16px',
            color: '#FFD700'
          }}>
            💡 Pro Tips
          </h4>
          <ul style={{
            margin: 0,
            paddingLeft: '24px',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            {itinerary.tips.map((tip, index) => (
              <li key={index} style={{ marginBottom: '8px' }}>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const ActivityCard = ({ activity }) => (
  <div style={{
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  }}>
    <div style={{
      display: 'flex',
      gap: '16px',
      marginBottom: '12px'
    }}>
      <div style={{
        padding: '8px 16px',
        background: 'rgba(0, 212, 212, 0.15)',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#00D4D4'
      }}>
        {activity.time}
      </div>
      <div style={{
        padding: '8px 16px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.7)'
      }}>
        {activity.duration}
      </div>
    </div>

    <h4 style={{
      fontSize: '20px',
      fontWeight: '700',
      marginBottom: '8px'
    }}>
      {activity.title}
    </h4>

    <div style={{
      fontSize: '15px',
      color: 'rgba(255, 255, 255, 0.6)',
      marginBottom: '12px'
    }}>
      📍 {activity.location}
    </div>

    <p style={{
      fontSize: '15px',
      color: 'rgba(255, 255, 255, 0.8)',
      lineHeight: '1.6',
      marginBottom: '16px'
    }}>
      {activity.description}
    </p>

    {activity.tips && activity.tips.length > 0 && (
      <div style={{
        padding: '12px',
        background: 'rgba(255, 215, 0, 0.08)',
        borderRadius: '10px',
        marginBottom: '12px'
      }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '600',
          color: '#FFD700',
          marginBottom: '8px'
        }}>
          💡 Tips:
        </div>
        <ul style={{
          margin: 0,
          paddingLeft: '20px',
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          {activity.tips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>
    )}

    {activity.estimated_cost && (
      <div style={{
        fontSize: '14px',
        color: '#50C878',
        fontWeight: '600'
      }}>
        💰 {activity.estimated_cost}
      </div>
    )}
  </div>
);
```

---

## Step 5: Alternative - Simpler JSON Request

If JSON parsing is unreliable, use a simpler approach:

```javascript
// Alternative prompt that's easier to parse
function generateSimplePrompt(days, interests, budget, groupType) {
  return `Create a ${days}-day Tulum itinerary for ${groupType} travelers interested in ${interests.join(', ')} with a ${budget} budget.

For each day, provide:
- 3-5 activities with specific venue names
- Time of day for each activity
- Brief description
- Estimated costs
- Transportation tips

Format as structured text that's easy to read.`;
}
```

---

## Difficulty Level: ⭐⭐☆☆☆ (2/5 - Easy!)

**Why it's easy:**
- ✅ Free API with generous limits
- ✅ Simple REST API calls
- ✅ No complex configuration
- ✅ Good documentation
- ✅ Works with vanilla JavaScript

**Time to implement:**
- Backend setup: 30 minutes
- Frontend form: 1 hour
- Display component: 1 hour
- **Total: ~2-3 hours**

This is perfect for your placeholder and will give you a working AI itinerary generator!
