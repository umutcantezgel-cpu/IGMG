import 'server-only';
import { getTranslations } from 'next-intl/server';
import { ZIEL_VORSCHLAEGE, zielSchluessel } from '@/lib/cms/ziele';
import type { schema } from '@/lib/db';
import { ORGANISATION_KUERZEL, type OrganisationKuerzel } from '@/lib/rechte/matrix';
import { darf, organisationsFilter, type Angemeldet } from '@/lib/rechte/pruefe';
import { basisUrl } from '@/lib/seo/metadaten';
import { feldwertAus } from '@/lib/validierung/seite';
import { ladeBildAuswahl } from '@/server/queries/verwaltung/medien';
import { ladeDateiAuswahl, ladeSeitenAuswahl, ladeSurenAuswahl, type FreigabeStand } from '@/server/queries/verwaltung/seiten';
import type { SeitenWerte } from './SeitenFormular';
import type { EditorOptionen, ZielGruppen } from './typen';

/** Linkziele für Menüs und Knöpfe: freie Seiten (mit Status) und die Bereiche der Website (deutsche Beschriftung). */
export async function zielGruppen(): Promise<ZielGruppen> {
  const [t, seiten] = await Promise.all([getTranslations('verwaltung.menues'), ladeSeitenAuswahl()]);
  return {
    seiten: seiten.map((s) => ({
      wert: `seite:${s.id}`,
      label: s.status === 'veroeffentlicht' ? `${s.titel} (/${s.slugDe})` : t('seiteEntwurf', { titel: s.titel, slug: s.slugDe }),
    })),
    bereiche: ZIEL_VORSCHLAEGE.map((pfad) => ({ wert: pfad, label: `${t(`ziele.${zielSchluessel(pfad)}`)} (${pfad})` })),
  };
}

/** Auswahllisten, Organisationen nach Rolle (K-06) und Rechte für den Seiten-Editor. */
export async function editorOptionen(a: Angemeldet, organisation: OrganisationKuerzel | null | undefined): Promise<EditorOptionen> {
  const [t, tk, bilder, dateien, suren, ziele] = await Promise.all([
    getTranslations('verwaltung.seiten'),
    getTranslations('karten'),
    ladeBildAuswahl(),
    ladeDateiAuswahl(),
    ladeSurenAuswahl(),
    zielGruppen(),
  ]);
  const filter = organisationsFilter(a.rollen, 'seite.bearbeiten');
  const orgs = ORGANISATION_KUERZEL.filter((o) => filter === null || filter.includes(o));
  const organisationen = [
    ...(filter === null ? [{ wert: '', label: t('allgemein') }] : []),
    ...orgs.map((o) => ({ wert: o, label: `${tk(`orgName_${o}`)} (${o.toUpperCase()})` })),
  ];
  // Organisation der Seite immer in der Auswahl (Lesemodus)
  if (organisation !== undefined && !organisationen.some((o) => o.wert === (organisation ?? '')))
    organisationen.push({ wert: organisation ?? '', label: organisation ? organisation.toUpperCase() : t('allgemein') });
  const darfVeroeffentlichen =
    organisation === undefined
      ? organisationsFilter(a.rollen, 'seite.veroeffentlichen')?.length !== 0
      : darf(a.rollen, 'seite.veroeffentlichen', { organisation });
  return {
    bilder,
    dateien,
    suren,
    ziele,
    organisationen,
    darfVeroeffentlichen,
    darfReligioes: darf(a.rollen, 'religioes.freigeben'),
    basisUrl: basisUrl().replace(/\/$/, ''),
  };
}

/** Datensatz → Startwerte des Editors. Ein offener Antrag zeigt sich als Status „zur Prüfung“. */
export function seitenWerte(z: typeof schema.seite.$inferSelect, stand: FreigabeStand | undefined): SeitenWerte {
  return {
    id: z.id,
    titelDe: z.titel.de,
    titelTr: z.titel.tr ?? '',
    titelEn: z.titel.en ?? '',
    beschreibungDe: z.beschreibung?.de ?? '',
    beschreibungTr: z.beschreibung?.tr ?? '',
    beschreibungEn: z.beschreibung?.en ?? '',
    slugDe: z.slugDe,
    slugTr: z.slugTr ?? '',
    slugEn: z.slugEn ?? '',
    organisation: z.organisation ?? '',
    status: z.status === 'veroeffentlicht' ? 'veroeffentlicht' : stand?.status === 'zur_pruefung' ? 'zur_pruefung' : 'entwurf',
    veroeffentlichenAm: feldwertAus(z.veroeffentlichenAm),
  };
}

export const NEUE_SEITE: SeitenWerte = {
  id: '',
  titelDe: '',
  titelTr: '',
  titelEn: '',
  beschreibungDe: '',
  beschreibungTr: '',
  beschreibungEn: '',
  slugDe: '',
  slugTr: '',
  slugEn: '',
  organisation: '',
  status: 'entwurf',
  veroeffentlichenAm: '',
};
