"use client";

import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { formatGoogleRating } from "@/lib/placeUtils";
import { Place } from "@/lib/types";

interface PlaceDetailSheetProps {
  place: Place | null;
  open: boolean;
  onClose: () => void;
  onAddToTrip: (place: Place) => void;
  onReview: (place: Place) => void;
}

export function PlaceDetailSheet({ place, open, onClose, onAddToTrip, onReview }: PlaceDetailSheetProps) {
  if (!place) return null;

  return (
    <Sheet title={place.name} open={open} onClose={onClose}>
      <div className="space-y-4">
        {place.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={place.photoUrl} alt={place.name} className="aspect-[2/1] w-full rounded-lg object-cover" />
        ) : null}
        <div className="space-y-1 text-sm text-muted">
          <p>{formatGoogleRating(place.googleRating)}</p>
          <p>{place.city}</p>
          <p>{place.address}</p>
          {place.note ? <p>{place.note}</p> : null}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => window.open(place.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(place.name)}`, "_blank")}>
            開啟地圖
          </Button>
          <Button onClick={() => onAddToTrip(place)}>加入行程</Button>
          <Button className="col-span-2" variant="secondary" onClick={() => onReview(place)}>
            {place.status === "visited" ? "編輯評價" : "評價並移到我的"}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
