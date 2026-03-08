import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Total revenue
        const revenueResult = await prisma.$queryRaw<[{ total: number }]>`
      SELECT COALESCE(SUM(od."UnitPrice" * od."Quantity" * (1 - od."Discount")), 0)::float as total
      FROM "OrderDetails" od
    `;
        const totalRevenue = revenueResult[0]?.total ?? 0;

        // Total orders
        const totalOrders = await prisma.orders.count();

        // Total customers
        const totalCustomers = await prisma.customers.count();

        // Total products
        const totalProducts = await prisma.products.count();

        // Monthly revenue (last 12 months)
        const monthlyRevenue = await prisma.$queryRaw<{ month: string; revenue: number }[]>`
      SELECT 
        TO_CHAR(o."OrderDate", 'YYYY-MM') as month,
        COALESCE(SUM(od."UnitPrice" * od."Quantity" * (1 - od."Discount")), 0)::float as revenue
      FROM "Orders" o
      JOIN "OrderDetails" od ON o."OrderID" = od."OrderID"
      WHERE o."OrderDate" IS NOT NULL
      GROUP BY TO_CHAR(o."OrderDate", 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `;

        // Top 10 customers by revenue
        const topCustomers = await prisma.$queryRaw<{ name: string; revenue: number }[]>`
      SELECT 
        c."CompanyName" as name,
        COALESCE(SUM(od."UnitPrice" * od."Quantity" * (1 - od."Discount")), 0)::float as revenue
      FROM "Customers" c
      JOIN "Orders" o ON c."CustomerID" = o."CustomerID"
      JOIN "OrderDetails" od ON o."OrderID" = od."OrderID"
      GROUP BY c."CompanyName"
      ORDER BY revenue DESC
      LIMIT 10
    `;

        // Recent 5 orders
        const recentOrders = await prisma.orders.findMany({
            take: 5,
            orderBy: { OrderDate: "desc" },
            include: {
                customer: true,
                employee: true,
                order_details: true,
            },
        });

        // Low stock products
        // (Removed erroneous code previously referencing prisma.products.fields)

        // Fallback: use raw query for low stock
        const lowStock = await prisma.$queryRaw<Array<{
            ProductID: number;
            ProductName: string;
            UnitsInStock: number;
            ReorderLevel: number;
            CategoryName: string | null;
        }>>`
      SELECT p."ProductID", p."ProductName", p."UnitsInStock", p."ReorderLevel", c."CategoryName"
      FROM "Products" p
      LEFT JOIN "Categories" c ON p."CategoryID" = c."CategoryID"
      WHERE p."Discontinued" = 0 
        AND p."UnitsInStock" <= p."ReorderLevel"
        AND p."ReorderLevel" > 0
      ORDER BY p."UnitsInStock" ASC
      LIMIT 10
    `;

        return NextResponse.json({
            data: {
                totalRevenue,
                totalOrders,
                totalCustomers,
                totalProducts,
                monthlyRevenue: monthlyRevenue.reverse(),
                topCustomers,
                recentOrders: recentOrders.map((o) => ({
                    ...o,
                    OrderDate: o.OrderDate?.toISOString() ?? null,
                    RequiredDate: o.RequiredDate?.toISOString() ?? null,
                    ShippedDate: o.ShippedDate?.toISOString() ?? null,
                    Freight: o.Freight ? Number(o.Freight) : null,
                    order_details: o.order_details.map((od) => ({
                        ...od,
                        UnitPrice: Number(od.UnitPrice),
                    })),
                })),
                lowStockProducts: lowStock,
            },
        });
    } catch (error: any) {
        console.error("Dashboard KPIs error:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard data", details: error?.message || String(error) },
            { status: 500 }
        );
    }
}
