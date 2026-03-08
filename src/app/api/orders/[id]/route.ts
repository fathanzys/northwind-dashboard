import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const order = await prisma.orders.findUnique({
            where: { OrderID: parseInt(id) },
            include: {
                customer: true,
                employee: true,
                shipper: true,
                order_details: { include: { product: { include: { category: true } } } },
            },
        });

        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        return NextResponse.json({
            data: {
                ...order,
                OrderDate: order.OrderDate?.toISOString() ?? null,
                RequiredDate: order.RequiredDate?.toISOString() ?? null,
                ShippedDate: order.ShippedDate?.toISOString() ?? null,
                Freight: order.Freight ? Number(order.Freight) : null,
                order_details: order.order_details.map((od) => ({
                    ...od,
                    UnitPrice: Number(od.UnitPrice),
                    product: od.product ? { ...od.product, UnitPrice: od.product.UnitPrice ? Number(od.product.UnitPrice) : null } : null,
                })),
            },
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const order = await prisma.orders.update({
            where: { OrderID: parseInt(id) },
            data: {
                CustomerID: body.CustomerID,
                EmployeeID: body.EmployeeID ? parseInt(body.EmployeeID) : null,
                RequiredDate: body.RequiredDate ? new Date(body.RequiredDate) : null,
                ShippedDate: body.ShippedDate ? new Date(body.ShippedDate) : null,
                ShipVia: body.ShipVia ? parseInt(body.ShipVia) : null,
                Freight: body.Freight ? parseFloat(body.Freight) : null,
                ShipName: body.ShipName,
                ShipAddress: body.ShipAddress,
                ShipCity: body.ShipCity,
                ShipCountry: body.ShipCountry,
            },
        });
        return NextResponse.json({ data: { ...order, OrderDate: order.OrderDate?.toISOString() ?? null, RequiredDate: order.RequiredDate?.toISOString() ?? null, ShippedDate: order.ShippedDate?.toISOString() ?? null, Freight: order.Freight ? Number(order.Freight) : null } });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const parsedId = parseInt(id);
        await prisma.order_details.deleteMany({ where: { OrderID: parsedId } });
        await prisma.orders.delete({ where: { OrderID: parsedId } });
        return NextResponse.json({ data: { success: true } });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
    }
}
