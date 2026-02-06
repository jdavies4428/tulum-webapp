# Complete Google Places API Categories & Tulum Coverage Strategy

## Problem: Missing Places When Pulling by Category

**Why places are missing:**
1. Using only generic types like `restaurant` or `bar`
2. Not using all relevant sub-categories
3. Not combining search methods (nearby + text search)
4. Google's limit of 20 results per API call
5. Some places have unusual primary types

## Solution: Comprehensive Multi-Category Strategy

---

## Part 1: Complete Google Places API Type List

### Table A: All Available Place Types (Filterable)

#### 🚗 Automotive
```javascript
const automotiveTypes = [
  'car_dealer',
  'car_rental',
  'car_repair',
  'car_wash',
  'electric_vehicle_charging_station',
  'gas_station',
  'parking',
  'rest_stop'
];
```

#### 💼 Business
```javascript
const businessTypes = [
  'corporate_office',
  'farm',
  'ranch'
];
```

#### 🎨 Culture
```javascript
const cultureTypes = [
  'art_gallery',
  'art_studio',
  'auditorium',
  'cultural_landmark',
  'historical_place',
  'monument',
  'museum',
  'performing_arts_theater',
  'sculpture'
];
```

#### 📚 Education
```javascript
const educationTypes = [
  'library',
  'preschool',
  'primary_school',
  'school',
  'secondary_school',
  'university'
];
```

#### 🎉 Entertainment and Recreation (IMPORTANT FOR TULUM!)
```javascript
const entertainmentTypes = [
  'adventure_sports_center',
  'amphitheatre',
  'amusement_center',
  'amusement_park',
  'aquarium',
  'banquet_hall',
  'barbecue_area',
  'botanical_garden',
  'bowling_alley',
  'casino',
  'childrens_camp',
  'comedy_club',
  'community_center',
  'concert_hall',
  'convention_center',
  'cultural_center',
  'cycling_park',
  'dance_hall',
  'dog_park',
  'event_venue',
  'ferris_wheel',
  'garden',
  'hiking_area',
  'historical_landmark',
  'internet_cafe',
  'karaoke',
  'marina',
  'movie_rental',
  'movie_theater',
  'national_park',
  'night_club',
  'observation_deck',
  'off_roading_area',
  'opera_house',
  'park',
  'philharmonic_hall',
  'picnic_ground',
  'planetarium',
  'plaza',
  'roller_coaster',
  'skateboard_park',
  'state_park',
  'tourist_attraction',
  'video_arcade',
  'visitor_center',
  'water_park',
  'wedding_venue',
  'wildlife_park',
  'wildlife_refuge',
  'zoo'
];
```

#### 🏋️ Facilities
```javascript
const facilitiesTypes = [
  'public_bath',
  'public_bathroom',
  'stable'
];
```

#### 💰 Finance
```javascript
const financeTypes = [
  'accounting',
  'atm',
  'bank'
];
```

#### 🍽️ Food and Drink (MOST IMPORTANT FOR TULUM!)
```javascript
const foodAndDrinkTypes = [
  // Shops & Cafes
  'acai_shop',
  'bagel_shop',
  'bakery',
  'cafe',
  'cafeteria',
  'candy_store',
  'cat_cafe',
  'chocolate_factory',
  'chocolate_shop',
  'coffee_shop',
  'confectionery',
  'deli',
  'dessert_shop',
  'dog_cafe',
  'donut_shop',
  'ice_cream_shop',
  'juice_shop',
  'sandwich_shop',
  'tea_house',
  
  // Bars & Pubs
  'bar',
  'bar_and_grill',
  'pub',
  'wine_bar',
  
  // Restaurant Types by Cuisine
  'afghani_restaurant',
  'african_restaurant',
  'american_restaurant',
  'asian_restaurant',
  'brazilian_restaurant',
  'chinese_restaurant',
  'french_restaurant',
  'greek_restaurant',
  'indian_restaurant',
  'indonesian_restaurant',
  'italian_restaurant',
  'japanese_restaurant',
  'korean_restaurant',
  'lebanese_restaurant',
  'mediterranean_restaurant',
  'mexican_restaurant',
  'middle_eastern_restaurant',
  'spanish_restaurant',
  'thai_restaurant',
  'turkish_restaurant',
  'vietnamese_restaurant',
  
  // Restaurant Types by Food Type
  'barbecue_restaurant',
  'breakfast_restaurant',
  'brunch_restaurant',
  'buffet_restaurant',
  'dessert_restaurant',
  'diner',
  'fast_food_restaurant',
  'fine_dining_restaurant',
  'food_court',
  'hamburger_restaurant',
  'pizza_restaurant',
  'ramen_restaurant',
  'seafood_restaurant',
  'steak_house',
  'sushi_restaurant',
  'vegan_restaurant',
  'vegetarian_restaurant',
  
  // Generic
  'restaurant',
  'meal_delivery',
  'meal_takeaway'
];
```

