import { useTranslation } from 'react-i18next';
import type { BilingualText, Language } from '@/types';

/** Returns localized text from a BilingualText object, falling back to English */
export function useBilingualText() {
  const { i18n } = useTranslation();
  const lang = i18n.language as Language;

  return (text?: BilingualText | null): string => {
    if (!text) return '';
    if (lang === 'hi' && text.hi) return text.hi;
    return text.en;
  };
}
