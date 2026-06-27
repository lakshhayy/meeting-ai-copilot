import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function MetricCard({ title, value, icon: Icon, trend, trendUp, className }: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold tracking-tight mt-2">{value}</h3>
          </div>
          <div className="p-3 bg-primary/10 rounded-xl">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            <span className={cn("font-medium", trendUp ? "text-green-500" : "text-amber-500")}>
              {trend}
            </span>
            <span className="text-muted-foreground ml-2">vs last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
