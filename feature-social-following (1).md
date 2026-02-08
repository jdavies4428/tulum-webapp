# Feature Addition: Social Following System

## Overview
Add Instagram/TikTok-style following system where users can follow each other, see their favorites, itineraries, and beach reports. This creates a social layer that increases engagement and provides social proof.

---

## Why Add Following?

### Benefits:
✅ **Increased engagement** - Users return to see what friends are discovering
✅ **Social proof** - "5 people you follow loved this place"
✅ **Content generation** - User-generated recommendations
✅ **Viral growth** - "Join to see what Sarah is exploring"
✅ **Community building** - Tulum travelers helping each other
✅ **Retention** - Social connections = stickiness

### Use Cases:
- "My friends are in Tulum, what are they doing?"
- "Sarah has great taste, I'll follow her recommendations"
- "This couple posts amazing beach finds"
- "Local expert shares hidden gems"

---

## User Profiles

### Public Profile
```jsx
const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);
  const { currentUser } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)',
      padding: '24px',
    }}>
      {/* Cover photo (optional) */}
      <div style={{
        height: '200px',
        borderRadius: '20px 20px 0 0',
        background: 'linear-gradient(135deg, #00CED1 0%, #0099CC 100%)',
        marginBottom: '-80px',
      }} />

      {/* Profile header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        padding: '100px 24px 24px',
        marginBottom: '24px',
        border: '2px solid rgba(0, 206, 209, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        position: 'relative',
      }}>
        {/* Avatar */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '6px solid #FFF',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        }}>
          <img
            src={user.photoURL}
            alt={user.displayName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Name & bio */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            margin: '0 0 8px 0',
            color: '#333',
          }}>
            {user.displayName}
          </h1>

          {user.bio && (
            <p style={{
              fontSize: '15px',
              color: '#666',
              margin: '0 0 16px 0',
              lineHeight: '1.5',
            }}>
              {user.bio}
            </p>
          )}

          {/* User type badge */}
          {user.userType && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: getUserTypeBadge(user.userType).background,
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '700',
              color: '#FFF',
            }}>
              <span>{getUserTypeBadge(user.userType).icon}</span>
              <span>{getUserTypeBadge(user.userType).label}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '20px',
        }}>
          <StatItem
            value={user.stats.favorites}
            label="Favorites"
            onClick={() => showUserFavorites(userId)}
          />
          <StatItem
            value={user.stats.followers}
            label="Followers"
            onClick={() => showFollowers(userId)}
          />
          <StatItem
            value={user.stats.following}
            label="Following"
            onClick={() => showFollowing(userId)}
          />
        </div>

        {/* Follow/Unfollow button */}
        {currentUser?.id !== userId && (
          <FollowButton
            userId={userId}
            following={following}
            onToggle={() => toggleFollow(userId)}
          />
        )}

        {/* Edit profile (if own profile) */}
        {currentUser?.id === userId && (
          <button
            onClick={() => openEditProfile()}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: 'rgba(0, 206, 209, 0.1)',
              border: '2px solid #00CED1',
              color: '#00CED1',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            ⚙️ Edit Profile
          </button>
        )}
      </div>

      {/* Content tabs */}
      <ProfileTabs userId={userId} />
    </div>
  );
};

const StatItem = ({ value, label, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '12px',
      background: 'rgba(0, 206, 209, 0.05)',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgba(0, 206, 209, 0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'rgba(0, 206, 209, 0.05)';
    }}
  >
    <div style={{
      fontSize: '24px',
      fontWeight: '800',
      color: '#00CED1',
      marginBottom: '4px',
    }}>
      {value.toLocaleString()}
    </div>
    <div style={{
      fontSize: '13px',
      fontWeight: '600',
      color: '#666',
    }}>
      {label}
    </div>
  </button>
);

const getUserTypeBadge = (type) => {
  const badges = {
    local: {
      icon: '🌴',
      label: 'Local Expert',
      background: 'linear-gradient(135deg, #50C878 0%, #3CB371 100%)'
    },
    frequent: {
      icon: '⭐',
      label: 'Frequent Visitor',
      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
    },
    verified: {
      icon: '✓',
      label: 'Verified',
      background: 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)'
    }
  };
  return badges[type] || { icon: '👤', label: 'Traveler', background: '#999' };
};
```

