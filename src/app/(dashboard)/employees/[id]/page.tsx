"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, ShoppingCart, DollarSign, MapPin, Calendar, Briefcase, GraduationCap } from "lucide-react";
import { formatNumber, formatDate } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";

export default function EmployeeDetailPage() {
    const params = useParams();
    const [employee, setEmployee] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const { formatValue } = useCurrency();

    useEffect(() => {
        fetch(`/api/employees/${params.id}`)
            .then((r) => r.json())
            .then((j) => {
                if (j.data) {
                    // Clean the notes (remove backslashes from quotes and newlines)
                    const cleanedNotes = j.data.Notes
                        ?.replace(/\\"/g, '"')
                        ?.replace(/\\n/g, ' ')
                        ?.replace(/\\r/g, ' ')
                        ?.replace(/\\/g, ''); // Final catch-all for any remaining backslashes
                    setEmployee({ ...j.data, Notes: cleanedNotes });
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [params.id]);

    if (loading) return <div className="space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-[200px]" /><Skeleton className="h-[400px]" /></div>;
    if (!employee) return <div className="text-center py-20 text-muted-foreground">Employee not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/employees" className={buttonVariants({ variant: "ghost", size: "icon" })}><ArrowLeft className="h-4 w-4" /></Link>
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl">
                        {employee.FirstName?.[0]}{employee.LastName?.[0]}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{employee.FirstName} {employee.LastName}</h1>
                        <p className="text-muted-foreground">{employee.Title}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-lg overflow-hidden">
                    <CardHeader className="pb-2 border-b border-slate-50 dark:border-slate-800/50">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <ShoppingCart className="h-3 w-3 text-blue-600" />
                            Total Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{employee.stats?.totalOrders ?? 0}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-lg overflow-hidden">
                    <CardHeader className="pb-2 border-b border-slate-50 dark:border-slate-800/50">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <DollarSign className="h-3 w-3 text-emerald-500" />
                            Revenue Generated
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{formatValue(employee.stats?.totalRevenue ?? 0)}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-lg overflow-hidden">
                    <CardHeader className="pb-2 border-b border-slate-50 dark:border-slate-800/50">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            Location
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">{employee.City || "-"}, {employee.Country || "-"}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-lg overflow-hidden">
                    <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800/50">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            Hire Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">{formatDate(employee.HireDate)}</div>
                    </CardContent>
                </Card>
            </div>

            {employee.Notes && (
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-lg overflow-hidden">
                    <CardHeader className="pb-3 border-b border-slate-50 dark:border-slate-800/50">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-blue-700 dark:text-blue-400 flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" /> Professional Background
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-[1.8] tracking-tight italic">
                            "{employee.Notes}"
                        </p>
                    </CardContent>
                </Card>
            )}

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-lg overflow-hidden">
                <CardHeader className="border-b border-slate-50 dark:border-slate-800/50">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-blue-600" /> Recent Orders Handled
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                            <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-6">Order #</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Customer</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Date</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-right px-6">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employee.recentOrders?.map((o: any) => {
                                const total = o.order_details?.reduce((s: number, od: any) => s + od.UnitPrice * od.Quantity * (1 - od.Discount), 0) ?? 0;
                                return (
                                    <TableRow key={o.OrderID} className="border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <TableCell className="px-6 font-bold"><Link href={`/orders/${o.OrderID}`} className="text-blue-600 dark:text-blue-400 hover:underline">#{o.OrderID}</Link></TableCell>
                                        <TableCell className="font-semibold text-slate-700 dark:text-slate-300">{o.customer?.CompanyName || "-"}</TableCell>
                                        <TableCell className="text-slate-500 font-medium">{formatDate(o.OrderDate)}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn(
                                                "text-[9px] font-black uppercase tracking-widest transition-all",
                                                o.ShippedDate 
                                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800" 
                                                    : "border-slate-200 bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                                            )}>
                                                {o.ShippedDate ? "Shipped" : "Pending"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-black text-slate-900 dark:text-white px-6">{formatValue(total)}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
