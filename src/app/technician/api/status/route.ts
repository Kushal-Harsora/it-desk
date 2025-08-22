import { prisma } from "@/db/prisma";
import { Status } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { timeZone } from "@/const/constVal";

export async function PUT(request: NextRequest) {
    try {

        const { name, email, ticketId, status } = await request.json() as { name: string, email: string, ticketId: number, status: string };

        const technician = await prisma.technician.findUnique({
            where: {
                email: email,
                name: name
            }
        });

        if (!technician) {
            return NextResponse.json({ message: "Technician not found. Kindly login again." }, { status: 404 });
        }

        const updateStatus = await prisma.ticket.update({
            where: {
                id: ticketId
            },
            data: {
                status: Status[status as keyof typeof Status],
                updatedAt: new Date(),
                technicianId: technician.id
            }
        });

        const user = await prisma.user.findUnique({
            where: {
                id: updateStatus.userId as number
            }
        });

        if (updateStatus && user) {

            const transport = nodemailer.createTransport({
                service: 'gmail',
                secure: true,
                port: 465,
                auth: {
                    user: process.env.EMAIL_ID,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            const zonedDate = toZonedTime(updateStatus.updatedAt, timeZone);

            const formattedDate = format(zonedDate, "EEEE, MMMM dd, yyyy");

            const mailOptions = {
                from: process.env.EMAIL_ID,
                to: user.email,
                subject: `Status Update for Ticket: ${updateStatus.title}`,
                html: `
<!DOCTYPE html>
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
    .status-box {
      background-color: #e0f2fe;
      padding: 10px;
      border-left: 4px solid #2196f3;
      margin-top: 10px;
      font-weight: bold;
      text-transform: uppercase;
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
    <h2>Ticket Status Updated</h2>
    <p>Dear <strong>${user.name || "User"}</strong>,</p>
    <p>Your ticket has been updated by <strong>${technician.name}</strong>.</p>

    <div class="details">
      <p><strong>Ticket ID:</strong> ${updateStatus.id}</p>
      <p><strong>Title:</strong> ${updateStatus.title}</p>
      <p><strong>Updated On:</strong> ${formattedDate}</p>
      <p><strong>New Status:</strong></p>
      <div class="status-box" style="color: ${updateStatus.status === 'OPEN' ? '#ef4444' :
                        updateStatus.status === 'IN_PROGRESS' ? '#eab308' :
                            updateStatus.status === 'RESOLVED' ? '#22c55e' :
                                updateStatus.status === 'CLOSED' ? '#3b82f6' :
                                    '#000'
                    };">
        ${updateStatus.status.replace('_', ' ')}
      </div>
    </div>

    <p>If you believe this status is incorrect or need further assistance, please reply to this email or contact our helpdesk at <a href="tel:+919130759132">+91-9130759132</a>.</p>

    <p>Thank you for using <strong>IT-Desk</strong>. We appreciate your patience and trust in our service.</p>

    <div class="footer">
      <p><strong>IT-Desk</strong><br />
      Email: <a href="mailto:itdesk.info@gmail.com">itdesk.info@gmail.com</a><br />
      Website: <a href="https://it-desk.vercel.app/" target="_blank">it-desk.vercel.app</a></p>
    </div>
  </div>
</body>
</html>
`,
            }

            await transport.sendMail(mailOptions);

            return NextResponse.json({ message: "Status updated successfully and sent email to corresponding user!" }, { status: 201 });
        } else {
            return NextResponse.json({ message: "Some error in updating status" }, { status: 401 });
        }

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: error }, { status: 500 });
    }
}