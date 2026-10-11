'use client';

import { useTranslations } from 'next-intl';
import type { ORGANISATION_KUERZEL, ROLLEN } from '@/lib/rechte/matrix';

/** Texte für `RollenFelder` aus `verwaltung.benutzer` und `verwaltung.rollen`. */
export function useRollenTexte() {
  const t = useTranslations('verwaltung.benutzer');
  const tr = useTranslations('verwaltung.rollen');
  return {
    rollen: t('formular.rollen'),
    rollenHinweis: t('formular.rollenHinweis'),
    organisationen: t('formular.organisationen'),
    organisationenHinweis: t('formular.organisationenHinweis'),
    rolle: (r: (typeof ROLLEN)[number]) => tr(r),
    beschreibung: (r: (typeof ROLLEN)[number]) => t(`rollenBeschreibung.${r}`),
    organisation: (o: (typeof ORGANISATION_KUERZEL)[number]) => t(`organisationen.${o}`),
  };
}
