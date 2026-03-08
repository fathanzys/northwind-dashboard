"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";
import { formatCurrency, downloadCSV } from "@/lib/utils";
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, LineChart, Line,
} from "recharts";

const COLORS = [
    "hsl(220, 70%, 55%)", "hsl(160, 70%, 45%)", "hsl(280, 70%, 55%)",
    "hsl(30, 80%, 55%)", "hsl(350, 70%, 55%)", "hsl(190, 70%, 50%)",
    "hsl(100, 60%, 45%)", "hsl(50, 80%, 50%)",
];

function ChartSkeleton() {
    return <Skeleton className="h-[350px] w-full rounded-xl" />;
}

export default function ReportsPage() {
    const [salesByCategory, setSalesByCategory] = useState<any[] | null>(null);
    const [monthlyRevenue, setMonthlyRevenue] = useState<any[] | null>(null);
    const [topEmployees, setTopEmployees] = useState<any[] | null>(null);
    const [customerSeg, setCustomerSeg] = useState<any[] | null>(null);

    useEffect(() => {
        fetch("/api/reports/sales-by-category").then(r => r.json()).then(j => setSalesByCategory(j.data)).catch(() => { });
        fetch("/api/reports/monthly-revenue").then(r => r.json()).then(j => setMonthlyRevenue(j.data)).catch(() => { });
        fetch("/api/reports/top-employees").then(r => r.json()).then(j => setTopEmployees(j.data)).catch(() => { });
        fetch("/api/reports/customer-segmentation").then(r => r.json()).then(j => setCustomerSeg(j.data)).catch(() => { });
    }, []);

    // Process monthly revenue for year-over-year comparison
    const yearlyData = (() => {
        if (!monthlyRevenue) return [];
        const years = [...new Set(monthlyRevenue.map(r => r.year))];
        const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months.map((m, i) => {
            const row: any = { month: monthNames[i] };
            years.forEach(y => {
                const found = monthlyRevenue.find(r => r.year === y && r.month === m);
                row[y] = found?.revenue ?? 0;
            });
            return row;
        });
    })();
    const years = monthlyRevenue ? [...new Set(monthlyRevenue.map(r => r.year))] : [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Reports</h1>
                <p className="text-muted-foreground">Analytics and business intelligence</p>
            </div>

            <Tabs defaultValue="sales-category" className="space-y-6">
                <div className="w-full overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                    <TabsList className="inline-flex w-auto min-w-full lg:grid lg:grid-cols-4 h-auto p-1 bg-slate-100/50 dark:bg-slate-800/50">
                        <TabsTrigger value="sales-category" className="px-4 py-2.5 text-xs font-bold uppercase tracking-tight data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">Sales by Category</TabsTrigger>
                        <TabsTrigger value="monthly-revenue" className="px-4 py-2.5 text-xs font-bold uppercase tracking-tight data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">Monthly Revenue</TabsTrigger>
                        <TabsTrigger value="top-employees" className="px-4 py-2.5 text-xs font-bold uppercase tracking-tight data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">Top Employees</TabsTrigger>
                        <TabsTrigger value="customer-seg" className="px-4 py-2.5 text-xs font-bold uppercase tracking-tight data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">Segmentation</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="sales-category" className="mt-0">
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-lg overflow-hidden">
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Sales Distribution</CardTitle>
                                <p className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5 uppercase">Revenue share by product category</p>
                            </div>
                            <Button variant="outline" size="sm" className="w-full sm:w-auto text-[10px] font-bold uppercase tracking-widest h-8 border-slate-200 dark:border-slate-700" onClick={() => salesByCategory && downloadCSV(salesByCategory, "sales-by-category")}>
                                <Download className="h-3 w-3 mr-2" />Export Data
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-8">
                            {!salesByCategory ? <ChartSkeleton /> : (
                                <div className="h-[350px] sm:h-[450px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie 
                                                data={salesByCategory} 
                                                cx="50%" 
                                                cy="50%" 
                                                outerRadius="80%" 
                                                innerRadius="50%" 
                                                dataKey="value" 
                                                nameKey="name" 
                                                labelLine={false}
                                                label={({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 }) => {
                                                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                                    if (percent < 0.05) return null;
                                                    return (
                                                        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[10px] font-bold">
                                                            {`${(percent * 100).toFixed(0)}%`}
                                                        </text>
                                                    );
                                                }}
                                            >
                                                {salesByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />)}
                                            </Pie>
                                            <Tooltip 
                                                formatter={(v: any) => formatCurrency(v)} 
                                                contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#f8fafc", fontSize: "12px" }} 
                                            />
                                            <Legend verticalAlign="bottom" height={60} iconType="circle" wrapperStyle={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", paddingTop: "20px" }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="monthly-revenue" className="mt-0">
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-lg overflow-hidden">
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Revenue Growth</CardTitle>
                                <p className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5 uppercase">Year-over-year monthly performance</p>
                            </div>
                            <Button variant="outline" size="sm" className="w-full sm:w-auto text-[10px] font-bold uppercase tracking-widest h-8 border-slate-200 dark:border-slate-700" onClick={() => monthlyRevenue && downloadCSV(monthlyRevenue, "monthly-revenue")}>
                                <Download className="h-3 w-3 mr-2" />Export Data
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-8">
                            {!monthlyRevenue ? <ChartSkeleton /> : (
                                <div className="h-[350px] sm:h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={yearlyData} margin={{ left: -10, right: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} opacity={0.5} />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: 600 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: 600 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                            <Tooltip 
                                                formatter={(v: any) => formatCurrency(v)} 
                                                contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#f8fafc", fontSize: "12px" }} 
                                            />
                                            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase" }} />
                                            {years.map((y, i) => <Line key={y} type="monotone" dataKey={y} stroke={COLORS[i % COLORS.length]} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, stroke: "white" }} activeDot={{ r: 6, strokeWidth: 0 }} />)}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="top-employees" className="mt-0">
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-lg overflow-hidden">
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Top Performers</CardTitle>
                                <p className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5 uppercase">Employee revenue contribution</p>
                            </div>
                            <Button variant="outline" size="sm" className="w-full sm:w-auto text-[10px] font-bold uppercase tracking-widest h-8 border-slate-200 dark:border-slate-700" onClick={() => topEmployees && downloadCSV(topEmployees, "top-employees")}>
                                <Download className="h-3 w-3 mr-2" />Export Data
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-8">
                            {!topEmployees ? <ChartSkeleton /> : (
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={topEmployees} layout="vertical" margin={{ left: -10, right: 30 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} opacity={0.5} />
                                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: 600 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#1E293B", fontWeight: 700 }} width={100} />
                                            <Tooltip 
                                                formatter={(v: any, name: any) => [name === "revenue" ? formatCurrency(v) : v, name === "revenue" ? "Revenue" : "Orders"]} 
                                                contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#f8fafc", fontSize: "12px" }} 
                                            />
                                            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase" }} />
                                            <Bar dataKey="revenue" fill={COLORS[0]} radius={[0, 4, 4, 0]} name="Revenue" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="customer-seg" className="mt-0">
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-lg overflow-hidden">
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Market Segmentation</CardTitle>
                                <p className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5 uppercase">Revenue and customer base by geography</p>
                            </div>
                            <Button variant="outline" size="sm" className="w-full sm:w-auto text-[10px] font-bold uppercase tracking-widest h-8 border-slate-200 dark:border-slate-700" onClick={() => customerSeg && downloadCSV(customerSeg, "customer-segmentation")}>
                                <Download className="h-3 w-3 mr-2" />Export Data
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-8">
                            {!customerSeg ? <ChartSkeleton /> : (
                                <div className="h-[450px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={customerSeg.slice(0, 10)} margin={{ bottom: 100, left: -10, right: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} opacity={0.5} />
                                            <XAxis dataKey="country" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94A3B8", fontWeight: 700 }} angle={-45} textAnchor="end" interval={0} height={80} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: 600 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                            <Tooltip 
                                                formatter={(v: any, name: any) => [name === "revenue" ? formatCurrency(v) : v, name === "revenue" ? "Revenue" : "Customers"]} 
                                                contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#f8fafc", fontSize: "12px" }} 
                                            />
                                            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase" }} />
                                            <Bar dataKey="revenue" fill={COLORS[1]} radius={[4, 4, 0, 0]} name="Revenue" />
                                            <Bar dataKey="customers" fill={COLORS[2]} radius={[4, 4, 0, 0]} name="Customers" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
