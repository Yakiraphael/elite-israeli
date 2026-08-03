import { useTranslation } from './LanguagesContext';
import he from './dictionaries/home_he';
import ar from './dictionaries/home_ar';
import en from './dictionaries/home_en';

const DICTS = { he, ar, en };

// וו ייעודי למחרוזות דף הבית — מחזיר אובייקט מובנה לפי סקציות רכיבים.
// שימוש: const { hero, mission } = useHomeStrings();
export function useHomeStrings() {
  const { lang } = useTranslation();
  return DICTS[lang] || DICTS.he;
}