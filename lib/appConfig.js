import { PageConfig } from "./PageConfig";
import { drinks as defaultDrinks } from "./drinks";

export function getDefaultConfig() {
  return {
    currency: PageConfig.currency,
    discountAmount: 1,
    drinks: defaultDrinks.map((drink) => ({ ...drink })),
    title: PageConfig.title,
    titleColor: PageConfig.titleColor,
    language: PageConfig.language,
    showLogo: PageConfig.showLogo,
    highlightColors: { ...PageConfig.highlightColors },
    translations: PageConfig.translations,
  };
}

export function sanitizeConfig(input) {
  const defaults = getDefaultConfig();
  const configuredDrinks = Array.isArray(input.drinks) ? input.drinks : defaults.drinks;
  const drinks = configuredDrinks
    .filter((drink) => Number.isInteger(Number(drink.id)) && typeof drink.name === "string" && drink.name.trim() && Number.isFinite(Number(drink.price)))
    .map((drink) => ({
      id: Number(drink.id),
      name: drink.name.trim().slice(0, 60),
      price: Math.max(0, Math.min(1000, Number(drink.price))),
    }));
  const config = {
    ...defaults,
    currency: typeof input.currency === "string" && input.currency.trim() ? input.currency.trim().slice(0, 20) : defaults.currency,
    discountAmount: Number.isFinite(Number(input.discountAmount)) ? Math.min(10, Math.max(0, Math.round(Number(input.discountAmount)))) : defaults.discountAmount,
    drinks: drinks.length ? drinks : defaults.drinks,
    title: typeof input.title === "string" && input.title.trim() ? input.title.trim().slice(0, 80) : defaults.title,
    titleColor: /^#[0-9a-f]{6}$/i.test(input.titleColor || "") ? input.titleColor : defaults.titleColor,
    language: input.language === "de" ? "de" : "en",
    showLogo: Boolean(input.showLogo),
    highlightColors: { ...defaults.highlightColors },
    translations: defaults.translations,
  };

  for (const key of Object.keys(defaults.highlightColors)) {
    if (/^#[0-9a-f]{6}$/i.test(input.highlightColors?.[key] || "")) {
      config.highlightColors[key] = input.highlightColors[key];
    }
  }

  return config;
}