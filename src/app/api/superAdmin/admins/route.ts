import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {

    const body = await req.json()
    const {
      name,
      email,
      password,
    } = body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing admin fields!" }, { status: 400 })
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
 

    // create new Admin


    const hashedPass = await bcrypt.hash(password, 10)

    const newAdmin = await prisma.admin.create({
      data: { name, email, password: hashedPass, createdAt: new Date() }
    })

    // don't return password in response
    const { password: _p, ...safeAdmin } = newAdmin as any;
    return NextResponse.json({ admin: safeAdmin }, { status: 201 });
  } catch (err: any) {
    console.error("Create admin error:", err);

    // handle unique constraint (duplicate email)
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
if (err.response) {
    console.error('Server error message:', err.response.data);
  } 
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
    let where: any = {};



    const admins = await prisma.admin.findMany({
      where,
      orderBy: { createdAt: "desc" },
      
    })
    if (!admins) {
      return NextResponse.json({ error: "No admins are present!!" }, { status: 401 })
    }

        // console.log("Fetched admins:", admins);

    return NextResponse.json(admins, { status: 200 })

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

}