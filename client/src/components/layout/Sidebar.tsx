import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Briefcase, 
  History, 
  ListTodo, 
  Settings,
  Bot,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Workspaces', href: '/workspaces', icon: Briefcase },
  { name: 'Recent Meetings', href: '/meetings', icon: History },
  { name: 'Action Items', href: '/action-items', icon: ListTodo },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="hidden md:flex flex-col w-64 border-r border-border/40 bg-card/30 backdrop-blur-xl h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-border/40 shrink-0">
        <Link to="/dashboard" className="flex items-center gap-2 group cursor-pointer transition-opacity hover:opacity-80">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">Co-pilot</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
          Main Menu
        </div>
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/40 space-y-4 shrink-0">
        <div className="px-2">
          <a href="/extension.zip" download="Meeting-Copilot-Extension.zip" className="w-full">
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md border-0 transition-all hover:scale-[1.02]"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Extension
            </Button>
          </a>
        </div>
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            location.pathname.startsWith('/settings')
              ? "bg-primary/10 text-primary shadow-sm" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </div>
  );
}
