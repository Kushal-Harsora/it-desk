import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { v4 as uuid } from 'uuid';
import { prisma } from '@/server/prisma';
import { parseForm } from '@/utils/parseForm';
import { promises as fs, stat } from 'fs';
import { success } from 'zod';
import { RedirectType } from 'next/navigation';
import next from 'next';

// app/api/tickets/[id]/route.ts




export const config = {
  api: {
    bodyParser: false,
  },
};

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  console.log("Inside the delete!!")
  const ticketId = parseInt(params.id);

  if (!ticketId || isNaN(ticketId) || ticketId <= 0) {
    return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
  }
  const existing = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!existing) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  try {
    const deleted = await prisma.ticket.delete({
      where: { id: ticketId }
    });

    return NextResponse.json(
      { success: `Ticket deleted successfully with ID = ${ticketId}` },
      { status: 200 }
    );
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Ticket not found or something went wrong." },
      { status: 500 }
    );
  }
}


export async function PUT(req: Request, context: { params: { id: string } }) {
  const { id } = context.params; 
  const ticketId = parseInt(id);

  if (!ticketId || isNaN(ticketId) || ticketId <= 0) {
    return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
  }

  const existing = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!existing) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }
  

  try {
    const body = await req.json();

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: body,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: "Something went wrong!" }, { status: 500 });
  }
}