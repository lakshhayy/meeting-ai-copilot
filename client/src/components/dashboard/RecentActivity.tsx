import { useAllMeetings, useAllActionItems } from "@/hooks/use-workspaces";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, ListTodo, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export function RecentActivity() {
  const { data: meetings, isLoading: loadingMeetings } = useAllMeetings();
  const { data: actionItems, isLoading: loadingItems } = useAllActionItems();

  const recentMeetings = meetings?.slice(0, 4) || [];
  const pendingTasks = actionItems?.filter((i: any) => i.item.status !== "done").slice(0, 4) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      
      {/* Recent Meetings Column */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-semibold flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Recent Meetings
          </h2>
          <Link to="/meetings" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm">
          <CardContent className="p-0">
            {loadingMeetings ? (
              <div className="p-8 text-center text-muted-foreground">Loading meetings...</div>
            ) : recentMeetings.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium">No recent meetings</h3>
                <p className="text-muted-foreground text-sm mt-1">Upload an audio file or record to get started.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {recentMeetings.map((m: any) => (
                  <Link 
                    key={m.meeting.id} 
                    to={`/workspace/${m.workspace.slug}/meeting/${m.meeting.id}`}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-foreground">{m.meeting.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <span>{m.workspace.name}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(m.meeting.createdAt), { addSuffix: true })}</span>
                      </p>
                    </div>
                    <Badge variant={m.meeting.status === 'ready' ? 'default' : 'secondary'}>
                      {m.meeting.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Items Column */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-semibold flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-indigo-500" />
            My Tasks
          </h2>
        </div>
        
        <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm">
          <CardContent className="p-0">
            {loadingItems ? (
              <div className="p-8 text-center text-muted-foreground">Loading tasks...</div>
            ) : pendingTasks.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-muted-foreground text-sm">You have no pending tasks. Great job!</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {pendingTasks.map((task: any) => (
                  <div key={task.item.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <p className="text-sm font-medium leading-snug">{task.item.task}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        {task.workspace.name}
                      </span>
                      <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-600 dark:text-amber-400">
                        {task.item.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
}
