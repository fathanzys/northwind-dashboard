"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, AlertCircle, TrendingUp, PackageSearch } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";

interface ExecutiveSummaryProps {
    data: {
        totalRevenue: number;
        totalOrders: number;
        lowStockItems: number;
        revenueGrowth: number;
    };
}

export function ExecutiveSummary({ data }: ExecutiveSummaryProps) {
    const { formatValue } = useCurrency();

    const insights = [
        {
            icon: TrendingUp,
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
            text: `Revenue is performing strong at ${formatValue(data.totalRevenue)}, showing a ${data.revenueGrowth}% growth trend this period.`
        },
        {
            icon: AlertCircle,
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-900/20",
            text: `${data.lowStockItems} inventory items are below critical thresholds. Immediate re-stocking is advised to prevent fulfillment delays.`
        },
        {
            icon: PackageSearch,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20",
            text: `Order volume remains steady at ${data.totalOrders} units. Beverage and Seafood categories continue to drive primary market share.`
        }
    ];

    return (
        <Card className="bg-slate-50 dark:bg-slate-900/50 border-blue-200 dark:border-blue-900/30 shadow-sm overflow-hidden relative group transition-all duration-300 hover:shadow-md">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="h-24 w-24 text-blue-600 dark:text-blue-400 rotate-12" />
            </div>
            <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-700 dark:text-blue-400">Executive AI Summary</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {insights.map((insight, i) => (
                        <div key={i} className="flex gap-3 items-start group/item">
                            <div className={`p-2 rounded-lg ${insight.bg} border border-white/10 shrink-0`}>
                                <insight.icon className={`h-4 w-4 ${insight.color}`} />
                            </div>
                            <p className="text-xs font-semibold leading-relaxed text-slate-700 dark:text-slate-300 group-hover/item:text-slate-900 dark:group-hover/item:text-white transition-colors">
                                {insight.text}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
