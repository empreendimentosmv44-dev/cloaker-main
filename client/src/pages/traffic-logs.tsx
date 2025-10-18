import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrafficLog } from "@shared/schema";
import { TrafficTable } from "@/components/traffic-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function TrafficLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<TrafficLog | null>(null);

  const { data: logs, isLoading } = useQuery<TrafficLog[]>({
    queryKey: ["/api/traffic", classificationFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (classificationFilter) {
        params.append("classification", classificationFilter);
      }
      const response = await fetch(`/api/traffic?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch traffic logs");
      return response.json();
    },
  });

  const filteredLogs =
    logs?.filter((log) => {
      const matchesSearch =
        log.ip.includes(searchTerm) ||
        log.userAgent.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.country?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    }) || [];

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `traffic-logs-${new Date().toISOString()}.json`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading traffic logs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Traffic Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and analyze all incoming traffic requests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by IP, User Agent, or Country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-search"
              />
            </div>
            <Select
              value={classificationFilter}
              onValueChange={setClassificationFilter}
            >
              <SelectTrigger className="w-full md:w-48" data-testid="select-classification">
                <SelectValue placeholder="Classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classifications</SelectItem>
                <SelectItem value="HUMAN">Human</SelectItem>
                <SelectItem value="SUSPICIOUS">Suspicious</SelectItem>
                <SelectItem value="BLOCKED">Blocked</SelectItem>
                <SelectItem value="KNOWN_CRAWLER">Known Crawler</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleExport}
              data-testid="button-export"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Traffic Logs ({filteredLogs.length} entries)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TrafficTable
            logs={filteredLogs}
            onRowClick={(log) => setSelectedLog(log)}
          />
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Traffic Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    IP Address
                  </p>
                  <p className="font-mono text-sm">{selectedLog.ip}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Country
                  </p>
                  <p className="text-sm">{selectedLog.country || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Classification
                  </p>
                  <p className="text-sm font-semibold">
                    {selectedLog.classification}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Score
                  </p>
                  <p className="font-mono text-sm">{selectedLog.score}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Action
                  </p>
                  <p className="text-sm font-semibold">{selectedLog.action}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Fingerprint
                  </p>
                  <p className="font-mono text-xs truncate">
                    {selectedLog.fingerprint || "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  User Agent
                </p>
                <p className="text-xs font-mono bg-muted p-3 rounded-md break-all">
                  {selectedLog.userAgent}
                </p>
              </div>
              {selectedLog.detectionReasons &&
                selectedLog.detectionReasons.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Detection Reasons
                    </p>
                    <ul className="space-y-1">
                      {selectedLog.detectionReasons.map((reason, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-chart-3">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
