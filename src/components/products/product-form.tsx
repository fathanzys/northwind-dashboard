"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Product, Category } from "@/types";

const productSchema = z.object({
    ProductName: z.string().min(1, "Required"),
    CategoryID: z.string().optional(),
    SupplierID: z.string().optional(),
    QuantityPerUnit: z.string().optional(),
    UnitPrice: z.string().optional(),
    UnitsInStock: z.string().optional(),
    UnitsOnOrder: z.string().optional(),
    ReorderLevel: z.string().optional(),
    Discontinued: z.boolean().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: Product | null;
    onSubmit: (data: ProductFormData) => Promise<void>;
}

export function ProductForm({ open, onOpenChange, product, onSubmit }: ProductFormProps) {
    const isEdit = !!product;
    const [categories, setCategories] = useState<Category[]>([]);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: { Discontinued: false }
    });

    const watchCategoryId = watch("CategoryID");

    useEffect(() => {
        fetch("/api/categories").then(r => r.json()).then(j => setCategories(j.data || [])).catch(() => { });
    }, []);

    useEffect(() => {
        if (product) {
            reset({
                ProductName: product.ProductName || "",
                CategoryID: product.CategoryID?.toString() || "",
                SupplierID: product.SupplierID?.toString() || "",
                QuantityPerUnit: product.QuantityPerUnit || "",
                UnitPrice: product.UnitPrice?.toString() || "",
                UnitsInStock: product.UnitsInStock?.toString() || "0",
                UnitsOnOrder: product.UnitsOnOrder?.toString() || "0",
                ReorderLevel: product.ReorderLevel?.toString() || "0",
                Discontinued: !!product.Discontinued,
            });
        } else {
            reset({ ProductName: "", CategoryID: "", SupplierID: "", QuantityPerUnit: "", UnitPrice: "", UnitsInStock: "0", UnitsOnOrder: "0", ReorderLevel: "0", Discontinued: false });
        }
    }, [product, reset]);

    const handleFormSubmit: SubmitHandler<ProductFormData> = async (data) => { await onSubmit(data); onOpenChange(false); };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{isEdit ? "Edit Product" : "New Product"}</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Product Name *</Label>
                        <Input {...register("ProductName")} placeholder="Product name" />
                        {errors.ProductName && <p className="text-sm text-destructive">{errors.ProductName.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            {/* eslint-disable-next-line react-hooks/incompatible-library */}
                            <Select value={watchCategoryId || ""} onValueChange={(v) => setValue("CategoryID", v ?? undefined)}>
                                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                <SelectContent>
                                    {categories.map((c: Category) => (
                                        <SelectItem key={c.CategoryID} value={c.CategoryID.toString()}>{c.CategoryName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Quantity Per Unit</Label>
                            <Input {...register("QuantityPerUnit")} placeholder="e.g. 10 boxes" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Unit Price</Label><Input type="number" step="0.01" {...register("UnitPrice")} placeholder="0.00" /></div>
                        <div className="space-y-2"><Label>Units In Stock</Label><Input type="number" {...register("UnitsInStock")} placeholder="0" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Units On Order</Label><Input type="number" {...register("UnitsOnOrder")} placeholder="0" /></div>
                        <div className="space-y-2"><Label>Reorder Level</Label><Input type="number" {...register("ReorderLevel")} placeholder="0" /></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="discontinued" {...register("Discontinued")} className="h-4 w-4" />
                        <Label htmlFor="discontinued">Discontinued</Label>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
