import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!apiKey || !name) {
    return new NextResponse(null, { status: 404 });
  }

  const photoUrl = new URL(`https://places.googleapis.com/v1/${name}/media`);
  photoUrl.searchParams.set("maxHeightPx", "700");
  photoUrl.searchParams.set("key", apiKey);
  photoUrl.searchParams.set("skipHttpRedirect", "true");

  const response = await fetch(photoUrl);
  if (!response.ok) {
    return new NextResponse(null, { status: 502 });
  }

  const data = (await response.json()) as { photoUri?: string };
  if (!data.photoUri) {
    return new NextResponse(null, { status: 404 });
  }

  const photoResponse = await fetch(data.photoUri);
  if (!photoResponse.ok) {
    return new NextResponse(null, { status: 502 });
  }

  return new NextResponse(photoResponse.body, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": photoResponse.headers.get("Content-Type") ?? "image/jpeg",
    },
  });
}
