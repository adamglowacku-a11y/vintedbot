import type { ParserHealthState } from "@/types/extension";

const OVERLAY_ID = "vintedflow-parser-debug";

export function updateParserDebugOverlay(health: ParserHealthState) {
  const overlay = getOrCreateOverlay();
  const counters = Object.entries(health.selectorCounters ?? {})
    .filter(([, count]) => count > 0)
    .slice(0, 5)
    .map(([selector, count]) => `${shorten(selector)}: ${count}`)
    .join(" · ");

  overlay.innerHTML = `
    <strong>VintedFlow parser</strong>
    <span>Status: ${health.status}</span>
    <span>Oferty: ${health.listingsFound}</span>
    <span>Czas: ${health.scanDurationMs ?? 0}ms</span>
    <span>Anchor: ${health.domHealth?.anchorsFound ?? 0} · Visible: ${health.domHealth?.visibleCandidates ?? 0}</span>
    <small>${counters || "Brak trafionych selektorów"}</small>
  `;
}

function getOrCreateOverlay() {
  const existing = document.getElementById(OVERLAY_ID);

  if (existing) {
    return existing;
  }

  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.style.cssText = [
    "position:fixed",
    "right:12px",
    "bottom:12px",
    "z-index:2147483647",
    "display:grid",
    "gap:3px",
    "max-width:280px",
    "padding:10px 12px",
    "border:1px solid rgba(45,212,191,.35)",
    "border-radius:14px",
    "background:rgba(7,10,19,.88)",
    "color:#f8fafc",
    "font:12px Inter,system-ui,sans-serif",
    "box-shadow:0 20px 60px rgba(0,0,0,.35)",
    "backdrop-filter:blur(18px)"
  ].join(";");
  document.documentElement.appendChild(overlay);
  return overlay;
}

function shorten(selector: string) {
  return selector.length > 32 ? `${selector.slice(0, 29)}...` : selector;
}
