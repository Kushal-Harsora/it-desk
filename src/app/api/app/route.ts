// Main API logic for the app goes here...
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { prisma } from '../../../db/prisma'
import { IncomingForm } from 'formidable';
import { parseForm } from '@/utils/parseForm';
import { promises as fs } from 'fs';


export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const { fields, files } = await parseForm(req);

  const { description, priority } = fields;
  const attachmentFile = files.attachment?.[0];

  let attachmentUrl = null;

  if (attachmentFile) {
  const fileName = `${uuid()}_${attachmentFile.originalFilename}`;
  const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

  const fileData = await fs.readFile(attachmentFile.filepath); // read buffer
  await writeFile(filePath, fileData); // write buffer to disk

  attachmentUrl = `/uploads/${fileName}`;
}
  const ticket = await prisma.ticket.create({
    data: {
      description,
      priority,
      attachment: attachmentUrl,
    },
  });

  // TODO: trigger email here using Nodemailer

  return NextResponse.json(ticket, { status: 201 });
}

export async function GET() {
  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(tickets);
}
