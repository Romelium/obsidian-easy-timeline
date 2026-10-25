import { Strings } from 'src/locales/en';

export const ja: Partial<Strings> = {
    entries: { other: '{count} 件' },

    'setting.useRegex.name': '正規表現を使用',
    'setting.useRegex.desc': '有効にすると、日付の基準にするプロパティを、最初に一致した正規表現で選択します。',
    'setting.reference.name': '基準',
    'setting.reference.desc': '日付の基準として使うプロパティ名、またはそのプロパティを探す正規表現を指定します（存在する場合）。',
    'setting.reference.placeholder': 'タグ（# なし）または正規表現を入力',
    'setting.defaultReference.name': '既定の基準日',
    'setting.defaultReference.desc': 'プロパティが見つからない場合に既定の基準として使うファイルの日付。',
    'option.ctime': '作成日',
    'option.mtime': '最終更新日',
    'setting.sort.name': '並べ替え',
    'setting.sort.desc': 'ソースブロックで指定されていない場合に使う並べ替え順',
    'option.asc': '昇順',
    'option.desc': '降順',
    'setting.singleLine.name': '1 行区切りを使用',
    'setting.singleLine.desc': 'セクションを 2 行ではなく 1 行で区切る場合に有効にします',
    'setting.preserveTimezones.name': 'タイムゾーンを保持',
    'setting.preserveTimezones.desc': '有効にすると、テキストに書かれた日付と時刻をそのまま表示し、(EST) や (JST) などのタイムゾーンを尊重します。既定では、イベントは絶対的な世界時刻で並べ替えられます。',
    'setting.sortRelativeTimezone.name': 'タイムゾーン基準で並べ替え',
    'setting.sortRelativeTimezone.desc': '有効にすると、イベントを絶対的な世界時刻ではなく、現地時刻（タイムゾーンの差を無視）で並べ替えます。',
};
