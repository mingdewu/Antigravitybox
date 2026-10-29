export type GeoCoordinate = [longitude: number, latitude: number];

export interface POIItem {
  id: string;
  name: string;
  badge: string;
  coordinates: GeoCoordinate;
  photoUrl: string;
  isPlaceholder: boolean;
  placeholderNotice?: string;
  description: string;
  startFrame: number;
  endFrame: number;
}

export interface RouteConfig {
  coordinates: GeoCoordinate[];
  lineColor: string;
  glowColor: string;
  lineWidth: number;
}

export interface CaptionItem {
  id: string;
  startFrame: number;
  endFrame: number;
  text: string;
}

export interface MapViewport {
  center: GeoCoordinate;
  zoom: number;
  pitch?: number;
  bearing?: number;
}

export interface TourConfig {
  id: string;
  title: string;
  subtitle: string;
  regionTag: string;
  fps: number;
  durationInFrames: number;
  mapInitialView: MapViewport;
  route: RouteConfig;
  pois: POIItem[];
  captions: CaptionItem[];
  attributionText: string;
}
