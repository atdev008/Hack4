import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Save trip
export async function POST(request: NextRequest) {
  try {
    const { userId, trip, missions } = await request.json();
    if (!userId || !trip) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const saved = await prisma.trip.create({
      data: {
        userId,
        title: trip.trip_title || "Untitled",
        shortDescription: trip.short_description,
        mood: trip.mood || "",
        province: trip.province || "",
        estimatedBudget: trip.estimated_budget,
        tirednessLevel: trip.tiredness_level,
        badgeReward: trip.badge_reward,
        badgeEmoji: trip.badge_emoji,
        travelMemory: trip.travel_memory_preview,
        status: missions?.every((m: { completed: boolean }) => m.completed) ? "completed" : "active",
        tripData: trip,
        missionsData: missions || [],
      },
    });

    // Create badge if trip completed
    if (trip.badge_reward && missions?.every((m: { completed: boolean }) => m.completed)) {
      await prisma.userBadge.upsert({
        where: { userId_name: { userId, name: trip.badge_reward } },
        create: { userId, tripId: saved.id, name: trip.badge_reward, emoji: trip.badge_emoji },
        update: {},
      });
    }

    return NextResponse.json({ id: saved.id });
  } catch (error) {
    console.error("Save trip error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

// Get user's trips
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  try {
    const trips = await prisma.trip.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(trips);
  } catch (error) {
    console.error("Get trips error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
