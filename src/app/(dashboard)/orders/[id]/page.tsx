"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Truck, Calendar, User, Printer } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function OrderDetailPage() {
    const params = useParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/orders/${params.id}`)
            .then((r) => r.json())
            .then((j) => setOrder(j.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [params.id]);

    if (loading) return (
        <div className="space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-[200px]" /><Skeleton className="h-[400px]" /></div>
    );

    if (!order) return <div className="text-center py-20 text-muted-foreground">Order not found</div>;

    const subtotal = order.order_details?.reduce((s: number, od: any) => s + od.UnitPrice * od.Quantity * (1 - od.Discount), 0) ?? 0;
    const freight = order.Freight ?? 0;
    const total = subtotal + freight;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/orders" className={buttonVariants({ variant: "ghost", size: "icon" })}><ArrowLeft className="h-4 w-4" /></Link>          <div>
                        <h1 className="text-3xl font-bold">Order #{order.OrderID}</h1>
                        <p className="text-muted-foreground">{formatDate(order.OrderDate)}</p>
                    </div>
                    <Badge variant={order.ShippedDate ? "default" : "secondary"} className="ml-2">
                        {order.ShippedDate ? "Shipped" : "Pending"}
                    </Badge>
                </div>
                <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-2" />Print</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><User className="h-4 w-4" />Customer</CardTitle></CardHeader>
                    <CardContent>
                        <p className="font-semibold">{order.customer?.CompanyName || "-"}</p>
                        <p className="text-sm text-muted-foreground">{order.customer?.ContactName}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" />Dates</CardTitle></CardHeader>
                    <CardContent className="space-y-1 text-sm">
                        <p>Ordered: {formatDate(order.OrderDate)}</p>
                        <p>Required: {formatDate(order.RequiredDate)}</p>
                        <p>Shipped: {formatDate(order.ShippedDate)}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Truck className="h-4 w-4" />Shipping</CardTitle></CardHeader>
                    <CardContent className="space-y-1 text-sm">
                        <p>{order.ShipName || "-"}</p>
                        <p>{[order.ShipAddress, order.ShipCity, order.ShipCountry].filter(Boolean).join(", ")}</p>
                        <p>Via: {order.shipper?.CompanyName || "-"}</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-lg">
                <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Discount</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.order_details?.map((od: any, i: number) => {
                                    const lineTotal = od.UnitPrice * od.Quantity * (1 - od.Discount);
                                    return (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{od.product?.ProductName || `Product #${od.ProductID}`}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(od.UnitPrice)}</TableCell>
                                            <TableCell className="text-right">{od.Quantity}</TableCell>
                                            <TableCell className="text-right">{od.Discount > 0 ? `${(od.Discount * 100).toFixed(0)}%` : "-"}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(lineTotal)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-8"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
                        <div className="flex gap-8"><span className="text-muted-foreground">Freight</span><span className="font-medium">{formatCurrency(freight)}</span></div>
                        <Separator className="w-48" />
                        <div className="flex gap-8"><span className="font-semibold text-lg">Total</span><span className="font-bold text-lg">{formatCurrency(total)}</span></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
