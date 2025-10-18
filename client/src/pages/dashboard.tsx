import { useQuery } from "@tanstack/react-query";
import { TrafficLog, TrafficStats, ChartDataPoint } from "@shared/schema";
import { StatCard } from "@/components/stat-card";
import { TrafficTable } from "@/components/traffic-table";
import { Users, AlertTriangle, Ban, Bot } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<TrafficStats>({
    queryKey: ["/api/stats"],
  });

  const { data: chartData, isLoading: chartLoading } = useQuery<
    ChartDataPoint[]
  >({
    queryKey: ["/api/stats/chart"],
  });

  const { data: recentLogs, isLoading: logsLoading } = useQuery<TrafficLog[]>({
    queryKey: ["/api/traffic/recent"],
  });

  if (statsLoading || chartLoading || logsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time traffic monitoring and classification
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Human Traffic"
          value={stats?.human || 0}
          icon={Users}
          trend={{
            value: stats?.humanPercentage || 0,
            isPositive: true,
          }}
          testId="stat-human"
        />
        <StatCard
          title="Suspicious"
          value={stats?.suspicious || 0}
          icon={AlertTriangle}
          trend={{
            value: stats?.suspiciousPercentage || 0,
            isPositive: false,
          }}
          testId="stat-suspicious"
        />
        <StatCard
          title="Blocked"
          value={stats?.blocked || 0}
          icon={Ban}
          trend={{
            value: stats?.blockedPercentage || 0,
            isPositive: false,
          }}
          testId="stat-blocked"
        />
        <StatCard
          title="Crawlers"
          value={stats?.crawler || 0}
          icon={Bot}
          testId="stat-crawler"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Traffic Timeline (Last 24 Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="timestamp"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="human"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  name="Human"
                />
                <Line
                  type="monotone"
                  dataKey="suspicious"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  name="Suspicious"
                />
                <Line
                  type="monotone"
                  dataKey="blocked"
                  stroke="hsl(var(--chart-4))"
                  strokeWidth={2}
                  name="Blocked"
                />
                <Line
                  type="monotone"
                  dataKey="crawler"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  name="Crawler"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <TrafficTable logs={recentLogs || []} />
        </CardContent>
      </Card>
    </div>
  );
}
