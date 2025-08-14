import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.superadmin.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ message: "Superadmin not found" }, { status: 404 });
    }

    const validatePassword = await bcrypt.compare(password, user.password);
    if (!validatePassword) {
      return NextResponse.json({ error: "Invalid Password" }, { status: 401 });
    }

    const token = jwt.sign({
      email: user.email,
      name: user.name,
      role: 'superadmin'
    }, process.env.JWT_SECRET as string, {
      expiresIn: '1d'
    });

    const response = NextResponse.json({
      message: "Login Successful",
      name: user.name,
      email: user.email,
      role: 'superadmin'
    }, { status: 200 });

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 1,
    });

    return response;

  } catch (error) {
    console.error("Error: ", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