#### 🗺️ Geographical Areas
```javascript
const geographicalTypes = [
  'administrative_area_level_1',
  'administrative_area_level_2',
  'country',
  'locality',
  'postal_code',
  'school_district'
];
```

#### 🏛️ Government
```javascript
const governmentTypes = [
  'city_hall',
  'courthouse',
  'embassy',
  'fire_station',
  'government_office',
  'local_government_office',
  'neighborhood_police_station',
  'police',
  'post_office'
];
```

#### 🏥 Health and Wellness (IMPORTANT FOR TULUM!)
```javascript
const healthTypes = [
  'chiropractor',
  'dental_clinic',
  'dentist',
  'doctor',
  'drugstore',
  'hospital',
  'massage',
  'medical_lab',
  'pharmacy',
  'physiotherapist',
  'sauna',
  'skin_care_clinic',
  'spa',
  'tanning_studio',
  'wellness_center',
  'yoga_studio'
];
```

#### 🏠 Housing
```javascript
const housingTypes = [
  'apartment_building',
  'apartment_complex',
  'condominium_complex',
  'housing_complex'
];
```

#### 🏨 Lodging (CRITICAL FOR TULUM!)
```javascript
const lodgingTypes = [
  'bed_and_breakfast',
  'budget_japanese_inn',
  'campground',
  'camping_cabin',
  'cottage',
  'extended_stay_hotel',
  'farmstay',
  'guest_house',
  'hostel',
  'hotel',
  'inn',
  'japanese_inn',
  'lodging',
  'mobile_home_park',
  'motel',
  'private_guest_room',
  'resort_hotel',
  'rv_park'
];
```

#### 🌴 Natural Features (CRITICAL FOR TULUM!)
```javascript
const naturalTypes = [
  'beach'
];
```

#### ⛪ Places of Worship
```javascript
const worshipTypes = [
  'church',
  'hindu_temple',
  'mosque',
  'synagogue'
];
```

#### 🛠️ Services
```javascript
const servicesTypes = [
  'astrologer',
  'barber_shop',
  'beautician',
  'beauty_salon',
  'body_art_service',
  'catering_service',
  'cemetery',
  'child_care_agency',
  'consultant',
  'courier_service',
  'electrician',
  'florist',
  'food_delivery',
  'foot_care',
  'funeral_home',
  'hair_care',
  'hair_salon',
  'insurance_agency',
  'laundry',
  'lawyer',
  'locksmith',
  'makeup_artist',
  'moving_company',
  'nail_salon',
  'painter',
  'plumber',
  'psychic',
  'real_estate_agency',
  'roofing_contractor',
  'storage',
  'summer_camp_organizer',
  'tailor',
  'telecommunications_service_provider',
  'tour_agency',
  'tourist_information_center',
  'travel_agency',
  'veterinary_care'
];
```

#### 🛍️ Shopping
```javascript
const shoppingTypes = [
  'asian_grocery_store',
  'auto_parts_store',
  'bicycle_store',
  'book_store',
  'butcher_shop',
  'cell_phone_store',
  'clothing_store',
  'convenience_store',
  'department_store',
  'discount_store',
  'electronics_store',
  'food_store',
  'furniture_store',
  'gift_shop',
  'grocery_store',
  'hardware_store',
  'home_goods_store',
  'home_improvement_store',
  'jewelry_store',
  'liquor_store',
  'market',
  'pet_store',
  'shoe_store',
  'shopping_mall',
  'sporting_goods_store',
  'store',
  'supermarket',
  'warehouse_store',
  'wholesaler'
];
```

