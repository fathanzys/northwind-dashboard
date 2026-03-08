"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Employee } from "@/types";

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        // eslint-disable-next-line
        setLoading(true);
        const query = search ? `?search=${encodeURIComponent(search)}` : "";
        fetch(`/api/employees${query}`)
            .then((r) => r.json())
            .then((j) => setEmployees(j.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [search]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Employees</h1>
                <p className="text-muted-foreground">Team members and sales performance</p>
            </div>

            <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                        </div>
                        <Badge variant="secondary">{employees.length} employees</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>City</TableHead>
                                        <TableHead>Hire Date</TableHead>
                                        <TableHead className="w-[50px]" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {employees.map((e: Employee) => (
                                        <TableRow key={e.EmployeeID} className="hover:bg-accent/50">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm">
                                                        {e.FirstName?.[0]}{e.LastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{e.FirstName} {e.LastName}</p>
                                                        <p className="text-xs text-muted-foreground">{e.TitleOfCourtesy}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{e.Title || "-"}</TableCell>
                                            <TableCell>{e.City || "-"}</TableCell>
                                            <TableCell>{formatDate(e.HireDate)}</TableCell>
                                            <TableCell>
                                                <Link href={`/employees/${e.EmployeeID}`} className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8" })}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {employees.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No employees found</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
