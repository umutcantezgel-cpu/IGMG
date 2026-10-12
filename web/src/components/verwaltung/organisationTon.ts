import type { OrganisationKuerzel } from '@/lib/rechte/matrix';

/** Kürzel-Abzeichen in den Organisationsfarben (Tokens aus globals.css), Übersicht und Veranstaltungen. */
export const KUERZEL_TON: Record<OrganisationKuerzel, string> = {
  at: 'bg-org-at-toenung text-org-at-text',
  kt: 'bg-org-kt-toenung text-org-kt-text',
  gt: 'bg-org-gt-toenung text-org-gt-text',
  kgt: 'bg-org-kgt-toenung text-org-kgt-text',
};