#### ⚽ Sports
```javascript
const sportsTypes = [
  'arena',
  'athletic_field',
  'fishing_charter',
  'fishing_pond',
  'fitness_center',
  'golf_course',
  'gym',
  'ice_skating_rink',
  'playground',
  'ski_resort',
  'sports_activity_location',
  'sports_club',
  'sports_coaching',
  'sports_complex',
  'stadium',
  'swimming_pool'
];
```

#### 🚌 Transportation
```javascript
const transportationTypes = [
  'airport',
  'airstrip',
  'bus_station',
  'bus_stop',
  'ferry_terminal',
  'heliport',
  'international_airport',
  'light_rail_station',
  'park_and_ride',
  'subway_station',
  'taxi_stand',
  'train_station',
  'transit_depot',
  'transit_station',
  'truck_stop'
];
```

---

## Part 2: Tulum-Specific Category Strategy

### Priority Categories for Tulum

```javascript
// Tulum Discovery App - Complete Category Configuration
const TULUM_CATEGORIES = {
  // HIGHEST PRIORITY - Beach & Nightlife
  beachClubs: [
    { type: 'bar', keyword: 'beach club' },
    { type: 'bar', keyword: 'beach bar' },
    { type: 'bar', keyword: 'playa' },
    { type: 'restaurant', keyword: 'beach club' },
    { type: 'night_club', keyword: 'beach' },
    { type: 'event_venue', keyword: 'beach' },
    { type: 'tourist_attraction', keyword: 'beach club' }
  ],
  
  // HIGH PRIORITY - Restaurants & Food
  restaurants: [
    'restaurant',
    'mexican_restaurant',
    'seafood_restaurant',
    'italian_restaurant',
    'vegan_restaurant',
    'vegetarian_restaurant',
    'mediterranean_restaurant',
    'asian_restaurant',
    'japanese_restaurant',
    'fine_dining_restaurant',
    'breakfast_restaurant',
    'brunch_restaurant',
    'cafe',
    'coffee_shop',
    'bar_and_grill',
    'food_court'
  ],
  
  // HIGH PRIORITY - Bars & Nightlife
  barsAndNightlife: [
    'bar',
    'night_club',
    'pub',
    'wine_bar',
    'cocktail_bar',
    'dance_hall',
    'karaoke',
    'live_music_venue'
  ],
  
  // MEDIUM-HIGH PRIORITY - Wellness & Spa
  wellness: [
    'spa',
    'massage',
    'wellness_center',
    'yoga_studio',
    'fitness_center',
    'gym',
    'sauna',
    'beauty_salon'
  ],
  
  // MEDIUM-HIGH PRIORITY - Hotels & Lodging
  lodging: [
    'lodging',
    'hotel',
    'resort_hotel',
    'hostel',
    'guest_house',
    'bed_and_breakfast',
    'cottage',
    'campground'
  ],
  
  // MEDIUM PRIORITY - Cultural & Tourist Attractions
  cultural: [
    'tourist_attraction',
    'museum',
    'art_gallery',
    'historical_landmark',
    'cultural_landmark',
    'monument',
    'archaeological_site',
    'visitor_center',
    'park'
  ],
  
  // MEDIUM PRIORITY - Activities & Adventure
  activities: [
    'adventure_sports_center',
    'aquarium',
    'marina',
    'diving_center',
    'tour_agency',
    'tourist_information_center',
    'travel_agency',
    'event_venue',
    'water_park',
    'amusement_park'
  ],
  
  // MEDIUM PRIORITY - Shopping
  shopping: [
    'shopping_mall',
    'clothing_store',
    'gift_shop',
    'jewelry_store',
    'market',
    'convenience_store',
    'grocery_store',
    'supermarket',
    'liquor_store'
  ],
  
  // LOW PRIORITY - Services
  services: [
    'atm',
    'bank',
    'hospital',
    'pharmacy',
    'gas_station',
    'car_rental',
    'laundry',
    'hair_salon'
  ]
};
```

---

## Part 3: Complete Data Pull Strategy

### Strategy 1: Multi-Pass Category Search

