import {
  LayoutDashboard,
  List,
  Key,
  FileText,
  Settings,
  Shield,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
    testId: "link-dashboard",
  },
  {
    title: "Traffic Logs",
    url: "/admin/logs",
    icon: List,
    testId: "link-traffic-logs",
  },
  {
    title: "Preview Tokens",
    url: "/admin/tokens",
    icon: Key,
    testId: "link-preview-tokens",
  },
  {
    title: "Audit Reports",
    url: "/admin/audit",
    icon: FileText,
    testId: "link-audit-reports",
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
    testId: "link-settings",
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/admin">
          <div className="flex items-center gap-2 hover-elevate rounded-md p-2 cursor-pointer" data-testid="link-logo">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm font-semibold">TrafficSeg-Guard</p>
              <p className="text-xs text-muted-foreground">Protection System</p>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <Link href={item.url}>
                      <SidebarMenuButton isActive={isActive} data-testid={item.testId}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
