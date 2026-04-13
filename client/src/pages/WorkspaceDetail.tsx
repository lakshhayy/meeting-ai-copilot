import { useParams, Link } from "react-router-dom";
import { useWorkspace, useMeetings, useDeleteWorkspace, useDeleteMeeting, useRenameWorkspace } from "@/hooks/use-workspaces";
import { useWorkspaceSocket } from "@/hooks/use-socket";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileAudio, Clock, CheckCircle2, Loader2, AlertCircle, Trash, Edit2, Plug } from "lucide-react";
import { useState } from "react";
import { UploadModal } from "@/components/UploadModal";
import { motion } from "framer-motion";

export default function WorkspaceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: workspace, isLoading: isLoadingWorkspace } = useWorkspace(slug || "");
  const { data: meetings, isLoading: isLoadingMeetings } = useMeetings(workspace?.id || "");
  
  const { mutate: deleteWorkspace, isPending: deletingWorkspace } = useDeleteWorkspace();
  const { mutate: deleteMeeting } = useDeleteMeeting();
  
  const { mutate: renameWorkspace, isPending: renamingWorkspace } = useRenameWorkspace();

  // Make the UI 100% Real-Time
  // Make the UI 100% Real-Time
  const { liveTranscript } = useWorkspaceSocket(workspace?.id);
  const { toast } = useToast();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
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
          {isEditingName ? (
            <div className="flex items-center gap-2 mb-1">
              <Input value={newName} onChange={e => setNewName(e.target.value)} disabled={renamingWorkspace} className="h-9 w-64" />
              <Button size="sm" onClick={() => {
                renameWorkspace({ workspaceId: workspace.id, name: newName }, {
                  onSuccess: () => setIsEditingName(false)
                })
              }} disabled={renamingWorkspace || !newName.trim()}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditingName(false)}>Cancel</Button>
            </div>
          ) : (
            <h1 className="text-3xl font-display font-bold group flex items-center">
              {workspace.name}
              <Button variant="ghost" size="icon" className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { setIsEditingName(true); setNewName(workspace.name); }}>
                <Edit2 className="w-4 h-4" />
              </Button>
            </h1>
          )}
          <p className="text-muted-foreground mt-1">Manage meetings and team members.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => {
            navigator.clipboard.writeText(workspace.id);
            toast({ title: "Copied Workspace ID! 🔌", description: "Paste this ID into your Chrome Extension to start recording live to this workspace." });
          }} className="shadow-sm">
            <Plug className="w-4 h-4 mr-2" />
            Connect Extension
          </Button>

          <Button variant="destructive" size="sm" onClick={() => deleteWorkspace(workspace.id)} disabled={deletingWorkspace} className="shadow-sm">
            {deletingWorkspace ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash className="w-4 h-4 mr-2" />}
            Delete Workspace
          </Button>

          {/* THE UPLOAD BUTTON */}
          <Button onClick={() => setIsUploadModalOpen(true)} className="shadow-sm">
            <UploadCloud className="w-4 h-4 mr-2" />
            Upload Meeting
          </Button>
        </div>
      </div>

      {liveTranscript.length > 0 && (
        <div className="bg-black text-emerald-400 font-mono text-sm border-l-4 border-emerald-500 rounded-lg p-5 shadow-lg mb-8 max-h-[300px] overflow-y-auto">
          <div className="flex items-center mb-3 text-emerald-500 font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
            LIVE TAB AUDIO FEED
          </div>
          <div className="space-y-4">
            {liveTranscript.map((chunk, i) => (
              <p key={i} className="opacity-90">{chunk}</p>
            ))}
          </div>
        </div>
      )}

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
          <motion.div 
            className="space-y-3"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
          >
            {meetings?.map((meeting: any) => (
              <motion.div 
                key={meeting.id} 
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  show: { opacity: 1, x: 0 }
                }}
              >
                <Link to={`/meeting/${meeting.id}`} className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-muted/30 transition-all hover:shadow-subtle cursor-pointer group">
                  <div>
                    <h3 className="font-medium group-hover:text-primary transition-colors">{meeting.title}</h3>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(meeting.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {renderStatus(meeting.status)}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteMeeting({ meetingId: meeting.id, workspaceId: workspace.id });
                      }}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
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