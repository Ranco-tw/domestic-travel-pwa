"use client";

import { useState } from "react";
import { AddToTripSheet } from "@/components/itinerary/AddToTripSheet";
import { CityAccordion } from "@/components/places/CityAccordion";
import { ReviewSheet } from "@/components/places/ReviewSheet";
import { categories, groupPlacesByCityAndCategory } from "@/lib/placeUtils";
import { Place, PlaceCategory, PlaceReview, Trip, TripItem } from "@/lib/types";

interface FavoritesPageProps {
  places: Place[];
  trips: Trip[];
  onReview: (placeId: string, review: PlaceReview) => void;
  onAddTripItem: (item: Omit<TripItem, "id" | "sortOrder">) => void;
  onDeletePlace: (placeId: string) => void;
}

export function FavoritesPage({ places, trips, onReview, onAddTripItem, onDeletePlace }: FavoritesPageProps) {
  const [filter, setFilter] = useState<PlaceCategory | "全部">("全部");
  const [reviewing, setReviewing] = useState<Place | null>(null);
  const [addingToTrip, setAddingToTrip] = useState<Place | null>(null);
  const groups = groupPlacesByCityAndCategory(places, filter);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-black">收藏</h1>
      <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => (
          <button key={category} onClick={() => setFilter(category)} className={`min-h-9 rounded-lg border px-4 text-sm font-bold ${filter === category ? "border-primary bg-primary text-white" : "border-border bg-card text-text"}`}>
            {category}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {Object.entries(groups).map(([city, cityGroups], index) => (
          <CityAccordion key={city} city={city} groups={cityGroups} defaultOpen={index === 0} onAddToTrip={setAddingToTrip} onReview={setReviewing} onDelete={onDeletePlace} />
        ))}
      </div>

      {!places.length ? <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted">還沒有收藏，先到探索新增一個地點。</p> : null}

      <ReviewSheet place={reviewing} open={Boolean(reviewing)} onClose={() => setReviewing(null)} onSubmit={onReview} />
      <AddToTripSheet place={addingToTrip} trips={trips} open={Boolean(addingToTrip)} onClose={() => setAddingToTrip(null)} onAddTripItem={onAddTripItem} />
    </div>
  );
}
