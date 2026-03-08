import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";

        const where: Prisma.employeesWhereInput = {};
        if (search) {
            where.OR = [
                { FirstName: { contains: search, mode: "insensitive" } },
                { LastName: { contains: search, mode: "insensitive" } },
                { Title: { contains: search, mode: "insensitive" } },
            ];
        }

        const employees = await prisma.employees.findMany({ where, orderBy: { LastName: "asc" } });

        const serialized = employees.map((e) => ({
            ...e,
            BirthDate: e.BirthDate?.toISOString() ?? null,
            HireDate: e.HireDate?.toISOString() ?? null,
        }));

        return NextResponse.json({ data: serialized, meta: { total: serialized.length, page: 1, limit: 100 } });
    } catch {
        return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
    }
}
