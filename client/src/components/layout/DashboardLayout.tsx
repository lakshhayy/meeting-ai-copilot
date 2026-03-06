import { ReactNode } from "react";
import { Navbar } from "./Navbar";

interface DashboardLayoutProps {
  children: ReactNode;
  workspaceName?: string;
}

export function DashboardLayout({ children, workspaceName }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-background">
      <Navbar workspaceName={workspaceName} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>
    </div>
  );
}
