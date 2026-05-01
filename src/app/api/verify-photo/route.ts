import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY ||
  "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";

const VISION_MODELS = [
  "google/gemma-4-31b-it:free",
  "openai/gpt-oss-20b:free",
];

// Haversine distance in meters
function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, place, mission, photoHint, userLat, userLng, placeLat, placeLng } = body;

    // Method 1: GPS verification (if coordinates available)
    if (userLat && userLng && placeLat && placeLng) {
      const distance = haversineMeters(userLat, userLng, placeLat, placeLng);
      const isNearby = distance <= 500; // within 500 meters

      if (isNearby) {
        return NextResponse.json({
          verified: true,
          confidence: 95,
          method: "gps",
          distance: Math.round(distance),
          comment: distance < 100
            ? "คุณอยู่ตรงจุดเลย! ภารกิจสำเร็จ 📍✨"
            : `คุณอยู่ห่างแค่ ${Math.round(distance)} เมตร! ภารกิจสำเร็จ 📍`,
        });
      }
      // If not nearby but has photo, try photo verification
      if (!imageBase64) {
        return NextResponse.json({
          verified: false,
          confidence: 20,
          method: "gps",
          distance: Math.round(distance),
          comment: `คุณอยู่ห่าง ${Math.round(distance)} เมตร — ลองเข้าใกล้สถานที่มากขึ้น หรือถ่ายรูปยืนยัน`,
        });
      }
    }

    // Method 2: Photo verification with AI
    if (imageBase64) {
      const prompt = `You are verifying if a photo matches a travel mission.

Place: ${place}
Mission: ${mission}
Expected photo: ${photoHint || "a photo proving the user visited this place"}

Look at this image and determine if it reasonably shows the user visited or is at/near "${place}".
Be generous — accept if it shows the place, food, drinks, or any scene plausibly at the location.

Respond with ONLY JSON:
{"verified": true/false, "confidence": 0-100, "comment": "short encouraging comment in Thai"}`;

      let content: string | null = null;
      for (const model of VISION_MODELS) {
        try {
          const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages: [{
                role: "user",
                content: [
                  { type: "text", text: prompt },
                  { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
                ],
              }],
              temperature: 0.3,
              max_tokens: 200,
            }),
          });
          if (!res.ok) continue;
          const data = await res.json();
          content = data.choices?.[0]?.message?.content;
          if (content) break;
        } catch { continue; }
      }

      if (content) {
        let clean = content.trim().replace(/<think>[\s\S]*?<\/think>/g, "").trim();
        if (clean.startsWith("```")) clean = clean.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
        const jsonMatch = clean.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ ...result, method: "photo" });
        }
      }

      // AI failed — auto approve photo
      return NextResponse.json({
        verified: true, confidence: 70, method: "photo",
        comment: "ถ่ายรูปสวยมาก! ภารกิจสำเร็จ 📸",
      });
    }

    return NextResponse.json({
      verified: false, confidence: 0,
      comment: "กรุณาถ่ายรูปหรือเข้าใกล้สถานที่เพื่อยืนยันภารกิจ",
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ verified: true, confidence: 50, comment: "ภารกิจสำเร็จ!" });
  }
}
