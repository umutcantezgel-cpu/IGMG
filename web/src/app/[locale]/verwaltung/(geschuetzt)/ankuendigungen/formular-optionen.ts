import 'server-only';
import { getTranslations } from 'next-intl/server';
import { organisationsFilter, type Angemeldet } from '@/lib/rechte/pruefe';

const ORGANISATIONEN = ['at', 'kt', 'gt', 'kgt'] as const;

/**
 * Auswahl der Organisation im Formular (K-06): je Rolle nur die erlaubten Organisationen. „Allgemein“ gibt es nur mit
 * uneingeschränktem Recht; eine Organisationsredaktion muss eine eigene Organisation wählen.
 */
export async function formularOptionen(a: Angemeldet) {
  const [tk, t] = await Promise.all([getTranslations('karten'), getTranslations('verwaltung.ankuendigungen')]);
  const filter = organisationsFilter(a.rollen, 'ankuendigung.bearbeiten');
  const orgs = ORGANISATIONEN.filter((o) => filter === null || filter.includes(o));
  return {
    organisationen: [
      ...(filter === null ? [{ wert: '', label: t('allgemein') }] : []),
      ...orgs.map((o) => ({ wert: o, label: `${tk(`orgName_${o}`)} (${o.toUpperCase()})` })),
    ],
  };
}
