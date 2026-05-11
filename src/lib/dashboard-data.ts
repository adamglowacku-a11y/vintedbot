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
  Zap,
  PlugZap
} from "lucide-react";
import type { Route } from "next";

type DashboardNavItem = {
  label: string;
  href: Route | "/extension/connect";
  icon: typeof BarChart3;
};

export const dashboardNavItems: DashboardNavItem[] = [
  { label: "Przegląd", href: "/dashboard", icon: BarChart3 },
  { label: "Oferty", href: "/dashboard/listings", icon: Layers3 },
  { label: "Automatyzacje", href: "/dashboard/automations", icon: Bot },
  { label: "Wiadomości", href: "/dashboard/messages", icon: Inbox },
  { label: "Analityka", href: "/dashboard/analytics", icon: TrendingUp },
  { label: "Rozszerzenie", href: "/extension/connect", icon: PlugZap },
  { label: "Ustawienia", href: "/dashboard/settings", icon: Settings }
];

export const overviewCards = [
  { label: "Przychód demo", value: "8 420 zł", delta: "+21,4%", icon: TrendingUp },
  { label: "Aktywne oferty", value: "486", delta: "+38 w tym tygodniu", icon: Layers3 },
  { label: "Uruchomione akcje", value: "1 284", delta: "99,1% poprawnie", icon: Zap },
  { label: "Wsparte odpowiedzi", value: "742", delta: "średnio 48 s", icon: Inbox }
];

export const recentActions = [
  "Odświeżono 36 przykładowych ofert premium",
  "Dodano kampanię rabatową na weekend do kolejki",
  "Wstrzymano automatyzację po ostrzeżeniu o limicie",
  "Zsynchronizowano ustawienia rozszerzenia z Chrome"
];

export const automationActivity = [
  { title: "Odświeżanie zakończone", detail: "Kolekcja płaszczy i dzianin", time: "2 min temu", icon: RefreshCw },
  { title: "Osiągnięto limit bezpieczeństwa", detail: "Automatyzacja ofert wstrzymana na 30 min", time: "18 min temu", icon: ShieldCheck },
  { title: "Opisy zoptymalizowane", detail: "Ulepszono 14 ofert", time: "41 min temu", icon: Sparkles },
  { title: "Kolejka zaktualizowana", detail: "Usunięto sprzedane oferty z kolejki", time: "1 godz. temu", icon: PackageCheck }
];

export const listings = [
  { name: "Płaszcz wełniany beżowy", sku: "VNT-2041", price: "72 zł", views: 1240, saves: 86, status: "Aktywna" },
  { name: "Bluza Nike vintage", sku: "VNT-1988", price: "38 zł", views: 820, saves: 44, status: "Podbita" },
  { name: "Skórzane botki", sku: "VNT-1870", price: "54 zł", views: 612, saves: 31, status: "Do odświeżenia" },
  { name: "Komplet marynarka Zara", sku: "VNT-1792", price: "49 zł", views: 944, saves: 63, status: "W kolejce" },
  { name: "Szalik kaszmirowy", sku: "VNT-1665", price: "29 zł", views: 402, saves: 18, status: "Szkic" }
];

export const automationQueues = [
  { name: "Kolejka odświeżania", count: 128, status: "Działa", window: "Co 45-75 min" },
  { name: "Kolejka ofert", count: 44, status: "Cooldown", window: "Maks. 18 / godz." },
  { name: "Kolejka opisów", count: 19, status: "Zaplanowana", window: "Dzisiaj 22:00" }
];

export const messageTemplates = [
  { name: "Follow-up po ofercie zestawu", usage: "284 użycia", cooldown: "30 min", enabled: true },
  { name: "Potwierdzenie wysyłki", usage: "191 użyć", cooldown: "10 min", enabled: true },
  { name: "Ochrona negocjacji ceny", usage: "88 użyć", cooldown: "45 min", enabled: false }
];

export const analyticsSegments = [
  { label: "Konwersja", value: "8,7%", detail: "+1,9% vs poprzedni miesiąc" },
  { label: "Średnia wartość zamówienia", value: "41,20 zł", detail: "+6,40 zł vs poprzedni miesiąc" },
  { label: "Wpływ automatyzacji", value: "24,8%", detail: "Przychód demo przypisany workflow" },
  { label: "Szybkość odpowiedzi", value: "94%", detail: "Odpowiedzi w ciągu 2 minut" }
];

export const quickActions = [
  { label: "Połącz rozszerzenie", icon: PackageCheck },
  { label: "Utwórz regułę odświeżania", icon: RefreshCw },
  { label: "Dodaj szablon wiadomości", icon: Inbox },
  { label: "Sprawdź limity bezpieczeństwa", icon: ShieldCheck }
];

export const scheduleOptions = [
  { label: "Godziny ciszy", value: "23:00 - 07:00" },
  { label: "Opóźnienie odświeżania", value: "45-75 minut" },
  { label: "Dzienny limit akcji", value: "320 akcji" },
  { label: "Cooldown ofert", value: "30 minut" }
];

export const settingsGroups = [
  {
    title: "Konto",
    items: ["Nazwa workspace", "Profil sprzedawcy", "Email powiadomień", "Dostęp zespołu"]
  },
  {
    title: "Subskrypcja",
    items: ["Plan Growth", "Panel płatności", "Limity użycia", "Historia faktur"]
  },
  {
    title: "Synchronizacja rozszerzenia",
    items: ["Parowanie rozszerzenia Chrome", "Stan sesji", "Częstotliwość synchronizacji ofert", "Reset lokalnego cache"]
  },
  {
    title: "API i bezpieczeństwo",
    items: ["Klucze API", "Dostawcy OAuth", "Sekrety webhooków", "Logi audytu"]
  }
];

export const hourlyPerformance = [38, 52, 46, 71, 84, 66, 92, 104, 88, 118, 132, 126];

export const extensionStatus = {
  connected: true,
  browser: "Chrome",
  version: "0.8.2",
  lastSync: "18 sekund temu",
  activeTab: "Profil Vinted"
};

export const syncTimeline = [
  { label: "Heartbeat rozszerzenia", value: "Zdrowy", icon: Clock3 },
  { label: "Supabase realtime", value: "Subskrybuje", icon: Zap },
  { label: "Worker kolejki", value: "Gotowy", icon: Bot }
];
