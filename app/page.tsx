"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "@/components/layout/AppShell";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { ExplorePage } from "@/components/explore/ExplorePage";
import { FavoritesPage } from "@/components/favorites/FavoritesPage";
import { ItineraryPage } from "@/components/itinerary/ItineraryPage";
import { MyPlacesPage } from "@/components/mine/MyPlacesPage";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Place, PlaceDraft, PlaceReview, Trip, TripItem } from "@/lib/types";

type DbRow = Record<string, string | number | null>;

function readString(row: DbRow, key: string, fallback = "") {
  const value = row[key];
  return typeof value === "string" ? value : fallback;
}

function readNumber(row: DbRow, key: string, fallback = 0) {
  const value = row[key];
  return typeof value === "number" ? value : fallback;
}

function toReview(row: DbRow): PlaceReview {
  return {
    rating: readNumber(row, "rating"),
    text: readString(row, "review_text"),
    visitedDate: readString(row, "visited_date"),
  };
}

function toPlace(row: DbRow, review?: PlaceReview): Place {
  return {
    id: readString(row, "id"),
    userId: readString(row, "user_id"),
    name: readString(row, "name"),
    category: readString(row, "category") as Place["category"],
    city: readString(row, "city"),
    address: readString(row, "address"),
    googleMapsUrl: readString(row, "google_maps_url") || undefined,
    googlePlaceId: readString(row, "google_place_id") || undefined,
    googleRating: row.google_rating === null ? undefined : readNumber(row, "google_rating"),
    googleReviewCount: row.google_review_count === null ? undefined : readNumber(row, "google_review_count"),
    photoUrl: readString(row, "photo_url") || undefined,
    note: readString(row, "note") || undefined,
    status: readString(row, "status", "wishlist") as Place["status"],
    review,
    createdAt: readString(row, "created_at"),
    updatedAt: readString(row, "updated_at"),
  };
}

function toTrip(row: DbRow): Trip {
  return {
    id: readString(row, "id"),
    userId: readString(row, "user_id"),
    name: readString(row, "name"),
    startDate: readString(row, "start_date"),
    endDate: readString(row, "end_date"),
    note: readString(row, "note") || undefined,
    createdAt: readString(row, "created_at"),
    updatedAt: readString(row, "updated_at"),
  };
}

function toTripItem(row: DbRow): TripItem {
  return {
    id: readString(row, "id"),
    tripId: readString(row, "trip_id"),
    dayIndex: readNumber(row, "day_index"),
    placeId: readString(row, "place_id") || undefined,
    type: readString(row, "type", "place") as TripItem["type"],
    title: readString(row, "title"),
    startTime: readString(row, "start_time") || undefined,
    endTime: readString(row, "end_time") || undefined,
    sortOrder: readNumber(row, "sort_order"),
    transportType: readString(row, "transport_type") || undefined,
    details: readString(row, "details") || undefined,
    note: readString(row, "note") || undefined,
  };
}

