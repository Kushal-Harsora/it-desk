import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import prisma from "@/db/prisma";
import { size, string } from "zod";
import { error } from "console";


// API for creating User!!!!!!

export async function POST(req: Request) {

    try {
        const body = await req.json();
        const { name, email, password, number } = body;

        if (!name || !email || !password || !number) {
            return NextResponse.json({ error: "Missing user fields!" }, { status: 400 })
        }

        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(email)) {
            return NextResponse.json({ error: "Invalid email" }, { status: 400 });
        }
          const regex = /^[0-9]{10}$/;
  
        if(!regex.test(number)){
            return NextResponse.json({error:"Invalid phone number!!"}, {status:400})
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, phoneNumber:number},
        });

        return NextResponse.json(user, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }


}

export async function GET() {

    try {
        const users = await prisma.user.findMany();
        return NextResponse.json(users)

    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "Failed to fetch users!!" }, { status: 500 })
    }

}