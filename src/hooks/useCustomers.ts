"use client";

import { useState, useCallback } from "react";
import { Customer, ApiResponse } from "@/types";
import { toast } from "sonner";

export function useCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 });

    const fetchCustomers = useCallback(
        async (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }) => {
            setLoading(true);
            try {
                const query = new URLSearchParams();
                if (params?.page) query.set("page", String(params.page));
                if (params?.limit) query.set("limit", String(params.limit));
                if (params?.search) query.set("search", params.search);
                if (params?.sortBy) query.set("sortBy", params.sortBy);
                if (params?.sortOrder) query.set("sortOrder", params.sortOrder);

                const res = await fetch(`/api/customers?${query.toString()}`);
                const json: ApiResponse<Customer[]> = await res.json();
                if (json.error) throw new Error(json.error);
                setCustomers(json.data || []);
                if (json.meta) setMeta(json.meta);
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to fetch customers");
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const createCustomer = async (data: Partial<Customer>) => {
        const res = await fetch("/api/customers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        toast.success("Customer created successfully");
        return json.data;
    };

    const updateCustomer = async (id: string, data: Partial<Customer>) => {
        const res = await fetch(`/api/customers/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        toast.success("Customer updated successfully");
        return json.data;
    };

    const deleteCustomer = async (id: string) => {
        const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        toast.success("Customer deleted successfully");
    };

    return { customers, loading, meta, fetchCustomers, createCustomer, updateCustomer, deleteCustomer };
}
