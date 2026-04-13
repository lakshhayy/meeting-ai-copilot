import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

interface DashboardLayoutProps {
  children: ReactNode;
  workspaceName?: string;
}

export function DashboardLayout({ children, workspaceName }: DashboardLayoutProps) {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-background transition-colors duration-300">
      <Navbar workspaceName={workspaceName} />
      <AnimatePresence mode="wait">
        <motion.main 
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
