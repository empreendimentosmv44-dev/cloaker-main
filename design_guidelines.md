# TrafficSeg-Guard Design Guidelines

## Design Approach

**Selected Approach:** Design System-Based (Utility-Focused Application)

**Rationale:** TrafficSeg-Guard is a technical security and monitoring tool requiring information density, data clarity, and operational efficiency. Drawing inspiration from modern admin dashboards like Linear, Vercel Dashboard, and Railway.app.

**Core Principles:**
- Data clarity over decoration
- Instant comprehension of traffic patterns
- Trust-building through professional presentation
- Responsive performance monitoring

---

## Color Palette

### Dark Mode (Primary)
- **Background Base:** 220 13% 9%
- **Surface:** 220 13% 13%
- **Surface Elevated:** 220 13% 16%
- **Border:** 220 13% 24%
- **Text Primary:** 220 9% 98%
- **Text Secondary:** 220 9% 70%
- **Text Tertiary:** 220 9% 50%

### Status Colors
- **Success (Human Traffic):** 142 76% 45%
- **Warning (Suspicious):** 38 92% 50%
- **Danger (Blocked):** 0 84% 60%
- **Info (Crawler):** 217 91% 60%
- **Neutral:** 220 9% 46%

### Accent
- **Primary Action:** 217 91% 60%
- **Primary Hover:** 217 91% 55%

### Light Mode
- **Background Base:** 0 0% 100%
- **Surface:** 220 13% 97%
- **Text Primary:** 220 13% 9%
- **Border:** 220 13% 88%

---

## Typography

**Font Family:**
- Primary: 'Inter', system-ui, sans-serif
- Monospace: 'JetBrains Mono', 'Fira Code', monospace (for IPs, tokens, logs)

**Scale:**
- **Hero/Display:** text-4xl to text-6xl, font-bold (600-700)
- **Page Titles:** text-2xl to text-3xl, font-semibold (600)
- **Section Headers:** text-xl, font-semibold (600)
- **Body:** text-sm to text-base, font-normal (400)
- **Captions/Labels:** text-xs to text-sm, font-medium (500)
- **Code/Data:** text-xs to text-sm, font-mono

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section spacing: space-y-6, space-y-8
- Card gaps: gap-4, gap-6
- Page margins: m-8, mx-12

**Grid Structure:**
- **Admin Dashboard:** 12-column grid, responsive collapse to 1-column on mobile
- **Max Width:** max-w-7xl for content areas
- **Sidebar:** Fixed 256px (w-64) on desktop, full-width drawer on mobile

---

## Component Library

### Navigation
**Admin Sidebar:**
- Fixed left sidebar (w-64) with sections: Dashboard, Traffic Logs, Preview Tokens, Audit Reports, Settings
- Icons from Heroicons (outline style)
- Active state: subtle background (surface elevated) + accent border-l-2
- Collapsed mobile view with hamburger trigger

**Top Bar:**
- Logo + breadcrumb navigation
- User profile dropdown (top-right)
- Real-time status indicator (connection, alerts)

### Data Display

**Traffic Table:**
- Striped rows for readability
- Sticky header with sort indicators
- Status badges with dot indicators
- Expandable rows for detailed classification data
- Monospace font for IPs, timestamps, tokens
- Color-coded classification (green=HUMAN, yellow=SUSPICIOUS, red=BLOCKED, blue=CRAWLER)

**Stat Cards:**
- 4-column grid on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Large numeric value (text-3xl font-bold)
- Label (text-sm text-secondary)
- Trend indicator (arrow + percentage)
- Icon in top-right corner

**Charts:**
- Line charts for traffic over time (recharts or similar)
- Pie/donut for classification distribution
- Bar charts for hourly/daily patterns
- Minimal gridlines, accent color for data series

### Forms & Inputs

**Input Fields:**
- Dark mode: bg-surface, border-border, focus:ring-2 ring-primary
- Labels above inputs (text-sm font-medium)
- Helper text below (text-xs text-tertiary)
- Error states with red border + error icon

**Buttons:**
- Primary: bg-primary, text-white, rounded-md, px-4 py-2
- Secondary: border-2 border-border, hover:bg-surface
- Destructive: bg-danger, text-white
- Icon-only: square aspect ratio, p-2

**Token Generator:**
- Input + "Generate" button inline
- Copy-to-clipboard functionality with toast notification
- Expiry date picker
- Description textarea
- Generated token displayed in monospace with copy button

### Overlays

**Modals:**
- Centered, max-w-lg to max-w-2xl
- Dark backdrop (backdrop-blur-sm bg-black/50)
- Rounded corners (rounded-lg)
- Header with title + close button
- Footer with action buttons (right-aligned)

**Notifications/Toasts:**
- Top-right positioned
- Auto-dismiss after 5s
- Color-coded by type (success, warning, error)
- Icon + message + close button

**Drawer (Mobile):**
- Full-height, slide from left
- Same content as sidebar
- Overlay backdrop

---

## Page-Specific Layouts

### Public Landing (Security Warning)
- Centered content, max-w-2xl
- Shield icon or security illustration
- Bold headline: "Protected Access Point"
- Brief explanation of traffic filtering
- No hero image - minimal, text-focused
- Subtle background pattern or gradient
- Footer with audit endpoint link

### Admin Dashboard
**Layout:**
- Sidebar navigation (left)
- Main content area with header
- 4-stat card summary row
- Real-time traffic chart (full width)
- Recent requests table with pagination

**Sections:**
1. Stats Overview (grid-cols-4 gap-4)
2. Traffic Timeline Chart (h-64)
3. Recent Requests Table (max 20 rows)
4. Quick Actions Panel (right sidebar on xl screens)

### Traffic Logs Page
- Advanced filters (collapsible)
- Table with sorting, filtering, pagination
- Bulk actions toolbar
- Export CSV/JSON functionality

### Preview Token Manager
- List view of active tokens with status badges
- "Generate New Token" prominent button
- Form modal for token creation
- Token details in expandable cards

### Audit Reports
- Date range selector
- Report type dropdown
- Generate button
- Results displayed in structured format
- Download PDF/JSON options

---

## Animations

**Minimal, Purposeful Only:**
- Table row hover: subtle background transition (150ms)
- Button states: scale on active (95%)
- Modal enter/exit: fade + scale (200ms)
- Toast notifications: slide-in from right
- Loading states: subtle pulse on skeleton screens
- **No** page transitions, scroll animations, or decorative effects

---

## Images

**No large hero images.** This is a utility application focused on data and functionality. Visual elements are limited to:
- Logo/branding in navigation
- Icons throughout (Heroicons)
- Optional: Small security-themed illustration on public landing page (shield, lock, or abstract data flow graphic, max 200px, centered)
- Chart visualizations (generated, not static images)

---

## Responsive Breakpoints

- **Mobile:** < 768px - Stack all grids to single column, hamburger nav
- **Tablet:** 768px - 1024px - 2-column grids, visible sidebar toggle
- **Desktop:** > 1024px - Full multi-column layouts, persistent sidebar
- **Large:** > 1536px - Optional right sidebar for contextual actions