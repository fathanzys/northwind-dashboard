import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const categoryId = searchParams.get("categoryId");
        const sortBy = searchParams.get("sortBy") || "ProductName";
        const sortOrder = (searchParams.get("sortOrder") || "asc") as "asc" | "desc";

        const where: any = {};
        if (search) {
            where.ProductName = { contains: search, mode: "insensitive" };
        }
        if (categoryId) {
            where.CategoryID = parseInt(categoryId);
        }

        const [products, total] = await Promise.all([
            prisma.products.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: { category: true, supplier: true },
            }),
            prisma.products.count({ where }),
        ]);

        const serialized = products.map((p) => ({
            ...p,
            UnitPrice: p.UnitPrice ? Number(p.UnitPrice) : null,
        }));

        return NextResponse.json({ data: serialized, meta: { total, page, limit } });
    } catch (error: any) {
        console.error("Products GET error:", error);
        return NextResponse.json({ error: "Failed to fetch products", details: error?.message || String(error) }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { ProductName, SupplierID, CategoryID, QuantityPerUnit, UnitPrice, UnitsInStock, UnitsOnOrder, ReorderLevel, Discontinued } = body;

        if (!ProductName) {
            return NextResponse.json({ error: "ProductName is required" }, { status: 400 });
        }

        const product = await prisma.products.create({
            data: {
                ProductName,
                SupplierID: SupplierID ? parseInt(SupplierID) : null,
                CategoryID: CategoryID ? parseInt(CategoryID) : null,
                QuantityPerUnit,
                UnitPrice: UnitPrice ? parseFloat(UnitPrice) : null,
                UnitsInStock: UnitsInStock ? parseInt(UnitsInStock) : 0,
                UnitsOnOrder: UnitsOnOrder ? parseInt(UnitsOnOrder) : 0,
                ReorderLevel: ReorderLevel ? parseInt(ReorderLevel) : 0,
                Discontinued: Discontinued ? 1 : 0,
            },
            include: { category: true, supplier: true },
        });

        return NextResponse.json({ data: { ...product, UnitPrice: product.UnitPrice ? Number(product.UnitPrice) : null } }, { status: 201 });
    } catch (error) {
        console.error("Products POST error:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
