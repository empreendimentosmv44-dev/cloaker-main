import {
  type TrafficLog,
  type InsertTrafficLog,
  type PreviewToken,
  type InsertPreviewToken,
  type Rule,
  type InsertRule,
  type Setting,
  type InsertSetting,
  type TrafficStats,
  type ChartDataPoint,
  type AuditReport,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { nanoid } from "nanoid";

export interface IStorage {
  // Traffic Logs
  createTrafficLog(log: InsertTrafficLog): Promise<TrafficLog>;
  getTrafficLogs(
    classification?: string,
    limit?: number
  ): Promise<TrafficLog[]>;
  getTrafficLogById(id: string): Promise<TrafficLog | undefined>;
  getRecentTrafficLogs(limit: number): Promise<TrafficLog[]>;
  
  // Preview Tokens
  createPreviewToken(token: InsertPreviewToken): Promise<PreviewToken>;
  getPreviewTokens(): Promise<PreviewToken[]>;
  getPreviewTokenByToken(token: string): Promise<PreviewToken | undefined>;
  incrementTokenUsage(id: string): Promise<void>;
  deletePreviewToken(id: string): Promise<void>;
  
  // Rules
  createRule(rule: InsertRule): Promise<Rule>;
  getRules(): Promise<Rule[]>;
  getRuleById(id: string): Promise<Rule | undefined>;
  deleteRule(id: string): Promise<void>;
  
  // Settings
  setSetting(setting: InsertSetting): Promise<Setting>;
  getSetting(key: string): Promise<Setting | undefined>;
  
  // Statistics
  getTrafficStats(): Promise<TrafficStats>;
  getChartData(): Promise<ChartDataPoint[]>;
  getAuditReport(startDate: string, endDate: string): Promise<AuditReport>;
}

export class MemStorage implements IStorage {
  private trafficLogs: Map<string, TrafficLog>;
  private previewTokens: Map<string, PreviewToken>;
  private rules: Map<string, Rule>;
  private settings: Map<string, Setting>;

  constructor() {
    this.trafficLogs = new Map();
    this.previewTokens = new Map();
    this.rules = new Map();
    this.settings = new Map();
  }

  // Traffic Logs
  async createTrafficLog(insertLog: InsertTrafficLog): Promise<TrafficLog> {
    const id = randomUUID();
    const log: TrafficLog = {
      ...insertLog,
      id,
      timestamp: new Date(),
    };
    this.trafficLogs.set(id, log);
    return log;
  }

  async getTrafficLogs(
    classification?: string,
    limit: number = 1000
  ): Promise<TrafficLog[]> {
    let logs = Array.from(this.trafficLogs.values());
    
    if (classification && classification !== "all") {
      logs = logs.filter((log) => log.classification === classification);
    }
    
    return logs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getTrafficLogById(id: string): Promise<TrafficLog | undefined> {
    return this.trafficLogs.get(id);
  }

  async getRecentTrafficLogs(limit: number = 20): Promise<TrafficLog[]> {
    return Array.from(this.trafficLogs.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Preview Tokens
  async createPreviewToken(
    insertToken: InsertPreviewToken
  ): Promise<PreviewToken> {
    const id = randomUUID();
    const token: PreviewToken = {
      id,
      token: insertToken.token || nanoid(32),
      description: insertToken.description,
      expiresAt: insertToken.expiresAt ? new Date(insertToken.expiresAt) : null,
      createdAt: new Date(),
      usageCount: 0,
      isActive: insertToken.isActive ?? 1,
    };
    this.previewTokens.set(id, token);
    return token;
  }

  async getPreviewTokens(): Promise<PreviewToken[]> {
    return Array.from(this.previewTokens.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getPreviewTokenByToken(
    token: string
  ): Promise<PreviewToken | undefined> {
    return Array.from(this.previewTokens.values()).find(
      (t) => t.token === token
    );
  }

  async incrementTokenUsage(id: string): Promise<void> {
    const token = this.previewTokens.get(id);
    if (token) {
      token.usageCount += 1;
      this.previewTokens.set(id, token);
    }
  }

  async deletePreviewToken(id: string): Promise<void> {
    this.previewTokens.delete(id);
  }

  // Rules
  async createRule(insertRule: InsertRule): Promise<Rule> {
    const id = randomUUID();
    const rule: Rule = {
      ...insertRule,
      id,
      createdAt: new Date(),
    };
    this.rules.set(id, rule);
    return rule;
  }

  async getRules(): Promise<Rule[]> {
    return Array.from(this.rules.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getRuleById(id: string): Promise<Rule | undefined> {
    return this.rules.get(id);
  }

  async deleteRule(id: string): Promise<void> {
    this.rules.delete(id);
  }

  // Settings
  async setSetting(insertSetting: InsertSetting): Promise<Setting> {
    const existing = Array.from(this.settings.values()).find(
      (s) => s.key === insertSetting.key
    );

    if (existing) {
      const updated: Setting = {
        ...existing,
        value: insertSetting.value,
        updatedAt: new Date(),
      };
      this.settings.set(existing.id, updated);
      return updated;
    }

    const id = randomUUID();
    const setting: Setting = {
      ...insertSetting,
      id,
      updatedAt: new Date(),
    };
    this.settings.set(id, setting);
    return setting;
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    return Array.from(this.settings.values()).find((s) => s.key === key);
  }

  // Statistics
  async getTrafficStats(): Promise<TrafficStats> {
    const logs = Array.from(this.trafficLogs.values());
    const total = logs.length;

    if (total === 0) {
      return {
        total: 0,
        human: 0,
        suspicious: 0,
        blocked: 0,
        crawler: 0,
        humanPercentage: 0,
        suspiciousPercentage: 0,
        blockedPercentage: 0,
        crawlerPercentage: 0,
      };
    }

    const human = logs.filter((l) => l.classification === "HUMAN").length;
    const suspicious = logs.filter(
      (l) => l.classification === "SUSPICIOUS"
    ).length;
    const blocked = logs.filter((l) => l.classification === "BLOCKED").length;
    const crawler = logs.filter(
      (l) => l.classification === "KNOWN_CRAWLER"
    ).length;

    return {
      total,
      human,
      suspicious,
      blocked,
      crawler,
      humanPercentage: Math.round((human / total) * 100),
      suspiciousPercentage: Math.round((suspicious / total) * 100),
      blockedPercentage: Math.round((blocked / total) * 100),
      crawlerPercentage: Math.round((crawler / total) * 100),
    };
  }

  async getChartData(): Promise<ChartDataPoint[]> {
    const logs = Array.from(this.trafficLogs.values());
    const now = new Date();
    const hours: ChartDataPoint[] = [];

    // Generate data for last 24 hours
    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(now);
      hourStart.setHours(now.getHours() - i, 0, 0, 0);
      const hourEnd = new Date(hourStart);
      hourEnd.setHours(hourStart.getHours() + 1);

      const hourLogs = logs.filter(
        (log) => log.timestamp >= hourStart && log.timestamp < hourEnd
      );

      hours.push({
        timestamp: hourStart.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        human: hourLogs.filter((l) => l.classification === "HUMAN").length,
        suspicious: hourLogs.filter((l) => l.classification === "SUSPICIOUS")
          .length,
        blocked: hourLogs.filter((l) => l.classification === "BLOCKED").length,
        crawler: hourLogs.filter((l) => l.classification === "KNOWN_CRAWLER")
          .length,
      });
    }

    return hours;
  }

  async getAuditReport(
    startDate: string,
    endDate: string
  ): Promise<AuditReport> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const logs = Array.from(this.trafficLogs.values()).filter(
      (log) => log.timestamp >= start && log.timestamp <= end
    );

    const totalRequests = logs.length;

    if (totalRequests === 0) {
      return {
        startDate,
        endDate,
        totalRequests: 0,
        classifications: {
          human: 0,
          suspicious: 0,
          blocked: 0,
          crawler: 0,
        },
        actions: {
          allow: 0,
          challenge: 0,
          block: 0,
          redirect: 0,
        },
        topIPs: [],
        topUserAgents: [],
        challengeSuccessRate: 0,
      };
    }

    // Classifications
    const classifications = {
      human: logs.filter((l) => l.classification === "HUMAN").length,
      suspicious: logs.filter((l) => l.classification === "SUSPICIOUS").length,
      blocked: logs.filter((l) => l.classification === "BLOCKED").length,
      crawler: logs.filter((l) => l.classification === "KNOWN_CRAWLER").length,
    };

    // Actions
    const actions = {
      allow: logs.filter((l) => l.action === "ALLOW").length,
      challenge: logs.filter((l) => l.action === "CHALLENGE").length,
      block: logs.filter((l) => l.action === "BLOCK").length,
      redirect: logs.filter((l) => l.action === "REDIRECT").length,
    };

    // Top IPs
    const ipCounts = new Map<string, { count: number; classification: string }>();
    logs.forEach((log) => {
      const current = ipCounts.get(log.ip) || { count: 0, classification: log.classification };
      ipCounts.set(log.ip, { count: current.count + 1, classification: log.classification });
    });
    const topIPs = Array.from(ipCounts.entries())
      .map(([ip, data]) => ({ ip, count: data.count, classification: data.classification as any }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top User Agents
    const uaCounts = new Map<string, number>();
    logs.forEach((log) => {
      uaCounts.set(log.userAgent, (uaCounts.get(log.userAgent) || 0) + 1);
    });
    const topUserAgents = Array.from(uaCounts.entries())
      .map(([userAgent, count]) => ({ userAgent, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Challenge success rate
    const challenged = logs.filter((l) => l.action === "CHALLENGE");
    const challengePassed = challenged.filter((l) => l.challengePassed === 1);
    const challengeSuccessRate =
      challenged.length > 0
        ? Math.round((challengePassed.length / challenged.length) * 100)
        : 0;

    return {
      startDate,
      endDate,
      totalRequests,
      classifications,
      actions,
      topIPs,
      topUserAgents,
      challengeSuccessRate,
    };
  }
}

export const storage = new MemStorage();
