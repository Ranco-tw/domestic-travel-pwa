"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";
import { Place, PlaceCategory } from "@/lib/types";
import { PlaceCard } from "./PlaceCard";

interface CityAccordionProps {
  city: string;
  groups: Partial<Record<PlaceCategory, Place[]>>;
  defaultOpen?: boolean;
  visited?: boolean;
  onAddToTrip: (place: Place) => void;
  onReview: (place: Place) => void;
}

const categoryOrder: PlaceCategory[] = ["住宿", "食物", "景點", "交通", "其他"];

export function CityAccordion({ city, groups, defaultOpen = false, visited = false, onAddToTrip, onReview }: CityAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const total = Object.values(groups).reduce((sum, list) => sum + (list?.length ?? 0), 0);

  return (
    <section className="rounded-lg border border-border bg-card">
      <button className="flex w-full items-center justify-between p-4" onClick={() => setOpen((value) => !value)}>
        <span className="flex items-center gap-2 text-lg font-bold">
          <ChevronRight size={18} className={clsx("transition", open && "rotate-90")} />
          {city}
        </span>
        <span className="text-sm font-semibold text-muted">{total}</span>
      </button>

      {open ? (
        <div className="space-y-5 border-t border-border p-3">
          {categoryOrder.map((category) => {
            const places = groups[category] ?? [];
            if (!places.length) return null;
            return (
              <div key={category}>
                <h3 className="mb-2 text-sm font-black text-muted">{category}</h3>
                <div className="space-y-3">
                  {places.map((place) => (
                    <PlaceCard key={place.id} place={place} visited={visited} onAddToTrip={onAddToTrip} onReview={onReview} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
