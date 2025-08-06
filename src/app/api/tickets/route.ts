import { NextRequest, NextResponse } from 'next/server';
// import { writeFile } from 'fs/promises';
// import path from 'path';
import { v4 as uuid } from 'uuid';
import { prisma } from '@/db/prisma';
import { Priority } from '@prisma/client';
import { parseForm } from '@/utils/parseForm';
import { toZonedTime } from 'date-fns-tz'
import { timeZone } from '@/const/constVal';
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
        createdAt: toZonedTime(new Date(), timeZone),
        updatedAt: toZonedTime(new Date(), timeZone)
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
export async function GET(req: NextRequest) {
  const filter = req.nextUrl.searchParams.get('filter')
  const now = new Date()



  let whereClause = {}

if (filter === 'weekly') {
  console.log("Weekly tickets !!!!!!!!!!!!!!")
  whereClause = {
    createdAt: {
      gte: subDays(now, 7),
      lte: now,
    },
  }
  console.log("After : -")
} else if (filter === 'monthly') {
  console.log("Monthly tickets !!!!!!!!!!!!!!")
  whereClause = {
    createdAt: {
      gte: subDays(now, 30),
      lte: now,
    },
  }

}
console.log("Now:", now.toISOString())
console.log("Filter:", filter)
console.log("Where Clause:", JSON.stringify(whereClause, null, 2))

  const tickets = await prisma.ticket.findMany({
    where: whereClause,
    orderBy: {
      createdAt: 'asc',
    },
    
  })
  console.log("All tickets !!!!!!!!!!!!!!")
  // console.log(tickets.map(t => t.createdAt))

  
  return NextResponse.json(tickets)
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
