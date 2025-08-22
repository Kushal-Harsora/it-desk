import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Priority } from '@prisma/client';
import { parseForm } from '@/utils/parseForm';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import nodemailer from "nodemailer";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { toZonedTime } from 'date-fns-tz';
import { timeZone } from '@/const/constVal';
import { format } from "date-fns";
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

    if (!user) {
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

      const transport = nodemailer.createTransport({
        service: 'gmail',
        secure: true,
        port: 465,
        auth: {
          user: process.env.EMAIL_ID,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      const zonedDate = toZonedTime(ticket.createdAt, timeZone);

      const formattedDate = format(zonedDate, "EEEE, MMMM dd, yyyy");

      const mailOptions = {
        from: process.env.EMAIL_ID,
        to: email,
        subject: `Ticket Confirmation for ${title}`,
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Montserrat', sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f9f9f9;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #fff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }
    h2 {
      color: #4CAF50;
      margin-bottom: 10px;
    }
    p {
      margin: 10px 0;
      line-height: 1.5;
    }
    .details {
      margin-top: 20px;
      background-color: #f1f1f1;
      padding: 15px;
      border-radius: 5px;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #666;
    }
    a {
      color: #4CAF50;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Ticket Confirmation</h2>
    <p>Dear <strong>${name}</strong>,</p>
    <p>Thank you for reaching out to <strong>IT-Desk</strong>.</p>
    <p>Your ticket has been successfully created and we're here to assist you.</p>

    <div class="details">
      <p><strong>Ticket ID:</strong> ${ticket.id}</p>
      <p><strong>Title:</strong> ${title}</p>
      <p><strong>Description:</strong><br /> ${description}</p>
      <p><strong>Priority:</strong> ${priority}</p>
      <p><strong>Scheduled Date:</strong> ${formattedDate}</p>
    </div>

    <p>If you have any questions or need to modify your appointment, feel free to contact us at <a href="tel:+919130759132">+91-9130759132</a> or reply to this email.</p>

    <p>We appreciate your trust and look forward to serving you.</p>

    <div class="footer">
      <p><strong>IT-Desk</strong><br />
      Email: <a href="mailto:itdesk.info@gmail.com">itdesk.info@gmail.com</a><br />
      Website: <a href="https://it-desk.vercel.app/" target="_blank">it-desk.vercel.app</a></p>
    </div>
  </div>
</body>
</html>`,

      }

      await transport.sendMail(mailOptions);

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
  try {
    // Read JWT token from cookie
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token & check role
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    if (typeof decoded !== "object" || decoded === null || !("email" in decoded)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const payload = decoded as JwtPayload;
    // if (payload.role !== "User") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    // Parse query params for optional date filtering
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const where: { createdAt?: { gte: Date, lte: Date } } = {};

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
    // Fetch ALL tickets (only superadmin can see all)
    const tickets = await prisma.ticket.findMany({
      where: {
        user: { email: payload.email },
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
