import { NextResponse } from "next/server";

const TAIWAN_CITIES = [
  "台北市",
  "新北市",
  "基隆市",
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

function normalizeMapsInput(input: string) {
  const trimmed = input.trim();

  try {
    const parsed = new URL(trimmed);
    const query = parsed.searchParams.get("q") ?? parsed.searchParams.get("query");
    if (query) return query;

    const placeMatch = parsed.pathname.match(/\/place\/([^/]+)/);
    if (placeMatch?.[1]) return decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
  } catch {
    return trimmed;
  }

  return trimmed;
}

function inferCity(formattedAddress = "") {
  return TAIWAN_CITIES.find((city) => formattedAddress.includes(city)) ?? "台南市";
}

function inferCategory(types: string[] = []) {
  if (types.some((type) => ["lodging", "hotel", "motel", "bed_and_breakfast"].includes(type))) return "住宿";
  if (types.some((type) => ["restaurant", "cafe", "bakery", "bar", "food", "meal_takeaway"].includes(type))) return "食物";
  if (types.some((type) => ["tourist_attraction", "museum", "park", "amusement_park", "zoo"].includes(type))) return "景點";
  if (types.some((type) => ["train_station", "transit_station", "bus_station", "parking"].includes(type))) return "交通";
  return "景點";
}

export async function POST(request: Request) {
  const { url } = (await request.json()) as { url?: string };

  if (!url) {
    return NextResponse.json({ configured: false, message: "請先貼上 Google Maps 網址。" }, { status: 400 });
  }

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return NextResponse.json({
      configured: false,
      message: "Google Maps API 尚未設定，請先使用手動新增。",
    });
  }

  const textQuery = normalizeMapsInput(url);
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.googleMapsUri,places.rating,places.userRatingCount,places.photos,places.types",
    },
    body: JSON.stringify({
      textQuery,
      languageCode: "zh-TW",
      regionCode: "TW",
      maxResultCount: 1,
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      {
        configured: true,
        found: false,
        message: "Google Maps 查詢失敗，請確認 API key、Places API 和帳單設定。",
      },
      { status: 502 },
    );
  }

  const data = (await response.json()) as {
    places?: Array<{
      id?: string;
      displayName?: { text?: string };
      formattedAddress?: string;
      googleMapsUri?: string;
      rating?: number;
      userRatingCount?: number;
      photos?: Array<{ name?: string }>;
      types?: string[];
    }>;
  };
  const place = data.places?.[0];

  if (!place) {
    return NextResponse.json({
      configured: true,
      found: false,
      message: "找不到這個地點，請改用手動新增。",
    });
  }

  const photoName = place.photos?.[0]?.name;

  return NextResponse.json({
    configured: true,
    found: true,
    place: {
      name: place.displayName?.text ?? textQuery,
      category: inferCategory(place.types),
      city: inferCity(place.formattedAddress),
      address: place.formattedAddress ?? "",
      googleMapsUrl: place.googleMapsUri ?? url,
      googlePlaceId: place.id,
      googleRating: place.rating,
      googleReviewCount: place.userRatingCount,
      photoUrl: photoName ? `/api/places/photo?name=${encodeURIComponent(photoName)}` : "",
      note: "",
    },
  });
}
