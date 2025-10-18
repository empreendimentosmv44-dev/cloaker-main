import { Request } from "express";
import { UAParser } from "ua-parser-js";
import geoip from "geoip-lite";
import logger from "./logger";
import { TrafficClassification, TrafficAction } from "@shared/schema";
import { storage } from "./storage";

export interface DetectionResult {
  classification: TrafficClassification;
  score: number;
  action: TrafficAction;
  detectionReasons: string[];
  fingerprint: string;
}

// Known bot patterns
const botPatterns = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /headless/i,
  /selenium/i,
  /puppeteer/i,
  /phantom/i,
];

// Known legitimate crawlers
const legitimateCrawlers = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i, // Yahoo
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
];

export class TrafficDetector {
  /**
   * Analyze incoming request and classify traffic
   */
  static async analyze(req: Request): Promise<DetectionResult> {
    const reasons: string[] = [];
    let score = 50; // Start with neutral score

    const userAgent = req.headers["user-agent"] || "";
    const ip = this.extractIP(req);
    const parser = new UAParser(userAgent);
    const uaResult = parser.getResult();

    // Generate fingerprint
    const fingerprint = this.generateFingerprint(req);

    // Check for legitimate crawlers first
    for (const pattern of legitimateCrawlers) {
      if (pattern.test(userAgent)) {
        reasons.push("Legitimate crawler detected");
        return {
          classification: "KNOWN_CRAWLER",
          score: 100,
          action: "ALLOW",
          detectionReasons: reasons,
          fingerprint,
        };
      }
    }

    // Check for bot patterns
    for (const pattern of botPatterns) {
      if (pattern.test(userAgent)) {
        score -= 30;
        reasons.push(`Bot pattern detected in User-Agent: ${pattern}`);
      }
    }

    // User-Agent validation
    if (!userAgent || userAgent.length < 20) {
      score -= 20;
      reasons.push("Missing or suspiciously short User-Agent");
    }

    // Check if User-Agent has valid browser info
    if (!uaResult.browser.name || !uaResult.os.name) {
      score -= 15;
      reasons.push("Invalid or incomplete User-Agent structure");
    }

    // Accept header validation
    const accept = req.headers["accept"];
    if (!accept || !accept.includes("text/html")) {
      score -= 10;
      reasons.push("Missing or invalid Accept header");
    }

    // Accept-Language validation
    const acceptLanguage = req.headers["accept-language"];
    if (!acceptLanguage) {
      score -= 5;
      reasons.push("Missing Accept-Language header");
    }

    // Connection header check
    const connection = req.headers["connection"];
    if (connection && connection.toLowerCase() === "close") {
      score -= 5;
      reasons.push("Suspicious Connection header");
    }

    // Check for common headless browser indicators
    if (userAgent.includes("HeadlessChrome")) {
      score -= 25;
      reasons.push("Headless browser detected");
    }

    // IP analysis
    try {
      const geo = geoip?.lookup ? geoip.lookup(ip) : null;
      if (geo) {
        // Add small bonus for having geolocation
        score += 5;
        reasons.push(`Request from ${geo.country}`);
      }
    } catch (error) {
      // Geolocation not available, continue without it
    }

    // Check for preview token - must be valid and active in storage
    const previewTokenStr = req.query.preview_token as string | undefined;
    if (previewTokenStr) {
      const token = await storage.getPreviewTokenByToken(previewTokenStr);
      if (token && token.isActive) {
        // Check if token is expired
        if (!token.expiresAt || new Date(token.expiresAt) > new Date()) {
          score += 50;
          reasons.push("Valid preview token provided");
          // Increment usage count asynchronously
          storage.incrementTokenUsage(token.id).catch(err => 
            logger.error("Failed to increment token usage", err)
          );
        } else {
          reasons.push("Preview token expired");
        }
      } else {
        reasons.push("Invalid or inactive preview token");
      }
    }

    // Determine classification and action
    let classification: TrafficClassification;
    let action: TrafficAction;

    if (score >= 70) {
      classification = "HUMAN";
      action = "ALLOW";
      reasons.push("High confidence human traffic");
    } else if (score >= 40) {
      classification = "SUSPICIOUS";
      action = "CHALLENGE";
      reasons.push("Suspicious patterns detected, challenge required");
    } else {
      classification = "BLOCKED";
      action = "BLOCK";
      reasons.push("Multiple bot indicators, blocking access");
    }

    logger.info("Traffic analyzed", {
      ip,
      classification,
      score,
      action,
      userAgent: userAgent.substring(0, 100),
    });

    return {
      classification,
      score,
      action,
      detectionReasons: reasons,
      fingerprint,
    };
  }

  /**
   * Extract IP address from request
   */
  private static extractIP(req: Request): string {
    return (
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      (req.headers["x-real-ip"] as string) ||
      req.socket.remoteAddress ||
      "unknown"
    );
  }

  /**
   * Generate a fingerprint for the request
   */
  private static generateFingerprint(req: Request): string {
    const components = [
      req.headers["user-agent"] || "",
      req.headers["accept"] || "",
      req.headers["accept-language"] || "",
      req.headers["accept-encoding"] || "",
      this.extractIP(req),
    ];

    // Simple hash function
    const hash = components.join("|");
    let hashValue = 0;
    for (let i = 0; i < hash.length; i++) {
      const char = hash.charCodeAt(i);
      hashValue = (hashValue << 5) - hashValue + char;
      hashValue = hashValue & hashValue;
    }
    return Math.abs(hashValue).toString(16);
  }

  /**
   * Get country from IP
   */
  static getCountry(ip: string): string | null {
    try {
      const geo = geoip?.lookup ? geoip.lookup(ip) : null;
      return geo?.country || null;
    } catch (error) {
      return null;
    }
  }
}
