import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  testId?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
  testId,
}: StatCardProps) {
  return (
    <Card className={cn("hover-elevate", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold" data-testid={testId}>
          {value}
        </div>
        {trend && (
          <p
            className={cn(
              "flex items-center gap-1 text-xs mt-2",
              trend.isPositive ? "text-chart-1" : "text-chart-4"
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>
              {trend.isPositive ? "+" : ""}
              {trend.value}% from last hour
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
