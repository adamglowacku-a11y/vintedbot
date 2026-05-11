import { refreshButtonSelectors } from "@/parser/selectors";

type RefreshExecutionResult = {
  ok: boolean;
  error?: string;
};

export async function executeRefreshClick(listingId: string, delayMs: number): Promise<RefreshExecutionResult> {
  const card = findListingCard(listingId);

  if (!card) {
    return {
      ok: false,
      error: "Nie znaleziono karty oferty w aktualnym DOM Vinted."
    };
  }

  const button = findRefreshButton(card);

  if (!button) {
    return {
      ok: false,
      error: "Nie znaleziono bezpiecznego przycisku odświeżenia dla tej oferty."
    };
  }

  if (button.disabled || button.getAttribute("aria-disabled") === "true") {
    return {
      ok: false,
      error: "Przycisk odświeżenia jest obecnie nieaktywny."
    };
  }

  card.scrollIntoView({ behavior: "smooth", block: "center" });
  await wait(delayMs);

  if (!isVisible(button)) {
    return {
      ok: false,
      error: "Przycisk odświeżenia nie jest widoczny po przewinięciu."
    };
  }

  button.dispatchEvent(new MouseEvent("mouseover", { bubbles: true, cancelable: true, view: window }));
  await wait(180 + Math.floor(Math.random() * 220));
  button.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
  await wait(90 + Math.floor(Math.random() * 140));
  button.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }));
  button.click();

  return {
    ok: true
  };
}

function findListingCard(listingId: string) {
  const anchor = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href*='/item'], a[href*='/items']")).find((element) =>
    element.href.includes(`/items/${listingId}`) || element.href.includes(`/item/${listingId}`)
  );

  return anchor?.closest("[data-testid*='item-box'], article, div");
}

function findRefreshButton(card: Element) {
  for (const selector of refreshButtonSelectors) {
    const button = card.querySelector<HTMLButtonElement>(selector);

    if (button) {
      return button;
    }
  }

  return null;
}

function isVisible(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
