"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LowStockProduct {
    ProductID: number;
    ProductName: string;
    UnitsInStock: number;
    ReorderLevel: number;
    CategoryName: string | null;
}

interface LowStockAlertProps {
    products: LowStockProduct[];
}

export function LowStockAlert({ products }: LowStockAlertProps) {
    return (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-lg overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Inventory Risk</CardTitle>
                        <p className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5 uppercase">Critical stock thresholds</p>
                    </div>
                </div>
                {products.length > 0 && (
                    <Badge className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800 text-[10px] font-bold h-5 px-2 rounded">
                        {products.length} ACTION REQUIRED
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {products.map((product) => {
                        const isCritical = product.UnitsInStock === 0;
                        return (
                            <div
                                key={product.ProductID}
                                className="group flex items-center justify-between p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            >
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight">{product.ProductName}</p>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                                        {product.CategoryName ?? "General Goods"}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="flex items-center gap-1.5 justify-end">
                                            <span className={cn(
                                                "text-sm font-bold tracking-tight",
                                                isCritical ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
                                            )}>
                                                {product.UnitsInStock}
                                            </span>
                                            <span className="text-[10px] font-medium text-slate-400">/ {product.ReorderLevel}</span>
                                        </div>
                                        <div className="mt-1 h-1 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className={cn(
                                                "h-full rounded-full transition-all duration-500",
                                                isCritical ? "bg-red-500 w-[10%]" : "bg-amber-500 w-[40%]"
                                            )} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {products.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                            <div className="p-3 rounded-full bg-emerald-50 dark:bg-emerald-900/20 mb-4 border border-emerald-100 dark:border-emerald-800">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Inventory Optimized</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">All stocks are above reorder thresholds</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// Helper to provide CN if not imported
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
