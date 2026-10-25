import { Strings } from 'src/locales/en';

export const fr: Partial<Strings> = {
    entries: { one: '{count} entrée', other: '{count} entrées' },

    'setting.useRegex.name': 'Utiliser une regex',
    'setting.useRegex.desc': "Si activé, le paramètre de référence utilise une regex pour choisir la propriété servant de référence aux dates, d'après la première correspondance.",
    'setting.reference.name': 'Référence',
    'setting.reference.desc': 'Indiquez le nom de la propriété, ou une regex, pour trouver la propriété à utiliser comme référence des dates, si elle existe.',
    'setting.reference.placeholder': 'Saisissez une étiquette (sans #) ou une regex',
    'setting.defaultReference.name': 'Date de référence par défaut',
    'setting.defaultReference.desc': "La date du fichier à utiliser comme référence par défaut si aucune propriété n'est trouvée.",
    'option.ctime': 'Date de création',
    'option.mtime': 'Date de dernière modification',
    'setting.sort.name': 'Tri',
    'setting.sort.desc': "Le tri à utiliser s'il n'est pas précisé dans le bloc source",
    'option.asc': 'Croissant',
    'option.desc': 'Décroissant',
    'setting.singleLine.name': 'Utiliser une seule ligne',
    'setting.singleLine.desc': 'Si les sections sont séparées par une seule ligne au lieu de deux',
    'setting.preserveTimezones.name': 'Conserver les fuseaux horaires',
    'setting.preserveTimezones.desc': "Si activé, la chronologie affiche la date et l'heure exactes écrites dans le texte, en respectant les fuseaux horaires comme (EST) ou (JST). Par défaut, les événements sont triés selon leur heure absolue mondiale.",
    'setting.sortRelativeTimezone.name': 'Trier selon le fuseau horaire',
    'setting.sortRelativeTimezone.desc': 'Si activé, la chronologie trie les événements selon leur heure locale (sans tenir compte des différences de fuseau horaire) plutôt que selon leur heure absolue mondiale.',
};
