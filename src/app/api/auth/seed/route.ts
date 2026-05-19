import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        // Warning: This route is for development purposes only.
        if (process.env.NODE_ENV === "production") {
            return NextResponse.json({ error: "Forbidden in production" }, { status: 403 });
        }

        const password = "admin";
        const hashedPassword = await bcrypt.hash(password, 10);
        const email = "admin@northwind.com";

        // Let's make Employee 1 an Admin
        const employee = await prisma.employees.upsert({
            where: { EmployeeID: 1 },
            update: {
                Email: email,
                PasswordHash: hashedPassword,
                Role: "admin",
            },
            create: {
                LastName: "Admin",
                FirstName: "System",
                Email: email,
                PasswordHash: hashedPassword,
                Role: "admin"
            }
        });

        // Let's make Employee 2 a User
        const userPassword = await bcrypt.hash("user", 10);
        await prisma.employees.upsert({
            where: { EmployeeID: 2 },
            update: {
                Email: "user@northwind.com",
                PasswordHash: userPassword,
                Role: "user",
            },
            create: {
                LastName: "User",
                FirstName: "Standard",
                Email: "user@northwind.com",
                PasswordHash: userPassword,
                Role: "user"
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: "Seeded admin and user accounts", 
            admin: "admin@northwind.com / admin",
            user: "user@northwind.com / user"
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
    }
}
