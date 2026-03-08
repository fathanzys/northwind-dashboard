import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const salesByCategory = await prisma.$queryRaw<{ name: string; value: number }[]>`
      SELECT 
        c."CategoryName" as name,
        COALESCE(SUM(od."UnitPrice" * od."Quantity" * (1 - od."Discount")), 0)::float as value
      FROM "Categories" c
      LEFT JOIN "Products" p ON c."CategoryID" = p."CategoryID"
      LEFT JOIN "OrderDetails" od ON p."ProductID" = od."ProductID"
      GROUP BY c."CategoryName"
      ORDER BY value DESC
    `;
        return NextResponse.json({ data: salesByCategory });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch sales by category" }, { status: 500 });
    }
}
