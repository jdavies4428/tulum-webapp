# Feature Spec: User-to-User Chat System

## Overview
Real-time messaging system that allows Tulum Discovery users to chat with each other, share recommendations, coordinate meetups, and ask locals for advice. Instagram/WhatsApp-style chat experience.

---

## User Story
**As a** tourist in Tulum  
**I want** to chat with other users and locals  
**So that** I can get real-time advice, share discoveries, and coordinate group activities

---

## Why Add Chat?

### Benefits:
✅ **Community building** - Connect travelers and locals
✅ **Real-time advice** - "Is Playa Paraiso good today?"
✅ **Group coordination** - Plan activities with friends
✅ **Local expertise** - Ask locals for insider tips
✅ **Engagement boost** - Users spend more time in app
✅ **Network effects** - More valuable with more users

### Use Cases:
- "Hey local, what beach is best today?"
- "Anyone want to split a taxi to the cenotes?"
- "Just found an amazing spot, check it out!"
- "Thanks for the restaurant rec, it was perfect!"
- Travel groups coordinating plans

---

## Technical Stack

### Backend Options

#### Option 1: Firebase Realtime Database (Easiest)
```javascript
// Pros:
- Real-time out of the box
- No server management
- WebSocket handled automatically
- Offline support built-in
- Free tier: 1GB data, 10GB bandwidth

// Cons:
- Vendor lock-in
- Limited querying
- Cost scales with usage
```

#### Option 2: Socket.io + Node.js (Full Control)
```javascript
// Pros:
- Complete control
- Custom features
- No vendor lock-in
- Scalable

// Cons:
- More complex setup
- Need to manage server
- Handle WebSocket connections
```

#### Option 3: Stream Chat API (Fastest)
```javascript
// Pros:
- Built for chat
- All features included
- Easy integration
- Great UI components

// Cons:
- Paid service ($99/month+)
- Another dependency
```

**Recommendation: Firebase for MVP, migrate to Socket.io if needed**

---

## Database Schema

### Firebase Structure

```javascript
// users/{userId}
{
  id: "user123",
  name: "Sarah Johnson",
  photoURL: "https://...",
  bio: "Local beach expert",
  online: true,
  lastSeen: 1707340800000,
  fcmToken: "..." // For push notifications
}

// conversations/{conversationId}
{
  id: "conv456",
  participants: ["user123", "user789"],
  participantDetails: {
    user123: { name: "Sarah", photo: "..." },
    user789: { name: "Mike", photo: "..." }
  },
  lastMessage: {
    text: "See you at 3pm!",
    senderId: "user123",
    timestamp: 1707340800000
  },
  unreadCount: {
    user123: 0,
    user789: 2
  },
  createdAt: 1707340800000,
  updatedAt: 1707340800000
}

// messages/{conversationId}/messages/{messageId}
{
  id: "msg001",
  conversationId: "conv456",
  senderId: "user123",
  text: "Have you been to Azulik?",
  timestamp: 1707340800000,
  read: false,
  type: "text", // text, image, place, location
  metadata: {
    // For place sharing
    placeId: "place123",
    placeName: "Azulik Beach Club",
    // For images
    imageUrl: "https://...",
    // For location
    latitude: 20.2114,
    longitude: -87.4654
  }
}

// typing/{conversationId}
{
  user123: true,
  user789: false
}
```

---

## Core Components

### 1. Chat List Screen

