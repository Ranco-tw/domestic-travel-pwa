export type AppTab = "explore" | "favorites" | "itinerary" | "mine";
export type ThemeMode = "system" | "light" | "dark";
export type PlaceCategory = "住宿" | "食物" | "景點" | "交通" | "其他";
export type PlaceStatus = "wishlist" | "visited";
export type TripItemType = "place" | "transport" | "custom";

export interface PlaceReview {
  rating: number;
  text: string;
  visitedDate: string;
}

export interface Place {
  id: string;
  userId: string;
  name: string;
  category: PlaceCategory;
  city: string;
  address: string;
  googleMapsUrl?: string;
  googlePlaceId?: string;
  googleRating?: number;
  googleReviewCount?: number;
  photoUrl?: string;
  note?: string;
  status: PlaceStatus;
  review?: PlaceReview;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  userId: string;
  name: string;
  startDate: string;
  endDate: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripItem {
  id: string;
  tripId: string;
  dayIndex: number;
  placeId?: string;
  type: TripItemType;
  title: string;
  startTime?: string;
  endTime?: string;
  sortOrder: number;
  category?: PlaceCategory;
  transportType?: string;
  details?: string;
  note?: string;
}

export interface PlaceDraft {
  name: string;
  category: PlaceCategory;
  city: string;
  address: string;
  googleMapsUrl: string;
  googlePlaceId?: string;
  googleRating?: number;
  googleReviewCount?: number;
  note: string;
  photoUrl: string;
}
