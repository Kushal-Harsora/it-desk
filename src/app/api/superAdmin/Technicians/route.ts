import { NextResponse } from "next/server";
import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient()
export async function POST(req:Request){

    try {   
        
        const body = await req.json();

        const {superAdminEmail,
            superAdminPassword,
            name,
            email,
    password} = body as{
        
      superAdminEmail?:string,
      superAdminPassword?:string,
      name?:string,
      email?:string,
      password?:string  
    } 

    if(!superAdminEmail || !superAdminPassword){
        return NextResponse.json({error:"Invalid admin credentials!!"}, {status:401})
    }

    if(!name || !email || !password){
        return NextResponse.json({error:"Missing details of technician!!"}, {status:401})
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be >= 6 chars" }, { status: 400 });
    }

    const superAdmin = await prisma.superadmin.findUnique(
        {
            where:{email:superAdminEmail}
        }
    )
    if(!superAdmin){
        return NextResponse.json({error:`No super-admin is present with email ${superAdminEmail}`},
            {status:400}
        )
    }
    const ok = await bcrypt.compare(superAdminPassword,superAdmin.password);
    if(!ok){
        return NextResponse.json({error:"Wrong super-admin credentials!!"},
            {status:400}
        )
    }

    const hashedPass = await bcrypt.hash(password, 10);
    const technician = await prisma.technician.create(
        {
            data:{name, email, password:hashedPass}
        }
    )

    const { password: _p, ...safeTechnician } = technician as any;

    
    return NextResponse.json({ admin: safeTechnician }, { status: 201 });


} catch (err:any) {
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
        const technicians = await prisma.technician.findMany({
            select:{id:true,name:true, email:true}
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
