"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { daysBetween } from "@/lib/placeUtils";
import { Place, Trip, TripItem } from "@/lib/types";

interface AddToTripSheetProps {
  place: Place | null;
  trips: Trip[];
  open: boolean;
  onClose: () => void;
  onAddTripItem: (item: Omit<TripItem, "id" | "sortOrder">) => void;
}

export function AddToTripSheet({ place, trips, open, onClose, onAddTripItem }: AddToTripSheetProps) {
  const [tripId, setTripId] = useState(trips[0]?.id ?? "");
  const [dayIndex, setDayIndex] = useState(0);
  const [startTime, setStartTime] = useState("");
  const selectedTrip = useMemo(() => trips.find((trip) => trip.id === tripId) ?? trips[0], [tripId, trips]);
  const dayCount = selectedTrip ? daysBetween(selectedTrip.startDate, selectedTrip.endDate) : 1;

  function submit() {
    if (!place || !selectedTrip) return;
    onAddTripItem({
      tripId: selectedTrip.id,
      dayIndex,
      type: "place",
      placeId: place.id,
      title: place.name,
      startTime,
      category: place.category,
      details: `${place.address || place.city}${place.googleRating ? `・Google ★${place.googleRating}` : ""}${place.review ? `・我的 ★${place.review.rating}` : ""}`,
    });
    onClose();
  }

  return (
    <Sheet title={place ? `加入行程：${place.name}` : "加入行程"} open={open} onClose={onClose}>
      {trips.length ? (
        <div className="space-y-3">
          <label className="block">
            <span className="mb-2 block text-sm font-bold">選擇行程</span>
            <select className="w-full rounded-lg border border-border bg-background p-3" value={selectedTrip?.id ?? ""} onChange={(event) => { setTripId(event.target.value); setDayIndex(0); }}>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.name}（{trip.startDate} - {trip.endDate}）
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold">加入哪一天</span>
            <select className="w-full rounded-lg border border-border bg-background p-3" value={dayIndex} onChange={(event) => setDayIndex(Number(event.target.value))}>
              {Array.from({ length: dayCount }).map((_, index) => (
                <option key={index} value={index}>
                  Day {index + 1}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold">時間</span>
            <input className="w-full rounded-lg border border-border bg-background p-3" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
          </label>
          <Button className="w-full" onClick={submit}>
            加入行程
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted">請先到行程分頁建立一趟旅程。</p>
      )}
    </Sheet>
  );
}
