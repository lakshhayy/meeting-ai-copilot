import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

interface DashboardLayoutProps {
  children: ReactNode;
  workspaceName?: string;
}

export function DashboardLayout({ children, workspaceName }: DashboardLayoutProps) {
  const location = useLocation();
  
  return (
    <div className="flex min-h-screen bg-[#fcfcfc] dark:bg-background transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar workspaceName={workspaceName} />
        <AnimatePresence mode="wait">
          <motion.main 
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
