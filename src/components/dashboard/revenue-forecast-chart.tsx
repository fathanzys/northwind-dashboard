"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/hooks/use-currency";
import {
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface DataPoint {
    year: string;
    revenue?: number;
    forecastRevenue?: number;
    upper?: number;
    lower?: number;
    predicted: boolean;
}

interface RevenueForecastChartProps {
    historical: { year: string; revenue: number; predicted: boolean }[];
    forecast: {
        year: string;
        revenue: number;
        predicted: boolean;
        upper: number;
        lower: number;
    }[];
}

export function RevenueForecastChart({ historical, forecast }: RevenueForecastChartProps) {
    const { formatValue } = useCurrency();

    // Merge historical + forecast into a single timeline
    const lastHist = historical[historical.length - 1];

    const combined: DataPoint[] = [
        ...historical.map((h) => ({
            year: h.year,
            revenue: h.revenue,
            predicted: false,
        })),
        // Bridge point: connect historical line to forecast line seamlessly
        {
            year: lastHist?.year ?? "",
            revenue: lastHist?.revenue,
            forecastRevenue: lastHist?.revenue,
            upper: lastHist?.revenue,
            lower: lastHist?.revenue,
            predicted: false,
        },
        ...forecast.map((f) => ({
            year: f.year,
            forecastRevenue: f.revenue,
            upper: f.upper,
            lower: f.lower,
            predicted: true,
        })),
    ];

    const splitYear = lastHist?.year;
    const formatYAxis = (v: number) => `$${(v / 1000).toFixed(0)}k`;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;
        const isPredicted = combined.find((d) => d.year === label)?.predicted ?? false;
        return (
            <div className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg shadow-2xl">
                <p className="text-[9px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
                    {label}{" "}
                    {isPredicted && (
                        <span className="text-emerald-400 ml-1">PREDICTED</span>
                    )}
                </p>
                {payload.map((p: any) =>
                    p.value != null ? (
                        <p key={p.dataKey} className="text-sm font-bold leading-none" style={{ color: p.color }}>
                            {p.name}: {formatValue(Number(p.value))}
                        </p>
                    ) : null
                )}
            </div>
        );
    };

    return (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-lg overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30">
                        <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                            Revenue Forecast
                        </CardTitle>
                        <p className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5 uppercase">
                            Historical + Predicted Trend · Linear Regression
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-8">
                {/* Legend */}
                <div className="flex items-center gap-6 mb-6 px-2">
                    <div className="flex items-center gap-2">
                        <div className="h-0.5 w-6 bg-blue-500 rounded" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Actual</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-0.5 w-6 bg-emerald-500 rounded" style={{ borderBottom: "2px dashed #10B981", height: 0 }} />
                        <div className="h-0.5 w-6 border-b-2 border-dashed border-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Predicted</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-6 bg-emerald-200/40 dark:bg-emerald-900/30 rounded" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">±10% Band</span>
                    </div>
                </div>

                <div className="h-[360px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={combined} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="historicalGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.12} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.04} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} opacity={0.5} />
                            <XAxis
                                dataKey="year"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: 600 }}
                                tickFormatter={formatYAxis}
                                width={56}
                            />
                            <Tooltip content={<CustomTooltip />} />

                            {/* NOW divider */}
                            {splitYear && (
                                <ReferenceLine
                                    x={splitYear}
                                    stroke="#94A3B8"
                                    strokeDasharray="4 4"
                                    strokeWidth={1.5}
                                    label={{
                                        value: "NOW",
                                        position: "insideTopRight",
                                        fontSize: 9,
                                        fill: "#94A3B8",
                                        fontWeight: 700,
                                    }}
                                />
                            )}

                            {/* Confidence band upper */}
                            <Area
                                type="monotone"
                                dataKey="upper"
                                stroke="transparent"
                                fill="url(#bandGrad)"
                                animationDuration={800}
                                legendType="none"
                                name="Upper Bound"
                            />
                            {/* Band lower (cuts out middle) */}
                            <Area
                                type="monotone"
                                dataKey="lower"
                                stroke="transparent"
                                fill="white"
                                fillOpacity={0.6}
                                animationDuration={800}
                                legendType="none"
                                name="Lower Bound"
                            />

                            {/* Historical area */}
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#3B82F6"
                                strokeWidth={2.5}
                                fill="url(#historicalGrad)"
                                animationDuration={900}
                                name="Actual Revenue"
                                dot={{ r: 5, fill: "#3B82F6", stroke: "white", strokeWidth: 2 }}
                                activeDot={{ r: 7, strokeWidth: 0 }}
                            />

                            {/* Forecast dashed line */}
                            <Line
                                type="monotone"
                                dataKey="forecastRevenue"
                                stroke="#10B981"
                                strokeWidth={2.5}
                                strokeDasharray="6 4"
                                animationDuration={1100}
                                name="Predicted Revenue"
                                dot={{ r: 4, fill: "#10B981", stroke: "white", strokeWidth: 2 }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                <p className="text-[9px] text-slate-400 font-medium mt-4 text-center uppercase tracking-wider">
                    * Predictions based on linear regression of historical annual revenue. For indicative purposes only.
                </p>
            </CardContent>
        </Card>
    );
}
