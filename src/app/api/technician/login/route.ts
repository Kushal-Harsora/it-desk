import { NextResponse } from "next/server";
import { prisma } from '../../../../db/prisma';
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const technician = await prisma.technician.findUnique({
      where: { email },
    });

    if (!technician) {
      return NextResponse.json({ message: "Technician does not exist" }, { status: 401 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, technician.password);

    if (!isPasswordCorrect) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({
      message: "Login successful!",
      name: technician.name,
      email: technician.email,
      id: technician.id,
    }, { status: 200 });

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
