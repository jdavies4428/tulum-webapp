# Feature Spec: Quick Actions FAB (Floating Action Button)

## Overview
A floating action button in the bottom-right corner that expands to show 4 essential quick actions for tourists: Translation, Taxi, Emergency SOS, and Currency converter.

---

## User Story
**As a** tourist in Tulum  
**I want** instant access to critical travel tools  
**So that** I can handle urgent situations without navigating through menus

---

## Success Metrics
- 40%+ daily active users use at least one quick action
- Average 2.5 quick action uses per session
- <1 second to access any feature

---

## Visual Design

### Collapsed State
```
                    ┌────┐
                    │ ⚡ │  <- Floating button
                    └────┘
```

### Expanded State
```
                    ┌────┐
                    │ 🚨 │  Emergency
                    └────┘
                    ┌────┐
                    │ 🌐 │  Translate
                    └────┘
                    ┌────┐
                    │ 🚕 │  Taxi
                    └────┘
                    ┌────┐
                    │ 💱 │  Currency
                    └────┘
                    ┌────┐
                    │ ✕  │  Close
                    └────┘
```

---

## Complete Implementation

```jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QuickActionsFAB = ({ 
  onTranslate,
  onCallTaxi,
  onEmergency,
  onCurrency 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    {
      id: 'emergency',
      icon: '🚨',
      label: 'SOS',
      color: '#FF0000',
      action: onEmergency,
      priority: 'critical'
    },
    {
      id: 'translate',
      icon: '🌐',
      label: 'Translate',
      color: '#00CED1',
      action: onTranslate
    },
    {
      id: 'taxi',
      icon: '🚕',
      label: 'Taxi',
      color: '#FFD700',
      action: onCallTaxi
    },
    {
      id: 'currency',
      icon: '💱',
      label: 'Currency',
      color: '#50C878',
      action: onCurrency
    }
  ];

  const handleActionClick = (action) => {
    setIsExpanded(false);
    action.action();
    
    // Analytics
    analytics.track('quick_action_used', {
      action: action.id,
      label: action.label
    });
    
    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <>
      {/* Backdrop when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 998,
            }}
          />
        )}
      </AnimatePresence>

      {/* FAB Container */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column-reverse',
        alignItems: 'flex-end',
        gap: '12px',
      }}>
        {/* Action Buttons (when expanded) */}
        <AnimatePresence>
          {isExpanded && actions.map((action, index) => (
            <motion.button
              key={action.id}
              initial={{ 
                opacity: 0, 
                scale: 0,
                y: 20 
              }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: 0 
              }}
              exit={{ 
                opacity: 0, 
                scale: 0,
                y: 20 
              }}
              transition={{ 
                delay: index * 0.05,
                type: 'spring',
                stiffness: 400,
                damping: 25
              }}
              onClick={() => handleActionClick(action)}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: action.priority === 'critical'
                  ? 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)'
                  : `linear-gradient(135deg, ${action.color} 0%, ${action.color}DD 100%)`,
                border: 'none',
                boxShadow: `0 8px 24px ${action.color}40`,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span style={{ fontSize: '24px' }}>{action.icon}</span>
              <span style={{
                fontSize: '9px',
                fontWeight: '700',
                color: '#FFF',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {action.label}
              </span>

              {/* Pulsing animation for emergency */}
              {action.priority === 'critical' && (
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  style={{
                    position: 'absolute',
                    inset: '-4px',
                    borderRadius: '50%',
                    border: '2px solid #FF0000',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Main FAB Toggle */}
        <motion.button
          animate={{ 
            rotate: isExpanded ? 45 : 0,
            scale: isExpanded ? 1.1 : 1
          }}
          transition={{ type: 'spring', stiffness: 300 }}
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: isExpanded
              ? 'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)'
              : 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)',
            border: 'none',
            boxShadow: '0 8px 32px rgba(0, 206, 209, 0.4)',
            cursor: 'pointer',
            fontSize: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            if (!isExpanded) {
              e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 48px rgba(0, 206, 209, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isExpanded) {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 206, 209, 0.4)';
            }
          }}
        >
          {isExpanded ? '✕' : '⚡'}
        </motion.button>

        {/* Hint label (shows briefly on first load) */}
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              position: 'absolute',
              right: '80px',
              bottom: '20px',
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#FFF',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            Quick Actions
          </motion.div>
        )}
      </div>
    </>
  );
};

export default QuickActionsFAB;
```

---

## Action Implementations

### 1. Emergency SOS
```jsx
const handleEmergency = () => {
  // Show emergency modal
  showModal({
    title: '🚨 Emergency Services',
    content: (
      <div>
        <EmergencyButton
          icon="🚓"
          label="Police"
          number="911"
          onClick={() => window.location.href = 'tel:911'}
        />
        <EmergencyButton
          icon="🚑"
          label="Ambulance"
          number="065"
          onClick={() => window.location.href = 'tel:065'}
        />
        <EmergencyButton
          icon="🔥"
          label="Fire Department"
          number="068"
          onClick={() => window.location.href = 'tel:068'}
        />
        <EmergencyButton
          icon="🏥"
          label="Hospital"
          number="+52 984 871 2000"
          onClick={() => window.location.href = 'tel:+529848712000'}
        />
        <EmergencyButton
          icon="🇺🇸"
          label="US Embassy"
          number="+52 55 5080 2000"
          onClick={() => window.location.href = 'tel:+525550802000'}
        />
      </div>
    )
  });
};

const EmergencyButton = ({ icon, label, number, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      padding: '16px',
      marginBottom: '12px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)',
      border: 'none',
      color: '#FFF',
      fontSize: '16px',
      fontWeight: '700',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    }}
  >
    <span style={{ fontSize: '24px' }}>{icon}</span>
    <div style={{ flex: 1, textAlign: 'left' }}>
      <div>{label}</div>
      <div style={{ fontSize: '13px', opacity: 0.9 }}>{number}</div>
    </div>
    <span>📞</span>
  </button>
);
```

