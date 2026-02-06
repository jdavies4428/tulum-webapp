# Tulum Places Screen & Modal - Beachy Design

## Overview
Redesigning the Places screen and modal to match the beachy, modern Tulum aesthetic with light backgrounds, turquoise accents, and organic shapes.

---

## Places Modal - Main Screen

```jsx
const TulumPlacesModal = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      {/* Backdrop with blur */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(8px)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease-out',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          inset: '60px 16px 16px',
          background: 'linear-gradient(180deg, #FFF8E7 0%, #FFFFFF 100%)',
          borderRadius: '32px',
          boxShadow: '0 20px 60px rgba(0, 206, 209, 0.25)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Wave decoration */}
          <svg
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '40px',
              opacity: 0.2,
            }}
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,50 Q300,10 600,50 T1200,50 L1200,120 L0,120 Z"
              fill="#00CED1"
            />
          </svg>

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
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(0, 206, 209, 0.2)',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.2s',
            }}
          >
            ✕
          </button>

          {/* Title */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px',
          }}>
            <div style={{
              fontSize: '32px',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }}>
              📍
            </div>
            <div>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '800',
                margin: 0,
                background: 'linear-gradient(135deg, #0099CC 0%, #00CED1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Places
              </h2>
              {/* Database badge */}
              <div style={{
                display: 'inline-block',
                marginTop: '4px',
                padding: '4px 10px',
                background: '#00CED1',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '700',
                color: '#FFF',
                letterSpacing: '0.5px',
              }}>
                DB
              </div>
            </div>
          </div>
          
          <p style={{
            fontSize: '15px',
            color: '#00ACC1',
            margin: 0,
            fontWeight: '600',
            position: 'relative',
            zIndex: 1,
          }}>
            Discover the best spots in Tulum
          </p>
        </div>

        {/* Filter Buttons */}
        <div style={{
          padding: '20px 16px 16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
        }}>
          <FilterButton
            icon="📋"
            label="All"
            active={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
            gradient="linear-gradient(135deg, #FFE4CC 0%, #FFD4B8 100%)"
          />
          <FilterButton
            icon="🌟"
            label="Local Picks"
            active={selectedCategory === 'local'}
            onClick={() => setSelectedCategory('local')}
            gradient="linear-gradient(135deg, #FFD4E5 0%, #FFC0D9 100%)"
          />
          <FilterButton
            icon="🔍"
            label="Search all places"
            active={selectedCategory === 'search'}
            onClick={() => setSelectedCategory('search')}
            gradient="linear-gradient(135deg, #E8E8E8 0%, #D8D8D8 100%)"
            wide
          />
          <FilterButton
            icon="🔥"
            label="Popular"
            active={selectedCategory === 'popular'}
            onClick={() => setSelectedCategory('popular')}
            gradient="linear-gradient(135deg, #FFB088 0%, #FF9966 100%)"
          />
        </div>

        {/* Places List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 16px 16px',
          WebkitOverflowScrolling: 'touch',
        }}>
          <PlaceCard
            name="Azulik"
            description="Eco-resort & sunset destination"
            category="Club"
            rating={4.5}
            distance="4.2km"
            priceLevel="$$"
            tags={['Beachfront', 'Sunset Views']}
            isOpen={true}
            isSaved={true}
          />
          
          <PlaceCard
            name="Gitano"
            description="Jungle restaurant & mezcal bar"
            category="Club"
            rating={4.7}
            distance="2.8km"
            priceLevel="$$$"
            tags={['Live Music', 'Cocktails']}
            isOpen={true}
            isSaved={false}
          />
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};
```

---

## Filter Button Component

```jsx
const FilterButton = ({ icon, label, active, onClick, gradient, wide }) => {
  return (
    <button
      onClick={onClick}
      style={{
        gridColumn: wide ? '1 / -1' : 'auto',
        padding: '16px 20px',
        background: active 
          ? gradient
          : 'rgba(255, 255, 255, 0.8)',
        border: active 
          ? '2px solid transparent'
          : '2px solid rgba(0, 206, 209, 0.2)',
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: active 
          ? '0 8px 24px rgba(0, 206, 209, 0.2)'
          : '0 2px 8px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Pattern overlay */}
      {active && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.08\'%3E%3Ccircle cx=\'2\' cy=\'2\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3,
        }} />
      )}
      
      <span style={{
        fontSize: '20px',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
      }}>
        {icon}
      </span>
      <span style={{
        fontSize: '15px',
        fontWeight: '700',
        color: active ? '#333' : '#666',
        letterSpacing: '0.2px',
      }}>
        {label}
      </span>
    </button>
  );
};
```

---

## Place Card Component

