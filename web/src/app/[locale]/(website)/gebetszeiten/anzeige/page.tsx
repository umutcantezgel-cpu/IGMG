import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { AnzeigeLive, type AnzeigeTexte } from '@/components/website/anzeige/AnzeigeLive';
import { Bild } from '@/components/website/Bild';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeAnzeige } from '@/server/queries/anzeige';
import { ladeGebetszeitenFenster } from '@/server/queries/gebetszeiten';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('anzeige');
  // Ohne Beschreibung erbte die Seite die Platzhalter-Beschreibung des Layouts; die Überschrift beschreibt den Inhalt
  return metadatenFuer({ pfad: '/gebetszeiten/anzeige', titel: t('titel'), beschreibung: t('ueberschrift') });
}

async function texte(locale: Locale): Promise<AnzeigeTexte> {
  const t = await getTranslations({ locale, namespace: 'anzeige' });
  const schluessel = [
    'ort',
    'schliessen',
    'aktuell',
    'naechstes',
    'ueberschrift',
    'aktuelleZeit',
    'naechsteZeit',
    'restzeit',
    'morgen',
    'hinweis',
    'berechnet',
    'offline',
    'einheitStd',
    'einheitMin',
    'folien',
    'iqama',
    'ruheTitel',
    'ruheText',
    'freitagTitel',
    'freitagText',
    'versQuelle',
    'hadithQuelle',
    'uebersetzung',
  ] as const;
  return {
    ...(Object.fromEntries(schluessel.map((k) => [k, t.raw(k) as string])) as Omit<AnzeigeTexte, 'namen' | 'arabisch'>),
    namen: t.raw('namen') as AnzeigeTexte['namen'],
    arabisch: t.raw('arabisch') as AnzeigeTexte['arabisch'],
  };
}

/**
 * Gebetszeiten-Anzeige für den Bildschirm in der Moschee (Blatt S03, K-08, Laufbuch D-12): eigene Vollbild-Ansicht
 * ohne Website-Rahmen. Deutsch und Türkisch wechseln sich wie im Design ab; Englisch bleibt englisch.
 * Folien, Iqama und Freitagsmodus aus der Verwaltung › Anzeige (AUFTRAG 3.10) stecken statisch in der Seite
 * (Tag `anzeige`); die Anzeige holt danach alle fünf Minuten `/api/anzeige` und läuft ohne Netz weiter.
 */
export default async function AnzeigeSeite() {
  const sprache = (await getLocale()) as Locale;
  const [fenster, anzeige, de, tr, en] = await Promise.all([
    ladeGebetszeitenFenster(),
    ladeAnzeige(),
    texte('de'),
    texte('tr'),
    texte('en'),
  ]);
  return (
    <AnzeigeLive
      tage={fenster.tage}
      texte={{ de, tr, en }}
      sprachen={sprache === 'en' ? ['en'] : sprache === 'tr' ? ['tr', 'de'] : ['de', 'tr']}
      berechnet={fenster.quelle === 'berechnet' && !fenster.bestaetigt}
      zurueckHref={pfadFuer('/gebetszeiten', sprache)}
      anzeige={anzeige}
      logo={<Bild src="/bilder/logos/logo-igmg-wetzlar.png" alt="" width={40} height={40} className="size-10" preload />}
    />
  );
}
