# TrafficSeg-Guard

## Overview

TrafficSeg-Guard is an intelligent traffic detection and protection system designed to classify incoming web traffic in real-time and serve appropriate experiences based on the classification. The system distinguishes between legitimate human users, suspicious traffic, known web crawlers, and blocked entities, providing policy-compliant traffic management with built-in audit capabilities for advertising platform compliance.

The application serves both a public-facing landing page that analyzes visitors and an administrative dashboard for monitoring, managing rules, generating audit reports, and controlling preview tokens.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Design System**: shadcn/ui component library (New York style variant) built on Radix UI primitives with Tailwind CSS for styling. The design follows a data-clarity-first approach optimized for monitoring dashboards with dark mode as the primary theme.

**Routing**: wouter for lightweight client-side routing

**State Management**: TanStack Query (React Query) for server state management with aggressive caching strategies (staleTime: Infinity) to minimize unnecessary refetches

**Key Design Decisions**:
- Component-based architecture with reusable UI primitives
- Path aliases configured for clean imports (`@/` for client code, `@shared/` for shared types)
- Theme system supporting light/dark modes with localStorage persistence
- Sidebar-based navigation for admin interface
- Real-time data visualization using Recharts for traffic analytics

### Backend Architecture

**Runtime**: Node.js 18+ with Express framework

**Request Processing Pipeline**:
1. Trust proxy configuration (1 hop for Replit deployment)
2. Rate limiting middleware (100 requests per 15 minutes per IP)
3. Helmet security headers
4. Traffic detection and classification
5. Response serving based on classification

**Traffic Detection System** (`TrafficDetector`):
- Analyzes User-Agent strings using ua-parser-js
- GeoIP lookup using geoip-lite
- Pattern matching for bot detection (crawlers, scrapers, headless browsers)
- Legitimate crawler allowlist (Google, Bing, Facebook, etc.)
- Scoring algorithm producing classifications: HUMAN, SUSPICIOUS, KNOWN_CRAWLER, BLOCKED
- Configurable rules engine for whitelist/blacklist patterns

**Storage Layer**: In-memory storage implementation (`MemStorage`) implementing the `IStorage` interface. This provides a database-agnostic abstraction layer that can be swapped for PostgreSQL/Neon without changing business logic. The schema is designed for Drizzle ORM with PostgreSQL in mind.

**Logging**: Winston logger with JSON formatting and configurable log levels

### Data Storage

**Database Schema** (Drizzle ORM with PostgreSQL target):

1. **traffic_logs**: Records all analyzed requests with IP, user agent, country, classification, score, action taken, UTM parameters, fingerprint, and detection reasons
2. **preview_tokens**: Manages secure access tokens for QA/reviewer preview with expiration, usage tracking, and active status
3. **rules**: Configurable whitelist/blacklist rules for IPs and user agents with pattern matching
4. **settings**: Key-value configuration storage

**Current Implementation**: In-memory storage for development/POC with full interface compatibility for database migration

### Authentication & Authorization

**Preview Token System**: Secure token-based access for QA/reviewers
- Tokens generated through admin panel
- Usage tracking and audit logging
- Expiration support
- No tokens embedded in ads (compliance requirement)

**Admin Access**: Currently unrestricted (authentication system not implemented in current codebase)

### External Dependencies

**Third-Party Libraries**:
- **@neondatabase/serverless**: PostgreSQL driver for Neon database integration
- **geoip-lite**: IP-to-country geolocation (no external API)
- **ua-parser-js**: User agent parsing and device detection
- **express-rate-limit**: IP-based rate limiting
- **helmet**: Security headers middleware
- **nanoid**: Secure random ID generation
- **date-fns**: Date manipulation and formatting

**Design System Components**:
- **Radix UI**: Accessible component primitives (30+ components)
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Pre-styled component implementations
- **class-variance-authority**: Component variant management
- **Recharts**: Data visualization

**Future Integration Points** (documented but not yet implemented):
- Cloudflare Turnstile or Google reCAPTCHA v3 for challenge flows
- Cloudflare Workers/Bot Management for enhanced detection
- Sentry for error tracking
- FingerprintJS for browser fingerprinting

### Compliance & Audit Features

**Audit Report Generation**: Endpoint `/api/audit/report` generates compliance reports with:
- Total requests by classification
- Action breakdown (allow, challenge, block, redirect)
- Chronological event log with decision explanations
- Date range filtering

**Decision Transparency**: Each traffic log includes detection reasons explaining why a request was classified and acted upon

**Policy Compliance Design**:
- Public landing page matches ad creative requirements
- Preview tokens logged and auditable
- No deceptive redirects or content cloaking
- Legitimate crawler detection and appropriate serving

### API Structure

**Public Endpoints**:
- `GET /api/detect`: Analyzes incoming request and returns classification with message

**Admin Endpoints**:
- `GET /api/stats`: Traffic statistics summary
- `GET /api/stats/chart`: Time-series chart data
- `GET /api/traffic`: Traffic logs with optional classification filter
- `GET /api/traffic/recent`: Recent traffic logs
- `GET /api/tokens`: Preview token management
- `POST /api/tokens`: Create new preview token
- `DELETE /api/tokens/:id`: Delete preview token
- `GET /api/rules`: Whitelist/blacklist rules
- `POST /api/rules`: Create new rule
- `DELETE /api/rules/:id`: Delete rule
- `GET /api/audit/report`: Generate audit compliance report

### Build & Deployment

**Development**: Vite dev server with HMR, Express API server with tsx for TypeScript execution

**Production Build**:
- Frontend: Vite build to `dist/public`
- Backend: esbuild bundle to `dist` with ESM format
- Database migrations: Drizzle Kit push command

**Environment Requirements**:
- `DATABASE_URL`: PostgreSQL connection string (for production)
- `NODE_ENV`: development/production flag
- `LOG_LEVEL`: Winston log level (default: info)

**Deployment Target**: Replit platform with built-in PostgreSQL provisioning support