```jsx
import React, { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { database } from './firebase';

const ChatListScreen = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Listen to conversations where user is participant
    const conversationsRef = ref(database, 'conversations');
    const q = query(conversationsRef, orderByChild('updatedAt'));

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Filter conversations where user is participant
      const userConversations = Object.values(data)
        .filter(conv => conv.participants.includes(user.id))
        .sort((a, b) => b.updatedAt - a.updatedAt);

      setConversations(userConversations);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) return <LoadingScreen />;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)',
      paddingBottom: '80px',
    }}>
      {/* Header */}
      <div style={{
        padding: '24px',
        background: 'rgba(255, 255, 255, 0.9)',
        borderBottom: '2px solid rgba(0, 206, 209, 0.2)',
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '800',
          margin: '0 0 8px 0',
          background: 'linear-gradient(135deg, #0099CC 0%, #00CED1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Messages
        </h1>
        <p style={{
          fontSize: '15px',
          color: '#666',
          margin: 0,
        }}>
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Conversation list */}
      <div style={{ padding: '16px' }}>
        {conversations.length === 0 ? (
          <EmptyChats />
        ) : (
          conversations.map((conv) => (
            <ConversationCard
              key={conv.id}
              conversation={conv}
              currentUserId={user.id}
              onClick={() => openConversation(conv.id)}
            />
          ))
        )}
      </div>

      {/* New chat FAB */}
      <button
        onClick={() => openNewChatModal()}
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)',
          border: 'none',
          boxShadow: '0 8px 24px rgba(0, 206, 209, 0.4)',
          cursor: 'pointer',
          fontSize: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFF',
          zIndex: 100,
        }}
      >
        ✎
      </button>
    </div>
  );
};

const ConversationCard = ({ conversation, currentUserId, onClick }) => {
  const otherUser = getOtherParticipant(conversation, currentUserId);
  const unreadCount = conversation.unreadCount?.[currentUserId] || 0;
  const isOnline = otherUser.online;

  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '16px',
        marginBottom: '12px',
        border: '2px solid rgba(0, 206, 209, 0.1)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.05)';
      }}
    >
      {/* Avatar with online indicator */}
      <div style={{ position: 'relative' }}>
        <img
          src={otherUser.photoURL}
          alt={otherUser.name}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: '3px solid #00CED1',
          }}
        />
        {isOnline && (
          <div style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: '#50C878',
            border: '2px solid #FFF',
          }} />
        )}
      </div>

      {/* Message info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '4px',
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#333',
          }}>
            {otherUser.name}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#999',
          }}>
            {formatTimestamp(conversation.lastMessage?.timestamp)}
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{
            fontSize: '14px',
            color: unreadCount > 0 ? '#333' : '#999',
            fontWeight: unreadCount > 0 ? '600' : '400',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {conversation.lastMessage?.text || 'No messages yet'}
          </div>
          
          {unreadCount > 0 && (
            <div style={{
              minWidth: '20px',
              height: '20px',
              borderRadius: '10px',
              background: '#00CED1',
              color: '#FFF',
              fontSize: '11px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 6px',
              marginLeft: '8px',
            }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyChats = () => (
  <div style={{
    textAlign: 'center',
    padding: '60px 20px',
  }}>
    <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
    <h3 style={{
      fontSize: '20px',
      fontWeight: '700',
      color: '#333',
      marginBottom: '8px',
    }}>
      No conversations yet
    </h3>
    <p style={{
      fontSize: '15px',
      color: '#666',
      marginBottom: '24px',
    }}>
      Start chatting with travelers and locals
    </p>
    <button
      onClick={() => openNewChatModal()}
      style={{
        padding: '14px 28px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)',
        border: 'none',
        color: '#FFF',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(0, 206, 209, 0.3)',
      }}
    >
      Start a Conversation
    </button>
  </div>
);
```

---

### 2. Chat Screen

