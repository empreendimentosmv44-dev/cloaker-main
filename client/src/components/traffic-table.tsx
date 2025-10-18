import { TrafficLog, TrafficClassification } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface TrafficTableProps {
  logs: TrafficLog[];
  onRowClick?: (log: TrafficLog) => void;
}

const classificationColors: Record<
  TrafficClassification,
  { bg: string; text: string; dot: string }
> = {
  HUMAN: {
    bg: "bg-chart-1/10",
    text: "text-chart-1",
    dot: "bg-chart-1",
  },
  SUSPICIOUS: {
    bg: "bg-chart-3/10",
    text: "text-chart-3",
    dot: "bg-chart-3",
  },
  BLOCKED: {
    bg: "bg-chart-4/10",
    text: "text-chart-4",
    dot: "bg-chart-4",
  },
  KNOWN_CRAWLER: {
    bg: "bg-chart-2/10",
    text: "text-chart-2",
    dot: "bg-chart-2",
  },
};

export function TrafficTable({ logs, onRowClick }: TrafficTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Classification</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>User Agent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground py-8"
              >
                No traffic logs yet
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow
                key={log.id}
                className="hover-elevate cursor-pointer"
                onClick={() => onRowClick?.(log)}
                data-testid={`row-traffic-${log.id}`}
              >
                <TableCell className="font-mono text-xs whitespace-nowrap">
                  {formatDistanceToNow(new Date(log.timestamp), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="font-mono text-xs">{log.ip}</TableCell>
                <TableCell className="text-xs">
                  {log.country || "Unknown"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "gap-1.5 font-mono text-xs",
                      classificationColors[log.classification].bg,
                      classificationColors[log.classification].text
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        classificationColors[log.classification].dot
                      )}
                    />
                    {log.classification}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{log.score}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                  {log.userAgent}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
