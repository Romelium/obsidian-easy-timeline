import * as chrono from 'chrono-node';
import { Chrono, ParsedResult, ParsingOption, ParsingReference } from 'chrono-node';
import { getLocale, lookupLocale } from 'src/i18n';

interface Parsers {
    casual: Chrono;
    strict: Chrono;
}

const english: Parsers = chrono;

// Keyed by lowercase Obsidian language. Chrono has no multi-language mode, so the parser for Obsidian's language runs next to the English one.
const localeParsers: Record<string, Parsers> = {
    'en-gb': { casual: chrono.en.GB, strict: new Chrono(chrono.en.configuration.createConfiguration(true, true)) },
    fr: chrono.fr,
    de: chrono.de,
    es: chrono.es,
    it: chrono.it,
    pt: chrono.pt,
    nl: chrono.nl,
    ru: chrono.ru,
    uk: chrono.uk,
    ja: chrono.ja,
    sv: chrono.sv,
    fi: chrono.fi,
    vi: chrono.vi,
    id: chrono.id,
    ar: chrono.ar,
    zh: chrono.zh.hans,
    'zh-tw': chrono.zh.hant,
};

// A parser for another language misreads text it doesn't know (the French one turns "Mar 5th, 2026" into a Tuesday), so the longest match wins.
// On a tie the Obsidian language wins, e.g. 12/03/2026 is day-first in French.
function parseBoth(mode: keyof Parsers, text: string, ref?: ParsingReference | Date, option?: ParsingOption): ParsedResult[] {
    const englishResults = english[mode].parse(text, ref, option);
    const localeResults = lookupLocale(localeParsers, getLocale() ?? 'en')?.[mode].parse(text, ref, option) ?? [];

    if (!localeResults.length) return englishResults;
    if (!englishResults.length) return localeResults;
    return englishResults[0].text.length > localeResults[0].text.length ? englishResults : localeResults;
}

export function parse(text: string, ref?: ParsingReference | Date, option?: ParsingOption): ParsedResult[] {
    return parseBoth('casual', text, ref, option);
}

export function parseDate(text: string, ref?: ParsingReference | Date, option?: ParsingOption): Date | null {
    return parseBoth('strict', text, ref, option)[0]?.date() ?? null;
}