```javascript
// server.js
const express = require('express');
const axios = require('axios');

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const TULUM_CENTER = { lat: 20.2114, lng: -87.4654 };
const TULUM_RADIUS = 10000;

// Complete category definitions (from above)
const TULUM_CATEGORIES = { /* ... */ };

// Fetch ALL places for a single category with pagination
async function fetchAllPlacesForType(type, keyword = '') {
  let allPlaces = [];
  let nextPageToken = null;
  
  do {
    try {
      const params = {
        location: `${TULUM_CENTER.lat},${TULUM_CENTER.lng}`,
        radius: TULUM_RADIUS,
        type: type,
        key: GOOGLE_PLACES_API_KEY,
        language: 'en'
      };
      
      if (keyword) params.keyword = keyword;
      if (nextPageToken) params.pagetoken = nextPageToken;
      
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        { params }
      );
      
      if (response.data.results) {
        allPlaces.push(...response.data.results);
      }
      
      nextPageToken = response.data.next_page_token;
      
      // Google requires 2-second delay before using next_page_token
      if (nextPageToken) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.error(`Error fetching ${type}:`, error.message);
      break;
    }
  } while (nextPageToken);
  
  return allPlaces;
}

// Fetch all places across multiple categories
async function fetchCompleteTulumData() {
  const results = {};
  
  // Beach Clubs - special handling with keywords
  console.log('Fetching beach clubs...');
  results.beachClubs = [];
  for (const config of TULUM_CATEGORIES.beachClubs) {
    const places = await fetchAllPlacesForType(config.type, config.keyword);
    results.beachClubs.push(...places);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
  }
  
  // Restaurants
  console.log('Fetching restaurants...');
  results.restaurants = [];
  for (const type of TULUM_CATEGORIES.restaurants) {
    const places = await fetchAllPlacesForType(type);
    results.restaurants.push(...places);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Bars & Nightlife
  console.log('Fetching bars and nightlife...');
  results.barsAndNightlife = [];
  for (const type of TULUM_CATEGORIES.barsAndNightlife) {
    const places = await fetchAllPlacesForType(type);
    results.barsAndNightlife.push(...places);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Wellness
  console.log('Fetching wellness centers...');
  results.wellness = [];
  for (const type of TULUM_CATEGORIES.wellness) {
    const places = await fetchAllPlacesForType(type);
    results.wellness.push(...places);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Continue for all other categories...
  
  // Deduplicate by place_id
  Object.keys(results).forEach(category => {
    const uniquePlaces = new Map();
    results[category].forEach(place => {
      uniquePlaces.set(place.place_id, place);
    });
    results[category] = Array.from(uniquePlaces.values());
    console.log(`${category}: ${results[category].length} unique places`);
  });
  
  return results;
}

// API endpoint
app.get('/api/places/complete', async (req, res) => {
  try {
    const data = await fetchCompleteTulumData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Strategy 2: Text Search for Specific Tulum Keywords

```javascript
// Supplement category search with text queries
const TULUM_TEXT_QUERIES = [
  'beach clubs in Tulum',
  'restaurants in Tulum',
  'cenotes near Tulum',
  'Tulum ruins',
  'bars in Tulum',
  'hotels in Tulum',
  'spas in Tulum',
  'yoga studios Tulum',
  'beach bars Tulum',
  'nightclubs Tulum',
  'beach access Tulum',
  'Tulum hotel zone',
  'downtown Tulum restaurants',
  'Tulum pueblo',
  'jungle restaurants Tulum',
  'rooftop bars Tulum'
];

async function textSearchSupplement() {
  const results = [];
  
  for (const query of TULUM_TEXT_QUERIES) {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/textsearch/json',
        {
          params: {
            query: query,
            location: `${TULUM_CENTER.lat},${TULUM_CENTER.lng}`,
            radius: TULUM_RADIUS,
            key: GOOGLE_PLACES_API_KEY
          }
        }
      );
      
      if (response.data.results) {
        results.push(...response.data.results);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error with query "${query}":`, error.message);
    }
  }
  
  return results;
}
```

### Strategy 3: Combined Approach with Caching

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 86400 }); // 24 hour cache

async function getCompleteTulumPlaces() {
  // Check cache first
  const cached = cache.get('tulum_complete_data');
  if (cached) {
    console.log('Returning cached data');
    return cached;
  }
  
  console.log('Fetching fresh data from Google Places API...');
  
  // Method 1: Category-based search
  const categoryResults = await fetchCompleteTulumData();
  
  // Method 2: Text-based search
  const textResults = await textSearchSupplement();
  
  // Combine and deduplicate
  const allPlaces = new Map();
  
  // Add category results
  Object.values(categoryResults).flat().forEach(place => {
    allPlaces.set(place.place_id, place);
  });
  
  // Add text search results
  textResults.forEach(place => {
    allPlaces.set(place.place_id, place);
  });
  
  const completeData = {
    categories: categoryResults,
    totalUniquePlaces: allPlaces.size,
    lastUpdated: new Date().toISOString()
  };
  
  // Cache the results
  cache.set('tulum_complete_data', completeData);
  
  return completeData;
}

