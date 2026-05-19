"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MoveRight, Lock, Mail, Loader2, Database } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        toast.error("Authentication Failed", {
          description: responseData.error || "Invalid credentials provided.",
        });
        return;
      }

      toast.success("Login Successful", {
        description: `Welcome back, ${responseData.user.name}`,
      });
      
      // Force refresh to update the server components (Middleware reading cookies)
      window.location.href = "/";
    } catch (error) {
      toast.error("Error", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[400px] p-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col items-center mb-8 gap-3 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 ring-1 ring-blue-500/50">
          <Database size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Northwind Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sign in to access the executive console
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl shadow-slate-200/20 dark:shadow-black/40">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                {...form.register("email")}
                type="email"
                placeholder="Ex: admin@northwind.com"
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm dark:text-white"
                disabled={isLoading}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                {...form.register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm dark:text-white"
                disabled={isLoading}
              />
            </div>
            {form.formState.errors.password && (
              <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors focus:ring-4 focus:ring-blue-500/20 disabled:opacity-70 mt-6"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Sign in to Dashboard <MoveRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Don't have an account?</span>
            <button 
                onClick={() => {
                  fetch("/api/auth/seed").then(r => r.json()).then(data => {
                      if(data.success) {
                        toast.success("Accounts generated!", { description: data.admin });
                      } else {
                        toast.error("Generation failed", { description: data.error });
                      }
                  })
                }} 
                className="text-blue-600 hover:underline px-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              Seed Users (Dev Admin)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
