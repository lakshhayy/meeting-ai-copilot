import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAllMeetings } from "@/hooks/use-workspaces";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export default function Meetings() {
  const { data: meetings, isLoading } = useAllMeetings();

  return (
    <DashboardLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-display font-bold">All Meetings</h1>
        <p className="text-muted-foreground mt-1">Your entire history of processed meetings across all workspaces.</p>
      </div>

      <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading meetings...</div>
          ) : !meetings || meetings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">No meetings yet</h3>
              <p className="text-muted-foreground text-sm mt-1">Head to a workspace to upload your first audio file.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {meetings.map((m: any) => (
                <Link 
                  key={m.meeting.id} 
                  to={`/workspace/${m.workspace.slug}/meeting/${m.meeting.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-muted/50 transition-colors gap-4"
                >
                  <div>
                    <h4 className="font-semibold text-lg text-foreground">{m.meeting.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                      <span className="font-medium bg-secondary/50 px-2 py-0.5 rounded-md">{m.workspace.name}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(m.meeting.createdAt), { addSuffix: true })}</span>
                    </p>
                  </div>
                  <div>
                    <Badge variant={m.meeting.status === 'ready' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                      {m.meeting.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