export default function Home() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripItems, setTripItems] = useState<TripItem[]>([]);
  const [dataError, setDataError] = useState("");

  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    setDataError("");

    const [placesResult, reviewsResult, tripsResult, tripItemsResult] = await Promise.all([
      supabase.from("places").select("*").order("created_at", { ascending: false }),
      supabase.from("place_reviews").select("*"),
      supabase.from("trips").select("*").order("created_at", { ascending: false }),
      supabase.from("trip_items").select("*").order("sort_order", { ascending: true }),
    ]);

    const firstError = placesResult.error ?? reviewsResult.error ?? tripsResult.error ?? tripItemsResult.error;
    if (firstError) {
      setDataError("資料庫讀取失敗，請確認 Supabase SQL 已執行完成。");
      setIsLoadingData(false);
      return;
    }

    const reviewsByPlaceId = new Map((reviewsResult.data ?? []).map((row) => [readString(row, "place_id"), toReview(row)]));
    setPlaces((placesResult.data ?? []).map((row) => toPlace(row, reviewsByPlaceId.get(readString(row, "id")))));
    setTrips((tripsResult.data ?? []).map(toTrip));
    setTripItems((tripItemsResult.data ?? []).map(toTripItem));
    setIsLoadingData(false);
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getUser().then(async ({ data }) => {
      if (!isMounted) return;
      setUser(data.user);
      setAuthChecked(true);
      if (data.user) await loadData();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) void loadData();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadData, supabase]);

  const placesById = useMemo(() => new Map(places.map((place) => [place.id, place])), [places]);

  async function addPlace(draft: PlaceDraft) {
    if (!user) return;
    setDataError("");
    const { data, error } = await supabase
      .from("places")
      .insert({
        user_id: user.id,
        name: draft.name,
        category: draft.category,
        city: draft.city,
        address: draft.address,
        google_maps_url: draft.googleMapsUrl || null,
        photo_url: draft.photoUrl || null,
        note: draft.note || null,
        status: "wishlist",
      })
      .select()
      .single();

    if (error) {
      setDataError("新增收藏失敗，請稍後再試。");
      return;
    }

    setPlaces((current) => [toPlace(data), ...current]);
  }

  async function reviewPlace(placeId: string, review: PlaceReview) {
    if (!user) return;
    setDataError("");
    const { error: reviewError } = await supabase.from("place_reviews").upsert(
      {
        user_id: user.id,
        place_id: placeId,
        rating: review.rating,
        review_text: review.text,
        visited_date: review.visitedDate,
      },
      { onConflict: "user_id,place_id" },
    );
    const { error: placeError } = await supabase.from("places").update({ status: "visited" }).eq("id", placeId);

    if (reviewError || placeError) {
      setDataError("儲存評價失敗，請稍後再試。");
      return;
    }

    setPlaces((current) =>
      current.map((place) =>
        place.id === placeId ? { ...place, status: "visited", review, updatedAt: new Date().toISOString() } : place,
      ),
    );
  }

  async function addTrip(trip: Omit<Trip, "id" | "userId" | "createdAt" | "updatedAt">) {
    if (!user) return;
    setDataError("");
    const { data, error } = await supabase
      .from("trips")
      .insert({
        user_id: user.id,
        name: trip.name,
        start_date: trip.startDate,
        end_date: trip.endDate,
        note: trip.note || null,
      })
      .select()
      .single();

    if (error) {
      setDataError("新增行程失敗，請稍後再試。");
      return;
    }

    setTrips((current) => [toTrip(data), ...current]);
  }

  async function addTripItem(item: Omit<TripItem, "id" | "sortOrder">) {
    if (!user) return;
    setDataError("");
    const nextOrder = tripItems.filter((candidate) => candidate.tripId === item.tripId && candidate.dayIndex === item.dayIndex).length;
    const { data, error } = await supabase
      .from("trip_items")
      .insert({
        user_id: user.id,
        trip_id: item.tripId,
        day_index: item.dayIndex,
        place_id: item.placeId || null,
        type: item.type,
        title: item.title,
        start_time: item.startTime || null,
        end_time: item.endTime || null,
        sort_order: nextOrder,
        transport_type: item.transportType || null,
        details: item.details || null,
        note: item.note || null,
      })
      .select()
      .single();

    if (error) {
      setDataError("加入行程失敗，請稍後再試。");
      return;
    }

    setTripItems((current) => [toTripItem(data), ...current]);
  }

  async function removeTripItem(itemId: string) {
    const { error } = await supabase.from("trip_items").delete().eq("id", itemId);
    if (error) {
      setDataError("刪除項目失敗，請稍後再試。");
      return;
    }
    setTripItems((current) => current.filter((item) => item.id !== itemId));
  }

  async function removeTrip(tripId: string) {
    const { error } = await supabase.from("trips").delete().eq("id", tripId);
    if (error) {
      setDataError("刪除行程失敗，請稍後再試。");
      return;
    }
    setTrips((current) => current.filter((trip) => trip.id !== tripId));
    setTripItems((current) => current.filter((item) => item.tripId !== tripId));
  }

  async function removePlace(placeId: string) {
    const { error } = await supabase.from("places").delete().eq("id", placeId);
    if (error) {
      setDataError("刪除地點失敗，請稍後再試。");
      return;
    }
    setPlaces((current) => current.filter((place) => place.id !== placeId));
    setTripItems((current) => current.filter((item) => item.placeId !== placeId));
  }

  async function reorderTripItems(dayItems: TripItem[]) {
    setTripItems((current) => {
      const ids = new Set(dayItems.map((item) => item.id));
      return current.map((item) => {
        const match = dayItems.find((candidate) => candidate.id === item.id);
        return ids.has(item.id) && match ? { ...item, sortOrder: match.sortOrder } : item;
      });
    });

    const { error } = await supabase.from("trip_items").upsert(
      dayItems.map((item) => ({
        id: item.id,
        user_id: user?.id,
        trip_id: item.tripId,
        day_index: item.dayIndex,
        place_id: item.placeId || null,
        type: item.type,
        title: item.title,
        start_time: item.startTime || null,
        end_time: item.endTime || null,
        sort_order: item.sortOrder,
        transport_type: item.transportType || null,
        details: item.details || null,
        note: item.note || null,
      })),
    );
    if (error) setDataError("行程排序同步失敗，請重新整理後再試。");
  }

  async function handleLogin() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    await loadData();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setPlaces([]);
    setTrips([]);
    setTripItems([]);
  }

  if (!authChecked) {
    return <div className="flex min-h-screen items-center justify-center bg-background font-bold text-muted">正在確認登入狀態...</div>;
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (isLoadingData && places.length === 0 && trips.length === 0) {
    return <div className="flex min-h-screen items-center justify-center bg-background font-bold text-muted">正在同步旅程資料...</div>;
  }

  return (
    <AppShell
      onLogout={handleLogout}
      childrenByTab={{
        explore: (
          <>
            {dataError ? <p className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{dataError}</p> : null}
            <ExplorePage onAddPlace={addPlace} />
          </>
        ),
        favorites: (
          <FavoritesPage
            places={places.filter((place) => place.status === "wishlist")}
            trips={trips}
            onReview={reviewPlace}
            onAddTripItem={addTripItem}
            onDeletePlace={removePlace}
          />
        ),
        itinerary: (
          <ItineraryPage
            placesById={placesById}
            trips={trips}
            tripItems={tripItems}
            onAddTrip={addTrip}
            onRemoveTrip={removeTrip}
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
            onDeletePlace={removePlace}
          />
        ),
      }}
    />
  );
}
