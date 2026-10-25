export type PluralForms = { other: string } & Partial<Record<Intl.LDMLPluralRule, string>>;

// English is the source of truth: every other language is a Partial<Strings> and falls back to these.
export interface Strings {
    entries: PluralForms; // "{count}" is replaced with the number of entries

    'setting.useRegex.name': string;
    'setting.useRegex.desc': string;
    'setting.reference.name': string;
    'setting.reference.desc': string;
    'setting.reference.placeholder': string;
    'setting.defaultReference.name': string;
    'setting.defaultReference.desc': string;
    'option.ctime': string;
    'option.mtime': string;
    'setting.sort.name': string;
    'setting.sort.desc': string;
    'option.asc': string;
    'option.desc': string;
    'setting.singleLine.name': string;
    'setting.singleLine.desc': string;
    'setting.preserveTimezones.name': string;
    'setting.preserveTimezones.desc': string;
    'setting.sortRelativeTimezone.name': string;
    'setting.sortRelativeTimezone.desc': string;
}

export const en: Strings = {
    entries: { one: '{count} Entry', other: '{count} Entries' },

    'setting.useRegex.name': 'Use Regex',
    'setting.useRegex.desc': 'If enabled, the reference setting will use regex to pick which property to use as the reference for dates based on the first regex match.',
    'setting.reference.name': 'Reference',
    'setting.reference.desc': 'Specify the property name or regex to find which property to use as the reference for dates, if available.',
    'setting.reference.placeholder': 'Enter tag (no hashtag #) or regex',
    'setting.defaultReference.name': 'Default Reference Date',
    'setting.defaultReference.desc': 'The file date to use as the default reference if no property is found.',
    'option.ctime': 'Creation Date',
    'option.mtime': 'Last Modified Date',
    'setting.sort.name': 'Sorting',
    'setting.sort.desc': 'The sorting to be used if not specified in source block',
    'option.asc': 'Ascending',
    'option.desc': 'Descending',
    'setting.singleLine.name': 'Use single line',
    'setting.singleLine.desc': 'If sections are separated by single lines instead of double lines',
    'setting.preserveTimezones.name': 'Preserve Timezones',
    'setting.preserveTimezones.desc': 'If enabled, the timeline will display the exact date and time written in the text, respecting timezones like (EST) or (JST). By default, it sorts events by their absolute global time.',
    'setting.sortRelativeTimezone.name': 'Sort Relative to Timezone',
    'setting.sortRelativeTimezone.desc': 'If enabled, the timeline will sort events by their local time (ignoring timezone differences) instead of their absolute global time.',
};
