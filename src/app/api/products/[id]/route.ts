import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const product = await prisma.products.findUnique({
            where: { ProductID: parseInt(id) },
            include: { category: true, supplier: true, order_details: { include: { order: true }, take: 10, orderBy: { order: { OrderDate: "desc" } } } },
        });

        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        return NextResponse.json({
            data: {
                ...product,
                UnitPrice: product.UnitPrice ? Number(product.UnitPrice) : null,
                order_details: product.order_details.map((od) => ({
                    ...od,
                    UnitPrice: Number(od.UnitPrice),
                    order: od.order ? { ...od.order, Freight: od.order.Freight ? Number(od.order.Freight) : null, OrderDate: od.order.OrderDate?.toISOString() ?? null, RequiredDate: od.order.RequiredDate?.toISOString() ?? null, ShippedDate: od.order.ShippedDate?.toISOString() ?? null } : null,
                })),
            },
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const product = await prisma.products.update({
            where: { ProductID: parseInt(id) },
            data: {
                ProductName: body.ProductName,
                SupplierID: body.SupplierID ? parseInt(body.SupplierID) : null,
                CategoryID: body.CategoryID ? parseInt(body.CategoryID) : null,
                QuantityPerUnit: body.QuantityPerUnit,
                UnitPrice: body.UnitPrice ? parseFloat(body.UnitPrice) : null,
                UnitsInStock: body.UnitsInStock != null ? parseInt(body.UnitsInStock) : 0,
                UnitsOnOrder: body.UnitsOnOrder != null ? parseInt(body.UnitsOnOrder) : 0,
                ReorderLevel: body.ReorderLevel != null ? parseInt(body.ReorderLevel) : 0,
                Discontinued: body.Discontinued ? 1 : 0,
            },
            include: { category: true, supplier: true },
        });
        return NextResponse.json({ data: { ...product, UnitPrice: product.UnitPrice ? Number(product.UnitPrice) : null } });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to update product", details: error?.message || String(error) }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const odCount = await prisma.order_details.count({ where: { ProductID: parseInt(id) } });
        if (odCount > 0) return NextResponse.json({ error: `Cannot delete: product is in ${odCount} order(s)` }, { status: 409 });
        await prisma.products.delete({ where: { ProductID: parseInt(id) } });
        return NextResponse.json({ data: { success: true } });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}
