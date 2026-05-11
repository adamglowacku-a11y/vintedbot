import {
  listingCardSelectors,
  priceSelectors,
  refreshButtonSelectors,
  SELECTOR_VERSION,
  statusKeywords,
  titleSelectors
} from "@/parser/selectors";
import type { ParsedListingStatus, ParsedVintedListing } from "@/types/extension";

const PRICE_PATTERN = /(?<currency>€|zł|PLN|EUR|\$|£)\s?(?<amount>\d+(?:[.,]\d{1,2})?)|(?<amountAfter>\d+(?:[.,]\d{1,2})?)\s?(?<currencyAfter>€|zł|PLN|EUR|\$|£)/i;

export function parseListingsFromDocument(documentRoot: Document = document) {
  const candidates = collectListingCandidates(documentRoot);
  const listings = new Map<string, ParsedVintedListing>();

  for (const candidate of candidates) {
    const listing = parseListingCard(candidate);

    if (listing) {
      listings.set(listing.id, listing);
    }
  }

  return Array.from(listings.values()).slice(0, 80);
}

function collectListingCandidates(documentRoot: Document) {
  const elements = new Set<Element>();

  for (const selector of listingCardSelectors) {
    documentRoot.querySelectorAll(selector).forEach((element) => {
      const card = element.closest("[data-testid*='item-box'], article, div") ?? element;
      elements.add(card);
    });
  }

  documentRoot.querySelectorAll("a[href*='/items/'], a[href*='/item/']").forEach((anchor) => {
    elements.add(anchor.closest("[data-testid*='item-box'], article, div") ?? anchor);
  });

  return Array.from(elements);
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

  return {
    id,
    title,
    priceText: price?.text,
    priceValue: price?.value,
    currency: price?.currency,
    url,
    status: extractStatus(card),
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

  return Array.from(card.querySelectorAll<HTMLAnchorElement>("a[href]")).find((anchor) => isListingUrl(anchor.href));
}

function isListingUrl(url: string) {
  return /\/items?\//i.test(url);
}

function extractListingId(url: string) {
  const match = url.match(/\/items?\/(?<id>\d+)/i);
  return match?.groups?.id;
}

function extractTitle(card: Element, anchor?: HTMLAnchorElement) {
  for (const selector of titleSelectors) {
    const element = card.querySelector(selector);

    if (element instanceof HTMLImageElement && element.alt.trim()) {
      return normalizeText(element.alt);
    }

    const text = normalizeText(element?.textContent);

    if (text && !PRICE_PATTERN.test(text)) {
      return text;
    }
  }

  const ariaLabel = anchor?.getAttribute("aria-label");
  return normalizeText(ariaLabel ?? anchor?.textContent);
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

  for (const [status, keywords] of Object.entries(statusKeywords)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
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
  return refreshButtonSelectors.some((selector) => Boolean(card.querySelector(selector)));
}

function normalizeText(value?: string | null) {
  const text = value?.replace(/\s+/g, " ").trim();
  return text || undefined;
}
