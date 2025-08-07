import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { prisma } from '@/db/prisma';
import fetch from 'node-fetch';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function GET(req: NextRequest, context: { params: { id: string } }) {
    const { id } = context.params;

    const ticketId = parseInt(id);
    if (isNaN(ticketId)) {
        return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
    }

    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
        });

        if (!ticket || !ticket.attachment) {
            return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
        }

        const s3 = new S3Client({ region: "ap-south-1" });
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: `ticket-${ticketId}.pdf`,
            ResponseContentDisposition: "attachment; filename=ticket-${ticketId}.pdf", // 👈 this triggers download

        });

        const url = await getSignedUrl(s3, command, { expiresIn: 60 }); // expires in 60 seconds

        return NextResponse.json({ url });
    } catch (error) {
        console.error("Error generating signed URL:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
