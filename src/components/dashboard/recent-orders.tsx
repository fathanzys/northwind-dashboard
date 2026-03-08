"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Clock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RecentOrder {
    OrderID: number;
    OrderDate: string | null;
    ShippedDate: string | null;
    customer?: { CompanyName: string } | null;
    employee?: { FirstName: string; LastName: string } | null;
    order_details?: { UnitPrice: number; Quantity: number; Discount: number }[];
}

interface RecentOrdersProps {
    orders: RecentOrder[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
    return (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-lg overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Transaction Ledger</CardTitle>
                        <p className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5 uppercase">Recent order activity</p>
                    </div>
                </div>
                <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                    View Ledger <ExternalLink className="h-3 w-3" />
                </button>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {orders.map((order) => {
                        const total = order.order_details?.reduce(
                            (sum, od) => sum + od.UnitPrice * od.Quantity * (1 - od.Discount),
                            0
                        ) ?? 0;
                        const isShipped = !!order.ShippedDate;

                        return (
                            <div
                                key={order.OrderID}
                                className="group flex items-center justify-between p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">ORD-{order.OrderID}</span>
                                        <Badge 
                                               className={cn(
                                                   "text-[10px] uppercase font-bold px-2 py-0 h-4 rounded",
                                                   isShipped 
                                                   ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800" 
                                                   : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800"
                                               )}>
                                            {isShipped ? "Shipped" : "Pending"}
                                        </Badge>
                                    </div>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        {order.customer?.CompanyName ?? "Counter-party Unknown"} · {formatDate(order.OrderDate)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{formatCurrency(total)}</span>
                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Approved</p>
                                </div>
                            </div>
                        );
                    })}
                    {orders.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Clock className="h-8 w-8 text-slate-200 dark:text-slate-800 mb-2" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Recent Activity</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// Helper to provide CN if not imported
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