```jsx
const PlaceCard = ({
  name,
  description,
  category,
  rating,
  distance,
  priceLevel,
  tags,
  isOpen,
  isSaved,
  onCardClick,
}) => {
  const [saved, setSaved] = useState(isSaved);

  return (
    <div
      onClick={onCardClick}
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        border: '2px solid rgba(0, 206, 209, 0.15)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Gradient accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #00CED1 0%, #0099CC 100%)',
      }} />

      {/* Header Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
      }}>
        {/* Category badge */}
        <div style={{
          padding: '6px 12px',
          background: '#1A1A1A',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: '700',
          color: '#FFF',
          letterSpacing: '0.5px',
        }}>
          {category}
        </div>

        {/* Right side icons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}>
          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSaved(!saved);
            }}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: saved 
                ? 'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)'
                : 'rgba(255, 255, 255, 0.9)',
              border: saved ? 'none' : '2px solid rgba(0, 0, 0, 0.1)',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: saved 
                ? '0 4px 16px rgba(255, 107, 107, 0.3)'
                : '0 2px 8px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s',
            }}
          >
            {saved ? '❤️' : '🤍'}
          </button>

          {/* Open/Closed badge */}
          <div style={{
            padding: '8px 16px',
            background: isOpen 
              ? 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)'
              : 'rgba(0, 0, 0, 0.2)',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '800',
            color: '#FFF',
            letterSpacing: '0.5px',
            boxShadow: isOpen ? '0 4px 12px rgba(0, 206, 209, 0.3)' : 'none',
          }}>
            • {isOpen ? 'OPEN' : 'CLOSED'}
          </div>
        </div>
      </div>

      {/* Place name */}
      <h3 style={{
        fontSize: '24px',
        fontWeight: '800',
        margin: '0 0 6px 0',
        color: '#1A1A1A',
        letterSpacing: '-0.5px',
      }}>
        {name}
      </h3>

      {/* Description */}
      <p style={{
        fontSize: '15px',
        color: '#666',
        margin: '0 0 16px 0',
        lineHeight: '1.5',
      }}>
        {description}
      </p>

      {/* Info row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}>
        {/* Rating */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: 'rgba(255, 215, 0, 0.15)',
          borderRadius: '10px',
        }}>
          <span style={{ fontSize: '16px' }}>⭐</span>
          <span style={{
            fontSize: '15px',
            fontWeight: '700',
            color: '#D4AF37',
          }}>
            {rating}
          </span>
        </div>

        {/* Distance */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: 'rgba(0, 206, 209, 0.1)',
          borderRadius: '10px',
        }}>
          <span style={{ fontSize: '16px' }}>📍</span>
          <span style={{
            fontSize: '15px',
            fontWeight: '700',
            color: '#00CED1',
          }}>
            {distance}
          </span>
        </div>

        {/* Price */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: 'rgba(255, 153, 102, 0.1)',
          borderRadius: '10px',
        }}>
          <span style={{ fontSize: '16px' }}>💰</span>
          <span style={{
            fontSize: '15px',
            fontWeight: '700',
            color: '#FF9966',
          }}>
            {priceLevel}
          </span>
        </div>
      </div>

      {/* Tags */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}>
        {tags.map((tag, i) => (
          <div
            key={i}
            style={{
              padding: '6px 14px',
              background: 'rgba(0, 0, 0, 0.06)',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#333',
            }}
          >
            {tag}
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 56px 56px 56px',
        gap: '8px',
      }}>
        {/* Saved button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSaved(!saved);
          }}
          style={{
            padding: '14px 20px',
            background: saved 
              ? 'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)'
              : 'rgba(0, 0, 0, 0.06)',
            border: 'none',
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: '700',
            color: saved ? '#FFF' : '#333',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
        >
          {saved ? '❤️' : '🤍'} {saved ? 'Saved' : 'Save'}
        </button>

        {/* Call button */}
        <ActionButton icon="📞" color="#0099FF" />
        {/* WhatsApp button */}
        <ActionButton icon="💬" color="#25D366" />
        {/* Directions button */}
        <ActionButton icon="🗺️" color="#FF9500" />
      </div>
    </div>
  );
};

const ActionButton = ({ icon, color }) => (
  <button style={{
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: color,
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 4px 16px ${color}40`,
    transition: 'all 0.2s',
  }}>
    {icon}
  </button>
);
```

---

## Key Design Features

✅ **Light, Beachy Backgrounds** - Gradients from turquoise to cream
✅ **Soft Shadows** - Subtle depth with colored shadows  
✅ **Rounded Corners** - 24px+ for organic feel
✅ **Wave Decorations** - SVG wave patterns in headers
✅ **Glass Morphism** - Frosted glass effects
✅ **Turquoise Accents** - Ocean blue (#00CED1) throughout
✅ **Colorful Action Buttons** - Blue, green, orange with shadows
✅ **Smooth Animations** - Slide up, fade in effects
✅ **Tag Pills** - Rounded tag badges
✅ **Status Badges** - Gradient open/closed indicators
✅ **Pattern Overlays** - Subtle dot patterns on active buttons

This design transforms your dark Places modal into a bright, beachy Tulum experience!
