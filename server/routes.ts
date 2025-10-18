import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { storage } from "./storage";
import { TrafficDetector } from "./traffic-detector";
import logger from "./logger";
import {
  insertTrafficLogSchema,
  insertPreviewTokenSchema,
  insertRuleSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for development
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
  });

  app.use("/api", limiter);

  // Detection API - analyzes incoming requests and returns classification
  app.get("/api/detect", async (req, res) => {
    try {
      const detection = await TrafficDetector.analyze(req);
      const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        "unknown";
      const country = TrafficDetector.getCountry(ip);

      // Log the traffic
      const log = await storage.createTrafficLog({
        ip,
        userAgent: req.headers["user-agent"] || "unknown",
        country,
        classification: detection.classification,
        score: detection.score,
        action: detection.action,
        referer: req.headers.referer || null,
        utmParams: {
          source: req.query.utm_source as string,
          medium: req.query.utm_medium as string,
          campaign: req.query.utm_campaign as string,
        },
        fingerprint: detection.fingerprint,
        detectionReasons: detection.detectionReasons,
        challengePassed: null,
      });

      res.json({
        classification: detection.classification,
        action: detection.action,
        score: detection.score,
        message: detection.detectionReasons[detection.detectionReasons.length - 1] || "Request analyzed",
        logId: log.id,
      });
    } catch (error) {
      logger.error("Error processing detection request", error);
      res.status(500).json({ error: "Detection failed" });
    }
  });

  // Traffic Stats API
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getTrafficStats();
      res.json(stats);
    } catch (error) {
      logger.error("Error fetching stats", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  app.get("/api/stats/chart", async (req, res) => {
    try {
      const chartData = await storage.getChartData();
      res.json(chartData);
    } catch (error) {
      logger.error("Error fetching chart data", error);
      res.status(500).json({ error: "Failed to fetch chart data" });
    }
  });

  // Traffic Logs API
  app.get("/api/traffic/recent", async (req, res) => {
    try {
      const logs = await storage.getRecentTrafficLogs(20);
      res.json(logs);
    } catch (error) {
      logger.error("Error fetching recent logs", error);
      res.status(500).json({ error: "Failed to fetch recent logs" });
    }
  });

  app.get("/api/traffic", async (req, res) => {
    try {
      const classification = req.query.classification as string | undefined;
      const limit = parseInt(req.query.limit as string) || 1000;
      const logs = await storage.getTrafficLogs(
        classification && classification !== "all" ? classification : undefined,
        limit
      );
      res.json(logs);
    } catch (error) {
      logger.error("Error fetching traffic logs", error);
      res.status(500).json({ error: "Failed to fetch traffic logs" });
    }
  });

  app.get("/api/traffic/:id", async (req, res) => {
    try {
      const log = await storage.getTrafficLogById(req.params.id);
      if (!log) {
        return res.status(404).json({ error: "Traffic log not found" });
      }
      res.json(log);
    } catch (error) {
      logger.error("Error fetching traffic log", error);
      res.status(500).json({ error: "Failed to fetch traffic log" });
    }
  });

  // Preview Tokens API
  app.get("/api/tokens", async (req, res) => {
    try {
      const tokens = await storage.getPreviewTokens();
      res.json(tokens);
    } catch (error) {
      logger.error("Error fetching tokens", error);
      res.status(500).json({ error: "Failed to fetch tokens" });
    }
  });

  app.post("/api/tokens", async (req, res) => {
    try {
      const validated = insertPreviewTokenSchema.parse(req.body);
      const token = await storage.createPreviewToken(validated);
      logger.info("Preview token created", { id: token.id });
      res.json(token);
    } catch (error) {
      logger.error("Error creating token", error);
      res.status(400).json({ error: "Invalid token data" });
    }
  });

  app.delete("/api/tokens/:id", async (req, res) => {
    try {
      await storage.deletePreviewToken(req.params.id);
      logger.info("Preview token deleted", { id: req.params.id });
      res.json({ success: true });
    } catch (error) {
      logger.error("Error deleting token", error);
      res.status(500).json({ error: "Failed to delete token" });
    }
  });

  // Rules API
  app.get("/api/rules", async (req, res) => {
    try {
      const rules = await storage.getRules();
      res.json(rules);
    } catch (error) {
      logger.error("Error fetching rules", error);
      res.status(500).json({ error: "Failed to fetch rules" });
    }
  });

  app.post("/api/rules", async (req, res) => {
    try {
      const validated = insertRuleSchema.parse(req.body);
      const rule = await storage.createRule(validated);
      logger.info("Rule created", { id: rule.id, type: rule.type });
      res.json(rule);
    } catch (error) {
      logger.error("Error creating rule", error);
      res.status(400).json({ error: "Invalid rule data" });
    }
  });

  app.delete("/api/rules/:id", async (req, res) => {
    try {
      await storage.deleteRule(req.params.id);
      logger.info("Rule deleted", { id: req.params.id });
      res.json({ success: true });
    } catch (error) {
      logger.error("Error deleting rule", error);
      res.status(500).json({ error: "Failed to delete rule" });
    }
  });

  // Audit Reports API
  app.get("/api/audit/report", async (req, res) => {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start and end dates are required" });
      }

      const report = await storage.getAuditReport(startDate, endDate);
      res.json(report);
    } catch (error) {
      logger.error("Error generating audit report", error);
      res.status(500).json({ error: "Failed to generate audit report" });
    }
  });

  app.get("/api/audit/decision/:id", async (req, res) => {
    try {
      const log = await storage.getTrafficLogById(req.params.id);
      if (!log) {
        return res.status(404).json({ error: "Decision not found" });
      }

      res.json({
        id: log.id,
        timestamp: log.timestamp,
        classification: log.classification,
        action: log.action,
        score: log.score,
        reasons: log.detectionReasons,
        ip: log.ip,
        userAgent: log.userAgent,
      });
    } catch (error) {
      logger.error("Error fetching audit decision", error);
      res.status(500).json({ error: "Failed to fetch audit decision" });
    }
  });

  // Settings API
  app.get("/api/settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ error: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      logger.error("Error fetching setting", error);
      res.status(500).json({ error: "Failed to fetch setting" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const setting = await storage.setSetting(req.body);
      logger.info("Setting updated", { key: setting.key });
      res.json(setting);
    } catch (error) {
      logger.error("Error updating setting", error);
      res.status(400).json({ error: "Invalid setting data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
