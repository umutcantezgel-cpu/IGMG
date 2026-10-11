import { getTranslations } from 'next-intl/server';
import NextLink from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { uebersichtFuer, type Karte } from '@/components/verwaltung/seiteninhalte/sicht';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { verlangeSitzung } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import { ladeZustaende } from '@/server/queries/verwaltung/seiteninhalte';

const pille = 'inline-flex items-center rounded-pill px-3 py-0.5 text-16 font-bold whitespace-nowrap';

/** Ziel einer Karte: Bereiche und Kontakt im Modul, Organisationen unter ihrem Kürzel (eigene Seiten). */
function zielDerKarte(karte: Karte): string {
  if (karte.gruppe === 'seiten') return `/verwaltung/seiteninhalte/${karte.bereich}`;
  if (karte.gruppe === 'kontakt') return '/verwaltung/seiteninhalte/kontakt';
  return `/verwaltung/seiteninhalte/organisationen/${karte.kuerzel}`;
}

/**
 * Verwaltung › Seiteninhalte (V05): Übersicht aller Bereiche mit Zustand und letzter Änderung. Zugang über die Liste
 * (`seiteninhalt.lesen` oder `organisationsinhalt.bearbeiten`); die Organisationsredaktion sieht nur ihre Karten (K-06).
 */
export default async function SeiteninhaltUebersicht() {
  const a = await verlangeSitzung();
  const karten = uebersichtFuer(a.rollen);
  if (karten.length === 0) redirect('/verwaltung/kein-zugriff');
  const [t, zustaende] = await Promise.all([getTranslations('verwaltung.seiteninhalte'), ladeZustaende()]);
  const gruppen = [
    { schluessel: 'seiten', titel: t('abschnitte.seiten'), karten: karten.filter((k) => k.gruppe === 'seiten') },
    { schluessel: 'kontakt', titel: t('abschnitte.kontakt'), karten: karten.filter((k) => k.gruppe === 'kontakt') },
    {
      schluessel: 'organisationen',
      titel: t('abschnitte.organisationen'),
      karten: karten.filter((k) => k.gruppe === 'organisation'),
    },
  ].filter((gruppe) => gruppe.karten.length > 0);

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-30 md:text-36">{t('titel')}</h1>
        <p className="max-w-3xl text-tinte-2">{t('einleitung')}</p>
      </div>
      {gruppen.map((gruppe) => (
        <section key={gruppe.schluessel} aria-labelledby={`gruppe-${gruppe.schluessel}`} className="flex flex-col gap-4">
          <h2 id={`gruppe-${gruppe.schluessel}`} className="font-display text-24 font-semibold">
            {gruppe.titel}
          </h2>
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {gruppe.karten.map((karte) => {
              const name = t(`bereich.${karte.bereich}`);
              const stand = zustaende.get(karte.bereich);
              const beispiel = stand === undefined || stand.istBeispiel;
              const aktion = karte.bearbeiten ? t('bearbeiten') : t('ansehen');
              const zuletzt = stand ? `${datumLang(stand.aktualisiertAm, 'de')}, ${uhrzeit(stand.aktualisiertAm, 'de')}` : null;
              return (
                <li key={karte.bereich} className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-5">
                  <h3 className="font-display text-20 font-semibold">{name}</h3>
                  <span className={cn(pille, 'self-start', beispiel ? 'bg-warnung-toenung text-warnung' : 'bg-gruen-50 text-gruen-800')}>
                    {beispiel ? t('zustand.beispiel') : t('zustand.gepflegt')}
                  </span>
                  <p className="text-16 text-tinte-2">{zuletzt ? t('zuletzt', { datum: zuletzt }) : t('nochKeinStand')}</p>
                  <Button asChild variant="outline" className="self-start">
                    <NextLink href={zielDerKarte(karte)} aria-label={`${aktion}: ${name}`}>
                      {aktion}
                    </NextLink>
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </>
  );
}
