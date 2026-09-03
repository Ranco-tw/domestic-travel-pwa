"use client";

import { useEffect, useMemo, useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Bus, GripVertical, Hotel, Plus, Star, Trash2, Utensils } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { daysBetween } from "@/lib/placeUtils";
import { Place, PlaceReview, Trip, TripItem } from "@/lib/types";

interface ItineraryPageProps {
  placesById: Map<string, Place>;
  trips: Trip[];
  tripItems: TripItem[];
  onAddTrip: (trip: Omit<Trip, "id" | "userId" | "createdAt" | "updatedAt">) => void;
  onRemoveTrip: (tripId: string) => void;
  onAddTripItem: (item: Omit<TripItem, "id" | "sortOrder">) => void;
  onRemoveTripItem: (itemId: string) => void;
  onReorderTripItems: (items: TripItem[]) => void;
  onReview: (placeId: string, review: PlaceReview) => void;
}

export function ItineraryPage({ placesById, trips, tripItems, onAddTrip, onRemoveTrip, onAddTripItem, onRemoveTripItem, onReorderTripItems, onReview }: ItineraryPageProps) {
  const [selectedTripId, setSelectedTripId] = useState(trips[0]?.id ?? "");
  const [dayIndex, setDayIndex] = useState(0);
  const [tripOpen, setTripOpen] = useState(false);
  const [transportOpen, setTransportOpen] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const trip = trips.find((candidate) => candidate.id === selectedTripId) ?? trips[0];
  const dayCount = trip ? daysBetween(trip.startDate, trip.endDate) : 1;
  const dayItems = useMemo(
    () => tripItems.filter((item) => item.tripId === trip?.id && item.dayIndex === dayIndex).sort((a, b) => a.sortOrder - b.sortOrder),
    [dayIndex, trip?.id, tripItems],
  );

  useEffect(() => {
    if (!trips.length) {
      setSelectedTripId("");
      return;
    }
    if (!trip || !trips.some((candidate) => candidate.id === selectedTripId)) {
      setSelectedTripId(trips[0].id);
    }
    if (dayIndex > dayCount - 1) setDayIndex(0);
  }, [dayCount, dayIndex, selectedTripId, trip, trips]);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = dayItems.findIndex((item) => item.id === active.id);
    const newIndex = dayItems.findIndex((item) => item.id === over.id);
    const reordered = arrayMove(dayItems, oldIndex, newIndex).map((item, index) => ({ ...item, sortOrder: index }));
    onReorderTripItems(reordered);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-3xl font-black">行程</h1>
        <Button className="px-3" onClick={() => setTripOpen(true)}>
          <Plus size={17} />
          新增行程
        </Button>
      </div>

      {trip ? (
        <>
          <select value={trip.id} onChange={(event) => setSelectedTripId(event.target.value)} className="w-full rounded-lg border border-border bg-card p-3 font-bold">
            {trips.map((candidate) => (
              <option value={candidate.id} key={candidate.id}>{candidate.name}</option>
            ))}
          </select>
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-muted">行程日期</p>
                <p className="mt-1 font-black">{trip.startDate} - {trip.endDate}</p>
              </div>
              <Button
                variant="danger"
                className="shrink-0 px-3"
                onClick={() => {
                  if (window.confirm(`確定要刪除「${trip.name}」和裡面的行程項目嗎？`)) onRemoveTrip(trip.id);
                }}
              >
                刪除行程
              </Button>
            </div>
            {trip.note ? <p className="mt-2 text-sm text-muted">{trip.note}</p> : null}
          </div>
          <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
            {Array.from({ length: dayCount }).map((_, index) => (
              <button key={index} onClick={() => setDayIndex(index)} className={`min-h-10 min-w-20 rounded-lg border px-4 text-sm font-bold ${dayIndex === index ? "border-primary bg-primary text-white" : "border-border bg-card"}`}>
                <span className="block">Day {index + 1}</span>
                <span className="block text-[11px] font-semibold opacity-80">{formatTripDay(trip.startDate, index)}</span>
              </button>
            ))}
          </div>

          <Button variant="secondary" className="w-full" onClick={() => setTransportOpen(true)}>
            <Bus size={17} />
            新增交通資訊
          </Button>

          <DndContext sensors={sensors} onDragEnd={onDragEnd}>
            <SortableContext items={dayItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {dayItems.map((item) => (
                  <SortableTripItem key={item.id} item={item} place={item.placeId ? placesById.get(item.placeId) : undefined} onRemove={onRemoveTripItem} onReview={onReview} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      ) : (
        <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted">先新增一趟旅程。</p>
      )}

      <TripSheet open={tripOpen} onClose={() => setTripOpen(false)} onAddTrip={onAddTrip} />
      {trip ? <TransportSheet open={transportOpen} onClose={() => setTransportOpen(false)} tripId={trip.id} dayIndex={dayIndex} onAddTripItem={onAddTripItem} /> : null}
    </div>
  );
}

function SortableTripItem({ item, place, onRemove, onReview }: { item: TripItem; place?: Place; onRemove: (id: string) => void; onReview: (placeId: string, review: PlaceReview) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const Icon = item.type === "transport" ? Bus : item.category === "住宿" ? Hotel : Utensils;

  return (
    <article ref={setNodeRef} style={style} className="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div className="flex gap-3">
        <button className="mt-1 text-muted" {...attributes} {...listeners} aria-label="拖曳排序">
          <GripVertical size={18} />
        </button>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-white">
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-muted">{item.startTime || "未設定時間"}</p>
          <h3 className="mt-1 truncate text-base font-black">{item.title}</h3>
          {item.details ? <p className="mt-1 text-sm text-muted">{item.details}</p> : null}
          {place?.review ? <p className="mt-1 text-sm text-muted">我的 ★{place.review.rating}・{place.review.text}</p> : null}
          <div className="mt-3 flex gap-2">
            {place && place.status === "wishlist" ? (
              <Button
                variant="secondary"
                className="min-h-8 px-3 text-xs"
                onClick={() => onReview(place.id, { rating: 5, text: "行程中完成評價", visitedDate: new Date().toISOString().slice(0, 10) })}
              >
                <Star size={14} />
                評價
              </Button>
            ) : null}
            <Button variant="danger" className="min-h-8 px-3 text-xs" onClick={() => onRemove(item.id)}>
              <Trash2 size={14} />
              刪除
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function formatTripDay(startDate: string, offset: number) {
  const date = new Date(`${startDate}T00:00:00`);
  date.setDate(date.getDate() + offset);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function TripSheet({ open, onClose, onAddTrip }: { open: boolean; onClose: () => void; onAddTrip: ItineraryPageProps["onAddTrip"] }) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  return (
    <Sheet title="新增行程" open={open} onClose={onClose}>
      <div className="space-y-3">
        <input className="w-full rounded-lg border border-border bg-background p-3" placeholder="行程名稱" value={name} onChange={(event) => setName(event.target.value)} />
        <input className="w-full rounded-lg border border-border bg-background p-3" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        <input className="w-full rounded-lg border border-border bg-background p-3" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        <textarea className="w-full rounded-lg border border-border bg-background p-3" placeholder="備註" value={note} onChange={(event) => setNote(event.target.value)} />
        <Button className="w-full" onClick={() => { if (name) { onAddTrip({ name, startDate, endDate, note }); onClose(); } }}>建立行程</Button>
      </div>
    </Sheet>
  );
}

function TransportSheet({ open, onClose, tripId, dayIndex, onAddTripItem }: { open: boolean; onClose: () => void; tripId: string; dayIndex: number; onAddTripItem: ItineraryPageProps["onAddTripItem"] }) {
  const [transportType, setTransportType] = useState("高鐵");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [startTime, setStartTime] = useState("");
  const [details, setDetails] = useState("");

  return (
    <Sheet title="新增交通資訊" open={open} onClose={onClose}>
      <div className="space-y-3">
        <select className="w-full rounded-lg border border-border bg-background p-3" value={transportType} onChange={(event) => setTransportType(event.target.value)}>
          {["火車", "高鐵", "客運", "租機車", "租車", "公車", "捷運", "步行", "其他"].map((type) => <option key={type}>{type}</option>)}
        </select>
        <input className="w-full rounded-lg border border-border bg-background p-3" placeholder="出發地" value={from} onChange={(event) => setFrom(event.target.value)} />
        <input className="w-full rounded-lg border border-border bg-background p-3" placeholder="抵達地" value={to} onChange={(event) => setTo(event.target.value)} />
        <input className="w-full rounded-lg border border-border bg-background p-3" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
        <input className="w-full rounded-lg border border-border bg-background p-3" placeholder="車次 / 票號 / 備註" value={details} onChange={(event) => setDetails(event.target.value)} />
        <Button className="w-full" onClick={() => { onAddTripItem({ tripId, dayIndex, type: "transport", title: `${transportType} ${from || "出發地"} → ${to || "目的地"}`, startTime, transportType, details }); onClose(); }}>
          加入行程
        </Button>
      </div>
    </Sheet>
  );
}
