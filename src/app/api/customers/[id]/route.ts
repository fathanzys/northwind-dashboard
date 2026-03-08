import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const customer = await prisma.customers.findUnique({
            where: { CustomerID: id },
            include: {
                orders: {
                    include: {
                        order_details: {
                            include: { product: true },
                        },
                        employee: true,
                    },
                    orderBy: { OrderDate: "desc" },
                },
            },
        });

        if (!customer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }

        const serialized = {
            ...customer,
            orders: customer.orders.map((o) => ({
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
            })),
        };

        return NextResponse.json({ data: serialized });
    } catch (error) {
        console.error("Customer GET error:", error);
        return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { CompanyName, ContactName, ContactTitle, Address, City, Region, PostalCode, Country, Phone, Fax } = body;

        if (!CompanyName) {
            return NextResponse.json({ error: "CompanyName is required" }, { status: 400 });
        }

        const customer = await prisma.customers.update({
            where: { CustomerID: id },
            data: { CompanyName, ContactName, ContactTitle, Address, City, Region, PostalCode, Country, Phone, Fax },
        });

        return NextResponse.json({ data: customer });
    } catch (error) {
        console.error("Customer PUT error:", error);
        return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Check for related orders
        const orderCount = await prisma.orders.count({ where: { CustomerID: id } });
        if (orderCount > 0) {
            return NextResponse.json(
                { error: `Cannot delete: customer has ${orderCount} order(s)` },
                { status: 409 }
            );
        }

        await prisma.customers.delete({ where: { CustomerID: id } });
        return NextResponse.json({ data: { success: true } });
    } catch (error) {
        console.error("Customer DELETE error:", error);
        return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
    }
}
