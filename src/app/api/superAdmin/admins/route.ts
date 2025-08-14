import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "@prisma/client";
import { error } from "console";
import { AwardIcon } from "lucide-react";
import { email } from "zod";

const prisma = new PrismaClient();

export async function POST(req:Request) {
    try {
        
        const body = await req.json()
        const {
      superAdminEmail,
      superAdminPassword,
      name,
      email,
      password,
    } = body as {
      superAdminEmail?: string;
      superAdminPassword?: string;
      name?: string;
      email?: string;
      password?: string;
    };
        
    if(!superAdminEmail || !superAdminPassword){
        return NextResponse.json({ error: "Missing super-admin credentials" },
        { status: 401 })
    }

    if(!name || !email || !password){
        return NextResponse.json({error:"Missing admin fields!"},{status:400})
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be >= 6 chars" }, { status: 400 });
    }

    const superAdmin = await prisma.superadmin.findUnique({
        where: {email:superAdminEmail}
    })

    if(!superAdmin){
        return NextResponse.json({error:`No super admin present with email ${superAdminEmail}`},
            {status:401}
        )
    }

    const ok = await bcrypt.compare(superAdminPassword, superAdmin.password)
    if (!ok) {
      return NextResponse.json({ error: "Invalid super admin credentials" }, { status: 401 });
    }
    // create new Admin
    
     
    const hashedPass = await bcrypt.hash(password,10)

    const newAdmin = await prisma.admin.create({
        data:{name, email, password:hashedPass}
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

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req:Request) {

    try {
        
        const admins = await prisma.admin.findMany({
            select:{id:true,name:true, email:true}
        })
        if(!admins){
            return NextResponse.json({error:"No admins are present!!"},{status:401})
        }
        return NextResponse.json(admins, {status:200})

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    
}