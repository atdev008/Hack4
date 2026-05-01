import { NextRequest, NextResponse } from "next/server";
import { TripInput } from "@/types";

const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY ||
  "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";

// Free models with fallback order
const FREE_MODELS = [
  "openai/gpt-oss-20b:free",
  "google/gemma-4-31b-it:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "qwen/qwen3-coder:free",
];

async function callOpenRouter(model: string, prompt: string): Promise<string | null> {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://moodquest-thailand.vercel.app",
          "X-Title": "MoodQuest Thailand",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "คุณคือ AI ที่ตอบเป็น JSON เท่านั้น ห้ามมี markdown code block ห้ามมี ```json ห้ามมีข้อความอื่นนอกจาก JSON ห้ามมี thinking tags",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.8,
          max_tokens: 2000,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Model ${model} error:`, response.status, errorText);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return content || null;
  } catch (error) {
    console.error(`Model ${model} exception:`, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mood, province, duration_hours, budget, transport_mode, locale = "th", user_context, weather_info, places_count, radius_km, area_lat, area_lng } = body;

    const isEn = locale === "en";
    const locationContext = area_lat && area_lng
      ? isEn
        ? `\nUser's location: ${area_lat}, ${area_lng}. All places MUST be within ${radius_km || 10}km radius of this point.`
        : `\nตำแหน่งผู้ใช้: ${area_lat}, ${area_lng} สถานที่ทั้งหมดต้องอยู่ในรัศมี ${radius_km || 10} กม. จากจุดนี้`
      : radius_km
      ? isEn
        ? `\nAll places must be within ${radius_km}km of ${province} center.`
        : `\nสถานที่ทั้งหมดต้องอยู่ในรัศมี ${radius_km} กม. จากใจกลาง${province}`
      : "";
    const contextBlock = user_context
      ? isEn
        ? `\n\nAdditional user constraints/preferences:\n${user_context}\nYou MUST respect these constraints when creating the trip.`
        : `\n\nข้อจำกัด/ความต้องการเพิ่มเติมจากผู้ใช้:\n${user_context}\nคุณต้องเคารพข้อจำกัดเหล่านี้ในการสร้างทริป`
      : "";
    const weatherBlock = weather_info
      ? isEn
        ? `\n\nCurrent weather: ${weather_info}\nIMPORTANT: For EVERY route_item, add a "rain_tip" field with a short, specific rain precaution for that particular place (e.g. "This cafe has indoor seating" or "Bring umbrella, no shelter nearby"). Make each tip unique and relevant to the specific location.`
        : `\n\nสภาพอากาศปัจจุบัน: ${weather_info}\nสำคัญ: ในทุก route_item ให้เพิ่มฟิลด์ "rain_tip" เป็นข้อควรระวังเรื่องฝนเฉพาะสถานที่นั้นๆ (เช่น "ร้านนี้มีที่นั่งในร่ม" หรือ "ไม่มีที่หลบฝน พกร่มไว้") ให้แต่ละ tip ไม่ซ้ำกัน เกี่ยวข้องกับสถานที่จริง`
      : "";

    const prompt = isEn
      ? `You are an AI Travel Game Master for Thailand tourism.
Create a quest-style trip based on the user's mood.

User info:
- Mood: ${mood}
- Area: ${province}
- Time: ${duration_hours} hours
- Budget: ${budget} THB
- Transport: ${transport_mode}

Return ONLY a JSON object (no markdown, no code blocks, no extra text):
{
  "trip_title": "Short catchy trip name",
  "short_description": "1-2 sentence trip description",
  "estimated_budget": estimated budget as number,
  "tiredness_level": "Low or Medium or High",
  "route_items": [
    {
      "time": "Start time e.g. 10:00",
      "place": "Real place name in ${province}",
      "mission": "Fun mission to do here",
      "stay_minutes": minutes to spend as number,
      "rain_tip": "Short rain precaution specific to this place (only if weather has rain chance)",
      "temp": estimated temperature at this place at this time (number in celsius),
      "aqi": estimated AQI at this specific location (number 0-500),
      "aqi_color": "hex color for AQI (#00E400 good, #FFFF00 moderate, #FF7E00 unhealthy-sensitive, #FF0000 unhealthy)",
      "weather_icon": "one of: sun, cloud-sun, cloud, cloud-drizzle, cloud-rain",
      "weather_warning": "short safety tip about weather/air quality at this specific place and time, or null if conditions are good",
      "photo_hint": "describe what photo the user should take to prove they visited (e.g. 'a photo of the temple entrance')",
      "stamp_emoji": "a unique emoji representing this place as a collectible stamp",
      "place_image_query": "short English search query to find a photo of this exact place (e.g. 'Lumpini Park Bangkok')"
    }
  ],
  "badge_reward": "Badge name",
  "badge_emoji": "emoji for the badge",
  "travel_memory_preview": "Short trip summary written casually"
}

Rules:
- Places must be real locations in ${province}
- Number of places: ${places_count ? `exactly ${places_count} places` : "3 for 2-3 hours, 4-5 for 4-5 hours, 6-8 for 6+ hours. Scale with available time."}
- Don't pack the trip too tight, allow travel time between stops
- Missions must be fun, doable, and match the "${mood}" mood
- Budget must not exceed ${budget} THB
- Write in friendly, casual English
- Return ONLY JSON, no markdown or other text${contextBlock}${weatherBlock}${locationContext}`
      : `คุณคือ AI Travel Game Master สำหรับการท่องเที่ยวในประเทศไทย
หน้าที่ของคุณคือสร้างทริปแบบภารกิจตาม mood ของผู้ใช้

ข้อมูลผู้ใช้:
- Mood: ${mood}
- จังหวัด/พื้นที่: ${province}
- เวลา: ${duration_hours} ชั่วโมง
- งบประมาณ: ${budget} บาท
- วิธีเดินทาง: ${transport_mode}

สร้าง JSON ที่มีโครงสร้างดังนี้ (ตอบเป็น JSON เท่านั้น ห้ามมี markdown หรือข้อความอื่น):
{
  "trip_title": "ชื่อทริปสั้นๆ เก๋ๆ ภาษาไทยหรืออังกฤษก็ได้",
  "short_description": "คำอธิบายทริป 1-2 ประโยค",
  "estimated_budget": ตัวเลขงบประมาณที่ประเมิน,
  "tiredness_level": "ต่ำ หรือ กลาง หรือ สูง",
  "route_items": [
    {
      "time": "เวลาเริ่ม เช่น 10:00",
      "place": "ชื่อสถานที่จริงใน${province}",
      "mission": "ภารกิจสนุกๆ ที่ต้องทำที่นี่",
      "stay_minutes": ตัวเลขนาทีที่ควรใช้เวลา,
      "rain_tip": "ข้อควรระวังเรื่องฝนเฉพาะสถานที่นี้ (ใส่เฉพาะเมื่อมีโอกาสฝนตก)",
      "temp": อุณหภูมิโดยประมาณ ณ สถานที่นี้ในเวลานั้น (ตัวเลข องศาเซลเซียส),
      "aqi": ค่า AQI โดยประมาณ ณ สถานที่นี้ (ตัวเลข 0-500),
      "aqi_color": "สี hex ตามระดับ AQI (#00E400 ดี, #FFFF00 ปานกลาง, #FF7E00 เริ่มมีผล, #FF0000 ไม่ดี)",
      "weather_icon": "เลือก 1 จาก: sun, cloud-sun, cloud, cloud-drizzle, cloud-rain",
      "weather_warning": "คำเตือนสั้นๆ เรื่องอากาศ/ฝุ่นเฉพาะสถานที่และเวลานี้ หรือ null ถ้าสภาพดี",
      "photo_hint": "อธิบายว่าต้องถ่ายรูปอะไรเพื่อยืนยันว่ามาจริง (เช่น 'ถ่ายรูปหน้าวัด' หรือ 'ถ่ายรูปอาหารที่สั่ง')",
      "stamp_emoji": "emoji ที่เป็นเอกลักษณ์ของสถานที่นี้ สำหรับสะสมเป็นแสตมป์",
      "place_image_query": "คำค้นหาภาษาอังกฤษสั้นๆ สำหรับหารูปสถานที่นี้ (เช่น 'Wat Arun Bangkok')"
    }
  ],
  "badge_reward": "ชื่อ badge ที่จะได้รับ",
  "badge_emoji": "emoji ที่เหมาะกับ badge",
  "travel_memory_preview": "ข้อความสรุปทริปสั้นๆ เขียนเหมือนเล่าให้เพื่อนฟัง"
}

เงื่อนไขสำคัญ:
- สถานที่ต้องเป็นสถานที่จริงที่มีอยู่ใน${province}
- จำนวนสถานที่: ${places_count ? `ต้องมี ${places_count} แห่งเท่านั้น` : "3 แห่งสำหรับ 2-3 ชม., 4-5 แห่งสำหรับ 4-5 ชม., 6-8 แห่งสำหรับ 6 ชม.ขึ้นไป ปรับตามเวลาที่มี"}
- ห้ามจัดทริปแน่นเกินไป ต้องมีเวลาเดินทางระหว่างจุด
- ภารกิจต้องสนุก ทำได้จริง และสอดคล้องกับ mood "${mood}"
- งบประมาณต้องไม่เกิน ${budget} บาท
- ใช้ภาษาไทยที่อ่านง่าย เป็นกันเอง
- ตอบเป็น JSON เท่านั้น ห้ามมี markdown code block หรือข้อความอื่น${contextBlock}${weatherBlock}${locationContext}`;

    // Try each model until one works
    let content: string | null = null;
    let usedModel = "";

    for (const model of FREE_MODELS) {
      console.log(`Trying model: ${model}`);
      content = await callOpenRouter(model, prompt);
      if (content) {
        usedModel = model;
        console.log(`Success with model: ${model}`);
        break;
      }
    }

    if (!content) {
      return NextResponse.json(
        { error: "All AI models are currently unavailable. Please try again in a moment." },
        { status: 502 }
      );
    }

    // Clean up the response - remove markdown code blocks, thinking tags, etc.
    let cleanContent = content.trim();

    // Remove <think>...</think> tags (some models add these)
    cleanContent = cleanContent.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    // Remove markdown code blocks
    if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent
        .replace(/^```(?:json)?\s*\n?/, "")
        .replace(/\n?```\s*$/, "");
    }

    // Find the JSON object in the response
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", cleanContent.substring(0, 500));
      return NextResponse.json(
        { error: "AI returned invalid format" },
        { status: 502 }
      );
    }

    const tripResult = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ ...tripResult, _model: usedModel });
  } catch (error) {
    console.error("Generate trip error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate trip",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
