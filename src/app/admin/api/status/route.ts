import { prisma } from "@/db/prisma";
import { Status } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";


export async function PUT(request: NextRequest) {
    try {

        const { name, email, ticketId, status } = await request.json() as { name: string, email: string, ticketId: number, status: string };

        const admin = await prisma.technician.findUnique({
            where: {
                email: email,
                name: name
            }
        });

        if (!admin) {
            return NextResponse.json({ message: "Admin not found. Kindly login again." }, { status: 404 });
        }

        const updateStatus = await prisma.ticket.update({
            where: {
                id: ticketId
            }, 
            data: {
                status: Status[status as keyof typeof Status],
                updatedAt: new Date(),
                technicianId: admin.id
            }
        });

        if (!updateStatus) {
            return NextResponse.json({ message: "Some error in updating status" }, { status: 401 });
        } else {
            return NextResponse.json({ message: "Status Updated Successfully" }, { status: 201 });
        }

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: error }, { status: 500 });
    }
}