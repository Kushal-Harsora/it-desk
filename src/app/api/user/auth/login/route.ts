import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { error } from "console";


export async function POST(req: Request) {

    try {

        const body = await req.json();
        const { email, password } = body
        const user = await prisma.user.findUnique({
            where: { email }
        })
        if (!email || !password) {
            return NextResponse.json({ error: "Missing fields !!" }, { status: 401 })
        }
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(email)) {
            return NextResponse.json({ error: "Invalid email" }, { status: 400 });
        }



        if (!user) {
            return NextResponse.json({ error: `No user exist with email= ${email}` }, { status: 401 })
        }

        const ok = await bcrypt.compare(password, user.password)

        if (!ok) {
            console.log(user.password," ",password)
            return NextResponse.json({ error: "Wrong password!!" }, { status: 401 })
        }

        const token = jwt.sign({
            email: user.email,
            name: user.name,
            role: user.role
        },
            process.env.JWT_SECRET as string,
            {
                expiresIn: "1d"
            }
        )
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
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 1,
        })

        return response;

    } catch (error) {
        console.error("Error: ", error instanceof Error ? error.message : "Unknown error");
        return NextResponse.json({
            message: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }

}