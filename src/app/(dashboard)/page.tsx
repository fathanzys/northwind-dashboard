"use client";

import { useEffect, useState } from "react";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { ExecutiveSummary } from "@/components/dashboard/executive-summary";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { TopCustomersChart } from "@/components/dashboard/top-customers-chart";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { LowStockAlert } from "@/components/dashboard/low-stock-alert";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    monthlyRevenue: { month: string; revenue: number }[];
    topCustomers: { name: string; revenue: number }[];
    recentOrders: any[];
    lowStockProducts: any[];
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/dashboard/kpis")
            .then((res) => res.json())
            .then((json) => {
                if (json.error) setError(json.error);
                else setData(json.data);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-10">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48 rounded bg-slate-200 dark:bg-slate-800" />
                    <Skeleton className="h-4 w-64 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
                <Skeleton className="h-32 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-lg bg-slate-200 dark:bg-slate-800" />
                    ))}
                </div>
                <div className="grid gap-8 lg:grid-cols-2">
                    <Skeleton className="h-[400px] rounded-lg bg-slate-200 dark:bg-slate-800" />
                    <Skeleton className="h-[400px] rounded-lg bg-slate-200 dark:bg-slate-800" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
                <div className="p-4 rounded-full bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                    <div className="h-12 w-12 text-red-600 dark:text-red-400 flex items-center justify-center text-3xl font-bold">!</div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">System Connectivity Issue</h2>
                    <p className="text-sm text-slate-500 max-w-md">{error}</p>
                </div>
                <p className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 rounded border border-slate-100 dark:border-slate-800">
                    Verify database protocols and environment configuration string.
                </p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col gap-1.5 border-l-4 border-blue-600 dark:border-blue-500 pl-6 py-1">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">
                    Executive 
                    <span className="text-blue-600 dark:text-blue-400 ml-2">Console</span>
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em]">
                    Northwind Global Operations · Real-time Intelligence
                </p>
            </div>

            <ExecutiveSummary 
                data={{
                    totalRevenue: data.totalRevenue,
                    totalOrders: data.totalOrders,
                    lowStockItems: data.lowStockProducts.length,
                    revenueGrowth: 12.5 // Hardcoded for demo/premium feel
                }} 
            />

            <KPICards
                totalRevenue={data.totalRevenue}
                totalOrders={data.totalOrders}
                totalCustomers={data.totalCustomers}
                totalProducts={data.totalProducts}
            />

            <div className="grid gap-8 lg:grid-cols-2">
                <RevenueChart data={data.monthlyRevenue} />
                <TopCustomersChart data={data.topCustomers} />
            </div>

            <div className="grid gap-8 lg:grid-cols-2 pb-10">
                <RecentOrders orders={data.recentOrders} />
                <LowStockAlert products={data.lowStockProducts} />
            </div>
        </div>
    );
}
