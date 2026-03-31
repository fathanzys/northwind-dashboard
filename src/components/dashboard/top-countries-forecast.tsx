"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/hooks/use-currency";
import { Globe, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
    LineChart,
    Line,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

interface CountryData {
    country: string;
    totalRevenue: number;
    forecastRevenue: number;
    trendPct: number;
    historical: { year: string; revenue: number }[];
}

interface TopCountriesForecastProps {
    forecastYear: string;
    countries: CountryData[];
}

const COUNTRY_FLAGS: Record<string, string> = {
    USA: "🇺🇸", Germany: "🇩🇪", UK: "🇬🇧", France: "🇫🇷", Brazil: "🇧🇷",
    Canada: "🇨🇦", Austria: "🇦🇹", Ireland: "🇮🇪", Mexico: "🇲🇽", Sweden: "🇸🇪",
    Switzerland: "🇨🇭", Italy: "🇮🇹", Spain: "🇪🇸", Argentina: "🇦🇷", Denmark: "🇩🇰",
    Finland: "🇫🇮", Norway: "🇳🇴", Portugal: "🇵🇹", Belgium: "🇧🇪", Netherlands: "🇳🇱",
    Poland: "🇵🇱", Venezuela: "🇻🇪",
};

const RANK_BADGES = ["🥇", "🥈", "🥉"];

function TrendBadge({ pct }: { pct: number }) {
    if (pct > 2)
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                <TrendingUp className="h-3 w-3" />+{pct.toFixed(1)}%
            </span>
        );
    if (pct < -2)
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                <TrendingDown className="h-3 w-3" />{pct.toFixed(1)}%
            </span>
        );
    return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            <Minus className="h-3 w-3" />Stable
        </span>
    );
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
    const points = data.map((v, i) => ({ i, v }));
    return (
        <ResponsiveContainer width="100%" height={40}>
            <LineChart data={points}>
                <Line
                    type="monotone"
                    dataKey="v"
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                />
                <Tooltip
                    content={() => null}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

export function TopCountriesForecast({ forecastYear, countries }: TopCountriesForecastProps) {
    const { formatValue } = useCurrency();

    const CARD_STYLES = [
        "border-amber-200 dark:border-amber-700/40 bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/10 dark:to-slate-900",
        "border-slate-300 dark:border-slate-600/50 bg-gradient-to-br from-slate-100 to-white dark:from-slate-800/50 dark:to-slate-900",
        "border-orange-200 dark:border-orange-700/40 bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/10 dark:to-slate-900",
    ];

    return (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-lg overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30">
                        <Globe className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                            Top Countries Forecast
                        </CardTitle>
                        <p className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5 uppercase">
                            Predicted Revenue Leaders · {forecastYear}
                        </p>
                    </div>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700/30">
                    <span className="text-[10px] font-bold text-violet-700 dark:text-violet-300 uppercase tracking-widest">
                        {forecastYear} Projected
                    </span>
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {countries.map((c, i) => {
                        const flag = COUNTRY_FLAGS[c.country] ?? "🌍";
                        const sparkData = c.historical.map((h) => h.revenue);
                        const isTop3 = i < 3;
                        const sparkColor = isTop3 ? "#8B5CF6" : "#94A3B8";
                        const cardStyle = CARD_STYLES[i] ?? "border-slate-200 dark:border-slate-700/30 bg-white dark:bg-slate-900";

                        return (
                            <div
                                key={c.country}
                                className={`relative rounded-lg border p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${cardStyle}`}
                            >
                                {/* Rank badge top-right */}
                                <div className="absolute top-3 right-3 text-lg leading-none select-none">
                                    {RANK_BADGES[i] ?? (
                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                            #{i + 1}
                                        </span>
                                    )}
                                </div>

                                {/* Country header */}
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xl leading-none">{flag}</span>
                                    <div>
                                        <p className={`text-xs uppercase tracking-tight ${isTop3 ? "font-extrabold text-slate-900 dark:text-white" : "font-bold text-slate-700 dark:text-slate-300"}`}>
                                            {c.country}
                                        </p>
                                        <div className="mt-0.5">
                                            <TrendBadge pct={c.trendPct} />
                                        </div>
                                    </div>
                                </div>

                                {/* Sparkline */}
                                <div className="mb-2 opacity-80">
                                    <MiniSparkline data={sparkData} color={sparkColor} />
                                </div>

                                {/* Revenue row */}
                                <div className="flex items-end justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                                    <div>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Historical Total</p>
                                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5">
                                            {formatValue(c.totalRevenue)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{forecastYear} Forecast</p>
                                        <p className={`text-sm font-extrabold mt-0.5 ${isTop3 ? "text-violet-600 dark:text-violet-400" : "text-slate-700 dark:text-slate-200"}`}>
                                            {formatValue(c.forecastRevenue)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <p className="text-[9px] text-slate-400 font-medium mt-5 text-center uppercase tracking-wider">
                    * Forecasts are linear regression estimates based on historical annual revenue. Indicative only.
                </p>
            </CardContent>
        </Card>
    );
}
