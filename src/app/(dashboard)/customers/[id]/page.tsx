"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, MapPin, Phone, Mail } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CustomerDetailPage() {
    const params = useParams();
    const [customer, setCustomer] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/customers/${params.id}`)
            .then((r) => r.json())
            .then((j) => setCustomer(j.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [params.id]);

    if (loading) return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[400px]" />
        </div>
    );

    if (!customer) return <div className="text-center py-20 text-muted-foreground">Customer not found</div>;

    const totalSpent = customer.orders?.reduce((sum: number, o: any) =>
        sum + (o.order_details?.reduce((s: number, od: any) => s + od.UnitPrice * od.Quantity * (1 - od.Discount), 0) ?? 0), 0) ?? 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/customers" className={buttonVariants({ variant: "ghost", size: "icon" })}><ArrowLeft className="h-4 w-4" /></Link>
                <div>
                    <h1 className="text-3xl font-bold">{customer.CompanyName}</h1>
                    <p className="text-muted-foreground">{customer.CustomerID}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-0 shadow-lg">
                    <CardHeader><CardTitle className="text-sm text-muted-foreground">Contact Info</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{customer.ContactName || "-"} ({customer.ContactTitle || "-"})</span></div>
                        <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{customer.Phone || "-"}</span></div>
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{[customer.Address, customer.City, customer.Country].filter(Boolean).join(", ") || "-"}</span></div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                    <CardHeader><CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold">{customer.orders?.length ?? 0}</div></CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                    <CardHeader><CardTitle className="text-sm text-muted-foreground">Total Spent</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-emerald-500">{formatCurrency(totalSpent)}</div></CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-lg">
                <CardHeader><CardTitle>Order History</CardTitle></CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order #</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customer.orders?.map((o: any) => {
                                    const total = o.order_details?.reduce((s: number, od: any) => s + od.UnitPrice * od.Quantity * (1 - od.Discount), 0) ?? 0;
                                    return (
                                        <TableRow key={o.OrderID}>
                                            <TableCell><Link href={`/orders/${o.OrderID}`} className="text-primary hover:underline">#{o.OrderID}</Link></TableCell>
                                            <TableCell>{formatDate(o.OrderDate)}</TableCell>
                                            <TableCell><Badge variant={o.ShippedDate ? "default" : "secondary"}>{o.ShippedDate ? "Shipped" : "Pending"}</Badge></TableCell>
                                            <TableCell>{o.order_details?.length ?? 0}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(total)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                                {(!customer.orders || customer.orders.length === 0) && (
                                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No orders found</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
