import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const topEmployees = await prisma.$queryRaw<{ name: string; orders: number; revenue: number }[]>`
      SELECT 
        CONCAT(e."FirstName", ' ', e."LastName") as name,
        COUNT(DISTINCT o."OrderID")::int as orders,
        COALESCE(SUM(od."UnitPrice" * od."Quantity" * (1 - od."Discount")), 0)::float as revenue
      FROM "Employees" e
      LEFT JOIN "Orders" o ON e."EmployeeID" = o."EmployeeID"
      LEFT JOIN "OrderDetails" od ON o."OrderID" = od."OrderID"
      GROUP BY e."EmployeeID", e."FirstName", e."LastName"
      ORDER BY revenue DESC
    `;
        return NextResponse.json({ data: topEmployees });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch top employees" }, { status: 500 });
    }
}
