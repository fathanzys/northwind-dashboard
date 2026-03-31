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
        const targetYearParam = searchParams.get("targetYear"); // year user wants to forecast to

        // Fetch full historical revenue
        const annualRevenue = await prisma.$queryRaw<
            { year: string; revenue: number }[]
        >`
      SELECT 
        TO_CHAR(o."OrderDate", 'YYYY') as year,
        COALESCE(SUM(od."UnitPrice" * od."Quantity" * (1 - od."Discount")), 0)::float as revenue
      FROM "Orders" o
      JOIN "OrderDetails" od ON o."OrderID" = od."OrderID"
      WHERE o."OrderDate" IS NOT NULL
      GROUP BY TO_CHAR(o."OrderDate", 'YYYY')
      ORDER BY year ASC
    `;

        if (annualRevenue.length === 0) {
            return NextResponse.json({ historical: [], forecast: [], forecastYears: [] });
        }

        const firstYear = parseInt(annualRevenue[0].year);
        const lastHistoricalYear = parseInt(annualRevenue[annualRevenue.length - 1].year);

        // Build available forecast years: lastYear+1 to lastYear+10
        const forecastYears = Array.from({ length: 10 }, (_, i) =>
            String(lastHistoricalYear + i + 1)
        );

        // Target year to forecast up to (default: +3 years)
        const targetYear = targetYearParam
            ? parseInt(targetYearParam)
            : lastHistoricalYear + 3;

        // Regression on all historical data
        const points = annualRevenue.map((r) => ({
            x: parseInt(r.year) - firstYear,
            y: r.revenue,
        }));
        const { slope, intercept } = linearRegression(points);

        // Generate forecast from lastHistoricalYear+1 up to targetYear
        const numForecastYears = Math.max(1, targetYear - lastHistoricalYear);
        const forecast = Array.from({ length: numForecastYears }, (_, i) => {
            const yr = lastHistoricalYear + i + 1;
            const x = yr - firstYear;
            const predicted = Math.max(0, slope * x + intercept);
            return {
                year: String(yr),
                revenue: Math.round(predicted),
                predicted: true,
                upper: Math.round(predicted * 1.1),
                lower: Math.round(predicted * 0.9),
            };
        });

        return NextResponse.json({
            historical: annualRevenue.map((r) => ({
                year: r.year,
                revenue: Math.round(r.revenue),
                predicted: false,
            })),
            forecast,
            forecastYears, // e.g. ["1997","1998",...,"2006"]
        });
    } catch (error: any) {
        console.error("Revenue prediction error:", error);
        return NextResponse.json(
            { error: "Failed to generate revenue forecast", details: error?.message },
            { status: 500 }
        );
    }
}
