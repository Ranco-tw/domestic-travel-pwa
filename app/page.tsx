"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { ExplorePage } from "@/components/explore/ExplorePage";
import { FavoritesPage } from "@/components/favorites/FavoritesPage";
import { ItineraryPage } from "@/components/itinerary/ItineraryPage";
import { MyPlacesPage } from "@/components/mine/MyPlacesPage";
import { initialPlaces, initialTripItems, initialTrips } from "@/lib/mockData";
import { makeId } from "@/lib/placeUtils";
import { Place, PlaceDraft, PlaceReview, Trip, TripItem } from "@/lib/types";

const STORAGE_KEY = "travel-pwa-state-v1";

interface StoredState {
  places: Place[];
  trips: Trip[];
  tripItems: TripItem[];
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [places, setPlaces] = useState<Place[]>(initialPlaces);
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [tripItems, setTripItems] = useState<TripItem[]>(initialTripItems);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("travel-pwa-session") === "true");
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as StoredState;
      setPlaces(parsed.places);
      setTrips(parsed.trips);
      setTripItems(parsed.tripItems);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ places, trips, tripItems }));
  }, [places, trips, tripItems]);

  const placesById = useMemo(() => new Map(places.map((place) => [place.id, place])), [places]);

  function addPlace(draft: PlaceDraft) {
    const now = new Date().toISOString();
    const place: Place = {
      id: makeId("place"),
      userId: "demo",
      name: draft.name,
      category: draft.category,
      city: draft.city,
      address: draft.address,
      googleMapsUrl: draft.googleMapsUrl || undefined,
      photoUrl: draft.photoUrl || undefined,
      note: draft.note || undefined,
      status: "wishlist",
      createdAt: now,
      updatedAt: now,
    };
    setPlaces((current) => [place, ...current]);
    return place;
  }

  function reviewPlace(placeId: string, review: PlaceReview) {
    setPlaces((current) =>
      current.map((place) =>
        place.id === placeId ? { ...place, status: "visited", review, updatedAt: new Date().toISOString() } : place,
      ),
    );
  }

  function addTrip(trip: Omit<Trip, "id" | "userId" | "createdAt" | "updatedAt">) {
    const now = new Date().toISOString();
    setTrips((current) => [
      { id: makeId("trip"), userId: "demo", createdAt: now, updatedAt: now, ...trip },
      ...current,
    ]);
  }

  function addTripItem(item: Omit<TripItem, "id" | "sortOrder">) {
    const nextOrder = tripItems.filter((candidate) => candidate.tripId === item.tripId && candidate.dayIndex === item.dayIndex).length;
    setTripItems((current) => [{ id: makeId("item"), sortOrder: nextOrder, ...item }, ...current]);
  }

  function removeTripItem(itemId: string) {
    setTripItems((current) => current.filter((item) => item.id !== itemId));
  }

  function reorderTripItems(dayItems: TripItem[]) {
    setTripItems((current) => {
      const ids = new Set(dayItems.map((item) => item.id));
      return current.map((item) => {
        const match = dayItems.find((candidate) => candidate.id === item.id);
        return ids.has(item.id) && match ? { ...item, sortOrder: match.sortOrder } : item;
      });
    });
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <AppShell
      onLogout={() => {
        localStorage.removeItem("travel-pwa-session");
        setIsLoggedIn(false);
      }}
      childrenByTab={{
        explore: <ExplorePage onAddPlace={addPlace} />,
        favorites: (
          <FavoritesPage
            places={places.filter((place) => place.status === "wishlist")}
            trips={trips}
            onReview={reviewPlace}
            onAddTripItem={addTripItem}
          />
        ),
        itinerary: (
          <ItineraryPage
            placesById={placesById}
            trips={trips}
            tripItems={tripItems}
            onAddTrip={addTrip}
            onAddTripItem={addTripItem}
            onRemoveTripItem={removeTripItem}
            onReorderTripItems={reorderTripItems}
            onReview={reviewPlace}
          />
        ),
        mine: (
          <MyPlacesPage
            places={places.filter((place) => place.status === "visited")}
            trips={trips}
            onReview={reviewPlace}
            onAddTripItem={addTripItem}
          />
        ),
      }}
    />
  );
}
