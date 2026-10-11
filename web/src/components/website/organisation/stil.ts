import { BookOpen, GraduationCap, Heart, Monitor, Pencil, Star, Target, Users, type LucideIcon } from 'lucide-react';
import { LOGOS } from '@/components/website/navigation';
import type { OrganisationSlug } from '@/i18n/routing';
import type { AktivitaetSymbol } from '@/lib/validierung/seiteninhalte/organisation';

/** Die vier Organisationen (Kürzel des Datenmodells, organisationEnum). */
export type Kuerzel = 'at' | 'kt' | 'gt' | 'kgt';

/** Reihenfolge der Organisationen (Abschnitt „Organisationen“). */
export const KUERZEL_ALLE: readonly Kuerzel[] = ['at', 'kt', 'gt', 'kgt'];

/** Feste Kennung je Organisation (Badge, D Z.96/104/112/120; in allen Sprachen gleich, nicht übersetzt). */
export const KENNUNG: Record<Kuerzel, string> = { at: 'AT', kt: 'KT', gt: 'GT', kgt: 'KGT' };

/** Adressteil je Organisation (routing.ts, ORGANISATIONEN; K-03). */
export const SLUG: Record<Kuerzel, OrganisationSlug> = {
  at: 'ana-teskilati',
  kt: 'kadin-teskilati',
  gt: 'genclik-teskilati',
  kgt: 'kadin-genclik-teskilati',
};

/**
 * Farben nur über Tokens aus globals.css (org-<k>, org-<k>-text, org-<k>-toenung). Die Klassen stehen hier
 * vollständig ausgeschrieben, damit Tailwind sie beim Bau findet.
 */
export const STIL: Record<Kuerzel, { akzent: string; band: string; tint: string; ink: string; deko: string; logo: string }> = {
  at: {
    akzent: 'border-org-at',
    band: 'bg-org-at',
    tint: 'bg-org-at-toenung',
    ink: 'text-org-at-text',
    deko: 'decoration-org-at',
    logo: LOGOS.at,
  },
  kt: {
    akzent: 'border-org-kt',
    band: 'bg-org-kt',
    tint: 'bg-org-kt-toenung',
    ink: 'text-org-kt-text',
    deko: 'decoration-org-kt',
    logo: LOGOS.kt,
  },
  gt: {
    akzent: 'border-org-gt',
    band: 'bg-org-gt',
    tint: 'bg-org-gt-toenung',
    ink: 'text-org-gt-text',
    deko: 'decoration-org-gt',
    logo: LOGOS.gt,
  },
  kgt: {
    akzent: 'border-org-kgt',
    band: 'bg-org-kgt',
    tint: 'bg-org-kgt-toenung',
    ink: 'text-org-kgt-text',
    deko: 'decoration-org-kgt',
    logo: LOGOS.kgt,
  },
};

/** Lucide-Symbole der Aktivitätskarten (Symbolnamen aus dem Seiteninhalt). */
export const SYMBOL: Record<AktivitaetSymbol, LucideIcon> = {
  heart: Heart,
  'book-open': BookOpen,
  users: Users,
  'graduation-cap': GraduationCap,
  pencil: Pencil,
  target: Target,
  monitor: Monitor,
  star: Star,
};
