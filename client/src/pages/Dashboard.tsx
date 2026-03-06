import { Plus, Briefcase, Search } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WorkspaceCard } from "@/components/WorkspaceCard";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useState } from "react";

export default function Dashboard() {
  const { data: workspaces, isLoading } = useWorkspaces();
  const [search, setSearch] = useState("");

  const filteredWorkspaces = workspaces?.filter(ws => 
    ws.name.toLowerCase().includes(search.toLowerCase()) || 
    ws.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold">Your Workspaces</h1>
          <p className="text-muted-foreground mt-1">Manage your teams and meeting contexts.</p>
        </div>
        <Link href="/create-workspace">
          <Button className="shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Workspace
          </Button>
        </Link>
      </div>

      <div className="mb-8 relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Search workspaces..." 
          className="pl-9 bg-card shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-card p-6 h-[140px] flex flex-col justify-between">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
              <Skeleton className="h-4 w-1/4 mt-auto" />
            </div>
          ))}
        </div>
      ) : filteredWorkspaces?.length === 0 ? (
        <div className="text-center py-20 px-4 border-2 border-dashed border-border rounded-2xl bg-card/50">
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
            <Briefcase className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-display font-semibold mb-2">No workspaces found</h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">
            {search ? "No workspaces match your search criteria." : "Create your first workspace to start analyzing meetings with AI."}
          </p>
          {!search && (
            <Link href="/create-workspace">
              <Button>Create Workspace</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkspaces?.map((ws) => (
            <WorkspaceCard key={ws.id} workspace={ws} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
