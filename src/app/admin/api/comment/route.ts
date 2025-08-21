import { prisma } from "@/db/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    try {

        const { name, email, ticketId, comment } = await request.json();

        const admin = await prisma.admin.findUnique({
            where: {
                email: email,
                name: name
            }
        });

        console.log(admin);

        if (!admin) {
            return NextResponse.json({ message: "Admin not found. Kindly login again." }, { status: 404 });
        }

        const createdComment = await prisma.comment.create({
            data: {
                ticketId: ticketId,
                message: comment,
                authorId: admin.id,
                createdAt: new Date()
            }
        });

        if (!createdComment) {
            return NextResponse.json({ message: "Some error creating comment" }, { status: 401 });
        } else {
            return NextResponse.json({ message: "Added Comment Successfully" }, { status: 201 });
        }

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: error }, { status: 500 });
    }
}