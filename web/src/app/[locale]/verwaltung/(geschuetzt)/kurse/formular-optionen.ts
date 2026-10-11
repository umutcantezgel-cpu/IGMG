import 'server-only';
import { getTranslations } from 'next-intl/server';
import { KURS_VERFUEGBARKEIT } from '@/lib/validierung/kurs';

/** Auswahllisten des Kursformulars. Die Texte stehen in `verwaltung.kurse` (nur Deutsch, ADR 0016). */
export async function formularOptionen() {
  const t = await getTranslations('verwaltung.kurse');
  return {
    verfuegbarkeit: KURS_VERFUEGBARKEIT.map((wert) => ({ wert, label: t(`verfuegbarkeitText.${wert}`) })),
  };
}
