import { Place, Trip, TripItem } from "./types";

const now = new Date().toISOString();

export const placeholderPhotos = {
  food: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=900&q=80",
  landmark: "https://images.unsplash.com/photo-1535139262971-c51845709a48?auto=format&fit=crop&w=900&q=80",
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
  street: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
};

export const initialPlaces: Place[] = [
  {
    id: "place-atang",
    userId: "demo",
    name: "阿堂鹹粥",
    category: "食物",
    city: "台南市",
    address: "台南市中西區",
    googleMapsUrl: "https://maps.google.com/?q=%E9%98%BF%E5%A0%82%E9%B9%B9%E7%B2%A5",
    googleRating: 4.4,
    googleReviewCount: 8230,
    photoUrl: placeholderPhotos.food,
    note: "早餐備案，想早點去避開排隊。",
    status: "wishlist",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "place-chihkan",
    userId: "demo",
    name: "赤崁樓",
    category: "景點",
    city: "台南市",
    address: "台南市中西區民族路二段212號",
    googleMapsUrl: "https://maps.google.com/?q=%E8%B5%A4%E5%B4%81%E6%A8%93",
    googleRating: 4.3,
    googleReviewCount: 29000,
    photoUrl: placeholderPhotos.landmark,
    status: "wishlist",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "place-hotel",
    userId: "demo",
    name: "台南晶英酒店",
    category: "住宿",
    city: "台南市",
    address: "台南市中西區和意路1號",
    googleMapsUrl: "https://maps.google.com/?q=%E5%8F%B0%E5%8D%97%E6%99%B6%E8%8B%B1%E9%85%92%E5%BA%97",
    googleRating: 4.6,
    googleReviewCount: 6200,
    photoUrl: placeholderPhotos.hotel,
    status: "visited",
    review: {
      rating: 5,
      text: "位置很好，晚上散步跟找吃的都方便。",
      visitedDate: "2026-08-18",
    },
    createdAt: now,
    updatedAt: now,
  },
];

export const initialTrips: Trip[] = [
  {
    id: "trip-tainan",
    userId: "demo",
    name: "台南三天兩夜",
    startDate: "2026-10-12",
    endDate: "2026-10-14",
    note: "慢慢吃、慢慢逛，不排太滿。",
    createdAt: now,
    updatedAt: now,
  },
];

export const initialTripItems: TripItem[] = [
  {
    id: "item-rail",
    tripId: "trip-tainan",
    dayIndex: 0,
    type: "transport",
    title: "高鐵 台北 → 台南",
    startTime: "08:30",
    endTime: "10:09",
    sortOrder: 0,
    transportType: "高鐵",
    details: "預計 1 小時 39 分・車次 803",
  },
  {
    id: "item-atang",
    tripId: "trip-tainan",
    dayIndex: 0,
    type: "place",
    placeId: "place-atang",
    title: "阿堂鹹粥",
    startTime: "10:30",
    sortOrder: 1,
    category: "食物",
    details: "台南市中西區・Google ★4.4",
  },
  {
    id: "item-hotel",
    tripId: "trip-tainan",
    dayIndex: 0,
    type: "place",
    placeId: "place-hotel",
    title: "入住 台南晶英酒店",
    startTime: "14:00",
    sortOrder: 2,
    category: "住宿",
    details: "住宿・我的 ★5",
  },
];