// Endpoint for complete data
app.get('/api/places/tulum/complete', async (req, res) => {
  try {
    const data = await getCompleteTulumPlaces();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Part 4: Scheduled Background Job

```javascript
// backgroundJob.js
const cron = require('node-cron');

// Update data every 24 hours at 3 AM
cron.schedule('0 3 * * *', async () => {
  console.log('Starting scheduled Tulum places update...');
  
  try {
    const data = await getCompleteTulumPlaces();
    console.log(`Updated ${data.totalUniquePlaces} places`);
    
    // Optionally save to database
    // await saveToDat abase(data);
  } catch (error) {
    console.error('Scheduled update failed:', error);
  }
});
```

---

## Part 5: Frontend Integration

```javascript
// services/placesService.js
class PlacesService {
  async getAllTulumPlaces() {
    try {
      const response = await fetch('http://localhost:3001/api/places/tulum/complete');
      const data = await response.json();
      
      return {
        beachClubs: data.categories.beachClubs || [],
        restaurants: data.categories.restaurants || [],
        bars: data.categories.barsAndNightlife || [],
        wellness: data.categories.wellness || [],
        lodging: data.categories.lodging || [],
        cultural: data.categories.cultural || [],
        activities: data.categories.activities || [],
        shopping: data.categories.shopping || [],
        services: data.categories.services || [],
        totalPlaces: data.totalUniquePlaces
      };
    } catch (error) {
      console.error('Error fetching places:', error);
      return null;
    }
  }
}

export default new PlacesService();
```

---

## Part 6: Why Places Might Still Be Missing

### Common Issues & Solutions:

**Issue 1: Place doesn't have correct type**
```javascript
// Solution: Use text search as backup
const textSearch = await searchPlaces('Gitano Tulum');
```

**Issue 2: Place is outside 10km radius**
```javascript
// Solution: Expand radius or use multiple center points
const TULUM_BEACH_CENTER = { lat: 20.1500, lng: -87.4400 };
const TULUM_PUEBLO_CENTER = { lat: 20.2114, lng: -87.4654 };
```

**Issue 3: New place not yet in Google Maps**
```javascript
// Solution: Allow manual place addition
// Provide form for users to submit missing places
```

**Issue 4: Place has unusual category**
```javascript
// Solution: Add catch-all search
const allTypes = [
  'establishment',
  'point_of_interest',
  'food',
  'store',
  'lodging'
];
```

---

## Part 7: Cost-Optimized Implementation

```javascript
// Minimize API calls with smart caching
const CACHE_DURATION = {
  popular: 6 * 60 * 60 * 1000,  // 6 hours for popular categories
  standard: 24 * 60 * 60 * 1000, // 24 hours for others
  details: 7 * 24 * 60 * 60 * 1000 // 7 days for place details
};

// Batch fetch only when needed
async function lazyLoadCategory(category) {
  const cacheKey = `category_${category}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION.standard) {
    return cached.data;
  }
  
  const data = await fetchCategoryData(category);
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  return data;
}
```

---

## Summary: Complete Coverage Checklist

✅ **Use ALL relevant category types** (not just 'restaurant' but ALL 50+ food types)
✅ **Combine nearby search + text search** for maximum coverage
✅ **Handle pagination** (next_page_token)
✅ **Use specific keywords** ('beach club', 'playa', 'cenote')
✅ **Multiple search centers** (beach zone + pueblo)
✅ **Deduplicate by place_id**
✅ **Cache aggressively** (24 hour minimum)
✅ **Schedule background updates** (daily at 3 AM)
✅ **Expand radius** if needed (10km → 15km for remote cenotes)
✅ **Allow user submissions** for missing places

## Expected Results

Using this comprehensive approach:
- **Before**: ~50-100 places using generic types
- **After**: 500-1000+ places using complete category coverage
- **Beach Clubs**: 30-50 (was 5-10)
- **Restaurants**: 200-300 (was 30-50)
- **Total Coverage**: 80-90% of all Tulum businesses

Feed this document to Cursor to implement complete Tulum coverage!