---

## Follow Button Component

```jsx
const FollowButton = ({ userId, following, onToggle }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await onToggle();
    setLoading(false);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        width: '100%',
        padding: '14px',
        borderRadius: '12px',
        background: following
          ? 'transparent'
          : 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)',
        border: following ? '2px solid rgba(0, 0, 0, 0.1)' : 'none',
        color: following ? '#333' : '#FFF',
        fontSize: '15px',
        fontWeight: '700',
        cursor: loading ? 'not-allowed' : 'pointer',
        boxShadow: following ? 'none' : '0 4px 16px rgba(0, 206, 209, 0.3)',
        transition: 'all 0.3s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}
    >
      {loading ? (
        '⚙️ Loading...'
      ) : following ? (
        <>
          <span>✓</span>
          <span>Following</span>
        </>
      ) : (
        <>
          <span>+</span>
          <span>Follow</span>
        </>
      )}
    </button>
  );
};
```

---

## Profile Tabs

```jsx
const ProfileTabs = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('favorites');

  const tabs = [
    { id: 'favorites', label: 'Favorites', icon: '⭐' },
    { id: 'lists', label: 'Lists', icon: '📋' },
    { id: 'itineraries', label: 'Itineraries', icon: '🗺️' },
    { id: 'reviews', label: 'Reviews', icon: '✍️' },
  ];

  return (
    <div>
      {/* Tab buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        marginBottom: '24px',
        scrollbarWidth: 'none',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              borderRadius: '12px',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)'
                : 'rgba(255, 255, 255, 0.9)',
              border: activeTab === tab.id ? 'none' : '2px solid rgba(0, 206, 209, 0.2)',
              color: activeTab === tab.id ? '#FFF' : '#333',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'favorites' && <UserFavorites userId={userId} />}
        {activeTab === 'lists' && <UserLists userId={userId} />}
        {activeTab === 'itineraries' && <UserItineraries userId={userId} />}
        {activeTab === 'reviews' && <UserReviews userId={userId} />}
      </div>
    </div>
  );
};
```

---

## Social Feed

```jsx
const SocialFeed = () => {
  const [feed, setFeed] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    // Get activity from people user follows
    const activity = await fetchFollowingActivity(user.id);
    setFeed(activity);
  };

  return (
    <div style={{
      padding: '24px',
      maxWidth: '600px',
      margin: '0 auto',
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '800',
        marginBottom: '24px',
        color: '#333',
      }}>
        Following Feed
      </h2>

      {feed.length === 0 ? (
        <EmptyFeed />
      ) : (
        feed.map((item) => (
          <FeedItem key={item.id} item={item} />
        ))
      )}
    </div>
  );
};

const FeedItem = ({ item }) => {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      padding: '20px',
      marginBottom: '16px',
      border: '2px solid rgba(0, 206, 209, 0.1)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
    }}>
      {/* User header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <img
          src={item.user.photoURL}
          alt={item.user.displayName}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '2px solid #00CED1',
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '15px',
            fontWeight: '700',
            color: '#333',
          }}>
            {item.user.displayName}
          </div>
          <div style={{
            fontSize: '13px',
            color: '#999',
          }}>
            {getActivityText(item)}
          </div>
        </div>
        <div style={{
          fontSize: '12px',
          color: '#999',
        }}>
          {formatTimeAgo(item.timestamp)}
        </div>
      </div>

      {/* Activity content */}
      <ActivityContent item={item} />
    </div>
  );
};

const getActivityText = (item) => {
  const actions = {
    favorited: 'saved a place',
    created_list: 'created a list',
    created_itinerary: 'created an itinerary',
    reviewed: 'reviewed a place',
    reported_beach: 'reported beach conditions',
  };
  return actions[item.type] || 'was active';
};

const ActivityContent = ({ item }) => {
  switch (item.type) {
    case 'favorited':
      return <PlacePreview place={item.place} />;
    case 'created_list':
      return <ListPreview list={item.list} />;
    case 'created_itinerary':
      return <ItineraryPreview itinerary={item.itinerary} />;
    case 'reviewed':
      return <ReviewPreview review={item.review} />;
    default:
      return null;
  }
};
```

