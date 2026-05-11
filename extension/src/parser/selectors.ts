export const SELECTOR_VERSION = "vinted-card-parser@1";

export const listingCardSelectors = [
  "[data-testid*='item-box']",
  "[data-testid*='item']",
  "article",
  "div[class*='feed-grid'] > div",
  "a[href*='/items/']",
  "a[href*='/item/']"
];

export const titleSelectors = [
  "[data-testid*='title']",
  "[class*='title']",
  "h2",
  "h3",
  "img[alt]"
];

export const priceSelectors = [
  "[data-testid*='price']",
  "[class*='price']",
  "[class*='Price']"
];

export const refreshButtonSelectors = [
  "button[aria-label*='refresh' i]",
  "button[aria-label*='odświe' i]",
  "button[aria-label*='erneuern' i]",
  "button[data-testid*='refresh' i]"
];

export const statusKeywords = {
  sold: ["sold", "sprzedane", "verkauft", "vendu"],
  reserved: ["reserved", "zarezerwowane", "reserviert", "réservé"],
  hidden: ["hidden", "ukryte", "ausgeblendet", "masqué"]
};
