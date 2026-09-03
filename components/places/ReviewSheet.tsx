"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Place, PlaceReview } from "@/lib/types";

interface ReviewSheetProps {
  place: Place | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (placeId: string, review: PlaceReview) => void;
}

export function ReviewSheet({ place, open, onClose, onSubmit }: ReviewSheetProps) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [visitedDate, setVisitedDate] = useState(() => new Date().toISOString().slice(0, 10));

  function submit() {
    if (!place) return;
    onSubmit(place.id, { rating, text, visitedDate });
    onClose();
  }

  return (
    <Sheet title={place ? `評價 ${place.name}` : "評價"} open={open} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-bold">我的星星</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} onClick={() => setRating(value)} className="text-star" aria-label={`${value} 星`}>
                <Star size={30} fill={value <= rating ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-bold">去過日期</span>
          <input value={visitedDate} onChange={(event) => setVisitedDate(event.target.value)} type="date" className="w-full rounded-lg border border-border bg-background p-3" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold">我的評語</span>
          <textarea value={text} onChange={(event) => setText(event.target.value)} rows={4} className="w-full rounded-lg border border-border bg-background p-3" placeholder="寫下這次的感覺..." />
        </label>
        <Button className="w-full" onClick={submit}>
          儲存評價
        </Button>
      </div>
    </Sheet>
  );
}
