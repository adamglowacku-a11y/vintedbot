export const SELECTOR_VERSION = "vinted-card-parser@2";

export const listingCardSelectors = [
  "[data-testid*='item-box']",
  "[data-testid*='grid-item']",
  "[data-testid*='closet-item']",
  "[data-testid*='catalog-item']",
  "[data-testid*='item']",
  "[class*='ItemBox']",
  "[class*='item-box']",
  "[class*='feed-grid'] [class*='cell']",
  "[class*='web_ui__Cell']",
  "article",
  "li",
  "div[class*='feed-grid'] > div",
  "div[class*='grid'] a[href*='/items/']",
  "a[href*='/items/']",
  "a[href*='/item/']"
];

export const titleSelectors = [
  "[data-testid*='title']",
  "[data-testid*='item-title']",
  "[data-testid*='description']",
  "[class*='title']",
  "[class*='Title']",
  "h2",
  "h3",
  "p",
  "span",
  "img[alt]"
];

export const priceSelectors = [
  "[data-testid*='price']",
  "[data-testid*='item-price']",
  "[class*='price']",
  "[class*='Price']",
  "span",
  "p"
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
