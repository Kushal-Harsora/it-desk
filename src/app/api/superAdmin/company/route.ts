import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server"

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { name, subdomain }: { name: string, subdomain: string } = body;
        if (!name || !subdomain) {
            return NextResponse.json({ error: "Missing fields!!" }, { status: 400 })
        }

        const newName: string = name.replace(/\s+/g, '');
        let newCode: string = "";
        if (newName.length > 3) {
            newCode = `${newName.substring(0, 3).toUpperCase()}`;
        } else {
            newCode = newName;
        }
    
        const company = await prisma.company.create({
            data: {
                name,
                subdomain,
                code: newCode
            },
        })
        return NextResponse.json(company, { status: 201 })
    } catch (error) {
        console.log("Some error ocurred while adding a new company!!", error)
        return NextResponse.json({ error: "Error at company POST!!" }, { status: 500 })
    }

}

export async function GET() {
    try {
        const companies = await prisma.company.findMany({
            select: {
                id: true,
                name: true,
                subdomain: true,
                code: true,
                createdAt: true,
                _count: {
                    select: {
                        users: true,
                        tickets: true
                    }
                }
            }
        });
        const formattedCompanies = companies.map((company) => ({
            id: company.id,
            name: company.name,
            subdomain: company.subdomain,
            createdAt: company.createdAt,
            users: company._count.users,
            tickets: company._count.tickets,
        }));

        return NextResponse.json(formattedCompanies, { status: 200 })

    } catch (error) {
        console.log("Error occured while fetching the company data!!", error)
        return NextResponse.json({ error: "Error at Company GET!" }, { status: 400 })
    }

}