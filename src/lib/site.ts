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
    "Premium suite do bezpiecznej automatyzacji sprzedaży na Vinted z rozszerzeniem Chrome, dashboardem i Supabase.",
  url: "https://vintedflow.vercel.app"
};

export const navItems = [
  { label: "Funkcje", href: "#features" },
  { label: "Podgląd", href: "#preview" },
  { label: "Cennik", href: "#pricing" },
  { label: "FAQ", href: "#faq" }
];

export const stats = [
  { label: "Zoptymalizowane oferty", value: "2,4M+" },
  { label: "Średni czas odpowiedzi", value: "42 s" },
  { label: "Oszczędzone godziny", value: "18 tys." }
];

export const features = [
  {
    title: "Inteligentna automatyzacja ofert",
    description: "Odświeżaj i optymalizuj oferty z limitami czasu dopasowanymi do aktywności kupujących.",
    icon: Bot
  },
  {
    title: "Analiza ofert",
    description: "Wykrywaj zainteresowanych kupujących, sugeruj rabaty i chroń minimalną marżę.",
    icon: Sparkles
  },
  {
    title: "Asystent wiadomości",
    description: "Odpowiadaj szybciej dzięki szablonom, kontekstowi kupującego i bezpiecznym limitom.",
    icon: MessageSquareText
  },
  {
    title: "Synchronizacja asortymentu",
    description: "Śledź aktywne, zarezerwowane, sprzedane i nieaktualne oferty w sesjach przeglądarki.",
    icon: Boxes
  },
  {
    title: "Analityka sprzedaży",
    description: "Sprawdzaj konwersję, przychód, zapisania, wyświetlenia i wpływ automatyzacji.",
    icon: ChartNoAxesCombined
  },
  {
    title: "Bezpieczny bridge rozszerzenia",
    description: "Łącz rozszerzenie Chrome z Supabase Auth przez kontrolowaną sesję dashboardu.",
    icon: ShieldCheck
  }
];

export const dashboardMetrics = [
  { label: "Przychód w tygodniu", value: "4 280 zł", delta: "+18,4%", icon: CreditCard },
  { label: "Aktywne automatyzacje", value: "27", delta: "+6 dzisiaj", icon: Zap },
  { label: "Średni wynik oferty", value: "92%", delta: "+11 pkt", icon: Gauge },
  { label: "Obsłużone zamówienia", value: "184", delta: "+32%", icon: PackageCheck }
];

export const activity = [
  { title: "Odświeżono kolekcję płaszczy zimowych", time: "2 min temu", icon: Clock3 },
  { title: "Wysłano propozycję zestawu do Marta K.", time: "8 min temu", icon: ArrowUpRight },
  { title: "Wykryto kontrofertę z niską marżą", time: "12 min temu", icon: BellRing },
  { title: "Zoptymalizowano 14 opisów ofert", time: "24 min temu", icon: Sparkles }
];

export const pricingPlans = [
  {
    name: "Start",
    price: "19 zł",
    description: "Dla pojedynczych sprzedawców automatyzujących podstawowe procesy.",
    features: ["150 aktywnych ofert", "Rozszerzenie Chrome", "Podstawowa analityka", "Wsparcie email"],
    cta: "Zacznij za darmo"
  },
  {
    name: "Growth",
    price: "49 zł",
    description: "Dla sprzedawców rozwijających codzienną sprzedaż i wiadomości.",
    features: ["Nielimitowane aktywne oferty", "Analiza ofert", "Asystent wiadomości", "Zaawansowana analityka"],
    cta: "Wypróbuj Growth",
    featured: true
  },
  {
    name: "Studio",
    price: "119 zł",
    description: "Dla zespołów obsługujących wiele profili i kont sprzedawców.",
    features: ["Dashboard wielu kont", "Uprawnienia zespołu", "Priorytetowe wsparcie", "Własne workflow"],
    cta: "Kontakt"
  }
];

export const faqs = [
  {
    question: "Jak rozszerzenie Chrome łączy się z dashboardem?",
    answer:
      "Rozszerzenie korzysta z sesji Supabase przekazanej przez dashboard i synchronizuje stan ofert oraz akcji."
  },
  {
    question: "Czy mogę kontrolować limity automatyzacji?",
    answer:
      "Tak. Każdy workflow ma limity częstotliwości, godziny ciszy, zasady marży i opcjonalną akceptację ręczną."
  },
  {
    question: "Czy projekt jest gotowy pod Vercel?",
    answer:
      "Architektura jest przygotowana pod Vercel, Supabase i routing Next.js App Router."
  },
  {
    question: "Jakie dane są zapisywane?",
    answer:
      "Tylko dane operacyjne zaakceptowane przez sprzedawcę: metadane ofert, aktywność workflow, analityka i ustawienia konta."
  }
];
