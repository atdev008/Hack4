import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: list friends + pending requests
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  try {
    const [friendsA, friendsB, pendingReceived, pendingSent] = await Promise.all([
      prisma.friendship.findMany({
        where: { userAId: userId },
        include: { userB: { select: { id: true, name: true, email: true, avatar: true, lat: true, lng: true, lastSeen: true } } },
      }),
      prisma.friendship.findMany({
        where: { userBId: userId },
        include: { userA: { select: { id: true, name: true, email: true, avatar: true, lat: true, lng: true, lastSeen: true } } },
      }),
      prisma.friendRequest.findMany({
        where: { toUserId: userId, status: "pending" },
        include: { fromUser: { select: { id: true, name: true, avatar: true } } },
      }),
      prisma.friendRequest.findMany({
        where: { fromUserId: userId, status: "pending" },
        include: { toUser: { select: { id: true, name: true, avatar: true } } },
      }),
    ]);

    const friends = [
      ...friendsA.map((f: typeof friendsA[number]) => f.userB),
      ...friendsB.map((f: typeof friendsB[number]) => f.userA),
    ];

    return NextResponse.json({ friends, pendingReceived, pendingSent });
  } catch (error) {
    console.error("Friends error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// POST: send friend request or accept
export async function POST(request: NextRequest) {
  try {
    const { action, fromUserId, toUserId, requestId } = await request.json();

    if (action === "request") {
      if (!fromUserId || !toUserId) return NextResponse.json({ error: "Missing IDs" }, { status: 400 });
      if (fromUserId === toUserId) return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });

      // Check if already friends
      const existing = await prisma.friendship.findFirst({
        where: { OR: [{ userAId: fromUserId, userBId: toUserId }, { userAId: toUserId, userBId: fromUserId }] },
      });
      if (existing) return NextResponse.json({ error: "Already friends" }, { status: 409 });

      // Check existing request
      const existingReq = await prisma.friendRequest.findFirst({
        where: { OR: [{ fromUserId, toUserId }, { fromUserId: toUserId, toUserId: fromUserId }] },
      });
      if (existingReq) {
        if (existingReq.status === "pending" && existingReq.fromUserId === toUserId) {
          // They already sent us a request — auto accept
          await prisma.friendship.create({ data: { userAId: fromUserId, userBId: toUserId } });
          await prisma.friendRequest.update({ where: { id: existingReq.id }, data: { status: "accepted" } });
          return NextResponse.json({ status: "accepted" });
        }
        return NextResponse.json({ error: "Request already sent" }, { status: 409 });
      }

      await prisma.friendRequest.create({ data: { fromUserId, toUserId } });
      return NextResponse.json({ status: "sent" });
    }

    if (action === "accept") {
      if (!requestId) return NextResponse.json({ error: "requestId required" }, { status: 400 });
      const req = await prisma.friendRequest.findUnique({ where: { id: requestId } });
      if (!req || req.status !== "pending") return NextResponse.json({ error: "Invalid request" }, { status: 404 });

      await prisma.friendship.create({ data: { userAId: req.fromUserId, userBId: req.toUserId } });
      await prisma.friendRequest.update({ where: { id: requestId }, data: { status: "accepted" } });
      return NextResponse.json({ status: "accepted" });
    }

    if (action === "reject") {
      if (!requestId) return NextResponse.json({ error: "requestId required" }, { status: 400 });
      await prisma.friendRequest.update({ where: { id: requestId }, data: { status: "rejected" } });
      return NextResponse.json({ status: "rejected" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Friend action error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
