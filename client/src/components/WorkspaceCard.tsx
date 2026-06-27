import { Users, MoreVertical, Settings, Trash, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { type WorkspaceResponse } from "@shared/schema";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface WorkspaceCardProps {
  workspace: WorkspaceResponse;
}

// Helper to generate a deterministic gradient based on a string
function getGradient(str: string) {
  const colors = [
    "from-blue-500 to-indigo-500",
    "from-violet-500 to-fuchsia-500",
    "from-emerald-400 to-cyan-500",
    "from-rose-400 to-orange-500",
    "from-amber-400 to-pink-500",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const gradientClass = getGradient(workspace.name);

  return (
    <Card className="group relative overflow-hidden h-full border-border/50 bg-card/40 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Top Gradient Area */}
      <Link to={`/workspace/${workspace.slug}`} className="block">
        <div className={`h-24 w-full bg-gradient-to-br ${gradientClass} opacity-80 group-hover:opacity-100 transition-opacity`} />
      </Link>

      {/* Quick Actions Dropdown (Absolute top right) */}
      <div className="absolute top-3 right-3 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger className="p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors outline-none">
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserPlus className="w-4 h-4 mr-2" /> Invite
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-500">
              <Trash className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardContent className="p-5 pt-0 relative">
        {/* Floating Avatar */}
        <Link to={`/workspace/${workspace.slug}`} className="block">
          <div className="w-12 h-12 rounded-xl bg-background border-2 border-border shadow-sm flex items-center justify-center font-bold text-xl -mt-6 mb-3 relative z-10 text-foreground">
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          
          <h3 className="font-display font-semibold text-lg leading-tight truncate">
            {workspace.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 truncate">
            {workspace.slug}
          </p>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50">
            <div className="flex items-center text-xs font-medium text-muted-foreground">
              <Users className="w-4 h-4 mr-1.5" />
              {workspace.memberCount} member{workspace.memberCount !== 1 ? 's' : ''}
            </div>
            
            {/* Fake overlapping avatars for premium feel */}
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-background flex items-center justify-center text-[10px] text-blue-700 font-bold">L</div>
              {workspace.memberCount && workspace.memberCount > 1 && (
                <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-background flex items-center justify-center text-[10px] text-emerald-700 font-bold">M</div>
              )}
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}