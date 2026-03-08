"use client";

import { useEffect, useState, useCallback } from "react";
import { useCustomers } from "@/hooks/useCustomers";
import { CustomerForm } from "@/components/customers/customer-form";
import { Customer } from "@/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Download, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/utils";
import Link from "next/link";

export default function CustomersPage() {
    const { customers, loading, meta, fetchCustomers, createCustomer, updateCustomer, deleteCustomer } = useCustomers();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [formOpen, setFormOpen] = useState(false);
    const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const loadData = useCallback(() => {
        fetchCustomers({ page, search, limit: 10, sortBy: "CompanyName", sortOrder: "asc" });
    }, [fetchCustomers, page, search]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleSearch = (val: string) => {
        setSearch(val);
        setPage(1);
    };

    const handleCreate = async (data: Partial<Customer>) => {
        try { await createCustomer(data); loadData(); } catch (e: any) { toast.error(e.message); throw e; }
    };

    const handleUpdate = async (data: Partial<Customer>) => {
        if (!editCustomer) return;
        try { await updateCustomer(editCustomer.CustomerID, data); setEditCustomer(null); loadData(); } catch (e: any) { toast.error(e.message); throw e; }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try { await deleteCustomer(deleteId); setDeleteId(null); loadData(); } catch (e: any) { toast.error(e.message); } finally { setDeleting(false); }
    };

    const handleExport = () => {
        downloadCSV(customers as unknown as Record<string, unknown>[], "customers");
        toast.success("CSV exported");
    };

    const totalPages = Math.ceil(meta.total / meta.limit);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Customers</h1>
                    <p className="text-muted-foreground">Manage your customer database</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
                    <Button onClick={() => { setEditCustomer(null); setFormOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Customer</Button>
                </div>
            </div>

            <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by company, country, or contact..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Badge variant="secondary">{meta.total} customers</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                    ) : (
                        <>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Company</TableHead>
                                            <TableHead>Contact</TableHead>
                                            <TableHead>City</TableHead>
                                            <TableHead>Country</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead className="w-[50px]" />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {customers.map((c) => (
                                            <TableRow key={c.CustomerID} className="hover:bg-accent/50">
                                                <TableCell className="font-mono text-sm">{c.CustomerID}</TableCell>
                                                <TableCell className="font-medium">{c.CompanyName}</TableCell>
                                                <TableCell>{c.ContactName || "-"}</TableCell>
                                                <TableCell>{c.City || "-"}</TableCell>
                                                <TableCell><Badge variant="outline">{c.Country || "-"}</Badge></TableCell>
                                                <TableCell className="text-sm">{c.Phone || "-"}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 border-0" })}>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>
                                                                <Link href={`/customers/${c.CustomerID}`} className="flex w-full items-center"><Eye className="h-4 w-4 mr-2" />View Details</Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => { setEditCustomer(c); setFormOpen(true); }}>
                                                                <Pencil className="h-4 w-4 mr-2" />Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(c.CustomerID)}>
                                                                <Trash2 className="h-4 w-4 mr-2" />Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {customers.length === 0 && (
                                            <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No customers found</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <p className="text-sm text-muted-foreground">
                                    Page {page} of {totalPages} ({meta.total} total)
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <CustomerForm
                open={formOpen}
                onOpenChange={(v) => { setFormOpen(v); if (!v) setEditCustomer(null); }}
                customer={editCustomer}
                onSubmit={editCustomer ? handleUpdate : handleCreate}
            />

            {/* Delete Confirmation */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Delete Customer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">Are you sure you want to delete customer <strong>{deleteId}</strong>? This action cannot be undone.</p>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</Button>
                                <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
