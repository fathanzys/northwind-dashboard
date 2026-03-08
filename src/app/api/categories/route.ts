import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const categories = await prisma.categories.findMany({ orderBy: { CategoryName: "asc" } });
        return NextResponse.json({ data: categories });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}
