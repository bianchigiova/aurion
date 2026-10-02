/**
 * The app's languages, and which one is in use: the one picked in Settings,
 * or else the first of the device's preferred languages we have, or else
 * English.
 *
 * To add a language: copy en.ts, translate it (TypeScript flags any missing
 * or misshapen message), and list it in LOCALES. Dates, months and
 * durations ("1 year, 3 months") come from the browser's Intl APIs, which
 * already speak the language.
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getLanguage, setLanguage as persistLanguage } from "../lib/prefs";
import { el } from "./el";
import { en, type Messages } from "./en";
import { it } from "./it";

export type { Messages };

export interface Locale {
  /** BCP 47 language code, also what's stored in prefs. */
  id: string;
  /** The language's own name for itself, for the picker. */
  name: string;
  messages: Messages;
}

export const LOCALES: Locale[] = [
  { id: "en", name: "English", messages: en },
  { id: "it", name: "Italiano", messages: it },
  { id: "el", name: "Ελληνικά", messages: el },
];

function localeById(id: string | null): Locale | undefined {
  return LOCALES.find((l) => l.id === id);
}

/** The device's preferred languages, best first. */
function deviceLanguages(): readonly string[] {
  return navigator.languages?.length ? navigator.languages : [navigator.language];
}

/** The first of the device's languages we have a translation for. */
function deviceLocale(): Locale {
  for (const tag of deviceLanguages()) {
    const found = localeById(tag.toLowerCase().split("-")[0]);
    if (found) return found;
  }
  return LOCALES[0];
}

/**
 * The tag to format dates and numbers with: the device's own regional
 * variant when it speaks the same language (so an English UI on a British
 * phone still writes "2 October 2026"), else the bare language.
 */
function formattingTag(locale: Locale): string {
  return (
    deviceLanguages().find((tag) => tag.toLowerCase().split("-")[0] === locale.id) ??
    locale.id
  );
}

interface I18n {
  /** Messages in the current language. */
  t: Messages;
  locale: Locale;
  /** For Intl and toLocale*String calls. */
  formatTag: string;
  /** The language picked in Settings, or null for automatic. */
  chosen: string | null;
  choose: (id: string | null) => void;
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [chosen, setChosen] = useState(() => localeById(getLanguage())?.id ?? null);
  const locale = localeById(chosen) ?? deviceLocale();

  useEffect(() => {
    document.documentElement.lang = locale.id;
  }, [locale]);

  const value = useMemo<I18n>(
    () => ({
      t: locale.messages,
      locale,
      formatTag: formattingTag(locale),
      chosen,
      choose: (id) => {
        persistLanguage(id);
        setChosen(id);
      },
    }),
    [locale, chosen],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n needs an I18nProvider above it");
  return value;
}
