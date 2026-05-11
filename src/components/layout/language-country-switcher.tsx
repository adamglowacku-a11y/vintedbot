"use client";

import { useState } from "react";

const languages = [
  { value: "pl", label: "Polski" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" }
];

const countries = [
  { value: "PL", label: "Polska", currency: "zł" },
  { value: "DE", label: "Niemcy", currency: "€" },
  { value: "FR", label: "Francja", currency: "€" },
  { value: "ES", label: "Hiszpania", currency: "€" },
  { value: "IT", label: "Włochy", currency: "€" }
];

export function LanguageCountrySwitcher() {
  const [language, setLanguage] = useState(() => getStoredValue("vintedflow:language", "pl"));
  const [country, setCountry] = useState(() => getStoredValue("vintedflow:country", "PL"));

  function updateLanguage(value: string) {
    setLanguage(value);
    window.localStorage.setItem("vintedflow:language", value);
  }

  function updateCountry(value: string) {
    setCountry(value);
    window.localStorage.setItem("vintedflow:country", value);
  }

  const currency = countries.find((item) => item.value === country)?.currency ?? "zł";

  return (
    <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-muted-foreground md:flex">
      <label className="flex items-center gap-2">
        Język
        <select
          className="rounded-full border border-white/10 bg-background px-2 py-1 text-white outline-none"
          onChange={(event) => updateLanguage(event.target.value)}
          value={language}
        >
          {languages.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        Kraj
        <select
          className="rounded-full border border-white/10 bg-background px-2 py-1 text-white outline-none"
          onChange={(event) => updateCountry(event.target.value)}
          value={country}
        >
          {countries.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <span className="rounded-full bg-primary/10 px-2 py-1 font-semibold text-primary">{currency}</span>
    </div>
  );
}

function getStoredValue(key: string, fallback: string) {
  if (typeof window === "undefined") {
    return fallback;
  }

  return window.localStorage.getItem(key) ?? fallback;
}
