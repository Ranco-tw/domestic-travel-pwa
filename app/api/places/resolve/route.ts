import { NextResponse } from "next/server";

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

  return NextResponse.json({
    configured: false,
    message: "Google Maps API key 已設定；下一版會接上 Places 查詢。",
  });
}
