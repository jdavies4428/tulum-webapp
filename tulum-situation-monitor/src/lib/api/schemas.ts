import { z } from "zod";

/**
 * Validation schemas for API requests
 * Centralized location for all API request/response validation
 */

// ============================================================================
// Translation API
// ============================================================================

export const translateTextSchema = z.object({
  text: z.string().min(1, "Text is required").max(5000, "Text must be less than 5000 characters"),
  targetLanguage: z.string().min(1, "Target language is required"),
  sourceLanguage: z.string().optional(),
});

export const translatePhrasesSchema = z.object({
  lang: z.enum(["en", "es"], { message: "Language must be 'en' or 'es'" }),
});

// ============================================================================
// Places API
// ============================================================================

export const placeDetailsSchema = z.object({
  placeId: z.string().min(1, "Place ID is required"),
  lang: z.enum(["en", "es"]).optional(),
});

export const placesNearbySchema = z.object({
  lat: z.coerce.number().min(-90).max(90, "Latitude must be between -90 and 90"),
  lng: z.coerce.number().min(-180).max(180, "Longitude must be between -180 and 180"),
  radius: z.coerce.number().min(100).max(50000, "Radius must be between 100 and 50000 meters").optional(),
  type: z.string().optional(),
});

export const placePhotoSchema = z.object({
  photo_reference: z.string().min(1, "Photo reference is required"),
  maxwidth: z.coerce.number().min(1).max(1600).optional().default(400),
});

export const placeSyncSchema = z.object({
  placeId: z.string().min(1, "Place ID is required"),
  name: z.string().min(1, "Place name is required"),
  category: z.string().min(1, "Category is required"),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  price_level: z.number().min(0).max(4).optional(),
  photo_url: z.string().url().optional(),
  opening_hours: z.record(z.string(), z.string()).optional(),
});

// ============================================================================
// Weather API
// ============================================================================

export const weatherQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

// ============================================================================
// Beach Conditions API
// ============================================================================

export const beachConditionsSchema = z.object({
  date: z.string().datetime().optional(),
  location: z.string().optional(),
});

// ============================================================================
// User Profile API
// ============================================================================

export const syncProfileSchema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
  email: z.string().email("Invalid email address").optional(),
  name: z.string().min(1, "Name is required").max(100).optional(),
  avatar_url: z.string().url("Invalid avatar URL").optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  location: z.string().max(100).optional(),
});

export const userFollowSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  action: z.enum(["follow", "unfollow"], { message: "Action must be 'follow' or 'unfollow'" }),
});

// ============================================================================
// Chat/Messages API
// ============================================================================

export const createConversationSchema = z.object({
  participantIds: z.array(z.string().uuid()).min(2, "At least 2 participants required"),
  title: z.string().min(1).max(100).optional(),
});

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid("Invalid conversation ID"),
  content: z.string().min(1, "Message cannot be empty").max(10000, "Message too long"),
  attachments: z.array(z.string().url()).optional(),
});

export const markMessagesReadSchema = z.object({
  conversationId: z.string().uuid("Invalid conversation ID"),
  messageIds: z.array(z.string().uuid()).optional(),
});

// ============================================================================
// Itinerary API
// ============================================================================

export const generateItinerarySchema = z.object({
  preferences: z.object({
    interests: z.array(z.string()).optional(),
    duration_days: z.number().min(1).max(30, "Duration must be between 1 and 30 days").optional(),
    budget: z.enum(["budget", "moderate", "luxury"]).optional(),
    pace: z.enum(["relaxed", "moderate", "packed"]).optional(),
  }),
  startDate: z.string().datetime().optional(),
});

export const saveItinerarySchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  days: z.array(z.object({
    date: z.string(),
    activities: z.array(z.object({
      time: z.string(),
      title: z.string().min(1),
      description: z.string().optional(),
      placeId: z.string().optional(),
      duration: z.number().optional(),
    })),
  })).min(1, "At least one day is required"),
  is_public: z.boolean().optional().default(false),
});

// ============================================================================
// Common Schemas
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export const idParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});
