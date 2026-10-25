import { Strings } from 'src/locales/en';

export const nl: Partial<Strings> = {
    entries: { one: '{count} vermelding', other: '{count} vermeldingen' },

    'setting.useRegex.name': 'Regex gebruiken',
    'setting.useRegex.desc': 'Indien ingeschakeld, gebruikt de referentie-instelling een regex om op basis van de eerste overeenkomst te bepalen welke eigenschap als referentie voor datums dient.',
    'setting.reference.name': 'Referentie',
    'setting.reference.desc': 'Geef de naam van de eigenschap of een regex op om de eigenschap te vinden die als referentie voor datums wordt gebruikt, indien beschikbaar.',
    'setting.reference.placeholder': 'Voer een tag (zonder #) of regex in',
    'setting.defaultReference.name': 'Standaard referentiedatum',
    'setting.defaultReference.desc': 'De bestandsdatum die als standaardreferentie wordt gebruikt als er geen eigenschap wordt gevonden.',
    'option.ctime': 'Aanmaakdatum',
    'option.mtime': 'Laatst gewijzigd',
    'setting.sort.name': 'Sortering',
    'setting.sort.desc': 'De sortering die wordt gebruikt als die niet in het bronblok is opgegeven',
    'option.asc': 'Oplopend',
    'option.desc': 'Aflopend',
    'setting.singleLine.name': 'Enkele regel gebruiken',
    'setting.singleLine.desc': 'Als secties worden gescheiden door één regel in plaats van twee',
    'setting.preserveTimezones.name': 'Tijdzones behouden',
    'setting.preserveTimezones.desc': 'Indien ingeschakeld, toont de tijdlijn de exacte datum en tijd zoals in de tekst staat, met respect voor tijdzones zoals (EST) of (JST). Standaard worden gebeurtenissen gesorteerd op hun absolute wereldtijd.',
    'setting.sortRelativeTimezone.name': 'Sorteren op tijdzone',
    'setting.sortRelativeTimezone.desc': 'Indien ingeschakeld, sorteert de tijdlijn gebeurtenissen op hun lokale tijd (zonder rekening te houden met tijdzoneverschillen) in plaats van op hun absolute wereldtijd.',
};
