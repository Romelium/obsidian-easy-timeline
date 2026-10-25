import { Strings } from 'src/locales/en';

export const zhTW: Partial<Strings> = {
    entries: { other: '{count} 筆紀錄' },

    'setting.useRegex.name': '使用正規表示式',
    'setting.useRegex.desc': '啟用後，「參考」設定將使用正規表示式，依第一個符合項目選擇用作日期參考的屬性。',
    'setting.reference.name': '參考',
    'setting.reference.desc': '指定屬性名稱或正規表示式，以尋找用作日期參考的屬性（如果有）。',
    'setting.reference.placeholder': '輸入標籤（不含 #）或正規表示式',
    'setting.defaultReference.name': '預設參考日期',
    'setting.defaultReference.desc': '找不到屬性時，用作預設參考的檔案日期。',
    'option.ctime': '建立日期',
    'option.mtime': '最後修改日期',
    'setting.sort.name': '排序',
    'setting.sort.desc': '來源區塊未指定時使用的排序方式',
    'option.asc': '遞增',
    'option.desc': '遞減',
    'setting.singleLine.name': '使用單行分隔',
    'setting.singleLine.desc': '各區段以單一換行而非兩個換行分隔時啟用',
    'setting.preserveTimezones.name': '保留時區',
    'setting.preserveTimezones.desc': '啟用後，時間軸會依文字中寫出的確切日期與時間顯示，並遵循 (EST)、(JST) 等時區。預設情況下，事件依其絕對全球時間排序。',
    'setting.sortRelativeTimezone.name': '依時區排序',
    'setting.sortRelativeTimezone.desc': '啟用後，時間軸會依當地時間（忽略時區差異）而非絕對全球時間排序事件。',
};
