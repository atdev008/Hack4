import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY ||
  "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";

const FREE_MODELS = [
  "openai/gpt-oss-20b:free",
  "google/gemma-4-31b-it:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
];

// Simple in-memory cache: key -> { data, ts }
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 1800_000; // 30 min

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const locale = searchParams.get("locale") || "th";

    if (!lat || !lng) {
      return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
    }

    // Round to 1 decimal for cache key (same area)
    const cacheKey = `${parseFloat(lat).toFixed(1)},${parseFloat(lng).toFixed(1)}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const hour = now.getHours();
    const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

    const prompt = `Based on the GPS coordinates (${lat}, ${lng}) in Thailand, estimate the current weather conditions.
Date: ${dateStr}, Time: ${timeOfDay}

Consider:
- This location is in Thailand
- Current season and typical weather patterns
- Time of day affects temperature
- Regional weather differences (coastal, mountain, urban, etc.)

Respond with ONLY a JSON object (no markdown, no code blocks):
{
  "locationName": "name of the nearest city/area in Thai",
  "locationNameEn": "name in English",
  "maxTemp": estimated max temperature today in celsius (number),
  "minTemp": estimated min temperature today in celsius (number),
  "currentTemp": estimated current temperature in celsius (number),
  "humidity": estimated humidity percentage (number),
  "rainPercent": chance of rain today percentage (number 0-100),
  "descTh": "short weather description in Thai (e.g. อากาศร้อน, ฝนฟ้าคะนอง)",
  "descEn": "short weather description in English",
  "aqi": estimated AQI number for this area (0-500),
  "aqiLevel": "Good or Moderate or Unhealthy for Sensitive or Unhealthy",
  "aqiLevelTh": "Thai translation",
  "aqiColor": "hex color for AQI level",
  "aqiAdvice": "short English health advice",
  "aqiAdviceTh": "short Thai health advice"
}

Be realistic. Use typical weather data for this region and season.`;

    let content: string | null = null;
    for (const model of FREE_MODELS) {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "system",
                content: "You respond with JSON only. No markdown, no code blocks, no thinking tags. Be a realistic weather estimator for Thailand.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 500,
          }),
        });
        if (!res.ok) continue;
        const data = await res.json();
        content = data.choices?.[0]?.message?.content;
        if (content) break;
      } catch {
        continue;
      }
    }

    if (!content) {
      return NextResponse.json({ error: "AI unavailable" }, { status: 502 });
    }

    // Clean response
    let clean = content.trim();
    clean = clean.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    if (clean.startsWith("```")) {
      clean = clean.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Invalid AI response" }, { status: 502 });
    }

    const result = JSON.parse(jsonMatch[0]);

    // Cache it
    cache.set(cacheKey, { data: result, ts: Date.now() });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Weather-location API error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
