import { timeZone } from "@/const/constVal";
import { prisma } from "@/db/prisma";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";


export async function POST(request: NextRequest) {
    try {

        const { name, email, ticketId, comment } = await request.json();

        const technician = await prisma.technician.findUnique({
            where: {
                email: email,
                name: name
            }
        });

        if (!technician) {
            return NextResponse.json({ message: "Technician not found. Kindly login again." }, { status: 404 });
        }

        const createdComment = await prisma.comment.create({
            data: {
                ticketId: ticketId,
                message: comment,
                authorTechId: technician.id,
                createdAt: new Date()
            }
        });

        const updatedTicket = await prisma.ticket.update({
            where: {
                id: ticketId
            },
            data: {
                technicianId: technician.id,
                updatedAt: new Date()
            }
        });

        const user = await prisma.user.findUnique({
            where: {
                id: updatedTicket.userId as number
            }
        });

        if (createdComment && updatedTicket && user) {

            const transport = nodemailer.createTransport({
                service: 'gmail',
                secure: true,
                port: 465,
                auth: {
                    user: process.env.EMAIL_ID,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            const zonedDate = toZonedTime(updatedTicket.updatedAt, timeZone);

            const formattedDate = format(zonedDate, "EEEE, MMMM dd, yyyy");

            const mailOptions = {
                from: process.env.EMAIL_ID,
                to: user.email,
                subject: `New Comment on Ticket: ${updatedTicket.title}`,
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
    .comment-box {
      background-color: #fff9c4;
      padding: 10px;
      border-left: 4px solid #fbc02d;
      margin-top: 10px;
      white-space: pre-wrap;
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
    <h2>New Comment Added to Your Ticket</h2>
    <p>Dear User,</p>
    <p>A new comment has been added to your ticket by <strong>${technician.name}</strong>.</p>

    <div class="details">
      <p><strong>Ticket ID:</strong> ${updatedTicket.id}</p>
      <p><strong>Title:</strong> ${updatedTicket.title}</p>
      <p><strong>Updated On:</strong> ${formattedDate}</p>
      <p><strong>Comment:</strong></p>
      <div class="comment-box">${createdComment.message}</div>
    </div>

    <p>If you have any questions or concerns, please reply to this email or contact us at <a href="tel:+919130759132">+91-9130759132</a>.</p>

    <p>Thank you for using <strong>IT-Desk</strong>. We're always here to help.</p>

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
            return NextResponse.json({ message: "Added somment successfully and sent email to corresponding user!" }, { status: 201 });
        } else {
            return NextResponse.json({ message: "Some error creating comment" }, { status: 401 });
        }

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: error }, { status: 500 });
    }
}