"use client";

import { useEffect, useState } from "react";
import { RevenueForecastChart } from "@/components/dashboard/revenue-forecast-chart";
import { TopCountriesForecast } from "@/components/dashboard/top-countries-forecast";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Globe, BarChart2, Activity, ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RevenueData {
    historical: { year: string; revenue: number; predicted: boolean }[];
    forecast: { year: string; revenue: number; predicted: boolean; upper: number; lower: number }[];
    forecastYears: string[]; // e.g. ["1997","1998",...,"2006"]
}

interface CountriesData {
    forecastYear: string;
    countries: {
        country: string;
        totalRevenue: number;
        forecastRevenue: number;
        trendPct: number;
        historical: { year: string; revenue: number }[];
    }[];
}

function KPIBadge({
    icon: Icon,
    label,
    value,
    sub,
    color,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    sub: string;
    color: string;
}) {
    return (
        <div className="rounded-lg border p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-md ${color}`}>
                <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">{value}</p>
                <p className="text-[10px] text-slate-400 font-medium">{sub}</p>
            </div>
        </div>
    );
}

export default function PredictionsPage() {
    const [forecastYears, setForecastYears] = useState<string[]>([]);
    const [targetYear, setTargetYear] = useState<string>("");
    const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
    const [countriesData, setCountriesData] = useState<CountriesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data whenever targetYear changes
    useEffect(() => {
        setLoading(true);
        setError(null);

        const param = targetYear ? `?targetYear=${targetYear}` : "";

        Promise.all([
            fetch(`/api/predictions/revenue${param}`).then((r) => r.json()),
            fetch(`/api/predictions/top-countries${param}`).then((r) => r.json()),
        ])
            .then(([rev, ctry]) => {
                if (rev.error || ctry.error) {
                    setError(rev.error ?? ctry.error);
                } else {
                    setRevenueData(rev);
                    setCountriesData(ctry);

                    // Initialise dropdown years on first load
                    if (forecastYears.length === 0 && rev.forecastYears?.length) {
                        setForecastYears(rev.forecastYears);
                        // Default to 3 years out (index 2)
                        const defaultTarget = rev.forecastYears[2] ?? rev.forecastYears[0];
                        setTargetYear(defaultTarget);
                    }
                }
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetYear]);

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-56 rounded bg-slate-200 dark:bg-slate-800" />
                        <Skeleton className="h-4 w-80 rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                    <Skeleton className="h-10 w-40 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
                    ))}
                </div>
                <Skeleton className="h-[460px] rounded-lg bg-slate-200 dark:bg-slate-800" />
                <Skeleton className="h-[620px] rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
                <div className="p-4 rounded-full bg-red-50 dark:bg-red-900/10 border border-red-100">
                    <div className="h-12 w-12 text-red-500 flex items-center justify-center text-3xl font-bold">!</div>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Prediction Error</h2>
                <p className="text-sm text-slate-500 max-w-md">{error}</p>
            </div>
        );
    }

    if (!revenueData || !countriesData) return null;

    const lastHistorical = revenueData.historical[revenueData.historical.length - 1];
    const targetForecast = revenueData.forecast.find((f) => f.year === targetYear)
        ?? revenueData.forecast[revenueData.forecast.length - 1];
    const growthPct =
        lastHistorical && targetForecast
            ? (((targetForecast.revenue - lastHistorical.revenue) / lastHistorical.revenue) * 100).toFixed(1)
            : "—";
    const topCountry = countriesData.countries[0];
    const avgGrowth =
        countriesData.countries.length
            ? (
                countriesData.countries.reduce((s, c) => s + c.trendPct, 0) /
                countriesData.countries.length
              ).toFixed(1)
            : "—";

    // Years ago label for dropdown display
    const lastHistYear = lastHistorical ? parseInt(lastHistorical.year) : 0;
    const yearsAhead = targetYear ? parseInt(targetYear) - lastHistYear : 0;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Page Header + Forecast Year Picker */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="flex flex-col gap-1.5 border-l-4 border-emerald-500 dark:border-emerald-400 pl-6 py-1">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">
                        AI{" "}
                        <span className="text-emerald-600 dark:text-emerald-400 ml-2">Forecast</span>
                    </h1>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em]">
                        Northwind Global Operations · Predictive Intelligence
                    </p>
                </div>

                {/* Forecast Target Year Dropdown */}
                {forecastYears.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 pl-1">
                            Forecast Target Year
                        </p>
                        <div className="relative">
                            <select
                                value={targetYear}
                                onChange={(e) => setTargetYear(e.target.value)}
                                className="appearance-none h-11 pl-4 pr-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-sm transition-all min-w-[180px]"
                            >
                                {forecastYears.map((y) => {
                                    const n = parseInt(y) - lastHistYear;
                                    return (
                                        <option key={y} value={y}>
                                            {y} &nbsp;(+{n} yr{n !== 1 ? "s" : ""})
                                        </option>
                                    );
                                })}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        </div>
                    </div>
                )}
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 px-4 py-3">
                <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    Forecasting revenue and top markets{" "}
                    <strong>{yearsAhead} year{yearsAhead !== 1 ? "s" : ""} ahead</strong> to{" "}
                    <strong>{targetYear}</strong>, based on all available historical data.
                    Predictions use <strong>Linear Regression</strong> — for indicative purposes only.
                </p>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <KPIBadge
                    icon={TrendingUp}
                    label={`Revenue Forecast — ${targetYear}`}
                    value={targetForecast ? formatCurrency(targetForecast.revenue) : "—"}
                    sub={`${growthPct}% vs last historical year`}
                    color="bg-emerald-500"
                />
                <KPIBadge
                    icon={Globe}
                    label={`Top Country — ${countriesData.forecastYear}`}
                    value={topCountry?.country ?? "—"}
                    sub={topCountry ? formatCurrency(topCountry.forecastRevenue) + " projected" : "—"}
                    color="bg-violet-500"
                />
                <KPIBadge
                    icon={BarChart2}
                    label="Avg Market Growth"
                    value={`${avgGrowth}%`}
                    sub="Across top-10 countries (YoY slope)"
                    color="bg-blue-500"
                />
            </div>

            {/* Revenue Forecast Chart */}
            <RevenueForecastChart
                historical={revenueData.historical}
                forecast={revenueData.forecast}
            />

            {/* Top Countries Forecast */}
            <TopCountriesForecast
                forecastYear={countriesData.forecastYear}
                countries={countriesData.countries}
            />
        </div>
    );
}
