export const SELECTOR_VERSION = "vinted-card-parser@2";

export const listingCardSelectors = [
  "[data-testid*='item-box']",
  "[data-testid*='itemBox']",
  "[data-testid*='item-card']",
  "[data-testid*='grid-item']",
  "[data-testid*='closet-item']",
  "[data-testid*='catalog-item']",
  "[data-testid*='item']",
  "[class*='ItemBox']",
  "[class*='item-box']",
  "[class*='itemBox']",
  "[class*='feed-grid__item']",
  "[class*='feed-grid'] [class*='cell']",
  "[class*='web_ui__Cell']",
  "[class*='web_ui__ItemBox']",
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
  "button[aria-label*='podbij' i]",
  "button[aria-label*='wyróż' i]",
  "button[aria-label*='promuj' i]",
  "button[aria-label*='boost' i]",
  "button[aria-label*='bump' i]",
  "button[aria-label*='erneuern' i]",
  "button[data-testid*='refresh' i]",
  "button[data-testid*='bump' i]",
  "button[data-testid*='promote' i]",
  "a[href*='bump']",
  "a[href*='promote']"
];

export const refreshButtonTextKeywords = [
  "odśwież",
  "odswiez",
  "podbij",
  "wyróżnij",
  "wyroznij",
  "promuj",
  "boost",
  "bump",
  "refresh",
  "promote",
  "erneuern",
  "hervorheben",
  "mettre en avant",
  "relancer",
  "destacar"
];

export const statusKeywords = {
  sold: ["sold", "sprzedane", "sprzedano", "verkauft", "vendu", "vendido", "venduto", "verkocht"],
  reserved: ["reserved", "zarezerwowane", "reserviert", "réservé", "reservado", "riservato", "gereserveerd"],
  hidden: ["hidden", "ukryte", "ausgeblendet", "masqué", "oculto", "nascosto", "verborgen"]
};