```jsx
const ChatScreen = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [conversation, setConversation] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  // Load conversation details
  useEffect(() => {
    const convRef = ref(database, `conversations/${conversationId}`);
    const unsubscribe = onValue(convRef, (snapshot) => {
      setConversation(snapshot.val());
    });
    return () => unsubscribe();
  }, [conversationId]);

  // Load messages
  useEffect(() => {
    const messagesRef = ref(database, `messages/${conversationId}/messages`);
    const q = query(messagesRef, orderByChild('timestamp'));

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setMessages([]);
        return;
      }

      const messageList = Object.values(data).sort((a, b) => 
        a.timestamp - b.timestamp
      );
      setMessages(messageList);

      // Mark messages as read
      markMessagesAsRead(conversationId, user.id);

      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [conversationId, user.id]);

  // Listen for typing indicator
  useEffect(() => {
    const typingRef = ref(database, `typing/${conversationId}`);
    const unsubscribe = onValue(typingRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const otherUserId = conversation?.participants.find(id => id !== user.id);
      setOtherUserTyping(data[otherUserId] || false);
    });

    return () => unsubscribe();
  }, [conversationId, user.id, conversation]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const message = {
      id: generateId(),
      conversationId,
      senderId: user.id,
      text: inputText.trim(),
      timestamp: Date.now(),
      read: false,
      type: 'text',
    };

    // Send message
    await sendMessage(conversationId, message);

    // Update conversation last message
    await updateConversationLastMessage(conversationId, message);

    // Clear input
    setInputText('');

    // Stop typing indicator
    setTypingIndicator(conversationId, user.id, false);
  };

  const handleTyping = (text) => {
    setInputText(text);

    // Set typing indicator
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      setTypingIndicator(conversationId, user.id, true);
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
      setTypingIndicator(conversationId, user.id, false);
    }
  };

  if (!conversation) return <LoadingScreen />;

  const otherUser = getOtherParticipant(conversation, user.id);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)',
    }}>
      {/* Header */}
      <ChatHeader user={otherUser} onBack={() => navigate('/messages')} />

      {/* Messages area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === user.id}
            showAvatar={shouldShowAvatar(messages, index, user.id)}
            otherUser={otherUser}
          />
        ))}

        {/* Typing indicator */}
        {otherUserTyping && (
          <TypingIndicator user={otherUser} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <ChatInput
        value={inputText}
        onChange={handleTyping}
        onSend={handleSend}
        onSharePlace={() => openPlacePicker()}
        onShareLocation={() => shareLocation()}
      />
    </div>
  );
};

const ChatHeader = ({ user, onBack }) => (
  <div style={{
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderBottom: '2px solid rgba(0, 206, 209, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  }}>
    <button
      onClick={onBack}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'rgba(0, 206, 209, 0.1)',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
      }}
    >
      ←
    </button>

    <img
      src={user.photoURL}
      alt={user.name}
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        border: '2px solid #00CED1',
      }}
    />

    <div style={{ flex: 1 }}>
      <div style={{
        fontSize: '16px',
        fontWeight: '700',
        color: '#333',
      }}>
        {user.name}
      </div>
      <div style={{
        fontSize: '13px',
        color: user.online ? '#50C878' : '#999',
      }}>
        {user.online ? 'Active now' : `Last seen ${formatLastSeen(user.lastSeen)}`}
      </div>
    </div>

    <button
      onClick={() => viewProfile(user.id)}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'rgba(0, 206, 209, 0.1)',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
      }}
    >
      ℹ️
    </button>
  </div>
);

const MessageBubble = ({ message, isOwn, showAvatar, otherUser }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: isOwn ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap: '8px',
    }}>
      {/* Avatar (other user only) */}
      {!isOwn && (
        <div style={{ width: '32px', height: '32px' }}>
          {showAvatar && (
            <img
              src={otherUser.photoURL}
              alt={otherUser.name}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '2px solid #00CED1',
              }}
            />
          )}
        </div>
      )}

      {/* Message content */}
      <div style={{
        maxWidth: '70%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOwn ? 'flex-end' : 'flex-start',
      }}>
        {message.type === 'text' && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '18px',
            background: isOwn
              ? 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)'
              : 'rgba(255, 255, 255, 0.95)',
            color: isOwn ? '#FFF' : '#333',
            fontSize: '15px',
            lineHeight: '1.4',
            wordWrap: 'break-word',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}>
            {message.text}
          </div>
        )}

        {message.type === 'place' && (
          <PlaceMessage message={message} isOwn={isOwn} />
        )}

        {message.type === 'image' && (
          <ImageMessage message={message} isOwn={isOwn} />
        )}

        <div style={{
          fontSize: '11px',
          color: '#999',
          marginTop: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          {formatTime(message.timestamp)}
          {isOwn && message.read && <span style={{ color: '#00CED1' }}>✓✓</span>}
        </div>
      </div>
    </div>
  );
};

const ChatInput = ({ value, onChange, onSend, onSharePlace, onShareLocation }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div style={{
      padding: '16px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '2px solid rgba(0, 206, 209, 0.2)',
    }}>
      {/* Action buttons */}
      {showActions && (
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '12px',
        }}>
          <ActionButton
            icon="📍"
            label="Share Place"
            onClick={onSharePlace}
          />
          <ActionButton
            icon="📷"
            label="Photo"
            onClick={() => uploadImage()}
          />
          <ActionButton
            icon="🗺️"
            label="Location"
            onClick={onShareLocation}
          />
        </div>
      )}

      {/* Input row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <button
          onClick={() => setShowActions(!showActions)}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(0, 206, 209, 0.1)',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            transform: showActions ? 'rotate(45deg)' : 'none',
            transition: 'transform 0.3s',
          }}
        >
          +
        </button>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSend()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '24px',
            border: '2px solid rgba(0, 206, 209, 0.2)',
            fontSize: '15px',
            outline: 'none',
          }}
        />

        <button
          onClick={onSend}
          disabled={!value.trim()}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: value.trim()
              ? 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)'
              : 'rgba(0, 206, 209, 0.2)',
            border: 'none',
            fontSize: '20px',
            cursor: value.trim() ? 'pointer' : 'not-allowed',
            boxShadow: value.trim() ? '0 4px 12px rgba(0, 206, 209, 0.3)' : 'none',
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
};

const ActionButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '10px 16px',
      borderRadius: '12px',
      background: 'rgba(0, 206, 209, 0.1)',
      border: '2px solid rgba(0, 206, 209, 0.3)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#00CED1',
    }}
  >
    <span style={{ fontSize: '18px' }}>{icon}</span>
    <span>{label}</span>
  </button>
);

const TypingIndicator = ({ user }) => (
  <div style={{
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
  }}>
    <img
      src={user.photoURL}
      alt={user.name}
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        border: '2px solid #00CED1',
      }}
    />
    <div style={{
      padding: '12px 16px',
      borderRadius: '18px',
      background: 'rgba(255, 255, 255, 0.95)',
      display: 'flex',
      gap: '4px',
    }}>
      <div className="typing-dot" style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#999',
        animation: 'typing 1.4s infinite',
      }} />
      <div className="typing-dot" style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#999',
        animation: 'typing 1.4s infinite 0.2s',
      }} />
      <div className="typing-dot" style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#999',
        animation: 'typing 1.4s infinite 0.4s',
      }} />
    </div>
  </div>
);
```

