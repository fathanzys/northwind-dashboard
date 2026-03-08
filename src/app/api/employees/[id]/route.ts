import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const employee = await prisma.employees.findUnique({
            where: { EmployeeID: parseInt(id) },
        });

        if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

        // Get stats
        const stats = await prisma.$queryRaw<[{ totalOrders: number; totalRevenue: number }]>`
      SELECT 
        COUNT(DISTINCT o."OrderID")::int as "totalOrders",
        COALESCE(SUM(od."UnitPrice" * od."Quantity" * (1 - od."Discount")), 0)::float as "totalRevenue"
      FROM "Orders" o
      JOIN "OrderDetails" od ON o."OrderID" = od."OrderID"
      WHERE o."EmployeeID" = ${parseInt(id)}
    `;

        // Recent orders
        const recentOrders = await prisma.orders.findMany({
            where: { EmployeeID: parseInt(id) },
            take: 10,
            orderBy: { OrderDate: "desc" },
            include: { customer: true, order_details: true },
        });

        return NextResponse.json({
            data: {
                ...employee,
                BirthDate: employee.BirthDate?.toISOString() ?? null,
                HireDate: employee.HireDate?.toISOString() ?? null,
                stats: stats[0] ?? { totalOrders: 0, totalRevenue: 0 },
                recentOrders: recentOrders.map((o) => ({
                    ...o,
                    OrderDate: o.OrderDate?.toISOString() ?? null,
                    RequiredDate: o.RequiredDate?.toISOString() ?? null,
                    ShippedDate: o.ShippedDate?.toISOString() ?? null,
                    Freight: o.Freight ? Number(o.Freight) : null,
                    order_details: o.order_details.map((od) => ({ ...od, UnitPrice: Number(od.UnitPrice) })),
                })),
            },
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 });
    }
}
