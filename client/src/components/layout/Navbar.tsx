import { UserButton } from "@clerk/clerk-react";
import { Link } from "wouter";
import { Bot, ChevronRight } from "lucide-react";

interface NavbarProps {
  workspaceName?: string;
}

export function Navbar({ workspaceName }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2 group cursor-pointer transition-opacity hover:opacity-80">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
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
          
          <div className="flex items-center gap-4">
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 shadow-sm"
                }
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
