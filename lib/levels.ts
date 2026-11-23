export const LEVEL_WORDS = ['', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر'];
export const levelName = (n: number) => `المستوى ${LEVEL_WORDS[n] ?? n}`;
