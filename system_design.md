# MoodQuest Thailand — System Design

## สารบัญ

1. [Database Design](#1-database-design)
2. [AI Strategy](#2-ai-strategy)
3. [Google Maps Integration](#3-google-maps-integration)
4. [System Architecture](#4-system-architecture)

---

## 1. Database Design

### แนวคิด

ออกแบบใหม่จาก idea เดิม โดยเพิ่มตารางที่ขาดหายไป เพิ่ม foreign key ให้ถูกต้อง
และรองรับฟีเจอร์ badge, user, photo check-in, เวลาเปิด-ปิด, รูปภาพสถานที่

ใช้ PostgreSQL เป็นหลัก (Phase 1 Prototype ใช้ SQLite ได้ แต่ schema เดียวกัน)

---

### ERD Overview

```
users ──< user_trips ──< trip_items >── places
  │                                       │
  └──< user_badges >── badges             │
                                          │
                        missions >────────┘
                           │
              trip_items.mission_id ───┘
```

---

### ตาราง users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name TEXT NOT NULL,
    email TEXT UNIQUE,
    avatar_url TEXT,
    auth_provider TEXT DEFAULT 'email',  -- email, google, line
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### ตาราง places

เพิ่มฟิลด์สำคัญ: เวลาเปิด-ปิด, รูปภาพ, rating, Google Place ID

```sql
CREATE TABLE places (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    province TEXT NOT NULL,
    district TEXT,                        -- เขต/อำเภอ (ช่วย filter ละเอียดขึ้น)
    category TEXT,                        -- cafe, temple, park, market, museum, etc.
    mood_tags TEXT[],                     -- ['ฮีลใจ', 'ถ่ายรูป', 'สายกิน']
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    google_place_id TEXT,                 -- สำหรับดึงข้อมูลจาก Google Maps
    avg_stay_minutes INT DEFAULT 60,
    estimated_cost INT DEFAULT 0,         -- ค่าใช้จ่ายโดยประมาณ (บาท)
    description TEXT,
    image_url TEXT,                        -- รูปหลักของสถานที่
    opening_hours JSONB,                  -- {"mon": "09:00-18:00", "tue": "09:00-18:00", ...}
    rating DECIMAL(2,1) DEFAULT 0,        -- คะแนนเฉลี่ย 0-5
    is_free BOOLEAN DEFAULT FALSE,
    accessibility_notes TEXT,             -- หมายเหตุสำหรับผู้สูงอายุ/ผู้พิการ
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index สำหรับค้นหาตาม province + mood
CREATE INDEX idx_places_province ON places(province);
CREATE INDEX idx_places_mood_tags ON places USING GIN(mood_tags);
CREATE INDEX idx_places_location ON places USING GIST (
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)
);  -- PostGIS สำหรับค้นหาตามระยะทาง (optional, Phase 3)
```

---

### ตาราง missions

```sql
CREATE TABLE missions (
    id SERIAL PRIMARY KEY,
    place_id INT REFERENCES places(id) ON DELETE CASCADE,
    mood TEXT NOT NULL,                   -- mood ที่ mission นี้เหมาะกับ
    mission_title TEXT NOT NULL,
    mission_description TEXT NOT NULL,
    difficulty TEXT DEFAULT 'easy',       -- easy, medium, hard
    badge_id INT REFERENCES badges(id),
    mission_type TEXT DEFAULT 'general',  -- photo, quiz, explore, taste, relax
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_missions_place_mood ON missions(place_id, mood);
```

---

### ตาราง badges

```sql
CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,            -- 'Urban Healer', 'Local Food Hunter'
    description TEXT,
    icon_url TEXT,
    category TEXT,                        -- mood, achievement, special
    requirement_type TEXT DEFAULT 'mission_count',  -- mission_count, trip_count, special
    requirement_value INT DEFAULT 1,      -- จำนวนที่ต้องทำสำเร็จ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### ตาราง user_trips

```sql
CREATE TABLE user_trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    trip_title TEXT NOT NULL,
    mood TEXT NOT NULL,
    province TEXT NOT NULL,
    budget INT,
    duration_hours INT,
    transport_mode TEXT,                  -- bts, mrt, walk, car, bike
    estimated_budget INT,                 -- งบที่ AI ประเมิน
    tiredness_level TEXT,                 -- ต่ำ, กลาง, สูง
    status TEXT DEFAULT 'planned',        -- planned, in_progress, completed, cancelled
    ai_summary TEXT,                      -- Travel Memory ที่ AI สร้าง
    share_token TEXT UNIQUE,              -- สำหรับ share link
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_user_trips_user ON user_trips(user_id);
CREATE INDEX idx_user_trips_status ON user_trips(status);
```

---

### ตาราง trip_items

```sql
CREATE TABLE trip_items (
    id SERIAL PRIMARY KEY,
    trip_id UUID REFERENCES user_trips(id) ON DELETE CASCADE,
    place_id INT REFERENCES places(id),
    mission_id INT REFERENCES missions(id),
    order_no INT NOT NULL,
    scheduled_time TEXT,                  -- "13:00"
    mission_text TEXT,                    -- mission ที่ AI สร้างเฉพาะทริปนี้
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    photo_url TEXT,                       -- รูปที่ผู้ใช้ถ่ายยืนยัน
    notes TEXT                            -- บันทึกส่วนตัวของผู้ใช้
);

CREATE INDEX idx_trip_items_trip ON trip_items(trip_id);
```

---

### ตาราง user_badges

```sql
CREATE TABLE user_badges (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id INT REFERENCES badges(id),
    trip_id UUID REFERENCES user_trips(id),  -- ได้จากทริปไหน
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id)                -- ไม่ให้ได้ badge ซ้ำ
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
```

---

### Diagram ความสัมพันธ์

```
┌──────────┐     ┌──────────────┐     ┌────────────┐
│  users   │────<│  user_trips  │────<│ trip_items  │
└──────────┘     └──────────────┘     └────────────┘
     │                                   │       │
     │                                   │       │
     └────<┌──────────────┐              │       │
           │ user_badges  │              │       │
           └──────────────┘              │       │
                  │                      │       │
                  v                      v       v
           ┌──────────┐          ┌────────┐ ┌──────────┐
           │  badges  │          │ places │ │ missions │
           └──────────┘          └────────┘ └──────────┘
                                      │          │
                                      └────>─────┘
```

---

## 2. AI Strategy

### เปรียบเทียบ AI Provider

| เกณฑ์ | OpenAI (GPT-4o) | Google Gemini | Typhoon (Thai AI) | OpenRouter |
|---|---|---|---|---|
| ภาษาไทย | ดีมาก | ดีมาก | ดีมาก (เน้นไทย) | ขึ้นกับ model |
| ราคา | ปานกลาง-สูง | ถูก (มี free tier) | ถูก | ขึ้นกับ model |
| Speed | เร็ว | เร็ว | เร็ว | ขึ้นกับ model |
| Vision (ตรวจรูป) | มี | มี | ไม่มี | ขึ้นกับ model |
| JSON Mode | มี | มี | มี | ขึ้นกับ model |
| Free Tier | ไม่มี | มี (generous) | มี (limited) | ไม่มี |

### คำแนะนำ

**Phase 1 (Prototype):** ใช้ **Google Gemini** เป็นหลัก
- มี free tier ใช้ได้เยอะ
- รองรับภาษาไทยดี
- มี Vision สำหรับ Photo Check-in ในอนาคต
- JSON mode ใช้ได้
- SDK ง่าย (`google-generativeai`)

**Phase 2 (MVP):** เพิ่ม **Typhoon** เป็น fallback
- เน้นภาษาไทยโดยเฉพาะ
- ราคาถูกกว่า
- เหมาะกับ Storytelling ภาษาไทย

**Phase 3+:** พิจารณา **OpenAI** สำหรับ
- Photo Verification ที่ซับซ้อน
- Multi-modal (รูป + ข้อความ)
- Function calling ที่ซับซ้อน

---

### AI ใช้ทำอะไรบ้างในระบบ

| ฟีเจอร์ | AI ทำอะไร | Input | Output |
|---|---|---|---|
| Trip Generator | สร้างเส้นทาง + จัดลำดับสถานที่ | mood, places, budget, time | route JSON |
| Mission Generator | สร้างภารกิจเฉพาะสถานที่ | place info, mood, context | mission text |
| Storytelling | เล่าเรื่องสถานที่ | place info, history | story text |
| Photo Check-in | ตรวจว่ารูปตรงกับภารกิจ | photo, mission text | pass/fail + comment |
| Travel Memory | สรุปทริป | trip data, completed missions | summary text |
| Badge Naming | ตั้งชื่อ badge เฉพาะทาง | mood, achievements | badge name + desc |

---

### ตัวอย่าง AI Integration Code (Gemini)

```python
import google.generativeai as genai
import json

genai.configure(api_key="YOUR_API_KEY")

def generate_trip(mood: str, province: str, duration: int, budget: int, 
                  transport: str, places: list[dict]) -> dict:
    """สร้างทริปจาก mood และข้อมูลผู้ใช้"""
    
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        generation_config={
            "response_mime_type": "application/json",
            "temperature": 0.8,
        }
    )
    
    prompt = f"""คุณคือ AI Travel Game Master สำหรับการท่องเที่ยวในประเทศไทย
หน้าที่ของคุณคือสร้างทริปแบบภารกิจตาม mood ของผู้ใช้

ข้อมูลผู้ใช้:
- Mood: {mood}
- จังหวัด/พื้นที่: {province}
- เวลา: {duration} ชั่วโมง
- งบประมาณ: {budget} บาท
- วิธีเดินทาง: {transport}
- สถานที่ที่เลือกไว้: {json.dumps(places, ensure_ascii=False)}

สร้าง JSON ที่มี:
- trip_title: ชื่อทริปสั้นๆ เก๋ๆ
- short_description: คำอธิบายทริป 1-2 ประโยค
- estimated_budget: งบประมาณที่ประเมิน (ตัวเลข)
- tiredness_level: ระดับความเหนื่อย (ต่ำ/กลาง/สูง)
- route_items: array ของ {{time, place, mission, stay_minutes}}
- badge_reward: ชื่อ badge ที่จะได้
- travel_memory_preview: ข้อความสรุปทริปสั้นๆ

เงื่อนไข:
- ห้ามจัดทริปแน่นเกินไป ต้องมีเวลาเดินทางระหว่างจุด
- ต้องสอดคล้องกับ mood
- ภาษาไทยที่อ่านง่าย เป็นกันเอง
- ทำให้รู้สึกเป็นประสบการณ์ส่วนตัว"""

    response = model.generate_content(prompt)
    return json.loads(response.text)
```

---

### ตัวอย่าง Photo Verification (Phase 3)

```python
def verify_mission_photo(photo_path: str, mission_text: str) -> dict:
    """ตรวจสอบว่ารูปถ่ายตรงกับภารกิจหรือไม่"""
    
    model = genai.GenerativeModel("gemini-2.0-flash")
    
    image = genai.upload_file(photo_path)
    
    prompt = f"""ตรวจสอบว่ารูปนี้ตรงกับภารกิจหรือไม่

ภารกิจ: {mission_text}

ตอบเป็น JSON:
- is_valid: true/false
- confidence: 0-100
- comment: ความเห็นสั้นๆ เป็นภาษาไทย (ชมหรือให้กำลังใจ)"""

    response = model.generate_content([prompt, image])
    return json.loads(response.text)
```

---

## 3. Google Maps Integration

### API ที่ต้องใช้

| API | ใช้ทำอะไร | Phase | ราคา |
|---|---|---|---|
| Places API (New) | ค้นหาสถานที่, ดึงรูป, rating, เวลาเปิด-ปิด | 2-3 | $0.032/request |
| Directions API | คำนวณเส้นทาง + เวลาเดินทางระหว่างจุด | 3 | $0.005-0.01/request |
| Distance Matrix API | คำนวณระยะทางหลายจุดพร้อมกัน | 3 | $0.005-0.01/element |
| Maps JavaScript API | แสดงแผนที่บนเว็บ | 2 | $0.007/load |
| Geocoding API | แปลงชื่อสถานที่เป็นพิกัด | 2 | $0.005/request |

### ค่าใช้จ่ายโดยประมาณ

Google ให้ credit ฟรี **$200/เดือน** ซึ่งเพียงพอสำหรับ:
- Maps load ~28,000 ครั้ง/เดือน
- Places search ~6,000 ครั้ง/เดือน
- Directions ~20,000 ครั้ง/เดือน

สำหรับ MVP ใช้ฟรีได้สบาย

---

### Phase 2: แสดงแผนที่ + Route บนเว็บ

```
ผู้ใช้เลือก mood + พื้นที่
        ↓
Backend ค้นหา places จาก DB
        ↓
AI จัดเรียง route
        ↓
Frontend แสดง route บน Google Maps
  - Marker แต่ละสถานที่
  - เส้นทางเชื่อมระหว่างจุด
  - Info window แสดง mission
```

### ตัวอย่าง Frontend (React + Google Maps)

```tsx
import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps';

interface RouteItem {
  place: string;
  lat: number;
  lng: number;
  mission: string;
  time: string;
}

function TripMap({ routeItems }: { routeItems: RouteItem[] }) {
  const center = {
    lat: routeItems[0]?.lat ?? 13.7563,
    lng: routeItems[0]?.lng ?? 100.5018,
  };

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!}>
      <Map
        defaultCenter={center}
        defaultZoom={13}
        style={{ width: '100%', height: '500px' }}
      >
        {routeItems.map((item, index) => (
          <Marker
            key={index}
            position={{ lat: item.lat, lng: item.lng }}
            label={`${index + 1}`}
            title={item.place}
          />
        ))}
      </Map>
    </APIProvider>
  );
}
```

---

### Phase 3: คำนวณระยะทาง + เวลาเดินทาง

```python
import googlemaps

gmaps = googlemaps.Client(key="YOUR_API_KEY")

def calculate_route_distances(places: list[dict], transport_mode: str) -> list[dict]:
    """คำนวณระยะทางและเวลาเดินทางระหว่างสถานที่"""
    
    mode_map = {
        "walk": "walking",
        "bts": "transit",
        "mrt": "transit",
        "car": "driving",
        "bike": "bicycling",
    }
    mode = mode_map.get(transport_mode, "transit")
    
    results = []
    for i in range(len(places) - 1):
        origin = (places[i]["lat"], places[i]["lng"])
        destination = (places[i + 1]["lat"], places[i + 1]["lng"])
        
        directions = gmaps.directions(
            origin, destination,
            mode=mode,
            language="th"
        )
        
        if directions:
            leg = directions[0]["legs"][0]
            results.append({
                "from": places[i]["name"],
                "to": places[i + 1]["name"],
                "distance": leg["distance"]["text"],
                "duration": leg["duration"]["text"],
                "steps_summary": leg.get("steps", [])[:3],  # สรุป 3 step แรก
            })
    
    return results


def enrich_place_from_google(google_place_id: str) -> dict:
    """ดึงข้อมูลเพิ่มเติมจาก Google Places API"""
    
    place = gmaps.place(
        google_place_id,
        fields=[
            "name", "formatted_address", "geometry/location",
            "opening_hours", "rating", "user_ratings_total",
            "photos", "price_level", "types"
        ],
        language="th"
    )
    
    result = place.get("result", {})
    
    return {
        "name": result.get("name"),
        "lat": result.get("geometry", {}).get("location", {}).get("lat"),
        "lng": result.get("geometry", {}).get("location", {}).get("lng"),
        "opening_hours": result.get("opening_hours", {}).get("weekday_text"),
        "rating": result.get("rating"),
        "total_ratings": result.get("user_ratings_total"),
        "price_level": result.get("price_level"),
        "photo_reference": (
            result.get("photos", [{}])[0].get("photo_reference")
            if result.get("photos") else None
        ),
    }
```

---

### กลยุทธ์ลดค่าใช้จ่าย Google Maps

1. **Cache ข้อมูลสถานที่** — ดึงจาก Google ครั้งเดียว เก็บใน DB
2. **Cache ระยะทาง** — เส้นทางที่คำนวณแล้วเก็บไว้ ไม่ต้องเรียกซ้ำ
3. **ใช้ Haversine formula** — คำนวณระยะทางเบื้องต้นเอง ไม่ต้องเรียก API ทุกครั้ง
4. **Batch requests** — ใช้ Distance Matrix แทน Directions เมื่อต้องการแค่ระยะทาง
5. **Lazy load Maps** — โหลดแผนที่เมื่อผู้ใช้ต้องการดูเท่านั้น

```python
import math

def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """คำนวณระยะทางเบื้องต้นระหว่าง 2 จุด (กม.) โดยไม่ต้องเรียก API"""
    R = 6371  # รัศมีโลก (กม.)
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlng / 2) ** 2)
    return R * 2 * math.asin(math.sqrt(a))
