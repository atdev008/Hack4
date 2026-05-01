import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Search user by ID or name
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  const userId = request.nextUrl.searchParams.get("userId") || "";

  if (!q || q.length < 2) return NextResponse.json([]);

  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } },
          { OR: [
            { id: { contains: q } },
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ]},
        ],
      },
      select: { id: true, name: true, avatar: true },
      take: 10,
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json([]);
  }
}
