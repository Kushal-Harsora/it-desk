import { prisma } from "@/db/prisma";
import { error } from "console";
import { NextApiRequest,NextApiResponse } from "next";
import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";


// API for creating Super Admin!!!!!!

export async function POST(req:Request){

    try {   
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
        return NextResponse.json({ error: "Missing required fields!!" }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const superadmin = await prisma.superadmin.create({
        data: { name, email, password: hashedPassword },
    });

    return NextResponse.json(superadmin, { status: 201 });

} catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}


}

export async function GET() {
    
    try {
        const superAdmins = await prisma.superadmin.findMany();
        return NextResponse.json(superAdmins)

    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "Failed to fetch super admins" }, { status: 500 })
    }

}