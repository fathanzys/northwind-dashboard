"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Search, Bell, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCurrency, Currency } from "@/hooks/use-currency";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
    const { theme, setTheme } = useTheme();
    const { currency, setCurrency } = useCurrency();

    const currencies: { label: string; value: Currency; symbol: string }[] = [
        { label: "US Dollar", value: "USD", symbol: "$" },
        { label: "Euro", value: "EUR", symbol: "€" },
        { label: "British Pound", value: "GBP", symbol: "£" },
    ];

    return (
        <header className="flex h-16 items-center justify-between px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] transition-all duration-300">
            <div className="flex flex-1 items-center gap-4">
                <div className="relative group hidden md:block w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input 
                        placeholder="Search system data..." 
                        className="pl-10 h-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm focus:ring-1 focus:ring-blue-500 transition-all rounded-md"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 p-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-600 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                        <Bell className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-600 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                        <Settings className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button variant="ghost" size="sm" className="h-8 gap-2 px-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-blue-600 font-black">
                                        {currencies.find(c => c.value === currency)?.symbol}
                                    </span>
                                    {currency}
                                </Button>
                            }
                        />
                        <DropdownMenuContent align="end" className="w-40">
                            {currencies.map((c) => (
                                <DropdownMenuItem 
                                    key={c.value} 
                                    onClick={() => setCurrency(c.value)}
                                    className="text-xs font-semibold gap-2"
                                >
                                    <span className="text-blue-600">{c.symbol}</span>
                                    {c.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-2" />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="h-8 w-8 text-slate-600 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}
