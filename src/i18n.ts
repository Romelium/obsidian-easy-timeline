import { getLanguage, moment } from 'obsidian';
import { de } from 'src/locales/de';
import { en, Strings } from 'src/locales/en';
import { es } from 'src/locales/es';
import { fr } from 'src/locales/fr';
import { it } from 'src/locales/it';
import { ja } from 'src/locales/ja';
import { ko } from 'src/locales/ko';
import { nl } from 'src/locales/nl';
import { pt } from 'src/locales/pt';
import { ru } from 'src/locales/ru';
import { uk } from 'src/locales/uk';
import { zh } from 'src/locales/zh';
import { zhTW } from 'src/locales/zh-tw';

// Keyed by lowercase locale. A regional locale (e.g. "pt-br") falls back to its language ("pt"), then to English.
const translations: Record<string, Partial<Strings>> = { fr, de, es, it, pt, nl, ru, uk, ja, ko, zh, 'zh-tw': zhTW };

type StringKey = { [K in keyof Strings]: Strings[K] extends string ? K : never }[keyof Strings];

/** Looks a locale such as "pt-BR" up in a table keyed by lowercase locale, falling back from the region to its language. */
export function lookupLocale<T>(table: Record<string, T>, locale: string): T | undefined {
    const key = locale.toLowerCase();
    return table[key] ?? table[key.split('-')[0]];
}

/**
 * The locale matching Obsidian's language setting, or undefined (system locale, English text) if the
 * runtime can't format it. getLanguage() needs Obsidian 1.8.7; older versions keep moment's locale in sync instead.
 */
export function getLocale(): string | undefined {
    const language = typeof getLanguage === 'function' ? getLanguage() : moment.locale();
    try {
        return Intl.DateTimeFormat.supportedLocalesOf(language)[0];
    } catch (e) {
        return undefined; // Not a valid BCP 47 tag
    }
}

export function t(key: StringKey): string {
    const strings = lookupLocale(translations, getLocale() ?? 'en');
    return strings?.[key] ?? en[key];
}

export function formatEntries(count: number): string {
    const locale = getLocale() ?? 'en';
    const entries = lookupLocale(translations, locale)?.entries ?? en.entries;
    const form = entries[new Intl.PluralRules(locale).select(count)] ?? entries.other;
    return form.replace('{count}', String(count));
}