### 2. Translation
```jsx
const handleTranslate = () => {
  // Open translation modal (from your translation feature)
  openTranslationModal();
};
```

### 3. Call Taxi
```jsx
const handleCallTaxi = () => {
  showModal({
    title: '🚕 Call a Taxi',
    content: (
      <div>
        <TaxiOption
          name="Local Taxi Stand"
          number="+52 984 871 2345"
          type="Regular"
          estimatedWait="5-10 min"
        />
        <TaxiOption
          name="Uber"
          type="App-based"
          action={() => window.open('uber://', '_blank')}
        />
        <TaxiOption
          name="Private Driver (Mario)"
          number="+52 984 123 4567"
          type="Private"
          estimatedWait="15-20 min"
          note="Recommended by locals"
        />
      </div>
    )
  });
};

const TaxiOption = ({ name, number, type, estimatedWait, action, note }) => (
  <div style={{
    padding: '16px',
    background: 'rgba(255, 215, 0, 0.1)',
    borderRadius: '12px',
    marginBottom: '12px',
    border: '2px solid rgba(255, 215, 0, 0.3)',
  }}>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
    }}>
      <div>
        <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
          {name}
        </div>
        <div style={{ fontSize: '13px', color: '#666' }}>
          {type} {estimatedWait && `• ${estimatedWait}`}
        </div>
      </div>
    </div>
    
    {note && (
      <div style={{
        fontSize: '12px',
        color: '#50C878',
        marginBottom: '8px',
      }}>
        ✨ {note}
      </div>
    )}
    
    <button
      onClick={action || (() => window.location.href = `tel:${number}`)}
      style={{
        width: '100%',
        padding: '12px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        border: 'none',
        color: '#000',
        fontWeight: '700',
        cursor: 'pointer',
      }}
    >
      {action ? 'Open App' : `📞 Call ${number}`}
    </button>
  </div>
);
```

### 4. Currency Converter
```jsx
const handleCurrency = () => {
  showModal({
    title: '💱 Currency Converter',
    content: <CurrencyConverter />
  });
};

const CurrencyConverter = () => {
  const [amount, setAmount] = useState(100);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('MXN');
  const [result, setResult] = useState(null);

  useEffect(() => {
    const convert = async () => {
      const rate = await getExchangeRate(fromCurrency, toCurrency);
      setResult(amount * rate);
    };
    convert();
  }, [amount, fromCurrency, toCurrency]);

  return (
    <div>
      {/* Amount input */}
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{
          width: '100%',
          padding: '16px',
          fontSize: '24px',
          fontWeight: '700',
          borderRadius: '12px',
          border: '2px solid rgba(0, 206, 209, 0.3)',
          marginBottom: '16px',
          textAlign: 'center',
        }}
      />

      {/* Currency selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', marginBottom: '20px' }}>
        <select
          value={fromCurrency}
          onChange={(e) => setFromCurrency(e.target.value)}
          style={{
            padding: '12px',
            borderRadius: '10px',
            border: '2px solid rgba(0, 206, 209, 0.3)',
            fontSize: '15px',
            fontWeight: '600',
          }}
        >
          <option value="USD">🇺🇸 USD</option>
          <option value="EUR">🇪🇺 EUR</option>
          <option value="GBP">🇬🇧 GBP</option>
          <option value="CAD">🇨🇦 CAD</option>
        </select>

        <button
          onClick={() => {
            const temp = fromCurrency;
            setFromCurrency(toCurrency);
            setToCurrency(temp);
          }}
          style={{
            width: '44px',
            borderRadius: '50%',
            background: 'rgba(0, 206, 209, 0.15)',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
          }}
        >
          ⇄
        </button>

        <select
          value={toCurrency}
          onChange={(e) => setToCurrency(e.target.value)}
          style={{
            padding: '12px',
            borderRadius: '10px',
            border: '2px solid rgba(0, 206, 209, 0.3)',
            fontSize: '15px',
            fontWeight: '600',
          }}
        >
          <option value="MXN">🇲🇽 MXN</option>
          <option value="USD">🇺🇸 USD</option>
          <option value="EUR">🇪🇺 EUR</option>
        </select>
      </div>

      {/* Result */}
      {result && (
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)',
          borderRadius: '16px',
          textAlign: 'center',
          color: '#FFF',
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
            {amount} {fromCurrency} =
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800' }}>
            {result.toFixed(2)} {toCurrency}
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## Mobile Optimizations

### Touch Targets
```css
/* Ensure minimum 44px tap targets */
button {
  min-width: 44px;
  min-height: 44px;
}
```

### Position Adjustments
```javascript
// On iOS, account for safe area
const bottomPosition = isSafariIOS ? 'calc(24px + env(safe-area-inset-bottom))' : '24px';
```

---

## Analytics

```javascript
analytics.track('quick_actions_opened');
analytics.track('quick_action_used', {
  action: 'translate',
  timestamp: Date.now()
});
```

---

## Success Criteria

- [ ] FAB visible on all pages
- [ ] Smooth animations (<16ms)
- [ ] All actions functional
- [ ] Mobile touch-friendly
- [ ] Accessible (keyboard + screen reader)
- [ ] Analytics tracking
- [ ] Haptic feedback on mobile

This FAB provides instant utility! 🚀
