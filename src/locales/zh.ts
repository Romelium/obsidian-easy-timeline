import { Strings } from 'src/locales/en';

export const zh: Partial<Strings> = {
    entries: { other: '{count} 条记录' },

    'setting.useRegex.name': '使用正则表达式',
    'setting.useRegex.desc': '启用后，“参考”设置将使用正则表达式，根据第一个匹配项选择用作日期参考的属性。',
    'setting.reference.name': '参考',
    'setting.reference.desc': '指定属性名称或正则表达式，用于查找作为日期参考的属性（如果有）。',
    'setting.reference.placeholder': '输入标签（不含 #）或正则表达式',
    'setting.defaultReference.name': '默认参考日期',
    'setting.defaultReference.desc': '未找到属性时，用作默认参考的文件日期。',
    'option.ctime': '创建日期',
    'option.mtime': '最后修改日期',
    'setting.sort.name': '排序',
    'setting.sort.desc': '源代码块中未指定时使用的排序方式',
    'option.asc': '升序',
    'option.desc': '降序',
    'setting.singleLine.name': '使用单行分隔',
    'setting.singleLine.desc': '各部分以单个换行而非两个换行分隔时启用',
    'setting.preserveTimezones.name': '保留时区',
    'setting.preserveTimezones.desc': '启用后，时间线将按文本中写出的确切日期和时间显示，并遵循 (EST)、(JST) 等时区。默认情况下，事件按其绝对全球时间排序。',
    'setting.sortRelativeTimezone.name': '按时区排序',
    'setting.sortRelativeTimezone.desc': '启用后，时间线将按本地时间（忽略时区差异）而非绝对全球时间对事件排序。',
};
