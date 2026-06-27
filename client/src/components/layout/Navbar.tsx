import { UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { Bot, ChevronRight, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavbarProps {
  workspaceName?: string;
}

export function Navbar({ workspaceName }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full glass-nav backdrop-blur-xl bg-background/80 border-b border-border/40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            {/* Mobile menu button (placeholder) */}
            <button className="md:hidden p-2 -ml-2 mr-2 text-muted-foreground hover:text-foreground">
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo (Visible only on mobile now, as sidebar has it on desktop) */}
            <Link to="/dashboard" className="md:hidden flex items-center gap-2 group cursor-pointer transition-opacity hover:opacity-80">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <span className="font-display font-semibold tracking-tight">Co-pilot</span>
            </Link>
            
            {/* Breadcrumbs */}
            {workspaceName && (
              <div className="hidden sm:flex items-center">
                <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Workspaces
                </Link>
                <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
                <span className="font-medium text-sm text-foreground">
                  {workspaceName}
                </span>
              </div>
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