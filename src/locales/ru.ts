import { Strings } from 'src/locales/en';

export const ru: Partial<Strings> = {
    entries: { one: '{count} запись', few: '{count} записи', many: '{count} записей', other: '{count} записи' },

    'setting.useRegex.name': 'Использовать регулярное выражение',
    'setting.useRegex.desc': 'Если включено, для выбора свойства, используемого как опорная дата, применяется регулярное выражение — по первому совпадению.',
    'setting.reference.name': 'Опорная дата',
    'setting.reference.desc': 'Укажите имя свойства или регулярное выражение для поиска свойства, которое будет использоваться как опорная дата для относительных дат, если оно есть.',
    'setting.reference.placeholder': 'Введите тег (без #) или регулярное выражение',
    'setting.defaultReference.name': 'Опорная дата по умолчанию',
    'setting.defaultReference.desc': 'Дата файла, используемая как опорная по умолчанию, если свойство не найдено.',
    'option.ctime': 'Дата создания',
    'option.mtime': 'Дата последнего изменения',
    'setting.sort.name': 'Сортировка',
    'setting.sort.desc': 'Порядок сортировки, если он не указан в блоке-источнике',
    'option.asc': 'По возрастанию',
    'option.desc': 'По убыванию',
    'setting.singleLine.name': 'Использовать одну строку',
    'setting.singleLine.desc': 'Если разделы отделены друг от друга одной строкой, а не двумя',
    'setting.preserveTimezones.name': 'Сохранять часовые пояса',
    'setting.preserveTimezones.desc': 'Если включено, временная шкала показывает точные дату и время, указанные в тексте, с учётом часовых поясов, например (EST) или (JST). По умолчанию события сортируются по абсолютному мировому времени.',
    'setting.sortRelativeTimezone.name': 'Сортировать по часовому поясу',
    'setting.sortRelativeTimezone.desc': 'Если включено, временная шкала сортирует события по местному времени (без учёта разницы часовых поясов), а не по абсолютному мировому времени.',
};
