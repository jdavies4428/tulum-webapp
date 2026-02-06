export interface PlaceBase {
  id?: string;
  name: string;
  lat: number;
  lng: number;
  desc: string;
  descEs?: string;
  descFr?: string;
  whatsapp: string;
  url: string;
  rating?: number | null;
}

export interface BeachClub extends PlaceBase {
  hasWebcam?: boolean;
}

export type Restaurant = PlaceBase;
export type CulturalPlace = PlaceBase;
