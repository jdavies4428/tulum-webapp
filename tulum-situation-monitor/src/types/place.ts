export interface PlaceBase {
  name: string;
  lat: number;
  lng: number;
  desc: string;
  descEs?: string;
  descFr?: string;
  whatsapp: string;
  url: string;
}

export interface BeachClub extends PlaceBase {
  hasWebcam?: boolean;
}

export type Restaurant = PlaceBase;
export type CulturalPlace = PlaceBase;
