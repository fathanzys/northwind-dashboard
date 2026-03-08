"use client";

import { useEffect, useState, useCallback } from "react";
import { useOrders } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MoreHorizontal, Trash2, ChevronLeft, ChevronRight, Eye, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function OrdersPage() {
    const { orders, loading, meta, fetchOrders, createOrder, deleteOrder } = useOrders();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [formOpen, setFormOpen] = useState(false);

    // Form state
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [formData, setFormData] = useState({ CustomerID: "", ShipCity: "", ShipCountry: "" });
    const [items, setItems] = useState<{ ProductID: string; Quantity: string; UnitPrice: string }[]>([{ ProductID: "", Quantity: "1", UnitPrice: "" }]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetch("/api/customers?limit=100").then(r => r.json()).then(j => setCustomers(j.data || [])).catch(() => { });
        fetch("/api/products?limit=100").then(r => r.json()).then(j => setProducts(j.data || [])).catch(() => { });
    }, []);

    const loadData = useCallback(() => {
        fetchOrders({ page, search, limit: 10 });
    }, [fetchOrders, page, search]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleSearch = (val: string) => { setSearch(val); setPage(1); };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try { await deleteOrder(deleteId); setDeleteId(null); loadData(); } catch (e: any) { toast.error(e.message); } finally { setDeleting(false); }
    };

    const addItem = () => setItems([...items, { ProductID: "", Quantity: "1", UnitPrice: "" }]);
    const removeItem = (i: number) => { if (items.length > 1) setItems(items.filter((_, idx) => idx !== i)); };
    const updateItem = (i: number, field: string, val: string) => {
        const newItems = [...items];
        (newItems[i] as any)[field] = val;
        if (field === "ProductID") {
            const p = products.find((p: any) => p.ProductID.toString() === val);
            if (p) newItems[i].UnitPrice = p.UnitPrice?.toString() || "";
        }
        setItems(newItems);
    };

    const handleCreateOrder = async () => {
        if (!formData.CustomerID) { toast.error("Select a customer"); return; }
        if (items.some(i => !i.ProductID || !i.Quantity)) { toast.error("Fill all product lines"); return; }
        setSubmitting(true);
        try {
            await createOrder({ ...formData, items });
            setFormOpen(false);
            setFormData({ CustomerID: "", ShipCity: "", ShipCountry: "" });
            setItems([{ ProductID: "", Quantity: "1", UnitPrice: "" }]);
            loadData();
        } catch (e: any) { toast.error(e.message); } finally { setSubmitting(false); }
    };

    const totalPages = Math.ceil(meta.total / meta.limit);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Orders</h1>
                    <p className="text-muted-foreground">Manage orders and shipments</p>
                </div>
                <Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4 mr-2" />New Order</Button>
            </div>

            <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search orders, customers..." value={search} onChange={(e) => handleSearch(e.target.value)} className="pl-9" />
                        </div>
                        <Badge variant="secondary">{meta.total} orders</Badge>
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
                                            <TableHead>Order #</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Items</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                            <TableHead className="w-[50px]" />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map((o: any) => {
                                            const total = o.order_details?.reduce((s: number, od: any) => s + od.UnitPrice * od.Quantity * (1 - od.Discount), 0) ?? 0;
                                            return (
                                                <TableRow key={o.OrderID} className="hover:bg-accent/50">
                                                    <TableCell className="font-medium">#{o.OrderID}</TableCell>
                                                    <TableCell>{o.customer?.CompanyName || "-"}</TableCell>
                                                    <TableCell>{formatDate(o.OrderDate)}</TableCell>
                                                    <TableCell><Badge variant={o.ShippedDate ? "default" : "secondary"}>{o.ShippedDate ? "Shipped" : "Pending"}</Badge></TableCell>
                                                    <TableCell>{o.order_details?.length ?? 0}</TableCell>
                                                    <TableCell className="text-right font-medium">{formatCurrency(total)}</TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 border-0" })}><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem>
                                                                    <Link href={`/orders/${o.OrderID}`} className="flex w-full items-center"><Eye className="h-4 w-4 mr-2" />View Details</Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(o.OrderID)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {orders.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No orders found</TableCell></TableRow>}
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

            {/* Create Order Dialog */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>New Order</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Customer *</Label>
                                <Select value={formData.CustomerID} onValueChange={(v) => setFormData({ ...formData, CustomerID: v || "" })}>
                                    <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                                    <SelectContent>{customers.map((c: any) => <SelectItem key={c.CustomerID} value={c.CustomerID}>{c.CompanyName}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label>Ship City</Label><Input value={formData.ShipCity} onChange={(e) => setFormData({ ...formData, ShipCity: e.target.value })} /></div>
                            <div className="space-y-2"><Label>Ship Country</Label><Input value={formData.ShipCountry} onChange={(e) => setFormData({ ...formData, ShipCountry: e.target.value })} /></div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between"><Label>Order Items</Label><Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="h-3 w-3 mr-1" />Add Item</Button></div>
                            <div className="space-y-2">
                                {items.map((item, i) => (
                                    <div key={i} className="flex items-end gap-2 p-3 rounded-lg border">
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-xs">Product</Label>
                                            <Select value={item.ProductID} onValueChange={(v) => updateItem(i, "ProductID", v || "")}>
                                                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                                                <SelectContent>{products.map((p: any) => <SelectItem key={p.ProductID} value={p.ProductID.toString()}>{p.ProductName} ({formatCurrency(p.UnitPrice)})</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-20 space-y-1"><Label className="text-xs">Qty</Label><Input type="number" min="1" value={item.Quantity} onChange={(e) => updateItem(i, "Quantity", e.target.value)} /></div>
                                        <div className="w-28 space-y-1"><Label className="text-xs">Price</Label><Input type="number" step="0.01" value={item.UnitPrice} onChange={(e) => updateItem(i, "UnitPrice", e.target.value)} /></div>
                                        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeItem(i)} disabled={items.length <= 1}><X className="h-4 w-4" /></Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateOrder} disabled={submitting}>{submitting ? "Creating..." : "Create Order"}</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <Card className="w-full max-w-md">
                        <CardHeader><h3 className="text-lg font-semibold">Delete Order</h3></CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">Delete order #{deleteId}? This will also remove all order details.</p>
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
