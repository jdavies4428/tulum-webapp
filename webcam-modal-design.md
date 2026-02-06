# Beach Webcam Modal - Tulum Design

## Webcam Modal Component

```jsx
import React, { useState, useRef, useEffect } from 'react';

const BeachWebcamModal = ({ isOpen, onClose }) => {
  const [selectedLocation, setSelectedLocation] = useState('Tulum');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);

  const locations = [
    { 
      id: 'tulum',
      name: 'Tulum',
      icon: '🏖️',
      streamUrl: 'your-tulum-stream-url',
      thumbnail: '/api/placeholder/800/450'
    },
    { 
      id: 'akumal',
      name: 'Akumal',
      icon: '🐢',
      streamUrl: 'your-akumal-stream-url',
      thumbnail: '/api/placeholder/800/450'
    },
  ];

  const currentLocation = locations.find(loc => loc.name === selectedLocation) || locations[0];

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 9998,
          animation: 'fadeIn 0.3s ease-out',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '900px',
          background: 'linear-gradient(135deg, #1a1410 0%, #0a0604 100%)',
          borderRadius: '24px',
          border: '2px solid rgba(0, 206, 209, 0.3)',
          boxShadow: '0 24px 80px rgba(0, 206, 209, 0.2)',
          zIndex: 9999,
          overflow: 'hidden',
          animation: 'slideUpFade 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          background: 'rgba(0, 0, 0, 0.5)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          {/* Left: Camera icon + LIVE badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}>
              📹
            </div>

            <div style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '900',
              color: '#FFF',
              letterSpacing: '1px',
              boxShadow: '0 4px 16px rgba(255, 0, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#FFF',
                animation: 'pulse 2s infinite',
              }} />
              LIVE
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              color: '#FFF',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 107, 107, 0.2)';
              e.currentTarget.style.borderColor = '#FF6B6B';
              e.currentTarget.style.transform = 'rotate(90deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'rotate(0deg)';
            }}
          >
            ✕
          </button>
        </div>

        {/* Location selector */}
        <div style={{
          padding: '16px 24px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
          }}>
            {locations.map((location) => (
              <button
                key={location.id}
                onClick={() => setSelectedLocation(location.name)}
                style={{
                  padding: '16px 20px',
                  background: selectedLocation === location.name
                    ? 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: selectedLocation === location.name
                    ? '2px solid #00CED1'
                    : '2px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  color: '#FFF',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.3s',
                  boxShadow: selectedLocation === location.name
                    ? '0 8px 24px rgba(0, 206, 209, 0.3)'
                    : 'none',
                }}
                onMouseEnter={(e) => {
                  if (selectedLocation !== location.name) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedLocation !== location.name) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <span style={{ fontSize: '24px' }}>{location.icon}</span>
                <span>{location.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Video player */}
        <div style={{
          position: 'relative',
          aspectRatio: '16/9',
          background: '#000',
          overflow: 'hidden',
        }}>
          {/* Video/Stream placeholder */}
          <div
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              background: `url(${currentLocation.thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* Timestamp overlay */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            padding: '8px 16px',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#FFF',
            fontFamily: 'monospace',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            {new Date().toLocaleString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
              weekday: 'short',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            })}
          </div>

          {/* Beach cam label */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            padding: '6px 12px',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '700',
            color: 'rgba(255, 255, 255, 0.7)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}>
            BEACH CAM
          </div>

          {/* Play button overlay */}
          <button
            onClick={togglePlay}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '4px solid rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              color: '#000',
              transition: 'all 0.3s',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
              e.currentTarget.style.boxShadow = '0 12px 48px rgba(0, 206, 209, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          {/* Video controls overlay (bottom) */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            opacity: 0,
            transition: 'opacity 0.3s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
          >
            {/* Control buttons */}
            <button
              onClick={togglePlay}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: 'none',
                color: '#FFF',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            {/* Progress bar placeholder */}
            <div style={{
              flex: 1,
              height: '4px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '2px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: '0%',
                background: 'linear-gradient(90deg, #00CED1 0%, #4DD0E1 100%)',
                borderRadius: '2px',
              }} />
            </div>

            {/* Fullscreen button */}
            <button
              onClick={toggleFullscreen}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: 'none',
                color: '#FFF',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ⛶
            </button>
          </div>
        </div>

        {/* Footer - Location info */}
        <div style={{
          padding: '20px 24px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.7)',
          }}>
            {selectedLocation} Beach Hotel Zone
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.3);
          }
        }
      `}</style>
    </>
  );
};

export default BeachWebcamModal;
```

