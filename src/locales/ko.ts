import { Strings } from 'src/locales/en';

export const ko: Partial<Strings> = {
    entries: { other: '{count}개 항목' },

    'setting.useRegex.name': '정규식 사용',
    'setting.useRegex.desc': '활성화하면 날짜의 기준으로 사용할 속성을 첫 번째로 일치하는 정규식으로 선택합니다.',
    'setting.reference.name': '기준',
    'setting.reference.desc': '날짜의 기준으로 사용할 속성 이름 또는 해당 속성을 찾는 정규식을 지정합니다(있는 경우).',
    'setting.reference.placeholder': '태그(# 제외) 또는 정규식 입력',
    'setting.defaultReference.name': '기본 기준 날짜',
    'setting.defaultReference.desc': '속성을 찾지 못했을 때 기본 기준으로 사용할 파일 날짜입니다.',
    'option.ctime': '생성 날짜',
    'option.mtime': '마지막 수정 날짜',
    'setting.sort.name': '정렬',
    'setting.sort.desc': '소스 블록에 지정하지 않았을 때 사용할 정렬 방식',
    'option.asc': '오름차순',
    'option.desc': '내림차순',
    'setting.singleLine.name': '한 줄 구분 사용',
    'setting.singleLine.desc': '섹션을 두 줄이 아닌 한 줄로 구분하는 경우',
    'setting.preserveTimezones.name': '시간대 유지',
    'setting.preserveTimezones.desc': '활성화하면 텍스트에 적힌 날짜와 시간을 (EST), (JST) 같은 시간대를 반영하여 그대로 표시합니다. 기본적으로 이벤트는 절대적인 세계 시간 기준으로 정렬됩니다.',
    'setting.sortRelativeTimezone.name': '시간대 기준 정렬',
    'setting.sortRelativeTimezone.desc': '활성화하면 이벤트를 절대적인 세계 시간이 아닌 현지 시간(시간대 차이 무시)으로 정렬합니다.',
};
