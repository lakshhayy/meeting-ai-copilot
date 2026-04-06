import { useParams, Link } from "react-router-dom";
import { useMeeting, useUpdateActionItemStatus, useRenameMeeting } from "@/hooks/use-workspaces";
import { useWorkspaceSocket } from "@/hooks/use-socket";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileAudio, ArrowLeft, Loader2, CheckCircle2, AlertCircle, PlaySquare, Copy, CheckSquare, Square, Mail, ListTodo, MessageSquare, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MeetingChat } from "@/components/MeetingChat";
import { useState } from "react";

export default function MeetingDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useMeeting(id || "");
  
  // Attach live web sockets to automatically update when background AI finishes!
  useWorkspaceSocket(data?.meeting.workspaceId);

  const { mutate: updateStatus } = useUpdateActionItemStatus();
  const { mutate: renameMeeting, isPending: renamingMeeting } = useRenameMeeting();
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const { toast } = useToast();
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mb-6 flex items-center">
          <Skeleton className="h-8 w-8 mr-4" />
          <Skeleton className="h-10 w-1/3" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </DashboardLayout>
    );
  }

  if (!data || !data.meeting) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Meeting not found</h2>
          <Button asChild className="mt-4">
            <Link to="/dashboard">Go back to Dashboard</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const { meeting, transcript, summary, actionItems } = data;

  const renderStatus = (status: string) => {
    switch (status) {
      case "uploading": return <span className="flex items-center text-sm font-medium text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-full"><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Uploading...</span>;
      case "transcribing": return <span className="flex items-center text-sm font-medium text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full"><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Transcribing audio...</span>;
      case "analysing": return <span className="flex items-center text-sm font-medium text-purple-500 bg-purple-500/10 px-3 py-1.5 rounded-full"><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Generating AI Insights...</span>;
      case "ready": return <span className="flex items-center text-sm font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full"><CheckCircle2 className="w-4 h-4 mr-2"/> Processed</span>;
      case "failed": return <span className="flex items-center text-sm font-medium text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full"><AlertCircle className="w-4 h-4 mr-2"/> Failed</span>;
      default: return <span>{status}</span>;
    }
  };

  const copyEmail = () => {
    if (summary?.followUpEmail) {
      navigator.clipboard.writeText(summary.followUpEmail);
      toast({
        title: "Copied!",
        description: "Email draft copied to your clipboard.",
      });
    }
  };

  const toggleTask = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "pending" : "done";
    updateStatus({ id: taskId, status: newStatus, meetingId: id! });
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-3">
            <Link to={`/dashboard`}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 mb-1">
                <FileAudio className="w-6 h-6 mr-1 text-primary flex-shrink-0" />
                <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} disabled={renamingMeeting} className="h-9 w-64 md:w-80" />
                <Button size="sm" onClick={() => {
                  renameMeeting({ meetingId: meeting.id, title: newTitle }, {
                    onSuccess: () => setIsEditingTitle(false)
                  })
                }} disabled={renamingMeeting || !newTitle.trim()}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditingTitle(false)}>Cancel</Button>
              </div>
            ) : (
              <h1 className="text-2xl font-display font-bold group flex items-center">
                <FileAudio className="w-6 h-6 mr-3 text-primary flex-shrink-0" />
                <span className="truncate max-w-[300px] md:max-w-[500px]">{meeting.title}</span>
                <Button variant="ghost" size="icon" className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { setIsEditingTitle(true); setNewTitle(meeting.title); }}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              </h1>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Recorded on {new Date(meeting.createdAt).toLocaleDateString()} at {new Date(meeting.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          {renderStatus(meeting.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI SUMMARY BOX */}
          {(meeting.status === "uploading" || meeting.status === "transcribing" || meeting.status === "analysing") ? (
             <div className="bg-card border border-border/60 rounded-xl p-12 text-center shadow-sm min-h-[400px] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <h3 className="font-medium text-lg">AI is processing your meeting...</h3>
                <p className="text-muted-foreground max-w-sm mt-2">
                  We are transcribing the audio and Gemini is extracting key decisions, action items, and drafting your email. The workspace will update live when ready.
                </p>
             </div>
          ) : meeting.status === "failed" ? (
             <div className="bg-card border border-red-500/20 rounded-xl p-12 text-center shadow-sm min-h-[400px] flex flex-col items-center justify-center text-red-500">
                <AlertCircle className="w-12 h-12 mb-4" />
                <h3 className="font-medium text-lg text-foreground">Something went wrong</h3>
                <p className="text-muted-foreground mt-2">We couldn't process this meeting audio.</p>
             </div>
          ) : summary ? (
            <div className="bg-gradient-to-br from-primary/5 via-transparent to-transparent border border-primary/20 rounded-xl p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-3">TL;DR</h2>
                <p className="text-foreground/90 leading-relaxed text-lg">
                  {summary.tldr}
                </p>
              </div>

              {summary.keyDecisions && summary.keyDecisions.length > 0 && (
                <div className="mt-8 border-t border-border/50 pt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2 text-primary" /> Key Decisions
                  </h3>
                  <ul className="space-y-3">
                    {summary.keyDecisions.map((decision: string, i: number) => (
                      <li key={i} className="flex items-start bg-background/50 p-3 rounded-lg border border-border/30">
                         <div className="min-w-6 mt-0.5 text-primary text-sm font-bold">{i + 1}.</div>
                         <div className="text-foreground">{decision}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

          {/* RAG CHAT */}
          {meeting.status === "ready" && (
            <div className="mb-6">
               <MeetingChat meetingId={meeting.id} />
            </div>
          )}

          {/* TRANSCRIPT */}
          {transcript && (
            <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 border-b pb-3">Raw Transcript</h2>
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                {transcript.rawText.split('\n').map((paragraph: string, i: number) => (
                  <p key={i} className={paragraph.trim() ? "mb-4" : "mb-2"}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground mb-4 flex items-center">
              <PlaySquare className="w-4 h-4 mr-2" /> Audio
            </h3>
            <audio controls className="w-full" src={meeting.audioUrl} />
          </div>

          {/* ACTION ITEMS */}
          {actionItems && actionItems.length > 0 && (
            <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground mb-4 flex items-center">
                <ListTodo className="w-4 h-4 mr-2" /> Action Items
              </h3>
              <div className="space-y-3">
                {actionItems.map((task: any) => (
                  <div 
                    key={task.id} 
                    onClick={() => toggleTask(task.id, task.status)}
                    className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${task.status === 'done' ? 'bg-muted/50 border-transparent' : 'bg-background hover:border-primary/50 hover:bg-muted/20 border-border/60'}`}
                  >
                    <div className="mr-3 mt-0.5 text-primary flex-shrink-0">
                      {task.status === "done" ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {task.task}
                      </p>
                      <div className="flex items-center text-xs mt-1 text-muted-foreground space-x-2">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{task.owner}</span>
                        <span>Due: {task.deadline}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMAIL DRAFT */}
          {summary?.followUpEmail && (
            <div className="bg-card border border-border/60 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="bg-muted px-4 py-3 border-b border-border/60 flex justify-between items-center">
                 <h3 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground flex items-center">
                  <Mail className="w-4 h-4 mr-2" /> Email Draft
                 </h3>
                 <Button size="sm" variant="ghost" className="h-8 hover:bg-primary/10 hover:text-primary transition-colors" onClick={copyEmail}>
                   <Copy className="w-4 h-4 mr-1.5" /> Copy
                 </Button>
              </div>
              <div className="p-4 bg-background whitespace-pre-wrap text-sm text-foreground/90 max-h-[350px] overflow-y-auto">
                {summary.followUpEmail}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
