import { UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom"; // <-- Changed to react-router-dom
import { Bot, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavbarProps {
  workspaceName?: string;
}

export function Navbar({ workspaceName }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full glass-nav backdrop-blur-xl bg-background/60 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="flex items-center gap-2 group cursor-pointer transition-opacity hover:opacity-80"> {/* <-- Changed href to to */}
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <span className="font-display font-semibold text-lg tracking-tight">Co-pilot</span>
            </Link>
            
            {workspaceName && (
              <>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-2" />
                <span className="font-medium text-sm text-foreground ml-2">
                  {workspaceName}
                </span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 shadow-sm border border-border/50"
                }
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}