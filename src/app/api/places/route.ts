import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";

interface PlaceResult {
  name: string;
  lat: number;
  lng: number;
  photoUrl: string | null;
  rating: number | null;
  placeId: string;
  address: string;
}

// Cache place lookups
const placeCache = new Map<string, { data: PlaceResult; ts: number }>();
const CACHE_TTL = 86400_000; // 24h

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const action = searchParams.get("action") || "search"; // search | photo | distance

  if (!API_KEY) {
    return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 });
  }

  if (action === "search") {
    return handleSearch(query);
  }
  if (action === "distance") {
    const fromLat = searchParams.get("fromLat");
    const fromLng = searchParams.get("fromLng");
    const toLat = searchParams.get("toLat");
    const toLng = searchParams.get("toLng");
    const mode = searchParams.get("mode") || "walking";
    if (!fromLat || !fromLng || !toLat || !toLng) {
      return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
    }
    return handleDistance(fromLat, fromLng, toLat, toLng, mode);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

async function handleSearch(query: string) {
  // Check cache
  const cached = placeCache.get(query);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    // Text Search to find the place
    const searchRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=th&key=${API_KEY}`
    );
    const searchData = await searchRes.json();
    const place = searchData.results?.[0];

    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    // Get photo URL if available
    let photoUrl: string | null = null;
    if (place.photos?.[0]?.photo_reference) {
      photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${place.photos[0].photo_reference}&key=${API_KEY}`;
    }

    const result: PlaceResult = {
      name: place.name,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      photoUrl,
      rating: place.rating || null,
      placeId: place.place_id,
      address: place.formatted_address || "",
    };

    placeCache.set(query, { data: result, ts: Date.now() });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Places search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

async function handleDistance(
  fromLat: string, fromLng: string, toLat: string, toLng: string, mode: string
) {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${fromLat},${fromLng}&destinations=${toLat},${toLng}&mode=${mode}&language=th&key=${API_KEY}`
    );
    const data = await res.json();
    const element = data.rows?.[0]?.elements?.[0];

    if (element?.status === "OK") {
      return NextResponse.json({
        distance: element.distance.text,
        distanceMeters: element.distance.value,
        duration: element.duration.text,
        durationSeconds: element.duration.value,
      });
    }

    return NextResponse.json({ error: "Could not calculate distance" }, { status: 404 });
  } catch (error) {
    console.error("Distance error:", error);
    return NextResponse.json({ error: "Distance calculation failed" }, { status: 500 });
  }
}
