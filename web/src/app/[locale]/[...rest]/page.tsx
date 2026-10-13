import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { FreieSeiteInhalt } from '@/components/website/bloecke/FreieSeiteInhalt';
import { baueMenues, bereichMit, menuesAusDb } from '@/components/website/navigation';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { textMitSprache } from '@/components/website/Text';
import { pfadFuer } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { seitenAdressen } from '@/lib/cms/slugs';
import { basisUrl, metadatenFuer } from '@/lib/seo/metadaten';
import { ladeKopfMenue } from '@/server/queries/menues';
import { ladeSeite, ladeSeitenSlugs, ladeWeiterleitung, type SeiteOeffentlich } from '@/server/queries/seiten';

export const ensureStatic = 'navigation';

/**
 * Freie Seiten aus dem CMS (ADR 0032) und Weiterleitungen über die Fangroute der Sprache. Beim Bau alle
 * veröffentlichten Slugs je Sprache plus Platzhalter `_` (ensureStatic verlangt ≥ 1 Wert); neue Seiten entstehen bei
 * der ersten Anfrage und bleiben statisch, bis sich `TAG.seiten` ändert.
 */
export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const sprache = (routing.locales as readonly string[]).includes(params.locale) ? (params.locale as Locale) : 'de';
  const slugs = await ladeSeitenSlugs(sprache);
  return [...slugs.map((slug) => ({ rest: [slug] })), { rest: ['_'] }];
}

/** Pfadteile aus der Adresse (kodiert oder nicht) → Klartext. */
function teileAus(rest: string[]): string[] {
  return rest.map((t) => {
    try {
      return decodeURIComponent(t);
    } catch {
      return t;
    }
  });
}

export async function generateMetadata({ params }: PageProps<'/[locale]/[...rest]'>): Promise<Metadata> {
  const { locale, rest } = await params;
  const sprache = locale as Locale;
  const teile = teileAus(rest);
  if (teile.length !== 1) return {};
  const treffer = await ladeSeite(sprache, teile[0]);
  if (treffer?.art !== 'seite') return {};
  const s = treffer.seite;
  const titel = textMitSprache(s.titel, sprache).text;
  const beschreibung = textMitSprache(s.beschreibung, sprache).text || undefined;
  // hreflang je Sprache mit eigenem Slug: Standard-Metadaten (Open Graph, Bild) und die Adressen dieser Seite
  const basis = await metadatenFuer({ pfad: '/', titel, beschreibung });
  const adressen = seitenAdressen(s.slugs);
  const absolut = (pfad: string) => `${basisUrl().replace(/\/$/, '')}${pfad}`;
  return {
    ...basis,
    alternates: {
      canonical: absolut(adressen[sprache]),
      languages: { de: absolut(adressen.de), tr: absolut(adressen.tr), en: absolut(adressen.en), 'x-default': absolut(adressen.de) },
    },
    openGraph: { ...basis.openGraph, url: absolut(adressen[sprache]) },
  };
}

/** URL-Daten nur innerhalb von Suspense lesen (MUSTER 1). */
export default function FangRoute({ params }: PageProps<'/[locale]/[...rest]'>) {
  return (
    <Suspense fallback={null}>
      <Aufloesung params={params} />
    </Suspense>
  );
}

/**
 * Reihenfolge (ADR 0032): freie Seite (veröffentlicht, Zeitpunkt erreicht) → Weiterleitung (308) → 404. Unbekannte
 * Adressen antworten mit HTTP 404 und der lokalisierten Fehlerseite (Blatt S24).
 */
async function Aufloesung({ params }: { params: Promise<{ locale: string; rest: string[] }> }) {
  const { locale, rest } = await params;
  const sprache = locale as Locale;
  const teile = teileAus(rest);
  if (teile.length === 1) {
    const treffer = await ladeSeite(sprache, teile[0]);
    if (treffer?.art === 'umleitung') permanentRedirect(treffer.nach);
    if (treffer?.art === 'seite') return <FreieSeite seite={treffer.seite} sprache={sprache} />;
  }
  const pfad = `${sprache === routing.defaultLocale ? '' : `/${sprache}`}/${teile.join('/')}`;
  const weiter = await ladeWeiterleitung(pfad);
  if (weiter) permanentRedirect(weiter.nach);
  notFound();
}

async function FreieSeite({ seite, sprache }: { seite: SeiteOeffentlich; sprache: Locale }) {
  const tk = await getTranslations('kopf');
  // Bereich der Hauptnavigation: die Gruppe des Menüs, in der diese Seite steht (sonst keiner)
  const bestand = baueMenues(
    (k) => tk(k),
    (ziel) => pfadFuer(ziel, sprache),
  );
  const ausDb = await ladeKopfMenue(sprache);
  const punkt = `seite:${seite.id}`;
  const bereich = ausDb ? bereichMit(menuesAusDb(ausDb, bestand), punkt) : 'keiner';
  const titel = textMitSprache(seite.titel, sprache);
  return (
    <Seitenrahmen bereich={bereich} seite={punkt} sprachZiel={{ adressen: seitenAdressen(seite.slugs) }} pfad={[{ label: titel.text }]}>
      <FreieSeiteInhalt seite={seite} sprache={sprache} />
    </Seitenrahmen>
  );
}
