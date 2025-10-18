import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuditReport } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AuditReports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: report, isLoading, refetch } = useQuery<AuditReport>({
    queryKey: ["/api/audit/report", startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({ startDate, endDate });
      const response = await fetch(`/api/audit/report?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to generate report");
      return response.json();
    },
    enabled: !!startDate && !!endDate,
  });

  const handleGenerate = () => {
    refetch();
  };

  const handleDownload = () => {
    if (!report) return;
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-report-${startDate}-to-${endDate}.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Audit Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate compliance reports for traffic filtering decisions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="input-start-date"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                data-testid="input-end-date"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={handleGenerate}
                disabled={!startDate || !endDate || isLoading}
                className="flex-1"
                data-testid="button-generate"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate
              </Button>
              {report && (
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  data-testid="button-download"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {report && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold" data-testid="text-total-requests">
                    {report.totalRequests}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Human Traffic</p>
                  <p className="text-2xl font-bold text-chart-1">
                    {report.classifications.human}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Suspicious</p>
                  <p className="text-2xl font-bold text-chart-3">
                    {report.classifications.suspicious}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Blocked</p>
                  <p className="text-2xl font-bold text-chart-4">
                    {report.classifications.blocked}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions Taken</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Allowed</p>
                  <p className="text-xl font-semibold">{report.actions.allow}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Challenged</p>
                  <p className="text-xl font-semibold">{report.actions.challenge}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Blocked</p>
                  <p className="text-xl font-semibold">{report.actions.block}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Challenge Success</p>
                  <p className="text-xl font-semibold">
                    {report.challengeSuccessRate}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top IP Addresses</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead className="text-right">Request Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.topIPs.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-sm">
                        {item.ip}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.classification}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {item.count}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top User Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Agent</TableHead>
                    <TableHead className="text-right">Request Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.topUserAgents.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="max-w-md truncate text-sm">
                        {item.userAgent}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {item.count}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {!report && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Select a date range and click Generate to create a report
          </CardContent>
        </Card>
      )}
    </div>
  );
}
