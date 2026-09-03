"use client";

import { CalendarPlus, ExternalLink, Pencil, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatGoogleRating } from "@/lib/placeUtils";
import { Place } from "@/lib/types";

interface PlaceCardProps {
  place: Place;
  visited?: boolean;
  onAddToTrip: (place: Place) => void;
  onReview: (place: Place) => void;
}

export function PlaceCard({ place, visited = false, onAddToTrip, onReview }: PlaceCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold">{place.name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
              <span>{formatGoogleRating(place.googleRating)}</span>
              {visited && place.review ? (
                <span className="inline-flex items-center gap-1 text-text">
                  / 我的 <Star size={14} fill="currentColor" className="text-star" />
                  {place.review.rating}
                </span>
              ) : null}
            </div>
            {visited && place.review ? <p className="mt-2 text-sm text-muted">{place.review.text}</p> : null}
          </div>
          <button
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-white"
            onClick={() => onAddToTrip(place)}
            aria-label="加入行程"
          >
            <CalendarPlus size={18} />
          </button>
        </div>
      </div>

      <div className="aspect-[2.4/1] bg-border">
        {place.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={place.photoUrl} alt={place.name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-sm text-muted">尚未加入照片</div>
        )}
      </div>

      <div className="flex gap-2 p-3">
        <Button variant="secondary" className="flex-1 px-2 text-xs" onClick={() => window.open(place.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(place.name)}`, "_blank")}>
          <ExternalLink size={15} />
          地圖
        </Button>
        <Button variant="secondary" className="flex-1 px-2 text-xs" onClick={() => onReview(place)}>
          <Pencil size={15} />
          {visited ? "編輯評價" : "評價"}
        </Button>
      </div>
    </article>
  );
}
