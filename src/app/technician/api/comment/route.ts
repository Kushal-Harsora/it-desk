import { prisma } from "@/db/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    try {

        const { name, email, ticketId, comment } = await request.json();

        const technician = await prisma.technician.findUnique({
            where: {
                email: email,
                name: name
            }
        });

        if (!technician) {
            return NextResponse.json({ message: "Technician not found. Kindly login again." }, { status: 404 });
        }

        const createdComment = await prisma.comment.create({
            data: {
                ticketId: ticketId,
                message: comment,
                authorTechId: technician.id,
                createdAt: new Date()
            }
        });

        const updatedTicket = await prisma.ticket.update({
            where: {
                id: ticketId
            }, 
            data: {
                technicianId: technician.id,
                updatedAt: new Date()
            }
        });

        if (createdComment && updatedTicket) {
            return NextResponse.json({ message: "Added Comment Successfully" }, { status: 201 });
        } else {
            return NextResponse.json({ message: "Some error creating comment" }, { status: 401 });
        }

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: error }, { status: 500 });
    }
}