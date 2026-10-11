import 'server-only';
import { getTranslations } from 'next-intl/server';
import { organisationsFilter, type Angemeldet } from '@/lib/rechte/pruefe';
import { KATEGORIEN, ORGANISATIONEN } from '@/lib/validierung/veranstaltung';

/** Auswahllisten des Formulars: Kategorien und – je Rolle – erlaubte Organisationen (K-06). */
export async function formularOptionen(a: Angemeldet) {
  const [tk, t] = await Promise.all([getTranslations('karten'), getTranslations('verwaltung.veranstaltungen')]);
  const filter = organisationsFilter(a.rollen, 'veranstaltung.bearbeiten');
  const orgs = ORGANISATIONEN.filter((o) => filter === null || filter.includes(o));
  return {
    kategorien: KATEGORIEN.map((k) => ({ wert: k, label: tk(`kat_${k}`) })),
    organisationen: [
      ...(filter === null ? [{ wert: '', label: t('allgemein') }] : []),
      ...orgs.map((o) => ({ wert: o, label: `${tk(`orgName_${o}`)} (${o.toUpperCase()})` })),
    ],
  };
}
