"use client";

import { useState } from "react";
import { CityAccordion } from "@/components/places/CityAccordion";
import { ReviewSheet } from "@/components/places/ReviewSheet";
import { categories, groupPlacesByCityAndCategory } from "@/lib/placeUtils";
import { Place, PlaceCategory, PlaceReview, Trip, TripItem } from "@/lib/types";

interface MyPlacesPageProps {
  places: Place[];
  trips: Trip[];
  onReview: (placeId: string, review: PlaceReview) => void;
  onAddTripItem: (item: Omit<TripItem, "id" | "sortOrder">) => void;
}

export function MyPlacesPage({ places, trips, onReview, onAddTripItem }: MyPlacesPageProps) {
  const [filter, setFilter] = useState<PlaceCategory | "全部">("全部");
  const [reviewing, setReviewing] = useState<Place | null>(null);
  const groups = groupPlacesByCityAndCategory(places, filter);

  function addToTrip(place: Place) {
    const trip = trips[0];
    if (!trip) return;
    onAddTripItem({
      tripId: trip.id,
      dayIndex: 0,
      type: "place",
      placeId: place.id,
      title: place.name,
      category: place.category,
      details: `${place.address || place.city}${place.review ? `・我的 ★${place.review.rating}` : ""}`,
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-black">我的</h1>
        <p className="mt-1 text-sm text-muted">已造訪的景點與我的評價</p>
      </div>
      <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => (
          <button key={category} onClick={() => setFilter(category)} className={`min-h-9 rounded-lg border px-4 text-sm font-bold ${filter === category ? "border-primary bg-primary text-white" : "border-border bg-card text-text"}`}>
            {category}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {Object.entries(groups).map(([city, cityGroups], index) => (
          <CityAccordion key={city} city={city} groups={cityGroups} defaultOpen={index === 0} visited onAddToTrip={addToTrip} onReview={setReviewing} />
        ))}
      </div>

      {!places.length ? <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted">評價後的地點會移到這裡。</p> : null}

      <ReviewSheet place={reviewing} open={Boolean(reviewing)} onClose={() => setReviewing(null)} onSubmit={onReview} />
    </div>
  );
}
