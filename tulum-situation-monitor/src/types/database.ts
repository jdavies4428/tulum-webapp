export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      venues: {
        Row: {
          id: string;
          place_id: string;
          name: string;
          category: "club" | "restaurant" | "cultural";
          location: unknown;
          rating: number | null;
          price_level: string | null;
          formatted_address: string | null;
          phone: string | null;
          website: string | null;
          description: string | null;
          description_es: string | null;
          description_fr: string | null;
          has_webcam: boolean;
          google_data: Json | null;
          last_synced_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          place_id: string;
          name: string;
          category: "club" | "restaurant" | "cultural";
          location?: unknown;
          rating?: number | null;
          price_level?: string | null;
          formatted_address?: string | null;
          phone?: string | null;
          website?: string | null;
          description?: string | null;
          description_es?: string | null;
          description_fr?: string | null;
          has_webcam?: boolean;
          google_data?: Json | null;
          last_synced_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["venues"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      saved_venues: {
        Row: {
          user_id: string;
          venue_id: string;
          saved_at: string | null;
        };
        Insert: {
          user_id: string;
          venue_id: string;
          saved_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["saved_venues"]["Insert"]>;
      };
    };
  };
}
