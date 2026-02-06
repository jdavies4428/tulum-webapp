# Translation Feature Implementation - Google Translate API

## Overview
Implement real-time translation for travelers in Tulum using Google Cloud Translation API. Support menu translation, conversation mode, image text translation, and speech-to-text translation.

---

## Step 1: Google Cloud Translation API Setup

### Get API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Cloud Translation API**
3. Create credentials → API Key
4. Restrict API key to Translation API only

### Pricing (Very Affordable!)

- **Basic Translation**: $20 per 1 million characters
- **Advanced (v3)**: $20 per 1 million characters
- **First 500,000 characters per month**: FREE!

**Example costs:**
- 1,000 translations (~50 chars each) = $0.001 (basically free!)
- Perfect for tourist app usage

---

## Step 2: Backend API Setup (Node.js/Express)

### Install Dependencies

```bash
npm install @google-cloud/translate express cors dotenv multer
```

### Backend Server

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const { Translate } = require('@google-cloud/translate').v2;
const multer = require('multer');
const vision = require('@google-cloud/vision');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize Google Translate
const translate = new Translate({
  key: process.env.GOOGLE_TRANSLATE_API_KEY
});

// Initialize Vision API for image text extraction
const visionClient = new vision.ImageAnnotatorClient({
  key: process.env.GOOGLE_TRANSLATE_API_KEY
});

// Setup file upload
const upload = multer({ storage: multer.memoryStorage() });

