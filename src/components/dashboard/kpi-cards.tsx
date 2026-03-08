"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";
import { DollarSign, ShoppingCart, Users, Package, ArrowUpRight } from "lucide-react";

interface KPICardsProps {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
}

const kpis = [
    {
        key: "totalRevenue" as const,
        title: "Total Revenue",
        icon: DollarSign,
        isCurrency: true,
        accent: "text-blue-600 dark:text-blue-400",
    },
    {
        key: "totalOrders" as const,
        title: "Total Orders",
        icon: ShoppingCart,
        format: formatNumber,
        accent: "text-slate-600 dark:text-slate-400",
    },
    {
        key: "totalCustomers" as const,
        title: "Total Customers",
        icon: Users,
        format: formatNumber,
        accent: "text-slate-600 dark:text-slate-400",
    },
    {
        key: "totalProducts" as const,
        title: "Total Products",
        icon: Package,
        accent: "text-slate-600 dark:text-slate-400",
    },
];

const kpiData = [
    { key: "totalOrders", format: formatNumber },
    { key: "totalCustomers", format: formatNumber },
    { key: "totalProducts", format: formatNumber },
];

export function KPICards(props: KPICardsProps) {
    const { formatValue } = useCurrency();

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => (
                <Card key={kpi.key} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                <kpi.icon className={cn("h-5 w-5", kpi.accent)} />
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800">
                                <ArrowUpRight className="h-3 w-3" />
                                <span>12.5%</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{kpi.title}</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {"isCurrency" in kpi 
                                    ? formatValue(props[kpi.key] as number)
                                    : formatNumber(props[kpi.key] as number)}
                            </h3>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                             <p className="text-[10px] text-slate-400 font-medium">vs. previous fiscal period</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// Helper to provide CN if not imported
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
