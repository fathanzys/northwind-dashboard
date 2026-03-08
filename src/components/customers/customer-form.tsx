"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Customer } from "@/types";
import { useEffect } from "react";

const customerSchema = z.object({
    CustomerID: z.string().min(1, "Required").max(5, "Max 5 characters").toUpperCase(),
    CompanyName: z.string().min(1, "Required"),
    ContactName: z.string().optional(),
    ContactTitle: z.string().optional(),
    Address: z.string().optional(),
    City: z.string().optional(),
    Region: z.string().optional(),
    PostalCode: z.string().optional(),
    Country: z.string().optional(),
    Phone: z.string().optional(),
    Fax: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer?: Customer | null;
    onSubmit: (data: CustomerFormData) => Promise<void>;
}

export function CustomerForm({ open, onOpenChange, customer, onSubmit }: CustomerFormProps) {
    const isEdit = !!customer;
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            CustomerID: "",
            CompanyName: "",
            ContactName: "",
            ContactTitle: "",
            Address: "",
            City: "",
            Region: "",
            PostalCode: "",
            Country: "",
            Phone: "",
            Fax: "",
        },
    });

    useEffect(() => {
        if (customer) {
            reset({
                CustomerID: customer.CustomerID,
                CompanyName: customer.CompanyName,
                ContactName: customer.ContactName || "",
                ContactTitle: customer.ContactTitle || "",
                Address: customer.Address || "",
                City: customer.City || "",
                Region: customer.Region || "",
                PostalCode: customer.PostalCode || "",
                Country: customer.Country || "",
                Phone: customer.Phone || "",
                Fax: customer.Fax || "",
            });
        } else {
            reset({
                CustomerID: "",
                CompanyName: "",
                ContactName: "",
                ContactTitle: "",
                Address: "",
                City: "",
                Region: "",
                PostalCode: "",
                Country: "",
                Phone: "",
                Fax: "",
            });
        }
    }, [customer, reset]);

    const handleFormSubmit = async (data: CustomerFormData) => {
        await onSubmit(data);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Customer" : "New Customer"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="CustomerID">Customer ID *</Label>
                            <Input
                                id="CustomerID"
                                {...register("CustomerID")}
                                disabled={isEdit}
                                className="uppercase"
                                placeholder="e.g. ALFKI"
                            />
                            {errors.CustomerID && (
                                <p className="text-sm text-destructive">{errors.CustomerID.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="CompanyName">Company Name *</Label>
                            <Input id="CompanyName" {...register("CompanyName")} placeholder="Company name" />
                            {errors.CompanyName && (
                                <p className="text-sm text-destructive">{errors.CompanyName.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ContactName">Contact Name</Label>
                            <Input id="ContactName" {...register("ContactName")} placeholder="Contact person" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ContactTitle">Contact Title</Label>
                            <Input id="ContactTitle" {...register("ContactTitle")} placeholder="Title" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="Address">Address</Label>
                        <Input id="Address" {...register("Address")} placeholder="Street address" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="City">City</Label>
                            <Input id="City" {...register("City")} placeholder="City" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="Region">Region</Label>
                            <Input id="Region" {...register("Region")} placeholder="Region" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="PostalCode">Postal Code</Label>
                            <Input id="PostalCode" {...register("PostalCode")} placeholder="Postal code" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="Country">Country</Label>
                            <Input id="Country" {...register("Country")} placeholder="Country" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="Phone">Phone</Label>
                            <Input id="Phone" {...register("Phone")} placeholder="Phone number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="Fax">Fax</Label>
                            <Input id="Fax" {...register("Fax")} placeholder="Fax number" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