---

## Special Message Types

### 1. Place Sharing

```jsx
const PlaceMessage = ({ message, isOwn }) => {
  const place = message.metadata;

  return (
    <div
      onClick={() => viewPlace(place.placeId)}
      style={{
        width: '260px',
        borderRadius: '16px',
        overflow: 'hidden',
        background: isOwn
          ? 'rgba(255, 255, 255, 0.2)'
          : 'rgba(255, 255, 255, 0.95)',
        border: isOwn ? '2px solid rgba(255, 255, 255, 0.3)' : '2px solid rgba(0, 206, 209, 0.2)',
        cursor: 'pointer',
      }}
    >
      {place.imageUrl && (
        <img
          src={place.imageUrl}
          alt={place.placeName}
          style={{
            width: '100%',
            height: '140px',
            objectFit: 'cover',
          }}
        />
      )}
      <div style={{ padding: '12px' }}>
        <div style={{
          fontSize: '15px',
          fontWeight: '700',
          color: isOwn ? '#FFF' : '#333',
          marginBottom: '4px',
        }}>
          📍 {place.placeName}
        </div>
        <div style={{
          fontSize: '13px',
          color: isOwn ? 'rgba(255, 255, 255, 0.8)' : '#666',
        }}>
          {place.category} • {place.distance}
        </div>
        {place.rating && (
          <div style={{
            fontSize: '13px',
            color: isOwn ? 'rgba(255, 255, 255, 0.9)' : '#00CED1',
            marginTop: '4px',
          }}>
            ⭐ {place.rating}/10
          </div>
        )}
      </div>
    </div>
  );
};
```

### 2. Image Sharing

```jsx
const ImageMessage = ({ message, isOwn }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <img
        src={message.metadata.imageUrl}
        alt="Shared image"
        onClick={() => setLightboxOpen(true)}
        style={{
          maxWidth: '260px',
          borderRadius: '16px',
          cursor: 'pointer',
          border: isOwn
            ? '2px solid rgba(255, 255, 255, 0.3)'
            : '2px solid rgba(0, 206, 209, 0.2)',
        }}
      />

      {lightboxOpen && (
        <ImageLightbox
          imageUrl={message.metadata.imageUrl}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
};
```

### 3. Location Sharing

