import {
  listingCardSelectors,
  priceSelectors,
  refreshButtonSelectors,
  refreshButtonTextKeywords,
  SELECTOR_VERSION,
  statusKeywords,
  titleSelectors
} from "@/parser/selectors";
import type { ParsedListingStatus, ParsedVintedListing, ParserHealthState } from "@/types/extension";

const PRICE_PATTERN = /(?<currency>€|zł|PLN|EUR|\$|£)\s?(?<amount>\d+(?:[.,]\d{1,2})?)|(?<amountAfter>\d+(?:[.,]\d{1,2})?)\s?(?<currencyAfter>€|zł|PLN|EUR|\$|£)/i;
const ITEM_LINK_SELECTOR = "a[href*='/items/'], a[href*='/item/'], a[href*='/catalog/']";

export function parseListingsFromDocument(documentRoot: Document = document) {
  return parseListingsWithDiagnostics(documentRoot).listings;
}

export function parseListingsWithDiagnostics(documentRoot: Document = document) {
  const startedAt = performance.now();
  const candidates = collectListingCandidates(documentRoot);
  const listings = new Map<string, ParsedVintedListing>();

  for (const candidate of candidates.elements) {
    const listing = parseListingCard(candidate);

    if (listing) {
      listings.set(listing.id, listing);
    }
  }

  const parsedListings = Array.from(listings.values()).slice(0, 120);
  const scanDurationMs = Math.round(performance.now() - startedAt);
  const health: Omit<ParserHealthState, "status" | "retries" | "logs"> = {
    lastRunAt: new Date().toISOString(),
    lastSuccessAt: parsedListings.length > 0 ? new Date().toISOString() : undefined,
    listingsFound: parsedListings.length,
    selectorVersion: SELECTOR_VERSION,
    scanDurationMs,
    selectorCounters: candidates.selectorCounters,
    domHealth: {
      anchorsFound: candidates.anchorsFound,
      imageCardsFound: candidates.imageCardsFound,
      visibleCandidates: candidates.visibleCandidates,
      documentReadyState: documentRoot.readyState,
      bodyTextLength: documentRoot.body?.innerText.length ?? 0
    }
  };

  return {
    listings: parsedListings,
    health
  };
}

function collectListingCandidates(documentRoot: Document) {
  const elements = new Set<Element>();
  const selectorCounters: Record<string, number> = {};

  for (const selector of listingCardSelectors) {
    const matches = Array.from(documentRoot.querySelectorAll(selector));
    selectorCounters[selector] = matches.length;
    matches.forEach((element) => {
      const card = findBestCardContainer(element);
      elements.add(card);
    });
  }

  const listingAnchors = Array.from(documentRoot.querySelectorAll<HTMLAnchorElement>(ITEM_LINK_SELECTOR)).filter((anchor) =>
    isListingUrl(anchor.href)
  );
  listingAnchors.forEach((anchor) => {
    elements.add(findBestCardContainer(anchor));
  });

  collectProfileGridImageCandidates(documentRoot).forEach((candidate) => {
    elements.add(candidate);
  });

  const visibleElements = Array.from(elements).filter(isVisibleCandidate);

  return {
    elements: visibleElements.length > 0 ? visibleElements : Array.from(elements),
    selectorCounters,
    anchorsFound: listingAnchors.length,
    imageCardsFound: Array.from(elements).filter((element) => Boolean(element.querySelector("img"))).length,
    visibleCandidates: visibleElements.length
  };
}

function collectProfileGridImageCandidates(documentRoot: Document) {
  return Array.from(documentRoot.querySelectorAll("img"))
    .map((image) => findBestCardContainer(image))
    .filter((candidate) => Boolean(findListingAnchor(candidate)) || looksLikeProfileListingCard(candidate));
}

function findBestCardContainer(element: Element) {
  const candidates: Element[] = [element];
  let current = element.parentElement;

  for (let depth = 0; depth < 8 && current; depth += 1) {
    candidates.push(current);
    current = current.parentElement;
  }

  return candidates
    .map((candidate) => ({ candidate, score: scoreCardCandidate(candidate) }))
    .sort((a, b) => b.score - a.score)[0]?.candidate ?? element;
}

function scoreCardCandidate(element: Element) {
  const text = element.textContent ?? "";
  const rect = element.getBoundingClientRect();
  let score = 0;

  if (element instanceof HTMLAnchorElement && isListingUrl(element.href)) score += 7;
  if (element.querySelector(ITEM_LINK_SELECTOR)) score += 6;
  if (element.querySelector("img")) score += 4;
  if (PRICE_PATTERN.test(text)) score += 3;
  if (/\b(podbij|bump|boost|push up|remonter|hervorheben)\b/i.test(text)) score += 3;
  if (text.length > 8 && text.length < 900) score += 2;
  if (rect.width >= 80 && rect.height >= 80) score += 2;
  if (rect.width >= 120 && rect.width <= 420 && rect.height >= 180 && rect.height <= 680) score += 4;
  if (element.matches("[data-testid*='item-box'], [data-testid*='itemBox'], [data-testid*='grid-item'], [class*='ItemBox'], [class*='item-box'], article, li")) score += 5;
  if (text.length > 1500) score -= 5;

  return score;
}

