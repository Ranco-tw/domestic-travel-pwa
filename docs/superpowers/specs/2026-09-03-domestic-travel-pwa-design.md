# Domestic Travel PWA App Design

## Overview

This project is a mobile-first PWA for Taiwan domestic travel planning. The app helps a private user collect places from Google Maps, organize them by city and type, build itineraries, and keep a personal record of visited places with private ratings and notes.

The first production direction is:

- GitHub for source control.
- Vercel for PWA hosting and backend API routes.
- Supabase for authentication, database storage, and future file storage if needed.
- Google Places / Maps API through server-side Vercel API routes only, so the API key is never exposed in frontend code.

The current workspace is empty and not yet initialized as a Git project. Implementation should start only after this design is reviewed and approved.

## Product Goals

The app should feel like a real iPhone travel app even though it is delivered as a PWA. It should support adding the website to the iPhone home screen, opening full screen, and using bottom-tab navigation.

Primary goals:

- Save travel places in the cloud instead of resetting when the app reloads.
- Keep a private database of places the user wants to visit and places already visited.
- Make itinerary planning easy on a phone.
- Let the user import places from Google Maps URLs when an API key is available.
- Provide a manual fallback when Google API access is not yet configured or a URL cannot be parsed.

## Users And Access

The app is private. It should not allow random visitors who know the URL to view or edit data.

Authentication requirements:

- Show a login page before the main app.
- Use fixed account/password style login from the user perspective.
- Implement login through Supabase Auth instead of hardcoding credentials in frontend code.
- Support "remember account/password" behavior from the user's perspective.
- Prefer storing the login session securely through Supabase session persistence.
- Do not expose service-role keys or sensitive credentials to the browser.

Login screen copy:

- App name: "旅途收藏"
- Subtitle: "收藏回憶，規劃屬於我們的旅程"
- Fields: "帳號", "密碼"
- Button: "開始規劃"
- Option: "記住帳號密碼"

## Visual Style

The app should use a warm earth-tone visual language with light and dark modes. It should feel natural, clean, and travel-oriented, with photos as the visual focus.

Light mode palette:

- Background: `#F7F3EA`
- Card: `#FFFDF8`
- Primary: `#6F7D4D`
- Secondary accent: `#C7794A`
- Text: `#2F2A24`
- Secondary text: `#756B5D`
- Star: `#D9A441`
- Border: `#E3D8C8`

Dark mode palette:

- Background: `#171A16`
- Card: `#24261F`
- Primary: `#A8B37A`
- Secondary accent: `#D08A5B`
- Text: `#F4EFE4`
- Secondary text: `#B9AE9E`
- Star: `#E2B85B`
- Border: `#3A3A31`

Theme behavior:

- Provide theme setting: follow system, light, dark.
- Place the theme control in the "我的" or settings area.
- Avoid an all-brown interface; use olive green for primary actions and terracotta sparingly.

## Navigation

After login, the main app uses four bottom tabs:

- 探索
- 收藏
- 行程
- 我的

The app should avoid unnecessary page jumps. Use native-app-like mobile patterns:

- Bottom sheets for search results, place details, and adding to itinerary.
- Full-screen sheets or dedicated edit screens for larger itinerary forms.
- Small confirmation dialogs for destructive actions such as delete.

## Page 1: 探索

Purpose: import places from Google Maps and save them to the user's cloud database.

Main flow:

1. User pastes a Google Maps place URL.
2. User taps "搜尋".
3. App shows loading state.
4. Backend API attempts to resolve place data.
5. App shows a bottom-sheet preview card.
6. User confirms or edits category/notes.
7. User taps "加入收藏".

Preview data:

- Place name.
- Photo.
- Google rating.
- Google review count.
- Address.
- City/county.
- Category: 住宿, 食物, 景點, 交通, 其他.
- Google Maps URL.
- Optional note.

Fallback behavior:

- If Google API is not configured, show a clear message and allow manual place creation.
- If the URL cannot be resolved, allow manual entry.
- Manual entry should support name, category, city, address, note, and optional image URL.

Button behavior:

- "開啟地圖" opens Google Maps.
- "加入收藏" saves the place with status `wishlist`.

## Page 2: 收藏

Purpose: show places the user wants to visit but has not yet reviewed as visited.

Display requirements:

- Top category tabs: 全部, 住宿, 食物, 景點, 交通.
- City/county sections should be collapsible accordions.
- The user can open only the city needed for the current trip, such as 台南市.
- Each expanded city groups places by type.

Preferred layout:

```text
▾ 台南市

食物
  阿堂鹹粥        Google ★4.4    +
  [橫向照片]

景點
  赤崁樓          Google ★4.3    +
  [橫向照片]
```

Place card actions:

- Tap card: open place detail bottom sheet.
- Tap plus: add to itinerary.
- Tap rating action: review and mark as visited.
- Open Google Maps.
- Edit category or note.
- Delete from collection.

Status behavior:

- A saved place starts as `wishlist`.
- When added to an itinerary, it can also show that it is scheduled.
- When reviewed, it moves from 收藏 to 我的.

## Page 3: 我的

Purpose: keep a private record of visited and reviewed places.

Display requirements:

- Same category tabs as 收藏.
- Same collapsible city/county organization.
- Same type grouping inside each city.

Visited place data:

- Place name.
- Photo.
- Google rating.
- Personal rating.
- Personal review.
- Visited date.
- Address.
- Google Maps URL.