```jsx
const LocationMessage = ({ message, isOwn }) => {
  const { latitude, longitude } = message.metadata;

  return (
    <div
      onClick={() => openMap(latitude, longitude)}
      style={{
        width: '260px',
        height: '140px',
        borderRadius: '16px',
        overflow: 'hidden',
        background: `url(https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+00CED1(${longitude},${latitude})/${longitude},${latitude},14,0/260x140@2x?access_token=YOUR_TOKEN)`,
        backgroundSize: 'cover',
        border: isOwn
          ? '2px solid rgba(255, 255, 255, 0.3)'
          : '2px solid rgba(0, 206, 209, 0.2)',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '12px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
        color: '#FFF',
        fontSize: '13px',
        fontWeight: '600',
      }}>
        📍 Current Location
      </div>
    </div>
  );
};
```

---

## Firebase Helper Functions

```javascript
// firebase-chat.js
import { ref, push, set, update, get } from 'firebase/database';
import { database } from './firebase';

// Send message
export const sendMessage = async (conversationId, message) => {
  const messageRef = ref(database, `messages/${conversationId}/messages/${message.id}`);
  await set(messageRef, message);
};

// Update conversation last message
export const updateConversationLastMessage = async (conversationId, message) => {
  const convRef = ref(database, `conversations/${conversationId}`);
  const updates = {
    lastMessage: {
      text: message.text,
      senderId: message.senderId,
      timestamp: message.timestamp,
    },
    updatedAt: message.timestamp,
  };

  // Increment unread count for other user
  const convSnapshot = await get(convRef);
  const conv = convSnapshot.val();
  const otherUserId = conv.participants.find(id => id !== message.senderId);
  
  updates[`unreadCount/${otherUserId}`] = (conv.unreadCount?.[otherUserId] || 0) + 1;

  await update(convRef, updates);
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId, userId) => {
  const convRef = ref(database, `conversations/${conversationId}`);
  await update(convRef, {
    [`unreadCount/${userId}`]: 0
  });

  // Mark individual messages as read
  const messagesRef = ref(database, `messages/${conversationId}/messages`);
  const snapshot = await get(messagesRef);
  const messages = snapshot.val();

  if (!messages) return;

  const updates = {};
  Object.entries(messages).forEach(([msgId, msg]) => {
    if (msg.senderId !== userId && !msg.read) {
      updates[`${msgId}/read`] = true;
    }
  });

  if (Object.keys(updates).length > 0) {
    await update(messagesRef, updates);
  }
};

// Set typing indicator
export const setTypingIndicator = async (conversationId, userId, isTyping) => {
  const typingRef = ref(database, `typing/${conversationId}/${userId}`);
  await set(typingRef, isTyping);
};

// Create new conversation
export const createConversation = async (currentUserId, otherUserId, otherUserData) => {
  const conversationId = generateConversationId(currentUserId, otherUserId);
  
  const conversation = {
    id: conversationId,
    participants: [currentUserId, otherUserId],
    participantDetails: {
      [currentUserId]: {
        name: getCurrentUser().displayName,
        photo: getCurrentUser().photoURL,
      },
      [otherUserId]: {
        name: otherUserData.displayName,
        photo: otherUserData.photoURL,
      }
    },
    lastMessage: null,
    unreadCount: {
      [currentUserId]: 0,
      [otherUserId]: 0,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const convRef = ref(database, `conversations/${conversationId}`);
  await set(convRef, conversation);

  return conversationId;
};

// Generate conversation ID (consistent for same participants)
const generateConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};

// Update online status
export const updateOnlineStatus = async (userId, isOnline) => {
  const userRef = ref(database, `users/${userId}`);
  await update(userRef, {
    online: isOnline,
    lastSeen: Date.now(),
  });
};
```

---

## Push Notifications