---

## Mobile-Optimized Webcam Modal

```jsx
const MobileWebcamModal = ({ isOpen, onClose }) => {
  const [selectedLocation, setSelectedLocation] = useState('Tulum');
  const [isPlaying, setIsPlaying] = useState(false);

  const locations = [
    { id: 'tulum', name: 'Tulum', icon: '🏖️' },
    { id: 'akumal', name: 'Akumal', icon: '🐢' },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Full screen overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#000',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
        }}>
          {/* Camera + Live */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}>
              📹
            </div>

            <div style={{
              padding: '6px 12px',
              background: '#FF0000',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '900',
              color: '#FFF',
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#FFF',
                animation: 'pulse 2s infinite',
              }} />
              LIVE
            </div>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#FFF',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Location tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          padding: '12px 16px',
          background: 'rgba(0, 0, 0, 0.5)',
        }}>
          {locations.map((location) => (
            <button
              key={location.id}
              onClick={() => setSelectedLocation(location.name)}
              style={{
                padding: '12px',
                background: selectedLocation === location.name
                  ? 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '12px',
                color: '#FFF',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '20px' }}>{location.icon}</span>
              {location.name}
            </button>
          ))}
        </div>

        {/* Video area */}
        <div style={{
          flex: 1,
          position: 'relative',
          background: '#000',
        }}>
          {/* Video placeholder */}
          <div style={{
            width: '100%',
            height: '100%',
            background: 'url(/api/placeholder/800/600)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />

          {/* Timestamp */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            padding: '6px 12px',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600',
            color: '#FFF',
            fontFamily: 'monospace',
          }}>
            02-06-2026 Fri 11:42:37
          </div>

          {/* Beach cam label */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            padding: '4px 10px',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '4px',
            fontSize: '9px',
            fontWeight: '700',
            color: 'rgba(255, 255, 255, 0.7)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            BEACH CAM
          </div>

          {/* Play button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '3px solid rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              fontSize: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.7)',
          }}>
            {selectedLocation} Beach Hotel Zone
          </div>
        </div>
      </div>
    </>
  );
};
```

---

## Compact Webcam Card (for homepage)

```jsx
const WebcamCard = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        aspectRatio: '16/9',
        position: 'relative',
        background: 'linear-gradient(135deg, #1a1410 0%, #0a0604 100%)',
        borderRadius: '20px',
        border: '2px solid rgba(0, 206, 209, 0.2)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'rgba(0, 206, 209, 0.5)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 206, 209, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(0, 206, 209, 0.2)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: '100%',
        height: '100%',
        background: 'url(/api/placeholder/800/450)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />

      {/* LIVE badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        padding: '6px 12px',
        background: '#FF0000',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: '1px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 4px 12px rgba(255, 0, 0, 0.5)',
      }}>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#FFF',
          animation: 'pulse 2s infinite',
        }} />
        LIVE
      </div>

      {/* Play overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '3px solid rgba(255, 255, 255, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        }}>
          ▶
        </div>
      </div>

      {/* Title overlay */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: '700',
          color: '#FFF',
          marginBottom: '4px',
        }}>
          🎥 Beach Cams
        </div>
        <div style={{
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.7)',
        }}>
          Live beach conditions
        </div>
      </div>
    </button>
  );
};
```

---

## Usage Example

```jsx
const App = () => {
  const [webcamOpen, setWebcamOpen] = useState(false);

  return (
    <>
      {/* Trigger button */}
      <WebcamCard onClick={() => setWebcamOpen(true)} />

      {/* Modal */}
      <BeachWebcamModal
        isOpen={webcamOpen}
        onClose={() => setWebcamOpen(false)}
      />
    </>
  );
};
```

---

## Key Features

✅ **Live badge** - Red with pulsing white dot
✅ **Timestamp overlay** - Monospace font (02-06-2026 Fri 11:42:37)
✅ **Location selector** - Tulum/Akumal tabs with turquoise highlight
✅ **Play button** - Large white circle overlay
✅ **Beach cam label** - Bottom right corner
✅ **Video controls** - Appears on hover
✅ **Fullscreen support**
✅ **Mobile version** - Full-screen takeover
✅ **Responsive design**
✅ **Smooth animations**

Perfect match for your existing design! 🎥🏖️
