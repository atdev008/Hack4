import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, password, provider } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // OAuth login — find or create user
    if (provider && provider !== "email") {
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: email.split("@")[0],
            email,
            provider,
            qrCode: `moodquest://user/${Date.now()}`,
          },
        });
      }
      return NextResponse.json({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        provider: user.provider,
      });
    }

    // Email login
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.passwordHash !== password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Update last seen
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeen: new Date() },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      provider: user.provider,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
