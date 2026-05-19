import { ThemeProvider } from "@/components/theme-provider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 items-center justify-center relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
            <div className="absolute top-[20%] -right-[10%] w-[40%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
        </div>
        <div className="z-10 w-full flex items-center justify-center">
            {children}
        </div>
    </div>
  );
}
