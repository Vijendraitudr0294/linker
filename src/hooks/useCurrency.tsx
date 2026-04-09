import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CurrencyInfo {
  code: string;
  symbol: string;
  rate: number; // rate relative to USD
}

const defaultCurrency: CurrencyInfo = { code: "USD", symbol: "$", rate: 1 };

const currencyMap: Record<string, { symbol: string; code: string }> = {
  US: { symbol: "$", code: "USD" },
  GB: { symbol: "£", code: "GBP" },
  EU: { symbol: "€", code: "EUR" },
  DE: { symbol: "€", code: "EUR" },
  FR: { symbol: "€", code: "EUR" },
  IT: { symbol: "€", code: "EUR" },
  ES: { symbol: "€", code: "EUR" },
  NL: { symbol: "€", code: "EUR" },
  IN: { symbol: "₹", code: "INR" },
  JP: { symbol: "¥", code: "JPY" },
  CN: { symbol: "¥", code: "CNY" },
  KR: { symbol: "₩", code: "KRW" },
  BR: { symbol: "R$", code: "BRL" },
  CA: { symbol: "C$", code: "CAD" },
  AU: { symbol: "A$", code: "AUD" },
  MX: { symbol: "MX$", code: "MXN" },
  RU: { symbol: "₽", code: "RUB" },
  ZA: { symbol: "R", code: "ZAR" },
  AE: { symbol: "د.إ", code: "AED" },
  SG: { symbol: "S$", code: "SGD" },
  MY: { symbol: "RM", code: "MYR" },
  TH: { symbol: "฿", code: "THB" },
  PH: { symbol: "₱", code: "PHP" },
  NG: { symbol: "₦", code: "NGN" },
  PK: { symbol: "₨", code: "PKR" },
  BD: { symbol: "৳", code: "BDT" },
  TR: { symbol: "₺", code: "TRY" },
  EG: { symbol: "E£", code: "EGP" },
  SA: { symbol: "﷼", code: "SAR" },
};

// Approximate exchange rates vs USD (static fallback)
const fallbackRates: Record<string, number> = {
  USD: 1, GBP: 0.79, EUR: 0.92, INR: 83.5, JPY: 154, CNY: 7.25,
  KRW: 1340, BRL: 5.05, CAD: 1.37, AUD: 1.55, MXN: 17.2,
  RUB: 92, ZAR: 18.5, AED: 3.67, SGD: 1.35, MYR: 4.72,
  THB: 36, PHP: 56.5, NGN: 1550, PKR: 280, BDT: 110,
  TRY: 32, EGP: 49, SAR: 3.75,
};

const CurrencyContext = createContext<{
  currency: CurrencyInfo;
  formatPrice: (usdAmount: number) => string;
}>({
  currency: defaultCurrency,
  formatPrice: (n) => `$${n}`,
});

const CURRENCY_CACHE_KEY = "biotra_currency";
const CURRENCY_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<CurrencyInfo>(() => {
    // Try to load cached currency from localStorage
    try {
      const cached = localStorage.getItem(CURRENCY_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.expiry > Date.now()) return parsed.currency;
      }
    } catch {}
    return defaultCurrency;
  });

  useEffect(() => {
    // Skip geo-IP if we already have a cached non-default currency
    try {
      const cached = localStorage.getItem(CURRENCY_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.expiry > Date.now()) return;
      }
    } catch {}

    const detect = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(4000) });
        const data = await res.json();
        const country = data.country_code;
        const match = currencyMap[country];
        if (match) {
          const detected = {
            code: match.code,
            symbol: match.symbol,
            rate: fallbackRates[match.code] || 1,
          };
          setCurrency(detected);
          localStorage.setItem(CURRENCY_CACHE_KEY, JSON.stringify({
            currency: detected,
            expiry: Date.now() + CURRENCY_CACHE_TTL,
          }));
        }
      } catch {
        // Keep USD default
      }
    };
    detect();
  }, []);

  const formatPrice = (usdAmount: number) => {
    if (usdAmount === 0) return "Free";
    const converted = usdAmount * currency.rate;
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency.code,
        minimumFractionDigits: 0,
        maximumFractionDigits: currency.rate > 100 ? 0 : 2,
      }).format(converted);
    } catch {
      return `${currency.symbol}${converted.toFixed(2)}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