---

## Followers/Following Lists

```jsx
const FollowersList = ({ userId, type }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, [userId, type]);

  const loadUsers = async () => {
    const data = type === 'followers'
      ? await getFollowers(userId)
      : await getFollowing(userId);
    setUsers(data);
    setLoading(false);
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '24px',
      padding: '24px',
      border: '2px solid rgba(0, 206, 209, 0.2)',
    }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '800',
        marginBottom: '20px',
        color: '#333',
      }}>
        {type === 'followers' ? 'Followers' : 'Following'}
      </h2>

      {loading ? (
        <div>Loading...</div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          {type === 'followers' 
            ? 'No followers yet'
            : 'Not following anyone yet'
          }
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {users.map((user) => (
            <UserListItem key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};

const UserListItem = ({ user }) => {
  const [following, setFollowing] = useState(user.isFollowing);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      background: 'rgba(0, 206, 209, 0.03)',
      borderRadius: '12px',
      transition: 'all 0.2s',
    }}>
      {/* Avatar */}
      <img
        src={user.photoURL}
        alt={user.displayName}
        onClick={() => navigateToProfile(user.id)}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '2px solid #00CED1',
          cursor: 'pointer',
        }}
      />

      {/* User info */}
      <div 
        style={{ flex: 1, cursor: 'pointer' }}
        onClick={() => navigateToProfile(user.id)}
      >
        <div style={{
          fontSize: '15px',
          fontWeight: '700',
          color: '#333',
          marginBottom: '2px',
        }}>
          {user.displayName}
        </div>
        {user.bio && (
          <div style={{
            fontSize: '13px',
            color: '#666',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {user.bio}
          </div>
        )}
      </div>

      {/* Follow button */}
      <button
        onClick={() => toggleFollow(user.id)}
        style={{
          padding: '8px 16px',
          borderRadius: '10px',
          background: following
            ? 'transparent'
            : 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)',
          border: following ? '2px solid rgba(0, 0, 0, 0.1)' : 'none',
          color: following ? '#333' : '#FFF',
          fontSize: '13px',
          fontWeight: '700',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {following ? 'Following' : 'Follow'}
      </button>
    </div>
  );
};
```

---

## Social Proof on Places

```jsx
const PlaceCard = ({ place }) => {
  const { user } = useAuth();
  const [socialProof, setSocialProof] = useState(null);

  useEffect(() => {
    if (user) {
      loadSocialProof();
    }
  }, [place.id, user]);

  const loadSocialProof = async () => {
    const proof = await getPlaceSocialProof(place.id, user.id);
    setSocialProof(proof);
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      padding: '20px',
      border: '2px solid rgba(0, 206, 209, 0.1)',
    }}>
      {/* Place info */}
      <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
        {place.name}
      </h3>

      {/* Social proof */}
      {socialProof && socialProof.count > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
          padding: '8px 12px',
          background: 'rgba(0, 206, 209, 0.08)',
          borderRadius: '10px',
        }}>
          {/* Avatars */}
          <div style={{ display: 'flex', marginLeft: '-4px' }}>
            {socialProof.users.slice(0, 3).map((user, i) => (
              <img
                key={user.id}
                src={user.photoURL}
                alt={user.displayName}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: '2px solid #FFF',
                  marginLeft: '-8px',
                }}
              />
            ))}
          </div>

          {/* Text */}
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#00CED1',
          }}>
            {socialProof.count === 1 
              ? `${socialProof.users[0].displayName} saved this`
              : `${socialProof.users[0].displayName} and ${socialProof.count - 1} ${socialProof.count === 2 ? 'other' : 'others'} saved this`
            }
          </div>
        </div>
      )}

      {/* Rest of place card */}
    </div>
  );
};
```

