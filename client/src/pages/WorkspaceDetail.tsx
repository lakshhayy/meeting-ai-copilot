import { useParams } from "react-router-dom";
import { useWorkspace, useMeetings } from "@/hooks/use-workspaces";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileAudio, Clock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { UploadModal } from "@/components/UploadModal";

export default function WorkspaceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: workspace, isLoading: isLoadingWorkspace } = useWorkspace(slug || "");
  const { data: meetings, isLoading: isLoadingMeetings } = useMeetings(workspace?.id || "");
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  if (isLoadingWorkspace) {
    return (
      <DashboardLayout>
        <Skeleton className="h-10 w-1/3 mb-6" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </DashboardLayout>
    );
  }

  if (!workspace) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Workspace not found</h2>
        </div>
      </DashboardLayout>
    );
  }

  // Helper to render beautiful status badges
  const renderStatus = (status: string) => {
    switch (status) {
      case "uploading": return <span className="flex items-center text-xs font-medium text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-full"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Uploading</span>;
      case "transcribing": return <span className="flex items-center text-xs font-medium text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Transcribing</span>;
      case "analysing": return <span className="flex items-center text-xs font-medium text-purple-500 bg-purple-500/10 px-2.5 py-1 rounded-full"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Analysing AI</span>;
      case "ready": return <span className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full"><CheckCircle2 className="w-3 h-3 mr-1"/> Ready</span>;
      case "failed": return <span className="flex items-center text-xs font-medium text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full"><AlertCircle className="w-3 h-3 mr-1"/> Failed</span>;
      default: return <span className="text-xs">{status}</span>;
    }
  };

  return (
    <DashboardLayout workspaceName={workspace.name}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">{workspace.name}</h1>
          <p className="text-muted-foreground mt-1">Manage meetings and team members.</p>
        </div>
        
        {/* THE UPLOAD BUTTON */}
        <Button onClick={() => setIsUploadModalOpen(true)} className="shadow-sm">
          <UploadCloud className="w-4 h-4 mr-2" />
          Upload Meeting
        </Button>
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm min-h-[400px]">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <FileAudio className="w-5 h-5 mr-2 text-primary" />
          Recent Meetings
        </h2>

        {isLoadingMeetings ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : meetings?.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg">No meetings yet</h3>
            <p className="text-sm text-muted-foreground mb-4 mt-1">Upload your first recording to generate AI insights.</p>
            <Button variant="outline" onClick={() => setIsUploadModalOpen(true)}>Upload Recording</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings?.map((meeting: any) => (
              <div key={meeting.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/20 transition-colors">
                <div>
                  <h3 className="font-medium">{meeting.title}</h3>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(meeting.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>{renderStatus(meeting.status)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* THE MODAL */}
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        workspaceId={workspace.id} 
      />
    </DashboardLayout>
  );
}