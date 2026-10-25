import { Strings } from 'src/locales/en';

export const it: Partial<Strings> = {
    entries: { one: '{count} voce', other: '{count} voci' },

    'setting.useRegex.name': 'Usa regex',
    'setting.useRegex.desc': "Se attivo, l'impostazione di riferimento usa una regex per scegliere quale proprietà usare come riferimento per le date, in base alla prima corrispondenza.",
    'setting.reference.name': 'Riferimento',
    'setting.reference.desc': 'Indica il nome della proprietà o una regex per trovare la proprietà da usare come riferimento per le date, se disponibile.',
    'setting.reference.placeholder': 'Inserisci un tag (senza #) o una regex',
    'setting.defaultReference.name': 'Data di riferimento predefinita',
    'setting.defaultReference.desc': 'La data del file da usare come riferimento predefinito se non viene trovata alcuna proprietà.',
    'option.ctime': 'Data di creazione',
    'option.mtime': 'Data di ultima modifica',
    'setting.sort.name': 'Ordinamento',
    'setting.sort.desc': "L'ordinamento da usare se non è specificato nel blocco sorgente",
    'option.asc': 'Crescente',
    'option.desc': 'Decrescente',
    'setting.singleLine.name': 'Usa una sola riga',
    'setting.singleLine.desc': 'Se le sezioni sono separate da una sola riga invece che da due',
    'setting.preserveTimezones.name': 'Mantieni i fusi orari',
    'setting.preserveTimezones.desc': "Se attivo, la timeline mostra la data e l'ora esatte scritte nel testo, rispettando fusi orari come (EST) o (JST). Per impostazione predefinita, gli eventi sono ordinati in base al loro orario globale assoluto.",
    'setting.sortRelativeTimezone.name': 'Ordina in base al fuso orario',
    'setting.sortRelativeTimezone.desc': "Se attivo, la timeline ordina gli eventi in base all'ora locale (ignorando le differenze di fuso orario) invece che all'orario globale assoluto.",
};
