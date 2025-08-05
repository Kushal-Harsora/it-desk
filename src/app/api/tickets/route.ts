import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { prisma } from '@/db/prisma';
import { parseForm } from '@/utils/parseForm';
import { promises as fs, stat } from 'fs';
import { success } from 'zod';


export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const { fields, files } = await parseForm(req);

    const description = fields.description?.[0] || '';
    const priority = fields.priority?.[0] || '';
    const category = fields.category?.[0] || '';
    // console.log({ description, priority, category });

    if (!description || !priority || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        description,
        priority,
        category,
      },
    });

    return NextResponse.json(ticket, { status: 201 });

  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}


export async function GET() {
  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(tickets, { status: 200 });
}




export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  console.log("Inside the delete!!")
  const ticketId = parseInt(params.id);

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