// ENDPOINT 1: Text Translation
app.post('/api/translate/text', async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body;

    const [translation] = await translate.translate(text, {
      from: sourceLanguage || 'auto',
      to: targetLanguage
    });

    res.json({
      success: true,
      original: text,
      translated: translation,
      sourceLanguage: sourceLanguage || 'auto',
      targetLanguage: targetLanguage
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ENDPOINT 2: Detect Language
app.post('/api/translate/detect', async (req, res) => {
  try {
    const { text } = req.body;
    const [detection] = await translate.detect(text);

    res.json({
      success: true,
      language: detection.language,
      confidence: detection.confidence
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ENDPOINT 3: Image Text Translation (OCR + Translate)
app.post('/api/translate/image', upload.single('image'), async (req, res) => {
  try {
    const { targetLanguage } = req.body;
    const imageBuffer = req.file.buffer;

    // Step 1: Extract text from image using Vision API
    const [result] = await visionClient.textDetection(imageBuffer);
    const detections = result.textAnnotations;
    
    if (!detections || detections.length === 0) {
      return res.json({
        success: false,
        error: 'No text found in image'
      });
    }

    const extractedText = detections[0].description;

    // Step 2: Translate extracted text
    const [translation] = await translate.translate(extractedText, targetLanguage);

    res.json({
      success: true,
      extractedText: extractedText,
      translated: translation,
      targetLanguage: targetLanguage
    });
  } catch (error) {
    console.error('Image translation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ENDPOINT 4: Batch Translation (for menus)
app.post('/api/translate/batch', async (req, res) => {
  try {
    const { texts, targetLanguage, sourceLanguage } = req.body;

    const translations = await Promise.all(
      texts.map(async (text) => {
        const [translation] = await translate.translate(text, {
          from: sourceLanguage || 'auto',
          to: targetLanguage
        });
        return { original: text, translated: translation };
      })
    );

    res.json({
      success: true,
      translations: translations,
      count: translations.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ENDPOINT 5: Get Supported Languages
app.get('/api/translate/languages', async (req, res) => {
  try {
    const [languages] = await translate.getLanguages();
    
    // Filter to commonly used languages for tourists
    const touristLanguages = [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Spanish', flag: '🇪🇸' },
      { code: 'fr', name: 'French', flag: '🇫🇷' },
      { code: 'de', name: 'German', flag: '🇩🇪' },
      { code: 'it', name: 'Italian', flag: '🇮🇹' },
      { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
      { code: 'ru', name: 'Russian', flag: '🇷🇺' },
      { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
      { code: 'ko', name: 'Korean', flag: '🇰🇷' },
      { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    ];

    res.json({
      success: true,
      languages: touristLanguages
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ENDPOINT 6: Common Phrases
app.get('/api/translate/phrases/:targetLanguage', async (req, res) => {
  try {
    const { targetLanguage } = req.params;
    
    const commonPhrases = [
      "Hello",
      "Thank you",
      "How much does this cost?",
      "Where is the bathroom?",
      "I need help",
      "Do you speak English?",
      "Can I have the menu?",
      "Water, please",
      "The check, please",
      "How do I get to the beach?",
      "Is this vegetarian?",
      "I'm allergic to...",
      "What time does it open?",
      "Can you call a taxi?",
      "Where can I find...",
    ];

    const translations = await Promise.all(
      commonPhrases.map(async (phrase) => {
        const [translation] = await translate.translate(phrase, targetLanguage);
        return { 
          english: phrase, 
          translated: translation 
        };
      })
    );

    res.json({
      success: true,
      phrases: translations,
      language: targetLanguage
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Translation API server running on port ${PORT}`);
});
```

### Environment Variables (.env)

```bash
GOOGLE_TRANSLATE_API_KEY=your_api_key_here
PORT=3001
```

---

## Step 3: Frontend React Component

```jsx
// components/TranslationModal.jsx
import React, { useState, useEffect } from 'react';

const TranslationModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('text'); // text, image, conversation, phrases
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [commonPhrases, setCommonPhrases] = useState([]);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  ];

  const modes = [
    { id: 'text', label: 'Text', icon: '💬' },
    { id: 'image', label: 'Camera', icon: '📸' },
    { id: 'conversation', label: 'Talk', icon: '🗣️' },
    { id: 'phrases', label: 'Phrases', icon: '📖' },
  ];

  // Load common phrases when modal opens
  useEffect(() => {
    if (isOpen && mode === 'phrases') {
      loadCommonPhrases();
    }
  }, [isOpen, mode, targetLanguage]);

  const loadCommonPhrases = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/translate/phrases/${targetLanguage}`);
      const data = await response.json();
      if (data.success) {
        setCommonPhrases(data.phrases);
      }
    } catch (error) {
      console.error('Error loading phrases:', error);
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/translate/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          sourceLanguage: sourceLanguage,
          targetLanguage: targetLanguage
        })
      });

      const data = await response.json();
      if (data.success) {
        setTranslatedText(data.translated);
      }
    } catch (error) {
      console.error('Translation error:', error);
      alert('Translation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedImage(URL.createObjectURL(file));
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('targetLanguage', targetLanguage);

      const response = await fetch('http://localhost:3001/api/translate/image', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setInputText(data.extractedText);
        setTranslatedText(data.translated);
      } else {
        alert('No text found in image');
      }
    } catch (error) {
      console.error('Image translation error:', error);
      alert('Image translation failed');
    } finally {
      setLoading(false);
    }
  };

  const swapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setInputText(translatedText);
    setTranslatedText(inputText);
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
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 9998,
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
          maxWidth: '700px',
          maxHeight: '90vh',
          background: 'linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)',
          borderRadius: '32px',
          border: '3px solid rgba(0, 206, 209, 0.3)',
          boxShadow: '0 24px 80px rgba(0, 206, 209, 0.3)',
          zIndex: 9999,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '2px solid rgba(0, 206, 209, 0.2)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>🌐</span>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '800',
                margin: 0,
                background: 'linear-gradient(135deg, #0099CC 0%, #00CED1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Translation
              </h2>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.1)',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            >
              ✕
            </button>
          </div>

          {/* Mode selector */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
          }}>
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                style={{
                  padding: '12px',
                  background: mode === m.id
                    ? 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)'
                    : 'rgba(255, 255, 255, 0.6)',
                  border: mode === m.id ? '2px solid #00CED1' : '2px solid transparent',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: mode === m.id ? '#FFF' : '#333',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.3s',
                }}
              >
                <span style={{ fontSize: '20px' }}>{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
        }}>
          {mode === 'text' && (
            <TextTranslationMode
              inputText={inputText}
              setInputText={setInputText}
              translatedText={translatedText}
              sourceLanguage={sourceLanguage}
              setSourceLanguage={setSourceLanguage}
              targetLanguage={targetLanguage}
              setTargetLanguage={setTargetLanguage}
              languages={languages}
              loading={loading}
              onTranslate={handleTranslate}
              onSwap={swapLanguages}
            />
          )}

          {mode === 'image' && (
            <ImageTranslationMode
              selectedImage={selectedImage}
              inputText={inputText}
              translatedText={translatedText}
              targetLanguage={targetLanguage}
              setTargetLanguage={setTargetLanguage}
              languages={languages}
              loading={loading}
              onImageUpload={handleImageUpload}
            />
          )}

          {mode === 'phrases' && (
            <CommonPhrasesMode
              phrases={commonPhrases}
              targetLanguage={targetLanguage}
              setTargetLanguage={setTargetLanguage}
              languages={languages}
            />
          )}

          {mode === 'conversation' && (
            <ConversationMode
              sourceLanguage={sourceLanguage}
              targetLanguage={targetLanguage}
              setSourceLanguage={setSourceLanguage}
              setTargetLanguage={setTargetLanguage}
              languages={languages}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default TranslationModal;
```

---

## Step 4: Translation Mode Components

### Text Translation Mode

```jsx
const TextTranslationMode = ({
  inputText,
  setInputText,
  translatedText,
  sourceLanguage,
  setSourceLanguage,
  targetLanguage,
  setTargetLanguage,
  languages,
  loading,
  onTranslate,
  onSwap
}) => {
  return (
    <div>
      {/* Language selector */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: '12px',
        marginBottom: '20px',
        alignItems: 'center',
      }}>
        <select
          value={sourceLanguage}
          onChange={(e) => setSourceLanguage(e.target.value)}
          style={{
            padding: '14px',
            borderRadius: '12px',
            border: '2px solid rgba(0, 206, 209, 0.3)',
            background: 'rgba(255, 255, 255, 0.9)',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>

        <button
          onClick={onSwap}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(0, 206, 209, 0.15)',
            border: '2px solid #00CED1',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ⇄
        </button>

        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          style={{
            padding: '14px',
            borderRadius: '12px',
            border: '2px solid rgba(0, 206, 209, 0.3)',
            background: 'rgba(255, 255, 255, 0.9)',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Input text */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        border: '2px solid rgba(0, 206, 209, 0.2)',
      }}>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to translate..."
          style={{
            width: '100%',
            minHeight: '120px',
            border: 'none',
            background: 'transparent',
            fontSize: '16px',
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Translate button */}
      <button
        onClick={onTranslate}
        disabled={loading || !inputText.trim()}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '16px',
          background: loading || !inputText.trim()
            ? 'rgba(0, 206, 209, 0.3)'
            : 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)',
          border: 'none',
          fontSize: '16px',
          fontWeight: '700',
          color: '#FFF',
          cursor: loading || !inputText.trim() ? 'not-allowed' : 'pointer',
          marginBottom: '16px',
          boxShadow: '0 8px 24px rgba(0, 206, 209, 0.3)',
        }}
      >
        {loading ? '⚙️ Translating...' : '✨ Translate'}
      </button>

      {/* Translated output */}
      {translatedText && (
        <div style={{
          background: 'rgba(80, 200, 120, 0.15)',
          borderRadius: '16px',
          padding: '20px',
          border: '2px solid rgba(80, 200, 120, 0.3)',
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '700',
            color: '#50C878',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Translation:
          </div>
          <div style={{
            fontSize: '16px',
            color: '#333',
            lineHeight: '1.6',
          }}>
            {translatedText}
          </div>

          {/* Copy button */}
          <button
            onClick={() => navigator.clipboard.writeText(translatedText)}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              borderRadius: '10px',
              background: 'rgba(80, 200, 120, 0.2)',
              border: '2px solid #50C878',
              fontSize: '14px',
              fontWeight: '600',
              color: '#50C878',
              cursor: 'pointer',
            }}
          >
            📋 Copy Translation
          </button>
        </div>
      )}
    </div>
  );
};
```

### Image Translation Mode

```jsx
const ImageTranslationMode = ({
  selectedImage,
  inputText,
  translatedText,
  targetLanguage,
  setTargetLanguage,
  languages,
  loading,
  onImageUpload
}) => {
  return (
    <div>
      {/* Language selector */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          fontSize: '14px',
          fontWeight: '700',
          color: '#666',
          marginBottom: '8px',
          display: 'block',
        }}>
          Translate to:
        </label>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            border: '2px solid rgba(0, 206, 209, 0.3)',
            background: 'rgba(255, 255, 255, 0.9)',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Upload area */}
      <label style={{
        display: 'block',
        padding: '60px 20px',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '16px',
        border: '3px dashed rgba(0, 206, 209, 0.4)',
        textAlign: 'center',
        cursor: 'pointer',
        marginBottom: '20px',
        transition: 'all 0.3s',
      }}>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onImageUpload}
          style={{ display: 'none' }}
        />
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📸</div>
        <div style={{
          fontSize: '16px',
          fontWeight: '700',
          color: '#00CED1',
          marginBottom: '6px',
        }}>
          Take or Upload Photo
        </div>
        <div style={{
          fontSize: '13px',
          color: '#999',
        }}>
          Point camera at menu, sign, or text
        </div>
      </label>

      {/* Preview image */}
      {selectedImage && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '16px',
          border: '2px solid rgba(0, 206, 209, 0.2)',
        }}>
          <img
            src={selectedImage}
            alt="Selected"
            style={{
              width: '100%',
              borderRadius: '12px',
              marginBottom: '12px',
            }}
          />
          {loading && (
            <div style={{
              textAlign: 'center',
              fontSize: '14px',
              color: '#00CED1',
              fontWeight: '600',
            }}>
              ⚙️ Extracting and translating text...
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {inputText && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Original text */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            padding: '16px',
            border: '2px solid rgba(0, 206, 209, 0.2)',
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#666',
              marginBottom: '8px',
              textTransform: 'uppercase',
            }}>
              Detected Text:
            </div>
            <div style={{ fontSize: '14px', color: '#333' }}>
              {inputText}
            </div>
          </div>

          {/* Translation */}
          {translatedText && (
            <div style={{
              background: 'rgba(80, 200, 120, 0.15)',
              borderRadius: '16px',
              padding: '16px',
              border: '2px solid rgba(80, 200, 120, 0.3)',
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: '700',
                color: '#50C878',
                marginBottom: '8px',
                textTransform: 'uppercase',
              }}>
                Translation:
              </div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                {translatedText}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

### Common Phrases Mode

```jsx
const CommonPhrasesMode = ({
  phrases,
  targetLanguage,
  setTargetLanguage,
  languages
}) => {
  const [playingPhrase, setPlayingPhrase] = useState(null);

  const speakPhrase = (text, lang) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'es' ? 'es-MX' : lang;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
      setPlayingPhrase(text);
      setTimeout(() => setPlayingPhrase(null), 2000);
    }
  };

  return (
    <div>
      {/* Language selector */}
      <div style={{ marginBottom: '20px' }}>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            border: '2px solid rgba(0, 206, 209, 0.3)',
            background: 'rgba(255, 255, 255, 0.9)',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Phrases list */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {phrases.map((phrase, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '16px',
              padding: '16px',
              border: '2px solid rgba(0, 206, 209, 0.2)',
              transition: 'all 0.3s',
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}>
              <div style={{
                fontSize: '15px',
                color: '#666',
                fontWeight: '500',
              }}>
                {phrase.english}
              </div>
              <button
                onClick={() => speakPhrase(phrase.translated, targetLanguage)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: playingPhrase === phrase.translated
                    ? 'linear-gradient(135deg, #00CED1 0%, #00BABA 100%)'
                    : 'rgba(0, 206, 209, 0.15)',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                🔊
              </button>
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#00CED1',
            }}>
              {phrase.translated}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## Step 5: Use Cases & Features

### 1. Menu Translation
```javascript
// Take photo of menu → Auto-translate
onImageUpload(menuPhoto)
```

### 2. Conversation Helper
```javascript
// Quick phrases for common situations
- "¿Cuánto cuesta?" (How much?)
- "Agua, por favor" (Water, please)
- "¿Dónde está el baño?" (Where's bathroom?)
```

### 3. Real-time Chat
```javascript
// Type → Translate → Show to local
inputText → translate() → show translated text
```

### 4. Speech-to-Text (Future Enhancement)
```javascript
// Speak → Transcribe → Translate
// Use Web Speech API + Google Translate
```

---

## Pricing Estimate

**Typical tourist usage per day:**
- 50 text translations (avg 50 chars) = 2,500 chars
- 10 menu photos (avg 200 chars) = 2,000 chars
- 20 common phrases (avg 30 chars) = 600 chars
- **Total: ~5,100 chars/day**

**Monthly cost for 1,000 active users:**
- 5,100 chars × 30 days × 1,000 users = 153M chars
- First 500K FREE
- Remaining 152.5M × $20/1M = **$3.05/month**

**Extremely affordable!** 🎉

---

## Quick Implementation Summary

1. ✅ Get Google Translate API key (FREE tier available)
2. ✅ Setup backend with 6 endpoints
3. ✅ Create translation modal with 4 modes
4. ✅ Add menu photo translation (OCR + translate)
5. ✅ Include common tourist phrases
6. ✅ Optional: Add speech synthesis

**Time to implement: 3-4 hours**
**Cost: Essentially FREE for most apps**

This is perfect for your Tulum Discovery app! 🌴🌐
