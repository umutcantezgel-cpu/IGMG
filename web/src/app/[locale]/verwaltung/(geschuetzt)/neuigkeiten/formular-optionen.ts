import 'server-only';
import { getTranslations } from 'next-intl/server';
import { ORGANISATION_KUERZEL } from '@/lib/rechte/matrix';
import { organisationsFilter, type Angemeldet } from '@/lib/rechte/pruefe';
import { NACHRICHT_KATEGORIEN } from '@/lib/validierung/neuigkeit';

/** Auswahllisten des Formulars: Kategorien und – je Rolle – erlaubte Organisationen (K-06). */
export async function formularOptionen(a: Angemeldet) {
  const [tk, t] = await Promise.all([getTranslations('karten'), getTranslations('verwaltung.neuigkeiten')]);
  const filter = organisationsFilter(a.rollen, 'nachricht.bearbeiten');
  const orgs = ORGANISATION_KUERZEL.filter((o) => filter === null || filter.includes(o));
  return {
    kategorien: NACHRICHT_KATEGORIEN.map((k) => ({ wert: k, label: tk(`nkat_${k}`) })),
    organisationen: [
      ...(filter === null ? [{ wert: '', label: t('allgemein') }] : []),
      ...orgs.map((o) => ({ wert: o, label: `${tk(`orgName_${o}`)} (${o.toUpperCase()})` })),
    ],
  };
}
