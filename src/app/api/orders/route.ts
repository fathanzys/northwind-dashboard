import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const sortBy = searchParams.get("sortBy") || "OrderDate";
        const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

        const where: any = {};
        if (search) {
            where.OR = [
                { customer: { CompanyName: { contains: search, mode: "insensitive" } } },
                { ShipCity: { contains: search, mode: "insensitive" } },
                { ShipCountry: { contains: search, mode: "insensitive" } },
            ];
            const asNum = parseInt(search);
            if (!isNaN(asNum)) { where.OR.push({ OrderID: asNum }); }
        }

        const [orders, total] = await Promise.all([
            prisma.orders.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    customer: true,
                    employee: true,
                    shipper: true,
                    order_details: { include: { product: true } },
                },
            }),
            prisma.orders.count({ where }),
        ]);

        const serialized = orders.map((o) => ({
            ...o,
            OrderDate: o.OrderDate?.toISOString() ?? null,
            RequiredDate: o.RequiredDate?.toISOString() ?? null,
            ShippedDate: o.ShippedDate?.toISOString() ?? null,
            Freight: o.Freight ? Number(o.Freight) : null,
            order_details: o.order_details.map((od) => ({
                ...od,
                UnitPrice: Number(od.UnitPrice),
                product: od.product ? { ...od.product, UnitPrice: od.product.UnitPrice ? Number(od.product.UnitPrice) : null } : null,
            })),
        }));

        return NextResponse.json({ data: serialized, meta: { total, page, limit } });
    } catch (error) {
        console.error("Orders GET error:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { CustomerID, EmployeeID, ShipVia, Freight, ShipName, ShipAddress, ShipCity, ShipRegion, ShipPostalCode, ShipCountry, RequiredDate, items } = body;

        if (!CustomerID || !items || items.length === 0) {
            return NextResponse.json({ error: "CustomerID and at least one item are required" }, { status: 400 });
        }

        const order = await prisma.orders.create({
            data: {
                CustomerID,
                EmployeeID: EmployeeID ? parseInt(EmployeeID) : null,
                OrderDate: new Date(),
                RequiredDate: RequiredDate ? new Date(RequiredDate) : null,
                ShipVia: ShipVia ? parseInt(ShipVia) : null,
                Freight: Freight ? parseFloat(Freight) : null,
                ShipName, ShipAddress, ShipCity, ShipRegion, ShipPostalCode, ShipCountry,
                order_details: {
                    create: items.map((item: any) => ({
                        ProductID: parseInt(item.ProductID),
                        UnitPrice: parseFloat(item.UnitPrice),
                        Quantity: parseInt(item.Quantity),
                        Discount: item.Discount ? parseFloat(item.Discount) : 0,
                    })),
                },
            },
            include: { customer: true, order_details: { include: { product: true } } },
        });

        return NextResponse.json({ data: { ...order, OrderDate: order.OrderDate?.toISOString() ?? null, RequiredDate: order.RequiredDate?.toISOString() ?? null, ShippedDate: order.ShippedDate?.toISOString() ?? null, Freight: order.Freight ? Number(order.Freight) : null } }, { status: 201 });
    } catch (error) {
        console.error("Orders POST error:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
