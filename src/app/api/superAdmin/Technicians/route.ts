import { NextResponse } from "next/server";
import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient()
export async function POST(req:Request){

    try {   
        
        const body = await req.json();

        const {name,
            email,
    password} = body as{
      name?:string,
      email?:string,
      password?:string  
    } 

    if(!name || !email || !password){
        return NextResponse.json({error:"Missing details of technician!!"}, {status:401})
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const hashedPass = await bcrypt.hash(password, 10);
    const technician = await prisma.technician.create(
        {
            data:{name, email, password:hashedPass}
        }
    )

    const { password: _p, ...safeTechnician } = technician as any;

    
    return NextResponse.json({ technician: safeTechnician }, { status: 201 });


} catch (err:any) {
    console.error("Create technician error:", err);

    // handle unique constraint (duplicate email)
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
}

export async function GET(req:Request) {
        let where: any = {};

    try {
        const technicians = await prisma.technician.findMany({
            where,
            orderBy: { createdAt: "desc" },
        })
        if(!technicians){
            return NextResponse.json({error:"No technicians are present!!"},{status:401})
        }
        return NextResponse.json(technicians, {status:200})

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    
}
