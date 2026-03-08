"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Package,
    ShoppingCart,
    UserCog,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Menu,
    LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/customers", label: "Customers", icon: Users },
    { href: "/products", label: "Products", icon: Package },
    { href: "/orders", label: "Orders", icon: ShoppingCart },
    { href: "/employees", label: "Employees", icon: UserCog },
    { href: "/reports", label: "Reports", icon: BarChart3 },
];

function NavContent({ collapsed, pathname }: { collapsed: boolean; pathname: string }) {
    return (
        <nav className="flex flex-col gap-1 px-3 py-4 text-slate-600 dark:text-slate-300">
            {navItems.map((item) => {
                const isActive = pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                            isActive
                                ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                                : "hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white text-slate-600 dark:text-slate-400"
                        )}
                    >
                        <item.icon className={cn(
                            "h-5 w-5 shrink-0 transition-colors",
                            isActive ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                        )} />
                        {!collapsed && <span>{item.label}</span>}
                    </Link>
                );
            })}
        </nav>
    );
}

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="relative h-full flex-col md:flex">
            {/* Mobile Trigger */}
            <div className="md:hidden p-4 absolute top-0 left-0 z-50">
                <Sheet>
                    <SheetTrigger
                        render={
                            <Button variant="ghost" size="icon" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                                <Menu className="h-6 w-6" />
                            </Button>
                        }
                    />
                    <SheetContent side="left" className="p-0 w-72 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 shadow-2xl">
                        <div className="flex h-20 items-center px-6 border-b border-slate-100 dark:border-slate-800/50">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-900/20">
                                <span className="text-xl font-bold text-white italic">N</span>
                            </div>
                            <div className="flex flex-col ml-3">
                                <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase">Northwind</span>
                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest leading-none">Solutions Group</span>
                            </div>
                        </div>
                        <ScrollArea className="h-[calc(100vh-5rem)]">
                            <NavContent collapsed={false} pathname={pathname} />
                        </ScrollArea>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden md:flex flex-col h-full bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 relative",
                    collapsed ? "w-20" : "w-64"
                )}
            >
                <div className="flex h-20 items-center px-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-900/20">
                        <span className="text-xl font-bold text-white italic">N</span>
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col ml-3 overflow-hidden">
                            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase truncate">Northwind</span>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest leading-none truncate">Solutions Group</span>
                        </div>
                    )}
                </div>

                <Button
                    onClick={() => setCollapsed(!collapsed)}
                    variant="secondary"
                    size="icon"
                    className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-slate-700 bg-[#1e293b] text-slate-400 hover:text-white shadow-lg z-50"
                >
                    {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                </Button>

                <ScrollArea className="flex-1">
                    <NavContent collapsed={collapsed} pathname={pathname} />
                </ScrollArea>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 mt-auto bg-slate-50/50 dark:bg-[#0f172a]/50 backdrop-blur-md">
                    <div className={cn("flex items-center gap-3 px-2", collapsed && "justify-center")}>
                        <div className="h-8 w-8 shrink-0 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                            <UserCog className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-1 flex-col overflow-hidden">
                                <p className="truncate text-xs font-bold text-slate-900 dark:text-white leading-none">Admin Executive</p>
                                <p className="truncate text-[10px] text-slate-500 font-medium mt-1">Strategic Operations</p>
                            </div>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-4 w-full justify-start text-slate-500 dark:text-slate-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-md py-5"
                    >
                        <LogOut className={cn("h-4 w-4 shrink-0", !collapsed && "mr-3")} />
                        {!collapsed && <span className="text-xs font-bold tracking-tight uppercase">Exit System</span>}
                    </Button>
                </div>
            </aside>
        </div>
    );
}
