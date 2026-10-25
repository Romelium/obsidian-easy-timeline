import { Strings } from 'src/locales/en';

export const es: Partial<Strings> = {
    entries: { one: '{count} entrada', other: '{count} entradas' },

    'setting.useRegex.name': 'Usar expresión regular',
    'setting.useRegex.desc': 'Si se activa, el ajuste de referencia usará una expresión regular para elegir qué propiedad se utiliza como referencia de las fechas, según la primera coincidencia.',
    'setting.reference.name': 'Referencia',
    'setting.reference.desc': 'Indica el nombre de la propiedad o una expresión regular para encontrar la propiedad que se usará como referencia de las fechas, si existe.',
    'setting.reference.placeholder': 'Introduce una etiqueta (sin #) o una expresión regular',
    'setting.defaultReference.name': 'Fecha de referencia predeterminada',
    'setting.defaultReference.desc': 'La fecha del archivo que se usará como referencia predeterminada si no se encuentra ninguna propiedad.',
    'option.ctime': 'Fecha de creación',
    'option.mtime': 'Fecha de última modificación',
    'setting.sort.name': 'Orden',
    'setting.sort.desc': 'El orden que se usará si no se especifica en el bloque de origen',
    'option.asc': 'Ascendente',
    'option.desc': 'Descendente',
    'setting.singleLine.name': 'Usar una sola línea',
    'setting.singleLine.desc': 'Si las secciones se separan con una sola línea en lugar de dos',
    'setting.preserveTimezones.name': 'Conservar zonas horarias',
    'setting.preserveTimezones.desc': 'Si se activa, la cronología mostrará la fecha y la hora exactas escritas en el texto, respetando zonas horarias como (EST) o (JST). De forma predeterminada, ordena los eventos por su hora global absoluta.',
    'setting.sortRelativeTimezone.name': 'Ordenar según la zona horaria',
    'setting.sortRelativeTimezone.desc': 'Si se activa, la cronología ordenará los eventos por su hora local (ignorando las diferencias de zona horaria) en lugar de por su hora global absoluta.',
};