---

## Discover Users Feature

```jsx
const DiscoverUsers = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    // Algorithm: users with similar taste, local experts, popular users
    const suggestions = await getSuggestedUsers();
    setSuggestedUsers(suggestions);
  };

  return (
    <div style={{
      padding: '24px',
      background: 'linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)',
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '800',
        marginBottom: '8px',
        color: '#333',
      }}>
        Discover Tulum Explorers
      </h2>
      <p style={{
        fontSize: '15px',
        color: '#666',
        marginBottom: '24px',
      }}>
        Follow travelers and locals for recommendations
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '16px',
      }}>
        {suggestedUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
};

const UserCard = ({ user }) => {
  const [following, setFollowing] = useState(false);

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '16px',
      padding: '16px',
      border: '2px solid rgba(0, 206, 209, 0.1)',
      textAlign: 'center',
      cursor: 'pointer',
    }}
    onClick={() => navigateToProfile(user.id)}
    >
      <img
        src={user.photoURL}
        alt={user.displayName}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: '3px solid #00CED1',
          marginBottom: '12px',
        }}
      />

      <div style={{
        fontSize: '15px',
        fontWeight: '700',
        color: '#333',
        marginBottom: '4px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {user.displayName}
      </div>

      {user.userType && (
        <div style={{
          fontSize: '11px',
          fontWeight: '600',
          color: '#00CED1',
          marginBottom: '8px',
        }}>
          {getUserTypeBadge(user.userType).label}
        </div>
      )}

      <div style={{
        fontSize: '12px',
        color: '#999',
        marginBottom: '12px',
      }}>
        {user.stats.favorites} favorites
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFollow(user.id);
        }}
        style={{
          width: '100%',
          padding: '8px',
          borderRadius: '10px',
          background: following
            ? 'transparent'
            : 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)',
          border: following ? '2px solid rgba(0, 0, 0, 0.1)' : 'none',
          color: following ? '#333' : '#FFF',
          fontSize: '13px',
          fontWeight: '700',
          cursor: 'pointer',
        }}
      >
        {following ? 'Following' : 'Follow'}
      </button>
    </div>
  );
};
```

---

## Database Schema

```sql
-- Users table (already exists, add fields)
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN user_type VARCHAR(50); -- 'local', 'frequent', 'verified'
ALTER TABLE users ADD COLUMN is_public BOOLEAN DEFAULT true;

-- Follows table
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Activity feed table
CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50), -- 'favorited', 'created_list', 'reviewed', etc.
  content JSONB, -- Flexible content storage
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_activity_user ON activity_feed(user_id);
CREATE INDEX idx_activity_created ON activity_feed(created_at DESC);
```

---

## API Endpoints

```javascript
// Follow user
POST /api/users/:userId/follow
Response: { success: true, following: true }

// Unfollow user
DELETE /api/users/:userId/follow
Response: { success: true, following: false }

// Get followers
GET /api/users/:userId/followers
Response: { users: [...], count: 42 }

// Get following
GET /api/users/:userId/following
Response: { users: [...], count: 15 }

// Get activity feed
GET /api/feed
Response: { activities: [...], hasMore: true }

// Get suggested users
GET /api/users/suggestions
Response: { users: [...] }

// Get social proof for place
GET /api/places/:placeId/social-proof
Response: { 
  count: 5,
  users: [...],
  isFollowing: true
}
```

---

## Privacy Settings

