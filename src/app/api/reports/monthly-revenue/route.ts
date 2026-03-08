import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const monthlyRevenue = await prisma.$queryRaw<{ year: string; month: string; revenue: number }[]>`
      SELECT 
        TO_CHAR(o."OrderDate", 'YYYY') as year,
        TO_CHAR(o."OrderDate", 'MM') as month,
        COALESCE(SUM(od."UnitPrice" * od."Quantity" * (1 - od."Discount")), 0)::float as revenue
      FROM "Orders" o
      JOIN "OrderDetails" od ON o."OrderID" = od."OrderID"
      WHERE o."OrderDate" IS NOT NULL
      GROUP BY TO_CHAR(o."OrderDate", 'YYYY'), TO_CHAR(o."OrderDate", 'MM')
      ORDER BY year, month
    `;
        return NextResponse.json({ data: monthlyRevenue });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch monthly revenue" }, { status: 500 });
    }
}
