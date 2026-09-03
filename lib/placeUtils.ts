import { Place, PlaceCategory } from "./types";

export const categories: Array<PlaceCategory | "全部"> = ["全部", "住宿", "食物", "景點", "交通"];

export const taiwanCities = [
  "基隆市",
  "台北市",
  "新北市",
  "桃園市",
  "新竹市",
  "新竹縣",
  "苗栗縣",
  "台中市",
  "彰化縣",
  "南投縣",
  "雲林縣",
  "嘉義市",
  "嘉義縣",
  "台南市",
  "高雄市",
  "屏東縣",
  "宜蘭縣",
  "花蓮縣",
  "台東縣",
  "澎湖縣",
  "金門縣",
  "連江縣",
];

export function groupPlacesByCityAndCategory(
  places: Place[],
  categoryFilter: PlaceCategory | "全部",
) {
  const filtered = categoryFilter === "全部" ? places : places.filter((place) => place.category === categoryFilter);

  return filtered.reduce<Record<string, Partial<Record<PlaceCategory, Place[]>>>>((groups, place) => {
    groups[place.city] ??= {};
    groups[place.city][place.category] ??= [];
    groups[place.city][place.category]?.push(place);
    return groups;
  }, {});
}

export function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function formatGoogleRating(rating?: number) {
  return rating ? `Google ★${rating.toFixed(1)}` : "Google 尚無評分";
}

export function daysBetween(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const diff = Math.max(0, end.getTime() - start.getTime());
  return Math.floor(diff / 86400000) + 1;
}