```

---

## 4. System Architecture

### ภาพรวม (Phase 2: MVP)

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                          │
│              Next.js / React                         │
│  ┌──────────┐ ┌──────────┐ ┌───────────────────┐   │
│  │ Mood UI  │ │ Trip View│ │ Google Maps View   │   │
│  └──────────┘ └──────────┘ └───────────────────┘   │
└──────────────────────┬──────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────┐
│                    Backend                           │
│                   FastAPI                            │
│  ┌──────────┐ ┌──────────┐ ┌───────────────────┐   │
│  │ Trip API │ │ User API │ │ Mission API       │   │
│  └────┬─────┘ └────┬─────┘ └────┬──────────────┘   │
│       │             │            │                    │
│  ┌────▼─────────────▼────────────▼──────────────┐   │
│  │              Service Layer                    │   │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────────┐  │   │
│  │  │ AI Svc  │ │ Maps Svc │ │ Badge Svc    │  │   │
│  │  └────┬────┘ └────┬─────┘ └──────────────┘  │   │
│  └───────┼───────────┼──────────────────────────┘   │
└──────────┼───────────┼──────────────────────────────┘
           │           │
     ┌─────▼───┐ ┌─────▼──────┐  ┌──────────────┐
     │ Gemini  │ │ Google Maps│  │ PostgreSQL   │
     │   API   │ │    API     │  │   Database   │
     └─────────┘ └────────────┘  └──────────────┘
```

