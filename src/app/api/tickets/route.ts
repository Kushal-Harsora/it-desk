import { NextRequest, NextResponse } from 'next/server';
// import { writeFile } from 'fs/promises';
// import path from 'path';
import { v4 as uuid } from 'uuid';
import { prisma } from '@/db/prisma';
import { Priority } from '@prisma/client';
import { parseForm } from '@/utils/parseForm';
// import { promises as fs, stat } from 'fs';
// import { success } from 'zod';



export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const { fields, files } = await parseForm(req);

    console.log("Fields:", fields);


    const title = fields.title?.[0] || '';
    const description = fields.description?.[0] || '';
    const priority = fields.priority?.[0] || '';

    if (!description || !priority || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let fileName = '';

    if (files && files.attachProof?.[0]) {
      const file = files.attachProof[0];
      fileName = `${uuid()}-${title}-${file.originalFilename}`

      //     await s3.send(new PutObjectCommand({
      //   Bucket: 'your-bucket-name',
      //   Key: newFileName,
      //   Body: fs.createReadStream(file.filepath),
      //   ContentType: file.mimetype,
      // }));
    }

    const ticket = await prisma.ticket.create({
      data: {
        description,
        priority: Priority[priority.toUpperCase() as keyof typeof Priority] || Priority.LOW,
        title,
        attachment: fileName,
        createdAt: new Date(),
        updatedAt: new Date()
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




import { subDays } from 'date-fns'
// route.ts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    console.log("Inside the get request!!!")
    let where = {};

    if (start && end) {
      where = {
        createdAt: {
          gte: new Date(start),
          lte: new Date(end),
        },
      };
    }

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });    return NextResponse.json({ tickets }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
