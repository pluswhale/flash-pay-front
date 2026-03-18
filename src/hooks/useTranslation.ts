import { useUIStore } from '../store/uiStore'
import { en, ru } from '../i18n'

export function useTranslation() {
  const language = useUIStore((s) => s.language)
  const t = language === 'ru' ? ru : en
  return { t, language }
}
