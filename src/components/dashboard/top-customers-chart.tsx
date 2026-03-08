"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Award } from "lucide-react";

interface TopCustomersChartProps {
    data: { name: string; revenue: number }[];
}

export function TopCustomersChart({ data }: TopCustomersChartProps) {
    return (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-lg overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Top Partners</CardTitle>
                        <p className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5 uppercase">Revenue contribution by client</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-8">
                <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                            barSize={16}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} opacity={0.5} />
                            <XAxis
                                type="number"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: 600 }}
                                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                            />
                            <YAxis
                                dataKey="name"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: "#475569", fontWeight: 700 }}
                                width={120}
                            />
                            <Tooltip
                                cursor={{ fill: "#F1F5F9", opacity: 0.5 }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-slate-900 border border-slate-700 px-3 py-2 rounded shadow-xl">
                                                <p className="text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-widest leading-none">
                                                    {payload[0].payload.name}
                                                </p>
                                                <p className="text-sm font-bold text-blue-400 leading-none">
                                                    {formatCurrency(Number(payload[0].value))}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar
                                dataKey="revenue"
                                fill="#3B82F6"
                                radius={[0, 4, 4, 0]}
                                animationDuration={1000}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
