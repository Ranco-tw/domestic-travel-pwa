"use client";

import { useState } from "react";
import { Link, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { taiwanCities } from "@/lib/placeUtils";
import { PlaceDraft } from "@/lib/types";

interface ExplorePageProps {
  onAddPlace: (draft: PlaceDraft) => void | Promise<void>;
}

const emptyDraft: PlaceDraft = {
  name: "",
  category: "食物",
  city: "台南市",
  address: "",
  googleMapsUrl: "",
  note: "",
  photoUrl: "",
};

export function ExplorePage({ onAddPlace }: ExplorePageProps) {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [draft, setDraft] = useState<PlaceDraft>(emptyDraft);
  const [isSearching, setIsSearching] = useState(false);
  const [googleMeta, setGoogleMeta] = useState<{ googlePlaceId?: string; googleRating?: number; googleReviewCount?: number }>({});

  async function resolveUrl() {
    if (!url.trim()) return;
    setIsSearching(true);
    setMessage("正在讀取 Google Maps 地點...");
    const response = await fetch("/api/places/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = (await response.json()) as {
      configured: boolean;
      found?: boolean;
      message?: string;
      place?: PlaceDraft & { googlePlaceId?: string; googleRating?: number; googleReviewCount?: number };
    };
    setIsSearching(false);

    if (data.found && data.place) {
      const { googlePlaceId, googleRating, googleReviewCount, ...placeDraft } = data.place;
      setDraft(placeDraft);
      setGoogleMeta({ googlePlaceId, googleRating, googleReviewCount });
      setPreviewOpen(true);
      setMessage("已抓到 Google Maps 地點，確認後可加入收藏。");
      return;
    }

    if (!data.configured) {
      setMessage(data.message ?? "Google Maps API 尚未設定，請先使用手動新增。");
      setDraft({ ...emptyDraft, googleMapsUrl: url });
      setManualOpen(true);
      return;
    }

    setMessage(data.message ?? "找不到這個地點，請改用手動新增。");
    setDraft({ ...emptyDraft, googleMapsUrl: url });
    setManualOpen(true);
  }

  async function saveManual() {
    if (!draft.name.trim()) return;
    await onAddPlace({ ...draft, ...googleMeta });
    setDraft(emptyDraft);
    setGoogleMeta({});
    setUrl("");
    setManualOpen(false);
    setPreviewOpen(false);
    setMessage("已加入收藏。");
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black">探索</h1>
        <p className="mt-1 text-sm text-muted">貼上 Google Maps 網址，或先手動新增地點。</p>
      </div>

      <section className="rounded-lg border border-border bg-card p-3 shadow-sm">
        <div className="flex gap-2">
          <label className="flex min-h-11 flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3">
            <Link size={17} className="text-muted" />
            <input value={url} onChange={(event) => setUrl(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="貼上 Google Maps 網址" />
          </label>
          <Button onClick={resolveUrl} className="px-3" disabled={isSearching}>
            <Search size={17} />
            {isSearching ? "搜尋中" : "搜尋"}
          </Button>
        </div>
        {message ? <p className="mt-3 text-sm font-semibold text-muted">{message}</p> : null}
      </section>

      <button onClick={() => setManualOpen(true)} className="flex w-full items-center justify-between rounded-lg border border-dashed border-primary/50 bg-card p-4 text-left">
        <span>
          <span className="block font-bold">手動新增地點</span>
          <span className="text-sm text-muted">沒有 Google API key 時也能先整理收藏。</span>
        </span>
        <Plus className="text-primary" />
      </button>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="font-bold">第一版匯入方式</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          目前先預留安全的後端 API。之後設定 Google Maps API key 後，搜尋會自動帶出店名、照片、地址和評分。
        </p>
      </section>

      <Sheet title="手動新增收藏" open={manualOpen} onClose={() => setManualOpen(false)}>
        <div className="space-y-3">
          <input className="w-full rounded-lg border border-border bg-background p-3" placeholder="名稱" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          <select className="w-full rounded-lg border border-border bg-background p-3" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as PlaceDraft["category"] })}>
            {["住宿", "食物", "景點", "交通", "其他"].map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
          <select className="w-full rounded-lg border border-border bg-background p-3" value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })}>
            {taiwanCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <input className="w-full rounded-lg border border-border bg-background p-3" placeholder="地址" value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} />
          <input className="w-full rounded-lg border border-border bg-background p-3" placeholder="Google Maps 網址" value={draft.googleMapsUrl} onChange={(event) => setDraft({ ...draft, googleMapsUrl: event.target.value })} />
          <input className="w-full rounded-lg border border-border bg-background p-3" placeholder="照片網址" value={draft.photoUrl} onChange={(event) => setDraft({ ...draft, photoUrl: event.target.value })} />
          <textarea className="w-full rounded-lg border border-border bg-background p-3" rows={3} placeholder="備註" value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} />
          <Button className="w-full" onClick={saveManual}>加入收藏</Button>
        </div>
      </Sheet>

      <Sheet title="確認地點" open={previewOpen} onClose={() => setPreviewOpen(false)}>
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="aspect-[1.7/1] bg-border">
              {draft.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.photoUrl} alt={draft.name} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-sm text-muted">尚未取得照片</div>
              )}
            </div>
            <div className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-black">{draft.name}</h2>
                {googleMeta.googleRating ? <span className="shrink-0 font-black text-star">★ {googleMeta.googleRating}</span> : null}
              </div>
              <p className="text-sm font-bold text-muted">{draft.city}・{draft.category}</p>
              <p className="text-sm leading-6 text-muted">{draft.address}</p>
              {googleMeta.googleReviewCount ? <p className="text-xs font-bold text-muted">Google 評論數：{googleMeta.googleReviewCount}</p> : null}
            </div>
          </div>

          <select className="w-full rounded-lg border border-border bg-background p-3" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as PlaceDraft["category"] })}>
            {["住宿", "食物", "景點", "交通", "其他"].map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
          <select className="w-full rounded-lg border border-border bg-background p-3" value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })}>
            {taiwanCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <Button className="w-full" onClick={saveManual}>加入收藏</Button>
        </div>
      </Sheet>
    </div>
  );
}
