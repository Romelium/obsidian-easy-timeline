import { Strings } from 'src/locales/en';

export const uk: Partial<Strings> = {
    entries: { one: '{count} запис', few: '{count} записи', many: '{count} записів', other: '{count} запису' },

    'setting.useRegex.name': 'Використовувати регулярний вираз',
    'setting.useRegex.desc': 'Якщо ввімкнено, для вибору властивості, яка використовується як опорна дата, застосовується регулярний вираз — за першим збігом.',
    'setting.reference.name': 'Опорна дата',
    'setting.reference.desc': 'Вкажіть назву властивості або регулярний вираз, щоб знайти властивість, яка використовуватиметься як опорна дата для відносних дат, якщо вона є.',
    'setting.reference.placeholder': 'Введіть тег (без #) або регулярний вираз',
    'setting.defaultReference.name': 'Опорна дата за замовчуванням',
    'setting.defaultReference.desc': 'Дата файлу, яка використовується як опорна за замовчуванням, якщо властивість не знайдено.',
    'option.ctime': 'Дата створення',
    'option.mtime': 'Дата останньої зміни',
    'setting.sort.name': 'Сортування',
    'setting.sort.desc': 'Порядок сортування, якщо його не вказано в блоці-джерелі',
    'option.asc': 'За зростанням',
    'option.desc': 'За спаданням',
    'setting.singleLine.name': 'Використовувати один рядок',
    'setting.singleLine.desc': 'Якщо розділи відокремлені одним рядком замість двох',
    'setting.preserveTimezones.name': 'Зберігати часові пояси',
    'setting.preserveTimezones.desc': 'Якщо ввімкнено, часова шкала показує точні дату й час, указані в тексті, з урахуванням часових поясів, наприклад (EST) або (JST). За замовчуванням події сортуються за абсолютним світовим часом.',
    'setting.sortRelativeTimezone.name': 'Сортувати за часовим поясом',
    'setting.sortRelativeTimezone.desc': 'Якщо ввімкнено, часова шкала сортує події за місцевим часом (без урахування різниці часових поясів), а не за абсолютним світовим часом.',
};
