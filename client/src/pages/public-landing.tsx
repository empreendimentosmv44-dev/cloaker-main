import { useEffect, useState } from "react";
import { Shield, AlertTriangle, Bot, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface DetectionResult {
  classification: "HUMAN" | "SUSPICIOUS" | "KNOWN_CRAWLER" | "BLOCKED";
  action: string;
  score: number;
  message: string;
  logId: string;
}

export default function PublicLanding() {
  const { data: detection, isLoading } = useQuery<DetectionResult>({
    queryKey: ["/api/detect"],
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Analyzing your connection...</p>
        </div>
      </div>
    );
  }

  if (!detection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive">Failed to analyze connection</p>
        </div>
      </div>
    );
  }

  const config = {
    HUMAN: {
      icon: Shield,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
      title: "Access Granted",
      description:
        "Your connection has been verified as legitimate. You may proceed.",
    },
    SUSPICIOUS: {
      icon: AlertTriangle,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
      title: "Additional Verification Required",
      description:
        "Please complete the security challenge below to verify you are human.",
    },
    KNOWN_CRAWLER: {
      icon: Bot,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      title: "Bot Detected",
      description:
        "You appear to be an automated crawler. For more information, visit /robot-info",
    },
    BLOCKED: {
      icon: Shield,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      title: "Access Denied",
      description:
        "Your connection has been blocked due to suspicious activity. If you believe this is an error, please contact support.",
    },
  };

  const currentConfig = config[detection.classification];
  const Icon = currentConfig.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div
              className={`p-4 rounded-full ${currentConfig.bgColor} ${currentConfig.color}`}
            >
              <Icon className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mt-4">Protected Access Point</h1>
          <p className="text-muted-foreground">
            This endpoint is protected by TrafficSeg-Guard
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {currentConfig.title}
                </h2>
                <Badge variant="secondary" className={currentConfig.bgColor}>
                  {detection.classification}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {detection.message || currentConfig.description}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Security Score:</span>
                <span className="font-mono font-semibold">
                  {detection.score}/100
                </span>
              </div>
            </div>

            {detection.classification === "SUSPICIOUS" && (
              <div className="p-4 bg-muted rounded-md space-y-2">
                <p className="text-sm font-medium">Security Challenge</p>
                <p className="text-sm text-muted-foreground">
                  In a production environment, a CAPTCHA or other challenge would appear here.
                </p>
                <div className="pt-2">
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover-elevate active-elevate-2">
                    Complete Challenge
                  </button>
                </div>
              </div>
            )}

            {detection.classification === "BLOCKED" && (
              <div className="space-y-2 text-sm p-4 bg-destructive/10 rounded-md">
                <p className="font-medium text-destructive">
                  Your access has been blocked for the following reason:
                </p>
                <p className="text-muted-foreground">{detection.message}</p>
              </div>
            )}

            {detection.classification === "HUMAN" && (
              <div className="text-center pt-4">
                <a
                  href="/admin"
                  className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-md hover-elevate active-elevate-2"
                >
                  Access Admin Dashboard
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Request ID:{" "}
            <span className="font-mono">{detection.logId.substring(0, 8)}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            For audit information, visit{" "}
            <a
              href={`/api/audit/decision/${detection.logId}`}
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              /api/audit/decision/{detection.logId.substring(0, 8)}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
