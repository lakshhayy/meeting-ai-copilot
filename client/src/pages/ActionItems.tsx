import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAllActionItems } from "@/hooks/use-workspaces";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListTodo } from "lucide-react";

export default function ActionItems() {
  const { data: actionItems, isLoading } = useAllActionItems();

  return (
    <DashboardLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-display font-bold">Action Items</h1>
        <p className="text-muted-foreground mt-1">Keep track of all your pending tasks.</p>
      </div>

      <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading tasks...</div>
          ) : !actionItems || actionItems.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ListTodo className="w-6 h-6 text-indigo-500" />
              </div>
              <h3 className="text-lg font-medium">No tasks found</h3>
              <p className="text-muted-foreground text-sm mt-1">You are all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {actionItems.map((task: any) => (
                <div key={task.item.id} className="p-6 hover:bg-muted/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-base font-medium leading-snug">{task.item.task}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                        {task.workspace.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        From: {task.meeting.title}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Badge 
                      variant={task.item.status === 'done' ? 'default' : 'outline'} 
                      className={`text-xs px-3 py-1 ${task.item.status !== 'done' ? 'border-amber-500/30 text-amber-600 dark:text-amber-400' : ''}`}
                    >
                      {task.item.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
