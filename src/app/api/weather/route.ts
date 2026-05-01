import { NextRequest, NextResponse } from "next/server";

const TMD_API_URL =
  "https://data.tmd.go.th/api/WeatherForecast7Days/v2/?uid=api&ukey=api12345";

// Map our province names to TMD province names (Thai)
const provinceMap: Record<string, string> = {
  กรุงเทพ: "กรุงเทพมหานคร",
  Bangkok: "กรุงเทพมหานคร",
  เชียงใหม่: "เชียงใหม่",
  "Chiang Mai": "เชียงใหม่",
  เชียงราย: "เชียงราย",
  "Chiang Rai": "เชียงราย",
  พัทยา: "ชลบุรี",
  Pattaya: "ชลบุรี",
  ภูเก็ต: "ภูเก็ต",
  Phuket: "ภูเก็ต",
  กระบี่: "กระบี่",
  Krabi: "กระบี่",
  น่าน: "น่าน",
  Nan: "น่าน",
  อยุธยา: "พระนครศรีอยุธยา",
  Ayutthaya: "พระนครศรีอยุธยา",
  กาญจนบุรี: "กาญจนบุรี",
  Kanchanaburi: "กาญจนบุรี",
  หัวหิน: "ประจวบคีรีขันธ์",
  "Hua Hin": "ประจวบคีรีขันธ์",
  เขาใหญ่: "นครราชสีมา",
  "Khao Yai": "นครราชสีมา",
  สุโขทัย: "สุโขทัย",
  Sukhothai: "สุโขทัย",
};

interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  rainPercent: number;
  descTh: string;
  descEn: string;
}

/**
 * Decode XML numeric character references like &#xE01; to actual characters
 */
function decodeXmlEntities(xml: string): string {
  return xml.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
}

function parseWeatherXml(xml: string, targetProvince: string): ForecastDay[] {
  // Decode all XML entities first so Thai text is readable
  const decoded = decodeXmlEntities(xml);

  // Split into province blocks
  const provinceBlocks = decoded.split("<Province>");
  
  for (const block of provinceBlocks) {
    // Check if this block contains our target province
    const nameMatch = block.match(/<ProvinceNameThai>([^<]+)<\/ProvinceNameThai>/);
    if (!nameMatch) continue;
    
    const provinceName = nameMatch[1].trim();
    if (provinceName !== targetProvince) continue;

    // Found our province — extract all forecast entries
    const results: ForecastDay[] = [];
    
    // TMD puts multiple forecasts as repeated tag groups within SevenDaysForecast
    // Split by ForecastDate to get individual days
    const forecastSection = block.match(/<SevenDaysForecast>([\s\S]*?)(<\/Province>|$)/);
    if (!forecastSection) continue;
    
    const content = forecastSection[1];
    
    // Extract all values in order
    const dates = [...content.matchAll(/<ForecastDate>([^<]+)<\/ForecastDate>/g)].map(m => m[1]);
    const maxTemps = [...content.matchAll(/<MaximumTemperature[^>]*>([^<]+)<\/MaximumTemperature>/g)].map(m => parseFloat(m[1]));
    const minTemps = [...content.matchAll(/<MinimumTemperature[^>]*>([^<]+)<\/MinimumTemperature>/g)].map(m => parseFloat(m[1]));
    const rainPcts = [...content.matchAll(/<PercentRainCover[^>]*>([^<]+)<\/PercentRainCover>/g)].map(m => parseInt(m[1], 10));
    const descsTh = [...content.matchAll(/<DescriptionThai>([^<]+)<\/DescriptionThai>/g)].map(m => m[1].trim());
    const descsEn = [...content.matchAll(/<DescriptionEnglish>([^<]+)<\/DescriptionEnglish>/g)].map(m => m[1].trim());

    const count = Math.min(dates.length, 3); // Get up to 3 days
    for (let i = 0; i < count; i++) {
      results.push({
        date: dates[i] ?? "",
        maxTemp: maxTemps[i] ?? 0,
        minTemp: minTemps[i] ?? 0,
        rainPercent: rainPcts[i] ?? 0,
        descTh: descsTh[i] ?? "",
        descEn: descsEn[i] ?? "",
      });
    }

    return results;
  }

  return [];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get("province") || "กรุงเทพ";

    const tmdProvince = provinceMap[province] || province;

    console.log(`Weather: looking for province "${tmdProvince}" (input: "${province}")`);

    const response = await fetch(TMD_API_URL, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error("TMD API error:", response.status);
      return NextResponse.json(
        { error: "Weather API unavailable" },
        { status: 502 }
      );
    }

    const xml = await response.text();
    const forecasts = parseWeatherXml(xml, tmdProvince);

    if (forecasts.length === 0) {
      console.error(`No forecast found for province: ${tmdProvince}`);
      return NextResponse.json(
        { error: `No forecast data for ${tmdProvince}` },
        { status: 404 }
      );
    }

    const today = forecasts[0];

    return NextResponse.json({
      province,
      today: {
        date: today.date,
        maxTemp: today.maxTemp,
        minTemp: today.minTemp,
        rainPercent: today.rainPercent,
        descTh: today.descTh,
        descEn: today.descEn,
      },
      forecasts,
    });
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather" },
      { status: 500 }
    );
  }
}
