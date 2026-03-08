"use client";

import { useEffect, useState, useCallback } from "react";
import { useProducts } from "@/hooks/useProducts";
import { ProductForm } from "@/components/products/product-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, getStockStatus } from "@/lib/utils";

function StockBadge({ status }: { status: "in-stock" | "low-stock" | "out-of-stock" }) {
    const variants: Record<string, { label: string; className: string }> = {
        "in-stock": { label: "In Stock", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
        "low-stock": { label: "Low Stock", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
        "out-of-stock": { label: "Out of Stock", className: "bg-red-500/10 text-red-500 border-red-500/20" },
    };
    const v = variants[status];
    return <Badge variant="outline" className={v.className}>{v.label}</Badge>;
}

export default function ProductsPage() {
    const { products, loading, meta, fetchProducts, createProduct, updateProduct, deleteProduct } = useProducts();
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [page, setPage] = useState(1);
    const [formOpen, setFormOpen] = useState(false);
    const [editProduct, setEditProduct] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        fetch("/api/categories").then(r => r.json()).then(j => setCategories(j.data || [])).catch(() => { });
    }, []);

    const loadData = useCallback(() => {
        fetchProducts({ page, search, categoryId: categoryFilter || undefined, limit: 10, sortBy: "ProductName", sortOrder: "asc" });
    }, [fetchProducts, page, search, categoryFilter]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleSearch = (val: string) => { setSearch(val); setPage(1); };
    const handleCategoryChange = (val: string) => { setCategoryFilter(val === "all" ? "" : val); setPage(1); };

    const handleCreate = async (data: any) => { try { await createProduct(data); loadData(); } catch (e: any) { toast.error(e.message); throw e; } };
    const handleUpdate = async (data: any) => { if (!editProduct) return; try { await updateProduct(editProduct.ProductID, data); setEditProduct(null); loadData(); } catch (e: any) { toast.error(e.message); throw e; } };
    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try { await deleteProduct(deleteId); setDeleteId(null); loadData(); } catch (e: any) { toast.error(e.message); } finally { setDeleting(false); }
    };

    const totalPages = Math.ceil(meta.total / meta.limit);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Products</h1>
                    <p className="text-muted-foreground">Manage product catalog</p>
                </div>
                <Button onClick={() => { setEditProduct(null); setFormOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Product</Button>
            </div>

            <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search products..." value={search} onChange={(e) => handleSearch(e.target.value)} className="pl-9" />
                        </div>
                        <Select value={categoryFilter || "all"} onValueChange={(v) => handleCategoryChange(v || "all")}>
                            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((c: any) => <SelectItem key={c.CategoryID} value={c.CategoryID.toString()}>{c.CategoryName}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Badge variant="secondary">{meta.total} products</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                    ) : (
                        <>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-[50px]" />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.map((p: any) => (
                                            <TableRow key={p.ProductID} className="hover:bg-accent/50">
                                                <TableCell>
                                                    <div>
                                                        <span className="font-medium">{p.ProductName}</span>
                                                        {!!p.Discontinued && <Badge variant="destructive" className="ml-2 text-xs">Discontinued</Badge>}
                                                    </div>
                                                </TableCell>
                                                <TableCell><Badge variant="outline">{p.category?.CategoryName || "-"}</Badge></TableCell>
                                                <TableCell>{formatCurrency(p.UnitPrice)}</TableCell>
                                                <TableCell>{p.UnitsInStock ?? 0}</TableCell>
                                                <TableCell><StockBadge status={getStockStatus(p.UnitsInStock, p.ReorderLevel)} /></TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 border-0" })}><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => { setEditProduct(p); setFormOpen(true); }}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(p.ProductID)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {products.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No products found</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="flex items-center justify-between pt-4">
                                <p className="text-sm text-muted-foreground">Page {page} of {totalPages} ({meta.total} total)</p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <ProductForm open={formOpen} onOpenChange={(v) => { setFormOpen(v); if (!v) setEditProduct(null); }} product={editProduct} onSubmit={editProduct ? handleUpdate : handleCreate} />

            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <Card className="w-full max-w-md">
                        <CardHeader><h3 className="text-lg font-semibold">Delete Product</h3></CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">Are you sure? This action cannot be undone.</p>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</Button>
                                <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