function isVisibleCandidate(element: Element) {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return rect.width > 20 && rect.height > 20 && style.display !== "none" && style.visibility !== "hidden";
}

function parseListingCard(card: Element): ParsedVintedListing | null {
  const anchor = findListingAnchor(card);
  const url = anchor?.href;

  if (!url) {
    return null;
  }

  const id = extractListingId(url);

  if (!id) {
    return null;
  }

  const title = extractTitle(card, anchor) ?? "Vinted listing";
  const price = extractPrice(card);
  const status = extractStatus(card);

  if (status === "sold") {
    return null;
  }

  return {
    id,
    title,
    priceText: price?.text,
    priceValue: price?.value,
    currency: price?.currency,
    url,
    status,
    imageUrl: extractImage(card),
    hasRefreshButton: hasRefreshButton(card),
    parsedAt: new Date().toISOString(),
    selectorVersion: SELECTOR_VERSION
  };
}

function findListingAnchor(card: Element) {
  if (card instanceof HTMLAnchorElement && isListingUrl(card.href)) {
    return card;
  }

  const anchors = Array.from(card.querySelectorAll<HTMLAnchorElement>("a[href]")).filter((anchor) => isListingUrl(anchor.href));
  return anchors.sort((a, b) => scoreAnchor(b) - scoreAnchor(a))[0];
}

function isListingUrl(url: string) {
  return /\/items?\//i.test(url) || /\/catalog\/\d+/i.test(url);
}

function extractListingId(url: string) {
  const match = url.match(/\/items?\/(?<id>\d+)/i) ?? url.match(/\/catalog\/(?<id>\d+)/i);
  return match?.groups?.id;
}

function scoreAnchor(anchor: HTMLAnchorElement) {
  let score = 0;
  if (anchor.querySelector("img")) score += 3;
  if (anchor.href.includes("/items/")) score += 3;
  if (anchor.textContent && PRICE_PATTERN.test(anchor.textContent)) score += 2;
  return score;
}

function extractTitle(card: Element, anchor?: HTMLAnchorElement) {
  for (const selector of titleSelectors) {
    const element = card.querySelector(selector);

    if (element instanceof HTMLImageElement && element.alt.trim()) {
      return normalizeText(element.alt);
    }

    const text = normalizeText(element?.textContent);

    if (text && !PRICE_PATTERN.test(text) && text.length < 180) {
      return text;
    }
  }

  const ariaLabel = anchor?.getAttribute("aria-label");
  const imageAlt = card.querySelector<HTMLImageElement>("img[alt]")?.alt;
  return normalizeText(ariaLabel ?? imageAlt ?? anchor?.textContent);
}

function extractPrice(card: Element) {
  const textSources = [
    ...priceSelectors.map((selector) => card.querySelector(selector)?.textContent),
    card.textContent
  ];

  for (const textSource of textSources) {
    const text = normalizeText(textSource);
    const match = text?.match(PRICE_PATTERN);

    if (!match?.groups) {
      continue;
    }

    const amount = match.groups.amount ?? match.groups.amountAfter;
    const currency = match.groups.currency ?? match.groups.currencyAfter;

    return {
      text: match[0],
      value: Number(amount.replace(",", ".")),
      currency
    };
  }

  return null;
}

function extractStatus(card: Element): ParsedListingStatus {
  const text = normalizeText(card.textContent)?.toLowerCase() ?? "";
  const imageLabels = Array.from(card.querySelectorAll("[aria-label], [title], img[alt]"))
    .map((element) => element.getAttribute("aria-label") ?? element.getAttribute("title") ?? element.getAttribute("alt"))
    .join(" ")
    .toLowerCase();
  const combinedText = `${text} ${imageLabels}`;

  for (const [status, keywords] of Object.entries(statusKeywords)) {
    if (keywords.some((keyword) => combinedText.includes(keyword))) {
      return status as ParsedListingStatus;
    }
  }

  return "active";
}

function extractImage(card: Element) {
  const image = card.querySelector<HTMLImageElement>("img[src], img[srcset]");

  if (!image) {
    return undefined;
  }

  return image.currentSrc || image.src || image.srcset.split(" ")[0];
}

function hasRefreshButton(card: Element) {
  if (refreshButtonSelectors.some((selector) => Boolean(card.querySelector(selector)))) {
    return true;
  }

  return Array.from(card.querySelectorAll("button, a, [role='button']")).some((element) =>
    refreshButtonTextKeywords.some((keyword) => normalizeText(element.textContent)?.toLowerCase().includes(keyword))
  );
}

function looksLikeProfileListingCard(card: Element) {
  const text = normalizeText(card.textContent)?.toLowerCase() ?? "";
  return Boolean(card.querySelector("img")) && PRICE_PATTERN.test(text) && /\b(podbij|bump|boost|wyświetleń|views|vu|gesehen)\b/i.test(text);
}

function normalizeText(value?: string | null) {
  const text = value?.replace(/\s+/g, " ").trim();
  return text || undefined;
}
