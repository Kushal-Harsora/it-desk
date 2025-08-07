import { NextRequest, NextResponse } from 'next/server';
// import { writeFile } from 'fs';
// import path from 'path';
import { v4 as uuid } from 'uuid';
import { prisma } from '@/db/prisma';
import { Priority } from '@prisma/client';
import { parseForm } from '@/utils/parseForm';
import fs from 'fs';
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

    const technician = await prisma.technician.findUnique({
      where: {
        email: email,
        name: name
      }
    });

    if(!technician) {
      return NextResponse.json({ error: "Technician not found. Kindly Login Again." }, { status: 404 });
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

      fileName = s3Key; // So you can save it in DB if needed
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
        technicianId: technician.id
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
  try {
    const { searchParams } = new URL(req.url);

    const name = searchParams.get('name');
    const email = searchParams.get('email');

    if (!name || !email) {
      return NextResponse.json({ error: "Necessary Field entires not found." }, { status: 401 });
    }

    const start = searchParams.get('start');
    const end = searchParams.get('end');

    const technician = await prisma.technician.findUnique({
      where: {
        name: name,
        email: email
      }
    });

    if (!technician) {
      return NextResponse.json({ error: "Technician not found. Kindly Login Again." }, { status: 404 });
    }

    let where = {};

    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      where = {
        technicianId: technician.id,
        createdAt: {
          gte: toZonedTime(startDate, timeZone),
          lte: toZonedTime(endDate, timeZone),
        },
      };
    }

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        comments: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    return NextResponse.json({ tickets }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json({ error: "Internal Server Error.", errorMessage: error instanceof Error ? error.message : error }, { status: 500 });
  }
}








// export async function DELETE(req: Request, { params }: { params: { id: string } }) {
//   console.log("Inside the delete!!")
//   const ticketId = parseInt(params.id);

//   try {
//     // const deleted = await prisma.ticket.delete({
//     //   where: { id: ticketId }
//     // });

//     return NextResponse.json(
//       { success: `Ticket deleted successfully with ID = ${ticketId}` },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.log(error)
//     return NextResponse.json(
//       { error: "Ticket not found or something went wrong." },
//       { status: 500 }
//     );
//   }
// }
