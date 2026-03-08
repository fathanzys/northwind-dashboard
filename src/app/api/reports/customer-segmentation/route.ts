import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const segmentation = await prisma.$queryRaw<{ country: string; customers: number; revenue: number }[]>`
      SELECT 
        COALESCE(c."Country", 'Unknown') as country,
        COUNT(DISTINCT c."CustomerID")::int as customers,
        COALESCE(SUM(od."UnitPrice" * od."Quantity" * (1 - od."Discount")), 0)::float as revenue
      FROM "Customers" c
      LEFT JOIN "Orders" o ON c."CustomerID" = o."CustomerID"
      LEFT JOIN "OrderDetails" od ON o."OrderID" = od."OrderID"
      GROUP BY c."Country"
      ORDER BY revenue DESC
    `;
        return NextResponse.json({ data: segmentation });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch customer segmentation" }, { status: 500 });
    }
}
