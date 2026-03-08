"use client";

import { useState, useCallback } from "react";
import { Product, ApiResponse } from "@/types";
import { toast } from "sonner";

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 });

    const fetchProducts = useCallback(
        async (params?: { page?: number; limit?: number; search?: string; categoryId?: string; sortBy?: string; sortOrder?: string }) => {
            setLoading(true);
            try {
                const query = new URLSearchParams();
                if (params?.page) query.set("page", String(params.page));
                if (params?.limit) query.set("limit", String(params.limit));
                if (params?.search) query.set("search", params.search);
                if (params?.categoryId) query.set("categoryId", params.categoryId);
                if (params?.sortBy) query.set("sortBy", params.sortBy);
                if (params?.sortOrder) query.set("sortOrder", params.sortOrder);

                const res = await fetch(`/api/products?${query.toString()}`);
                const json: ApiResponse<Product[]> = await res.json();
                if (json.error) throw new Error(json.error);
                setProducts(json.data || []);
                if (json.meta) setMeta(json.meta);
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to fetch products");
            } finally {
                setLoading(false);
            }
        }, []
    );

    const createProduct = async (data: any) => {
        const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        toast.success("Product created successfully");
        return json.data;
    };

    const updateProduct = async (id: number, data: any) => {
        const res = await fetch(`/api/products/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        toast.success("Product updated successfully");
        return json.data;
    };

    const deleteProduct = async (id: number) => {
        const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        toast.success("Product deleted successfully");
    };

    return { products, loading, meta, fetchProducts, createProduct, updateProduct, deleteProduct };
}