Example layout:

```text
▾ 台南市

食物
  阿堂鹹粥  Google ★4.4 / 我的 ★5
  很好吃，下次會再去
  [橫向照片]
  [再加入行程] [編輯評價]
```

Actions:

- Add visited place to a new itinerary again.
- Edit personal rating and review.
- Open Google Maps.
- Delete only after confirmation.

## Page 4: 行程

Purpose: create and adjust travel plans.

Trip-level data:

- Trip name.
- Start date.
- End date.
- Day count derived from date range.
- Optional trip note.

Itinerary display:

- Trip selector at top.
- "新增行程" action.
- Day tabs: Day 1, Day 2, Day 3, etc.
- Timeline list for the selected day.
- Smaller time text.
- Larger, clearer place or transport title.
- Secondary detail line for address, duration, category, Google rating, or ticket info.

Itinerary item types:

- Place from 收藏.
- Place from 我的.
- Accommodation.
- Food.
- Attraction.
- Transportation.
- Custom note/task.

Transportation entry fields:

- Transport type: 火車, 高鐵, 客運, 租機車, 租車, 公車, 捷運, 步行, 其他.
- Departure location.
- Arrival location.
- Departure time.
- Arrival time.
- Train/bus number or ticket number.
- Seat information.
- Note.

Interactions:

- Add items from 收藏 or 我的 to a selected trip day.
- Manually add transportation or custom item.
- Long-press and drag itinerary items to reorder.
- Edit item time and notes.
- Delete itinerary item.
- Review a wishlist place directly from the itinerary.

Review behavior from itinerary:

- If the item came from 我的, show the user's personal rating and review.
- If the item came from 收藏, show a review option.
- After the user reviews it, move the place from 收藏 to 我的.

## Data Model

Initial Supabase tables should include:

- `profiles`: user profile metadata.
- `places`: canonical saved places for the user.
- `place_reviews`: personal rating, review, visited date.
- `trips`: trip names and date ranges.
- `trip_days`: derived or stored day records for trips.
- `trip_items`: itinerary entries and ordering.

Place fields:

- `id`
- `user_id`
- `name`
- `category`
- `city`
- `address`
- `google_maps_url`
- `google_place_id`
- `google_rating`
- `google_review_count`
- `photo_url`
- `note`
- `status`: `wishlist`, `visited`
- `created_at`
- `updated_at`

Trip item fields:

- `id`
- `trip_id`
- `day_index`
- `place_id`
- `type`: `place`, `transport`, `custom`
- `title`
- `start_time`
- `end_time`
- `sort_order`
- `transport_type`
- `details`
- `note`
- `created_at`
- `updated_at`

## Google Maps API Handling

The user does not currently have a Google API key. Implementation should account for this.

Server-side API design:

- Frontend calls a Vercel API route, such as `/api/places/resolve`.
- The API route reads the Google key from Vercel environment variables.
- The API route calls Google Places / Maps services.
- The API route returns only the place data needed by the frontend.
- The key is never sent to the browser.

Environment variable:

- `GOOGLE_MAPS_API_KEY`

Fallback phases:

1. Build UI and Supabase storage with manual place creation.
2. Add the server-side resolve endpoint with graceful "API not configured" handling.
3. When the user later provides or configures a Google API key, enable live URL resolving.

Security notes:

- Restrict the Google API key in Google Cloud when possible.
- Use server-side calls so frontend users cannot inspect the key.
- Avoid putting API keys in GitHub.
- Avoid putting API keys in frontend `.env` variables that become public.

## Supabase And Security

Use Supabase Auth and Row Level Security.

Requirements:

- Each data row should belong to a `user_id`.
- RLS policies should allow a logged-in user to read/write only their own rows.
- Service-role key must only be used server-side if needed.
- Client should use Supabase anon key only.

This prevents a visitor from changing data even if they guess the Vercel URL.

## PWA Requirements

The app should include:

- Web app manifest.
- App icon.
- Mobile viewport support.
- iPhone home-screen friendly layout.
- Theme color for light and dark modes.
- Basic service worker or framework PWA support if suitable.

Offline behavior for the first version can be limited:

- The app can show cached shell UI.
- Live data requires network.
- Full offline editing can be a later version.

## MVP Scope

Version 1 should include:

- Login.
- Theme switching.
- Bottom tab navigation.
- Supabase-backed saved places.
- Manual place creation.
- Google Maps URL import UI and backend placeholder.
- 收藏 page with category tabs and collapsible cities.
- 我的 page with personal reviews.
- Trip creation.
- Day tabs.
- Itinerary item creation.
- Add place to itinerary.
- Drag-and-drop itinerary ordering.
- Review from 收藏 or 行程 and move to 我的.

Version 1 should not include:

- Public user registration.
- Social sharing.
- Booking integration.
- Payment.
- Automatic route optimization.
- Full Google Maps embedded route planning.
- Multi-user collaboration.

## Open Decisions

Before implementation, confirm:

- Whether the login account should be created manually in Supabase by the app owner.
- Whether the first version should allow only one account or multiple invited accounts.
- Whether photos should use Google photo URLs first or require manually added image URLs until the Google API key exists.
- Whether transportation ticket images should be supported in version 1 or text fields are enough.

## Implementation Approval Gate

Do not implement until the user reviews and approves this design.