```javascript
// Setup FCM (Firebase Cloud Messaging)
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const messaging = getMessaging();

// Request permission and get token
export const setupPushNotifications = async () => {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY'
      });

      // Save token to user profile
      await saveTokenToDatabase(token);
    }
  } catch (error) {
    console.error('Push notification error:', error);
  }
};

// Listen for foreground messages
onMessage(messaging, (payload) => {
  console.log('Message received:', payload);
  
  // Show in-app notification
  showInAppNotification({
    title: payload.notification.title,
    body: payload.notification.body,
    data: payload.data,
  });
});

// Send notification (backend function)
export const sendChatNotification = async (recipientId, senderName, messageText) => {
  // This would be a cloud function
  const notification = {
    title: senderName,
    body: messageText,
    click_action: '/messages',
    icon: '/icon-192x192.png',
  };

  // Send via FCM
  await sendFCMNotification(recipientId, notification);
};
```

---

## Moderation & Safety

### 1. Report User

```jsx
const ReportUserModal = ({ userId, onClose }) => {
  const [reason, setReason] = useState('');

  const reasons = [
    'Spam',
    'Harassment',
    'Inappropriate content',
    'Scam/Fraud',
    'Other',
  ];

  const handleReport = async () => {
    await reportUser({
      reportedUserId: userId,
      reportedBy: currentUser.id,
      reason,
      timestamp: Date.now(),
    });

    alert('User reported. Thank you for keeping our community safe.');
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2>Report User</h2>
      {reasons.map(r => (
        <button
          key={r}
          onClick={() => setReason(r)}
          style={{
            background: reason === r ? '#FF6B6B' : '#FFF',
            color: reason === r ? '#FFF' : '#333',
          }}
        >
          {r}
        </button>
      ))}
      <button onClick={handleReport}>Submit Report</button>
    </Modal>
  );
};
```

### 2. Block User

```javascript
export const blockUser = async (currentUserId, blockedUserId) => {
  const blockRef = ref(database, `blocks/${currentUserId}/${blockedUserId}`);
  await set(blockRef, true);

  // Delete conversation
  const conversationId = generateConversationId(currentUserId, blockedUserId);
  await deleteConversation(conversationId);
};

export const isUserBlocked = async (userId, otherUserId) => {
  const blockRef = ref(database, `blocks/${userId}/${otherUserId}`);
  const snapshot = await get(blockRef);
  return snapshot.val() === true;
};
```

---

## Helper Functions

```javascript
// Format timestamp
export const formatTimestamp = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  
  return new Date(timestamp).toLocaleDateString();
};

export const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const formatLastSeen = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 5) return 'just now';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  
  return new Date(timestamp).toLocaleDateString();
};

// Check if should show avatar
export const shouldShowAvatar = (messages, index, currentUserId) => {
  const currentMessage = messages[index];
  const nextMessage = messages[index + 1];

  // Show avatar if:
  // - Last message from this user
  // - Next message is from different user
  // - Last message overall

  if (!nextMessage) return true;
  if (currentMessage.senderId !== currentUserId && 
      nextMessage.senderId !== currentMessage.senderId) {
    return true;
  }

  return false;
};

export const getOtherParticipant = (conversation, currentUserId) => {
  const otherUserId = conversation.participants.find(id => id !== currentUserId);
  return conversation.participantDetails[otherUserId];
};

export const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
```

---

## CSS Animations

```css
@keyframes typing {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

---

## Success Metrics

### KPIs:
- Active conversations: >30% of users
- Messages sent per user: >10/week
- Response rate: >60%
- Chat satisfaction: >4.5/5

### Analytics Events:
```javascript
analytics.track('conversation_started');
analytics.track('message_sent', { type: 'text' });
analytics.track('place_shared');
analytics.track('user_blocked');
```

---

## Implementation Checklist

### Phase 1: Core Chat (Week 1)
- [ ] Firebase setup
- [ ] Chat list screen
- [ ] Chat screen
- [ ] Text messaging
- [ ] Real-time updates
- [ ] Typing indicators
- [ ] Read receipts

### Phase 2: Rich Content (Week 2)
- [ ] Image sharing
- [ ] Place sharing
- [ ] Location sharing
- [ ] Image lightbox
- [ ] Place preview cards

### Phase 3: Notifications (Week 3)
- [ ] Push notification setup
- [ ] New message notifications
- [ ] In-app notifications
- [ ] Badge counts
- [ ] Sound/vibration

### Phase 4: Safety (Week 4)
- [ ] Report user
- [ ] Block user
- [ ] Message moderation
- [ ] Spam detection
- [ ] Admin tools

This creates a complete, production-ready chat system! 💬✨
