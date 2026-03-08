import { create } from "zustand";

export type Currency = "USD" | "EUR" | "GBP";

interface CurrencyState {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatValue: (value: number) => string;
}

const CURRENCY_DATA = {
  USD: { symbol: "$", rate: 1, locale: "en-US" },
  EUR: { symbol: "€", rate: 0.92, locale: "de-DE" },
  GBP: { symbol: "£", rate: 0.79, locale: "en-GB" },
};

export const useCurrency = create<CurrencyState>((set, get) => ({
  currency: "USD",
  setCurrency: (currency: Currency) => set({ currency }),
  formatValue: (value: number) => {
    const { currency } = get();
    const { symbol, rate, locale } = CURRENCY_DATA[currency];
    const converted = value * rate;
    
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(converted);
  },
}));
