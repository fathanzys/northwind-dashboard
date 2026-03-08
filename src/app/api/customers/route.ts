import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const sortBy = searchParams.get("sortBy") || "CompanyName";
        const sortOrder = (searchParams.get("sortOrder") || "asc") as "asc" | "desc";

        const where = search
            ? {
                OR: [
                    { CompanyName: { contains: search, mode: "insensitive" as const } },
                    { Country: { contains: search, mode: "insensitive" as const } },
                    { ContactName: { contains: search, mode: "insensitive" as const } },
                ],
            }
            : {};

        const [customers, total] = await Promise.all([
            prisma.customers.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            }),
            prisma.customers.count({ where }),
        ]);

        return NextResponse.json({
            data: customers,
            meta: { total, page, limit },
        });
    } catch (error) {
        console.error("Customers GET error:", error);
        return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { CustomerID, CompanyName, ContactName, ContactTitle, Address, City, Region, PostalCode, Country, Phone, Fax } = body;

        if (!CustomerID || !CompanyName) {
            return NextResponse.json({ error: "CustomerID and CompanyName are required" }, { status: 400 });
        }

        if (CustomerID.length > 5) {
            return NextResponse.json({ error: "CustomerID must be 5 characters or less" }, { status: 400 });
        }

        const existing = await prisma.customers.findUnique({ where: { CustomerID } });
        if (existing) {
            return NextResponse.json({ error: "CustomerID already exists" }, { status: 409 });
        }

        const customer = await prisma.customers.create({
            data: { CustomerID: CustomerID.toUpperCase(), CompanyName, ContactName, ContactTitle, Address, City, Region, PostalCode, Country, Phone, Fax },
        });

        return NextResponse.json({ data: customer }, { status: 201 });
    } catch (error) {
        console.error("Customers POST error:", error);
        return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
    }
}
