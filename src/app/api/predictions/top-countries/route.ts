import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function linearRegression(points: { x: number; y: number }[]) {
    const n = points.length;
    if (n < 2) return { slope: 0, intercept: points[0]?.y ?? 0 };
    const sumX = points.reduce((s, p) => s + p.x, 0);
    const sumY = points.reduce((s, p) => s + p.y, 0);
    const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
    const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const targetYearParam = searchParams.get("targetYear");

        // Fetch all country-year revenue rows (full history)
        const allRows = await prisma.$queryRaw<
            { country: string; year: string; revenue: number }[]
        >`
      SELECT 
        c."Country" as country,
        TO_CHAR(o."OrderDate", 'YYYY') as year,
        COALESCE(SUM(od."UnitPrice" * od."Quantity" * (1 - od."Discount")), 0)::float as revenue
      FROM "Customers" c
      JOIN "Orders" o ON c."CustomerID" = o."CustomerID"
      JOIN "OrderDetails" od ON o."OrderID" = od."OrderID"
      WHERE o."OrderDate" IS NOT NULL AND c."Country" IS NOT NULL
      GROUP BY c."Country", TO_CHAR(o."OrderDate", 'YYYY')
      ORDER BY c."Country", year ASC
    `;

        const historicalYears = [...new Set(allRows.map((r) => r.year))].sort();
        const firstYear = parseInt(historicalYears[0] ?? "1994");
        const lastHistoricalYear = parseInt(historicalYears[historicalYears.length - 1] ?? "1996");

        // Target forecast year (default: next year)
        const targetYear = targetYearParam
            ? parseInt(targetYearParam)
            : lastHistoricalYear + 1;

        const forecastYear = String(targetYear);

        // Group rows by country
        const countryMap = new Map<string, { year: string; revenue: number }[]>();
        for (const row of allRows) {
            if (!countryMap.has(row.country)) countryMap.set(row.country, []);
            countryMap.get(row.country)!.push({
                year: row.year,
                revenue: Math.round(row.revenue),
            });
        }

        // Calculate forecast per country for the target year
        const countries = Array.from(countryMap.entries()).map(([country, history]) => {
            const totalRevenue = history.reduce((s, h) => s + h.revenue, 0);

            const points = history.map((h) => ({
                x: parseInt(h.year) - firstYear,
                y: h.revenue,
            }));
            const { slope, intercept } = linearRegression(points);

            // Forecast revenue at targetYear
            const xTarget = targetYear - firstYear;
            const forecastRevenue = Math.max(0, Math.round(slope * xTarget + intercept));

            const lastRevenue = history[history.length - 1]?.revenue ?? 1;
            const trendPct = lastRevenue > 0 ? (slope / lastRevenue) * 100 : 0;

            // Pad historical sparkline years
            const historyByYear: Record<string, number> = {};
            history.forEach((h) => (historyByYear[h.year] = h.revenue));
            const filledHistory = historicalYears.map((y) => ({
                year: y,
                revenue: historyByYear[y] ?? 0,
            }));

            return {
                country,
                totalRevenue,
                forecastRevenue,
                trendPct: parseFloat(trendPct.toFixed(1)),
                historical: filledHistory,
            };
        });

        const sorted = countries
            .sort((a, b) => b.forecastRevenue - a.forecastRevenue)
            .slice(0, 10);

        return NextResponse.json({
            forecastYear,
            countries: sorted,
        });
    } catch (error: any) {
        console.error("Top countries prediction error:", error);
        return NextResponse.json(
            { error: "Failed to generate country forecast", details: error?.message },
            { status: 500 }
        );
    }
}