---

### Flow หลัก: สร้างทริป

```
1. ผู้ใช้เลือก mood, จังหวัด, เวลา, งบ, วิธีเดินทาง
                    ↓
2. Backend ค้นหา places จาก DB
   - filter ตาม province, mood_tags, is_active
   - filter ตาม estimated_cost <= budget
   - filter ตาม opening_hours (ถ้ามี)
   - เรียงตาม rating, ความใกล้
                    ↓
3. ส่ง places ที่ผ่าน filter ให้ AI (Gemini)
   - AI เลือกสถานที่ที่เหมาะสม
   - AI จัดลำดับเส้นทาง
   - AI สร้าง mission แต่ละจุด
   - AI ตั้งชื่อทริป + badge
                    ↓
4. (Phase 3) คำนวณระยะทางจริงด้วย Google Maps
   - ตรวจสอบว่าเส้นทางเป็นไปได้
   - ปรับเวลาเดินทางระหว่างจุด
                    ↓
5. บันทึกทริปลง DB (user_trips + trip_items)
                    ↓
6. ส่ง response กลับ Frontend
   - แสดง route + mission
   - แสดงแผนที่ (Phase 2+)
```

---

### API Endpoints หลัก

```
POST   /api/trips/generate          สร้างทริปใหม่
GET    /api/trips/:id               ดูรายละเอียดทริป
PATCH  /api/trips/:id/items/:itemId complete mission
POST   /api/trips/:id/complete      จบทริป → สร้าง Travel Memory
GET    /api/trips/:id/share         ดูทริปผ่าน share link

GET    /api/users/:id/badges        ดู badge ทั้งหมด
GET    /api/users/:id/trips         ดูประวัติทริป

GET    /api/places?province=&mood=  ค้นหาสถานที่
GET    /api/moods                   ดู mood ทั้งหมดที่มี
```

---

### Environment Variables ที่ต้องตั้ง

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/moodquest

# AI
GEMINI_API_KEY=your_gemini_api_key

# Google Maps
GOOGLE_MAPS_API_KEY=your_maps_api_key

# App
APP_SECRET_KEY=your_secret_key
CORS_ORIGINS=http://localhost:3000
```

---

## สรุปสิ่งที่ออกแบบ

| หัวข้อ | รายละเอียด |
|---|---|
| Database | 7 ตาราง (users, places, missions, badges, user_trips, trip_items, user_badges) พร้อม index |
| AI | เริ่มด้วย Gemini (ฟรี, ภาษาไทยดี, มี Vision) เพิ่ม Typhoon เป็น fallback |
| Google Maps | Phase 2 แสดงแผนที่, Phase 3 คำนวณเส้นทาง, cache เพื่อลดค่าใช้จ่าย |
| Architecture | Next.js + FastAPI + PostgreSQL + Gemini + Google Maps |
| ค่าใช้จ่าย | Phase 1-2 แทบไม่มีค่าใช้จ่าย (Gemini free tier + Google Maps $200 credit) |
