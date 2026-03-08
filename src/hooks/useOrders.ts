"use client";

import { useState, useCallback } from "react";
import { Order, ApiResponse } from "@/types";
import { toast } from "sonner";

export function useOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 });

    const fetchOrders = useCallback(
        async (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }) => {
            setLoading(true);
            try {
                const query = new URLSearchParams();
                if (params?.page) query.set("page", String(params.page));
                if (params?.limit) query.set("limit", String(params.limit));
                if (params?.search) query.set("search", params.search);
                if (params?.sortBy) query.set("sortBy", params.sortBy);
                if (params?.sortOrder) query.set("sortOrder", params.sortOrder);

                const res = await fetch(`/api/orders?${query.toString()}`);
                const json: ApiResponse<Order[]> = await res.json();
                if (json.error) throw new Error(json.error);
                setOrders(json.data || []);
                if (json.meta) setMeta(json.meta);
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to fetch orders");
            } finally {
                setLoading(false);
            }
        }, []
    );

    const createOrder = async (data: any) => {
        const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        toast.success("Order created successfully");
        return json.data;
    };

    const deleteOrder = async (id: number) => {
        const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        toast.success("Order deleted successfully");
    };

    return { orders, loading, meta, fetchOrders, createOrder, deleteOrder };
}
