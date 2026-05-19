import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { setSession } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        const employee = await prisma.employees.findUnique({
            where: { Email: email },
        });

        if (!employee || !employee.PasswordHash) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        const isValidPassword = await bcrypt.compare(password, employee.PasswordHash);

        if (!isValidPassword) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Set session
        await setSession({
            id: employee.EmployeeID,
            email: employee.Email!,
            role: employee.Role,
            name: `${employee.FirstName} ${employee.LastName}`
        });

        return NextResponse.json(
            { 
                success: true, 
                message: "Logged in successfully",
                user: {
                    id: employee.EmployeeID,
                    email: employee.Email,
                    role: employee.Role,
                    name: `${employee.FirstName} ${employee.LastName}`
                }
            },
            { status: 200 }
        );

    } catch (error: any) {
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}
