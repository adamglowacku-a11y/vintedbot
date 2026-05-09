import {
  ArrowUpRight,
  BellRing,
  Bot,
  Boxes,
  ChartNoAxesCombined,
  Clock3,
  CreditCard,
  Gauge,
  MessageSquareText,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react";

export const siteConfig = {
  name: "VintedFlow",
  description:
    "Premium automation suite for Vinted sellers with a Chrome extension, live dashboard, and Supabase-backed workflow engine.",
  url: "https://vintedflow.vercel.app"
};

export const navItems = [
  { label: "Features", href: "#features" },
  { label: "Preview", href: "#preview" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" }
];

export const stats = [
  { label: "Listings optimized", value: "2.4M+" },
  { label: "Avg. response time", value: "42s" },
  { label: "Seller hours saved", value: "18k" }
];

export const features = [
  {
    title: "Smart Listing Automation",
    description: "Bulk relist, refresh, and optimize product titles with timing rules that match buyer activity.",
    icon: Bot
  },
  {
    title: "Offer Intelligence",
    description: "Detect high-intent buyers, auto-suggest discounts, and protect minimum margins.",
    icon: Sparkles
  },
  {
    title: "Inbox Assistant",
    description: "Reply faster with reusable snippets, AI-assisted answers, and buyer context from the dashboard.",
    icon: MessageSquareText
  },
  {
    title: "Inventory Sync",
    description: "Track listing states, reserved items, sold items, and stale stock across every browser session.",
    icon: Boxes
  },
  {
    title: "Performance Analytics",
    description: "See conversion, revenue, saves, views, and automation impact in a clean seller cockpit.",
    icon: ChartNoAxesCombined
  },
  {
    title: "Secure Extension Bridge",
    description: "Connect the Chrome extension to Supabase auth with scoped sessions and encrypted tokens.",
    icon: ShieldCheck
  }
];

export const dashboardMetrics = [
  { label: "Revenue this week", value: "€4,280", delta: "+18.4%", icon: CreditCard },
  { label: "Active automations", value: "27", delta: "+6 today", icon: Zap },
  { label: "Avg. listing score", value: "92%", delta: "+11 pts", icon: Gauge },
  { label: "Orders processed", value: "184", delta: "+32%", icon: PackageCheck }
];

export const activity = [
  { title: "Auto-refreshed winter coats collection", time: "2 min ago", icon: Clock3 },
  { title: "Sent bundled offer to Marta K.", time: "8 min ago", icon: ArrowUpRight },
  { title: "Detected low-margin counteroffer", time: "12 min ago", icon: BellRing },
  { title: "Optimized 14 listing descriptions", time: "24 min ago", icon: Sparkles }
];

export const pricingPlans = [
  {
    name: "Starter",
    price: "€19",
    description: "For solo sellers automating core listing workflows.",
    features: ["150 active listings", "Chrome extension", "Basic analytics", "Email support"],
    cta: "Start free"
  },
  {
    name: "Growth",
    price: "€49",
    description: "For sellers scaling daily operations and buyer messaging.",
    features: ["Unlimited active listings", "Offer intelligence", "Inbox assistant", "Advanced analytics"],
    cta: "Try Growth",
    featured: true
  },
  {
    name: "Studio",
    price: "€119",
    description: "For teams managing multiple wardrobes and seller accounts.",
    features: ["Multi-account dashboard", "Team permissions", "Priority support", "Custom workflows"],
    cta: "Contact sales"
  }
];

export const faqs = [
  {
    question: "How does the Chrome extension connect to the dashboard?",
    answer:
      "The extension authenticates through Supabase and sends listing, activity, and workflow events to the dashboard in real time."
  },
  {
    question: "Can I control automation limits?",
    answer:
      "Yes. Every workflow has rate limits, quiet hours, margin rules, and manual approval settings so sellers stay in control."
  },
  {
    question: "Is this ready for Vercel deployment?",
    answer:
      "The architecture is built for Vercel with environment-based Supabase configuration and clean Next.js app routing."
  },
  {
    question: "What data is stored?",
    answer:
      "Only seller-approved operational data such as listing metadata, workflow activity, analytics, and account preferences."
  }
];
