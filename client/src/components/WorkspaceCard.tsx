import { Users, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { type WorkspaceResponse } from "@shared/schema";

interface WorkspaceCardProps {
  workspace: WorkspaceResponse;
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  return (
    <Link href={`/workspace/${workspace.slug}`} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
      <Card className="h-full hover-elevate border-border/60 bg-card shadow-subtle transition-colors hover:border-primary/20 cursor-pointer">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-lg leading-none">
                {workspace.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {workspace.slug}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="w-4 h-4 mr-2" />
            {workspace.memberCount === 1 
              ? "1 member" 
              : `${workspace.memberCount || 0} members`}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
