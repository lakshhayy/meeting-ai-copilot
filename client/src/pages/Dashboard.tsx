import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WorkspaceCard } from "@/components/WorkspaceCard";
import { useWorkspaces, useAllMeetings, useAllActionItems } from "@/hooks/use-workspaces";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Briefcase, AudioLines, CheckCircle2, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: workspaces, isLoading: loadingWorkspaces } = useWorkspaces();
  const { data: meetings } = useAllMeetings();
  const { data: actionItems } = useAllActionItems();

  const totalWorkspaces = workspaces?.length || 0;
  const totalMeetings = meetings?.length || 0;
  const pendingTasks = actionItems?.filter((i: any) => i.item.status !== "done").length || 0;

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">Welcome back! Here's what's happening across your teams.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/create-workspace">
            <Button variant="outline" className="shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Workspace
            </Button>
          </Link>
          <Button className="shadow-md bg-primary hover:bg-primary/90 transition-transform hover:scale-105">
            <Upload className="w-4 h-4 mr-2" /> Upload Audio
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <MetricCard 
          title="Active Workspaces" 
          value={totalWorkspaces} 
          icon={Briefcase}
        />
        <MetricCard 
          title="Meetings Processed" 
          value={totalMeetings} 
          icon={AudioLines}
          trend="+2"
          trendUp={true}
        />
        <MetricCard 
          title="Action Items Pending" 
          value={pendingTasks} 
          icon={CheckCircle2}
        />
      </div>

      {/* Quick Access Workspaces */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-semibold">Your Workspaces</h2>
          <Link to="/workspaces" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        
        {loadingWorkspaces ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-card p-6 h-[180px]">
                <Skeleton className="h-full w-full" />
              </div>
            ))}
          </div>
        ) : workspaces?.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-border rounded-2xl bg-card/20">
            <h3 className="text-lg font-medium mb-2">No workspaces found</h3>
            <p className="text-muted-foreground text-sm mb-4">Create your first workspace to start analyzing meetings.</p>
            <Link to="/create-workspace">
              <Button size="sm">Create Workspace</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workspaces?.slice(0, 4).map((ws) => (
              <WorkspaceCard key={ws.id} workspace={ws} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity Feed */}
      <RecentActivity />
      
    </DashboardLayout>
  );
}