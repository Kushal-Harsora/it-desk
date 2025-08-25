import { PrismaClient } from "@prisma/client";
import { error } from "console";
import { NextResponse } from "next/server"
import { string, success } from "zod";

const prisma = new PrismaClient();
export async function POST(req: Request) {

    try {
        const body = await req.json();

        const { name, subdomain } = body;
        if (!name || !subdomain) {
            return NextResponse.json({ error: "Missing fields!!" }, { status: 400 })
        }

        const lastCompany = await prisma.company.findFirst({
            orderBy: { createdAt: "desc" }
        })

        let newCode: string;
        if (lastCompany) {
            const lastNumeric = parseInt(lastCompany.code.split("-")[1])
            newCode = `${name.charAt(0).toUpperCase()}-${String(lastNumeric + 1).padStart(3, "0")}`;
        }
        else {
            newCode = `${name.charAt(0).toUpperCase()}-001`;
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
        return NextResponse.json({ error: "Error at company POST!!" }, { status: 400 })
    }

}

export async function GET(req: Request) {

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
            users: company._count.users,
            tickets: company._count.tickets,
        }));

        return NextResponse.json(formattedCompanies, { status: 200 })

    } catch (error) {
        console.log("Error occured while fetching the company data!!", error)
        return NextResponse.json({ error: "Error at Company GET!" }, { status: 400 })
    }

}