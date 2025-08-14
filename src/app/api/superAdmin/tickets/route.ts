import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import jwt from "jsonwebtoken";

const timeZone = "Asia/Kolkata"; // Change if needed

export async function GET(req: NextRequest) {
  try {
    // Read JWT token from cookie
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token & check role
    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (payload.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse query params for optional date filtering
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    let where: any = {};

    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Fetch ALL tickets (only superadmin can see all)
    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        comments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Return tickets
    return NextResponse.json({ tickets }, { status: 200 });

  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        errorMessage: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
