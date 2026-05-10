import {
  BarChart3,
  Bot,
  Clock3,
  Inbox,
  Layers3,
  PackageCheck,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap
} from "lucide-react";
import type { Route } from "next";

type DashboardNavItem = {
  label: string;
  href: Route;
  icon: typeof BarChart3;
};

export const dashboardNavItems: DashboardNavItem[] = [
  { label: "Overview", href: "/dashboard", icon: BarChart3 },
  { label: "Listings", href: "/dashboard/listings", icon: Layers3 },
  { label: "Automations", href: "/dashboard/automations", icon: Bot },
  { label: "Messages", href: "/dashboard/messages", icon: Inbox },
  { label: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
  { label: "Settings", href: "/dashboard/settings", icon: Settings }
];

export const overviewCards = [
  { label: "Revenue tracked", value: "€8,420", delta: "+21.4%", icon: TrendingUp },
  { label: "Active listings", value: "486", delta: "+38 this week", icon: Layers3 },
  { label: "Automations run", value: "1,284", delta: "99.1% healthy", icon: Zap },
  { label: "Replies assisted", value: "742", delta: "48 sec avg.", icon: Inbox }
];

export const recentActions = [
  "Refreshed 36 premium listings",
  "Queued weekend discount campaign",
  "Paused automation after low stock warning",
  "Synced extension settings from Chrome"
];

export const automationActivity = [
  { title: "Auto refresh completed", detail: "Coats and knitwear collection", time: "2 min ago", icon: RefreshCw },
  { title: "Safety limit reached", detail: "Offer automation paused for 30 min", time: "18 min ago", icon: ShieldCheck },
  { title: "Descriptions optimized", detail: "14 listings improved", time: "41 min ago", icon: Sparkles },
  { title: "Order flow updated", detail: "Sold items removed from queue", time: "1 hr ago", icon: PackageCheck }
];

export const listings = [
  { name: "Wool coat - beige", sku: "VNT-2041", price: "€72", views: 1240, saves: 86, status: "Active" },
  { name: "Nike vintage hoodie", sku: "VNT-1988", price: "€38", views: 820, saves: 44, status: "Boosted" },
  { name: "Leather ankle boots", sku: "VNT-1870", price: "€54", views: 612, saves: 31, status: "Needs refresh" },
  { name: "Zara blazer set", sku: "VNT-1792", price: "€49", views: 944, saves: 63, status: "Queued" },
  { name: "Cashmere scarf", sku: "VNT-1665", price: "€29", views: 402, saves: 18, status: "Draft" }
];

export const automationQueues = [
  { name: "Refresh queue", count: 128, status: "Running", window: "Every 45-75 min" },
  { name: "Offer queue", count: 44, status: "Cooling down", window: "Max 18 / hour" },
  { name: "Description queue", count: 19, status: "Scheduled", window: "Tonight 22:00" }
];

export const messageTemplates = [
  { name: "Bundle offer follow-up", usage: "284 uses", cooldown: "30 min", enabled: true },
  { name: "Shipping confirmation", usage: "191 uses", cooldown: "10 min", enabled: true },
  { name: "Price negotiation guardrail", usage: "88 uses", cooldown: "45 min", enabled: false }
];

export const analyticsSegments = [
  { label: "Conversion rate", value: "8.7%", detail: "+1.9% vs last month" },
  { label: "Avg. order value", value: "€41.20", detail: "+€6.40 vs last month" },
  { label: "Automation lift", value: "24.8%", detail: "Revenue attributed to workflows" },
  { label: "Response SLA", value: "94%", detail: "Replies within 2 minutes" }
];

export const quickActions = [
  { label: "Connect extension", icon: PackageCheck },
  { label: "Create refresh rule", icon: RefreshCw },
  { label: "Add message template", icon: Inbox },
  { label: "Review safety limits", icon: ShieldCheck }
];

export const scheduleOptions = [
  { label: "Quiet hours", value: "23:00 - 07:00" },
  { label: "Refresh delay", value: "45-75 minutes" },
  { label: "Daily action cap", value: "320 actions" },
  { label: "Offer cooldown", value: "30 minutes" }
];

export const settingsGroups = [
  {
    title: "Account",
    items: ["Workspace name", "Seller profile", "Notification email", "Team access"]
  },
  {
    title: "Subscription",
    items: ["Growth plan", "Billing portal", "Usage limits", "Invoice history"]
  },
  {
    title: "Extension sync",
    items: ["Chrome extension pairing", "Session health", "Listing sync frequency", "Local cache reset"]
  },
  {
    title: "API and security",
    items: ["API keys", "OAuth providers", "Webhook secrets", "Audit logs"]
  }
];

export const hourlyPerformance = [38, 52, 46, 71, 84, 66, 92, 104, 88, 118, 132, 126];

export const extensionStatus = {
  connected: true,
  browser: "Chrome",
  version: "0.8.2",
  lastSync: "18 seconds ago",
  activeTab: "Vinted wardrobe"
};

export const syncTimeline = [
  { label: "Extension heartbeat", value: "Healthy", icon: Clock3 },
  { label: "Supabase realtime", value: "Subscribed", icon: Zap },
  { label: "Queue worker", value: "Ready", icon: Bot }
];
