import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Find users nearby (within radius km)
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const lat = parseFloat(request.nextUrl.searchParams.get("lat") || "0");
  const lng = parseFloat(request.nextUrl.searchParams.get("lng") || "0");
  const radiusKm = parseFloat(request.nextUrl.searchParams.get("radius") || "2");

  if (!userId || !lat || !lng) {
    return NextResponse.json({ error: "userId, lat, lng required" }, { status: 400 });
  }

  try {
    // Update my location
    await prisma.user.update({
      where: { id: userId },
      data: { lat, lng, lastSeen: new Date() },
    });

    // Find nearby users (Haversine in SQL)
    const nearby = await prisma.$queryRaw<Array<{
      id: string; name: string; avatar: string | null; distance_km: number; last_seen: Date;
    }>>`
      SELECT id, name, avatar, "lastSeen" as last_seen,
        (6371 * acos(
          cos(radians(${lat})) * cos(radians(lat)) *
          cos(radians(lng) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(lat))
        )) AS distance_km
      FROM "User"
      WHERE id != ${userId}
        AND lat IS NOT NULL AND lng IS NOT NULL
        AND "lastSeen" > NOW() - INTERVAL '24 hours'
      HAVING (6371 * acos(
          cos(radians(${lat})) * cos(radians(lat)) *
          cos(radians(lng) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(lat))
        )) < ${radiusKm}
      ORDER BY distance_km
      LIMIT 20
    `;

    return NextResponse.json(nearby);
  } catch (error) {
    console.error("Nearby error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
