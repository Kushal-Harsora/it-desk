import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/db/prisma"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        const user = await prisma.admin.findUnique({
            where: {
                email: email
            }
        });

        if (!user) {
            return NextResponse.json({
                message: "User not found"
            }, {
                status: 404
            })
        }

        if (user) {
            const validatePassword = await bcrypt.compare(password, user.password);
            if (!validatePassword) {
                return NextResponse.json({
                    error: "Invalid Password"
                }, {
                    status: 401
                })
            } else {

                const token = jwt.sign({
                    email: user.email,
                    name: user.name,
                }, process.env.JWT_SECRET as string, {
                    expiresIn: '1d'
                });



                const response = NextResponse.json({
                    message: "Success",
                    name: user.name,
                    email: user.email
                }, {
                    status: 200
                });

                response.cookies.set({
                    name: 'token',
                    value: token,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 1,
                });

                return response;
            }
        }

    } catch (error) {
        console.error("Error: ", error instanceof Error ? error.message : "Unknown error");
        return NextResponse.json({
            message: error instanceof Error ? error.message : "Unknown error"
        }, {
            status: 500
        })
    }
}


// Only for Development Purpose
export async function PUT(request: NextRequest) {
    const { name, email, password } = await request.json();

    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.admin.create({
            data: {
                email: email,
                name: name,
                createdAt: new Date(),
                password: hashedPassword
            }
        })

        if (user) {
            return NextResponse.json({
                message: "User Created"
            }, {
                status: 201
            })
        }

        return NextResponse.json({
            message: "User Creation Failed",
        }, {
            status: 500
        });

    } catch (error) {
        console.error("Error: ", error instanceof Error ? error.message : "Unknown error");
        return NextResponse.json({
            message: error instanceof Error ? error.message : "Unknown error"
        }, {
            status: 500
        })
    }
}