```jsx
const PrivacySettings = () => {
  const [settings, setSettings] = useState({
    profilePublic: true,
    showActivity: true,
    showFavorites: true,
    showLists: true,
    allowFollowers: true,
  });

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      padding: '24px',
    }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '800',
        marginBottom: '20px',
      }}>
        Privacy Settings
      </h2>

      <ToggleSetting
        label="Public Profile"
        description="Anyone can see your profile"
        value={settings.profilePublic}
        onChange={(val) => updateSetting('profilePublic', val)}
      />

      <ToggleSetting
        label="Show Activity"
        description="Followers can see your activity"
        value={settings.showActivity}
        onChange={(val) => updateSetting('showActivity', val)}
      />

      <ToggleSetting
        label="Show Favorites"
        description="Others can see your saved places"
        value={settings.showFavorites}
        onChange={(val) => updateSetting('showFavorites', val)}
      />

      <ToggleSetting
        label="Show Lists"
        description="Others can see your lists"
        value={settings.showLists}
        onChange={(val) => updateSetting('showLists', val)}
      />

      <ToggleSetting
        label="Allow Followers"
        description="Let others follow you"
        value={settings.allowFollowers}
        onChange={(val) => updateSetting('allowFollowers', val)}
      />
    </div>
  );
};

const ToggleSetting = ({ label, description, value, onChange }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 0',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  }}>
    <div>
      <div style={{
        fontSize: '15px',
        fontWeight: '700',
        color: '#333',
        marginBottom: '4px',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '13px',
        color: '#666',
      }}>
        {description}
      </div>
    </div>

    <label style={{
      position: 'relative',
      display: 'inline-block',
      width: '48px',
      height: '28px',
    }}>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        style={{ opacity: 0, width: 0, height: 0 }}
      />
      <span style={{
        position: 'absolute',
        cursor: 'pointer',
        inset: 0,
        background: value ? '#00CED1' : '#ccc',
        borderRadius: '28px',
        transition: '0.3s',
      }}>
        <span style={{
          position: 'absolute',
          height: '20px',
          width: '20px',
          left: value ? '24px' : '4px',
          bottom: '4px',
          background: '#FFF',
          borderRadius: '50%',
          transition: '0.3s',
        }} />
      </span>
    </label>
  </div>
);
```

---

## Notifications

```jsx
const Notification = ({ notification }) => {
  const icons = {
    new_follower: '👤',
    favorite_activity: '⭐',
    list_shared: '📋',
    mention: '@',
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      background: notification.read 
        ? 'transparent' 
        : 'rgba(0, 206, 209, 0.05)',
      borderRadius: '12px',
      marginBottom: '8px',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
      }}>
        {icons[notification.type]}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '14px',
          color: '#333',
          marginBottom: '2px',
        }}>
          {notification.message}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#999',
        }}>
          {formatTimeAgo(notification.timestamp)}
        </div>
      </div>

      {!notification.read && (
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#00CED1',
        }} />
      )}
    </div>
  );
};
```

---

## Integration with Existing Features

### Update Sign-In Flow
```jsx
// After sign-in, show profile completion
const CompleteProfile = ({ user }) => {
  return (
    <div>
      <h2>Welcome! Complete your profile</h2>
      
      <input
        type="text"
        placeholder="Add a bio (optional)"
        maxLength={150}
      />

      <select>
        <option value="">I am a...</option>
        <option value="tourist">Tourist</option>
        <option value="local">Local</option>
        <option value="frequent">Frequent Visitor</option>
      </select>

      <button>Continue</button>
      <button onClick={() => skip()}>Skip for now</button>
    </div>
  );
};
```

### Add to Header Menu
```jsx
<MenuItem icon="👥" label="Following Feed" onClick={() => navigate('/feed')} />
<MenuItem icon="🔍" label="Discover Users" onClick={() => navigate('/users')} />
```

---

## Analytics

```javascript
analytics.track('user_followed', {
  follower_id: currentUser.id,
  following_id: userId
});

analytics.track('profile_viewed', {
  viewer_id: currentUser.id,
  profile_id: userId
});

analytics.track('social_proof_clicked', {
  place_id: placeId,
  proof_type: 'followers_saved'
});
```

---

## Success Metrics

- Follow rate: >30% of active users follow someone
- Social proof click-through: >15%
- Activity feed engagement: >40% of users check it
- Profile completion: >60% add bio
- Return visits: +50% with social features

This turns your app into a social discovery platform! 🌴👥✨
