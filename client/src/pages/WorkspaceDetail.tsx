import { useParams } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useWorkspace } from "@/hooks/use-workspaces";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Video, Settings, Plus, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function WorkspaceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: workspace, isLoading, error } = useWorkspace(slug || "");

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex justify-between">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !workspace) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center">
          <h2 className="text-2xl font-bold">Workspace not found</h2>
          <p className="text-muted-foreground mt-2">The workspace you are looking for does not exist or you don't have access.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout workspaceName={workspace.name}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {workspace.name}
          </h1>
          <p className="text-muted-foreground flex items-center mt-1">
            <Badge variant="secondary" className="mr-2 font-mono rounded-md">/{workspace.slug}</Badge>
            Workspace Dashboard
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="shadow-sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button className="shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Meeting
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Meetings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold">Recent Meetings</h2>
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search transcripts..." className="pl-9 h-9" />
            </div>
          </div>
          
          {/* Empty State for meetings */}
          <Card className="border-dashed border-2 bg-card/50 shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary mb-4">
                <Video className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-display font-semibold mb-2">No meetings yet</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                Upload your first meeting recording to generate an AI summary and action items.
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Upload Recording
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Team Members */}
        <div className="space-y-6">
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <Users className="w-5 h-5 mr-2 text-primary" />
                Team Members
              </CardTitle>
              <CardDescription>People with access to this workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workspace.members?.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage src={member.user.avatarUrl || ""} />
                        <AvatarFallback className="bg-primary/5 text-primary">
                          {member.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">{member.user.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{member.user.email}</p>
                      </div>
                    </div>
                    {member.role === 'admin' && (
                      <Badge variant="secondary" className="text-xs">Admin</Badge>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-border">
                <Button variant="outline" className="w-full">
                  Invite People
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
