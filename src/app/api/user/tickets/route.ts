import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import jwt from "jsonwebtoken";
import { Priority } from '@prisma/client';
import { parseForm } from '@/utils/parseForm';
import fs from 'fs';
import { v4 as uuid } from 'uuid';

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { toZonedTime } from 'date-fns-tz';
import { timeZone } from '@/const/constVal';
export const config = {
  api: {
    bodyParser: false,
  },
};

const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});



export async function POST(req: NextRequest) {
  try {
    const { fields, files } = await parseForm(req);

    const title = fields.title?.[0] || '';
    const description = fields.description?.[0] || '';
    const priority = fields.priority?.[0] || '';
    const name = fields.name?.[0];
    const email = fields.email?.[0];

    if (!description || !priority || !title || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email,
        name: name
      }
    });

    if(!user) {
      return NextResponse.json({ error: "User not found. Kindly Login Again." }, { status: 404 });
    }

    let fileName = '';
    console.log("Parsed files:", files);

    if (files && files.attachment?.[0]) {
      const file = files.attachment[0];

      const uniqueFileName = `${uuid()}-${title}-${file.originalFilename}`;
      const s3Key = `${uniqueFileName}-${Date.now()}`;

      console.log("Uploading to S3:", s3Key);

      const stream = fs.createReadStream(file.filepath);

      await s3.send(new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: s3Key,
        Body: stream,
        ContentType: file.mimetype ?? 'application/octet-stream',
      }));

      fileName = s3Key; 
      console.log("Upload complete");
    }



    const ticket = await prisma.ticket.create({
      data: {
        description,
        priority: Priority[priority.toUpperCase() as keyof typeof Priority] || Priority.LOW,
        title,
        attachment: fileName,
        createdAt: toZonedTime(new Date(), timeZone),
        updatedAt: toZonedTime(new Date(), timeZone),
        userId: user.id
      },
    });

    if (ticket) {
      return NextResponse.json({
        message: "Ticket created successfully"
      }, {
        status: 201
      });
    } else {
      return NextResponse.json({
        error: 'Failed to create ticket'
      }, {
        status: 500
      });
    }


  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  console.log("Inside of get req!!!!!!!!!!!!!!")
  try {
    // Read JWT token from cookie
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token & check role
    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    // if (payload.role !== "User") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    // Parse query params for optional date filtering
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    let where: any = {};

    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }
    let user = {}
    // Fetch ALL tickets (only superadmin can see all)
    const tickets = await prisma.ticket.findMany({
      where: {
        user: {email:payload.email},
        ...where
      },
      orderBy: { createdAt: "desc" },
      include: {
        comments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Return tickets
    return NextResponse.json({ tickets }, { status: 200 });

  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        errorMessage: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
