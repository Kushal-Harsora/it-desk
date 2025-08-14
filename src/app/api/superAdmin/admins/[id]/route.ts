import { NextResponse } from "next/server";
import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET(req:Request, context: { params:Promise<{id:string}> }) {

    const {id} = await context.params;
    try {

        const admins = await prisma.admin.findMany({
            where:{id:parseInt(id)},
            select:{id:true, name:true, email:true}
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

export async function PUT(req:Request, context:{params:Promise<{id:string}>}) {
    const { id } = await context.params;
  const body = await req.json();
  const { name, email, password } = body;

  try {
    const dataToUpdate: any = {};

    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });

    // Remove password before sending response
    const { password: _, ...safeAdmin } = updatedAdmin;

    return NextResponse.json(safeAdmin, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }

}

export async function DELETE(req:Request, context:{params:Promise<{id:string}>}) {
    const {id} = await context.params

    try {
        const admins = await prisma.admin.delete({
            where:{id:parseInt(id)},
        })
        
        return NextResponse.json({message:"Admin deleted successfully 🍾"}, {status:200})
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}