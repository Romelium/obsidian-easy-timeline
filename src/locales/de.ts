import { Strings } from 'src/locales/en';

export const de: Partial<Strings> = {
    entries: { one: '{count} Eintrag', other: '{count} Einträge' },

    'setting.useRegex.name': 'Regex verwenden',
    'setting.useRegex.desc': 'Wenn aktiviert, verwendet die Einstellung „Referenz“ einen regulären Ausdruck, um anhand des ersten Treffers die Eigenschaft auszuwählen, die als Referenz für Datumsangaben dient.',
    'setting.reference.name': 'Referenz',
    'setting.reference.desc': 'Name der Eigenschaft oder regulärer Ausdruck, um die Eigenschaft zu finden, die (falls vorhanden) als Referenz für Datumsangaben dient.',
    'setting.reference.placeholder': 'Tag (ohne #) oder Regex eingeben',
    'setting.defaultReference.name': 'Standard-Referenzdatum',
    'setting.defaultReference.desc': 'Das Dateidatum, das als Standardreferenz dient, wenn keine Eigenschaft gefunden wird.',
    'option.ctime': 'Erstellungsdatum',
    'option.mtime': 'Datum der letzten Änderung',
    'setting.sort.name': 'Sortierung',
    'setting.sort.desc': 'Die Sortierung, falls im Quellblock nichts angegeben ist',
    'option.asc': 'Aufsteigend',
    'option.desc': 'Absteigend',
    'setting.singleLine.name': 'Einzelne Zeile verwenden',
    'setting.singleLine.desc': 'Wenn Abschnitte durch einzelne statt doppelte Zeilenumbrüche getrennt sind',
    'setting.preserveTimezones.name': 'Zeitzonen beibehalten',
    'setting.preserveTimezones.desc': 'Wenn aktiviert, zeigt die Timeline das im Text angegebene Datum und die Uhrzeit genau an und berücksichtigt Zeitzonen wie (EST) oder (JST). Standardmäßig werden Ereignisse nach ihrer absoluten globalen Zeit sortiert.',
    'setting.sortRelativeTimezone.name': 'Relativ zur Zeitzone sortieren',
    'setting.sortRelativeTimezone.desc': 'Wenn aktiviert, sortiert die Timeline Ereignisse nach ihrer Ortszeit (Zeitzonenunterschiede werden ignoriert) statt nach ihrer absoluten globalen Zeit.',
};
