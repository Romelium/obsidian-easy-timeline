import { Strings } from 'src/locales/en';

export const pt: Partial<Strings> = {
    entries: { one: '{count} entrada', other: '{count} entradas' },

    'setting.useRegex.name': 'Usar regex',
    'setting.useRegex.desc': 'Se ativado, a configuração de referência usará uma regex para escolher qual propriedade será usada como referência para as datas, com base na primeira correspondência.',
    'setting.reference.name': 'Referência',
    'setting.reference.desc': 'Informe o nome da propriedade ou uma regex para encontrar a propriedade a ser usada como referência para as datas, se disponível.',
    'setting.reference.placeholder': 'Digite uma tag (sem #) ou uma regex',
    'setting.defaultReference.name': 'Data de referência padrão',
    'setting.defaultReference.desc': 'A data do arquivo a usar como referência padrão se nenhuma propriedade for encontrada.',
    'option.ctime': 'Data de criação',
    'option.mtime': 'Data da última modificação',
    'setting.sort.name': 'Ordenação',
    'setting.sort.desc': 'A ordenação a usar se não for especificada no bloco de origem',
    'option.asc': 'Crescente',
    'option.desc': 'Decrescente',
    'setting.singleLine.name': 'Usar linha única',
    'setting.singleLine.desc': 'Se as seções são separadas por uma única linha em vez de duas',
    'setting.preserveTimezones.name': 'Manter fusos horários',
    'setting.preserveTimezones.desc': 'Se ativado, a linha do tempo exibirá a data e a hora exatas escritas no texto, respeitando fusos horários como (EST) ou (JST). Por padrão, os eventos são ordenados pelo seu horário global absoluto.',
    'setting.sortRelativeTimezone.name': 'Ordenar pelo fuso horário',
    'setting.sortRelativeTimezone.desc': 'Se ativado, a linha do tempo ordenará os eventos pelo horário local (ignorando as diferenças de fuso horário) em vez do horário global absoluto.',
};
