import { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from '@/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

const s3 = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Missing or invalid ticket ID' });
    return;
  }

  try {
    // Fetch ticket from database based on id
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(id) },
      select: { attachment: true },
    });

    if (!ticket || !ticket.attachment) {
      res.status(404).json({ error: 'No attachment found for this ticket' });
      return;
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: ticket.attachment,
    });

    const { Body, ContentType } = await s3.send(command);

    if (Body) {
      res.setHeader('Content-Type', ContentType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="attachment"`);

      // Pipe the file stream to response
      // @ts-ignore - Body is a readable stream
      Body.pipe(res);
    } else {
      res.status(404).send('File not found');
    }
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ error: 'Failed to fetch file' });
  }
}


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  // Fetch ticket from DB
  const ticket = await prisma.ticket.findUnique({
    where: { id: parseInt(id) },
    select: { attachment: true },
  });

  if (!ticket || !ticket.attachment) {
    return NextResponse.json({ error: 'No attachment found' }, { status: 404 });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: ticket.attachment,
    });

    const s3Object = await s3.send(command);

    if (!s3Object.Body) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Stream the data directly:
    return new NextResponse(s3Object.Body as any, {
      headers: {
        'Content-Type': s3Object.ContentType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${ticket.attachment}"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 });
  }
}