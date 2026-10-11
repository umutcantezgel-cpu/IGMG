import { Check, Settings } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Text } from '@/components/website/Text';
import type { Mehrsprachig } from '@/lib/db/schema/typen';
import type { Sprache } from '@/lib/i18n/inhalt';
import { cn } from '@/lib/utils';

/** Berechnungsmethoden wie im Design (Berechnungsmethode). Die Seite ordnet ihre Werte hier zu. */
export const BERECHNUNGS_METHODEN = ['turkey', 'mwl', 'isna', 'egypt', 'makkah'] as const;
export type BerechnungsMethode = (typeof BERECHNUNGS_METHODEN)[number];
/** Quelle der Zeiten wie im Datenmodell. */
export type Zeitquelle = 'import' | 'berechnet';
export type Madhab = 'hanafi' | 'shafi';

export type EinstellungenPanelProps = {
  sprache: Sprache;
  /** Ortsname aus der Datenbank: Deutsch Pflicht, tr/en mit sichtbarem Rückfall. */
  ort: Mehrsprachig;
  /** Breite und Länge des gewählten Ortes in Grad (Zahl). */
  breite: number;
  laenge: number;
  quelle: Zeitquelle;
  methode: BerechnungsMethode;
  anpassungImsakMin: number;
  anpassungIshaMin: number;
  /** Nur angezeigt, wenn übergeben (nicht im Design, siehe Bericht). */
  madhab?: Madhab | null;
};

/**
 * Tab „Einstellungen“ (design/PrayerTimes.dc.html, Blatt S02). Besucherinnen und Besucher sehen nur die
 * Berechnungsgrundlage. Die amtlichen Zeiten lassen sich hier nicht verändern (K-08, G-06), deshalb gibt es
 * keine Eingabefelder und keine Speichern- oder Zurücksetzen-Schaltflächen.
 */
export async function EinstellungenPanel({
  sprache,
  ort,
  breite,
  laenge,
  quelle,
  methode,
  anpassungImsakMin,
  anpassungIshaMin,
  madhab,
}: EinstellungenPanelProps) {
  const t = await getTranslations('gebetszeitenEinstellungen');
  const koordinatenText = t('koordinaten', {
    breite: Math.abs(breite).toFixed(4),
    breitenRichtung: breite >= 0 ? t('richtung_nord') : t('richtung_sued'),
    laenge: Math.abs(laenge).toFixed(4),
    laengenRichtung: laenge >= 0 ? t('richtung_ost') : t('richtung_west'),
  });

  return (
    // Kein eigenes role="tabpanel": Das Panel liegt im Tab-Panel von GebetszeitenTabs (keine verschachtelten Panels)
    <div className="flex w-full max-w-seitenkopf flex-col gap-6 rounded-lg border border-linie bg-weiss p-5 md:p-8">
      <div className="flex flex-col gap-2">
        <h3 className="flex items-center gap-2 text-24 leading-tight">
          <Settings aria-hidden className="size-6 shrink-0 text-gruen-700" />
          {t('titel')}
        </h3>
        <p className="text-16 leading-einleitung text-tinte-2">{t('untertitel')}</p>
      </div>

      <section aria-labelledby="einst-methode" className="flex flex-col gap-3">
        <h4 id="einst-methode" className="font-text text-16 font-bold">
          {t('methode_titel')}
        </h4>
        <ul className="flex flex-col gap-2">
          {BERECHNUNGS_METHODEN.map((m) => {
            const aktiv = m === methode;
            return (
              <li
                key={m}
                aria-current={aktiv ? 'true' : undefined}
                className={cn(
                  'flex min-h-14 items-center gap-3 rounded-md px-3.5 py-2',
                  aktiv ? 'border-2 border-gruen-700 bg-gruen-50' : 'border border-rand bg-weiss',
                )}
              >
                <span className="flex min-w-0 flex-1 flex-col leading-snug">
                  <strong>{t(`methoden.${m}.name`)}</strong>
                  <span className="text-16 text-tinte-2">{t(`methoden.${m}.desc`)}</span>
                </span>
                {aktiv ? (
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-gruen-700 px-3 py-0.5 text-16 font-bold text-weiss">
                    <Check aria-hidden className="size-4" />
                    {t('methode_verwendet')}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
        <dl className="grid gap-4 pt-2 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="text-16 font-bold text-tinte-2">{t('quelle_label')}</dt>
            <dd className="m-0">{quelle === 'import' ? t('quelle_import') : t('quelle_berechnet')}</dd>
          </div>
          {madhab ? (
            <div className="flex flex-col gap-1">
              <dt className="text-16 font-bold text-tinte-2">{t('madhab_label')}</dt>
              <dd className="m-0">{madhab === 'hanafi' ? t('madhab_hanafi') : t('madhab_shafi')}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section aria-labelledby="einst-standort" className="flex flex-col gap-3">
        <h4 id="einst-standort" className="font-text text-16 font-bold">
          {t('standort_titel')}
        </h4>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-sand px-4 py-3">
          <p className="flex flex-col leading-snug">
            <Text feld={ort} sprache={sprache} als="strong" />
            <span className="text-16 text-tinte-2">{koordinatenText}</span>
          </p>
        </div>
      </section>

      <section aria-labelledby="einst-anpassung" className="flex flex-col gap-3">
        <h4 id="einst-anpassung" className="font-text text-16 font-bold">
          {t('anpassungen_titel')}
        </h4>
        <dl className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <dt className="text-16 font-bold">{t('imsak')}</dt>
            <dd className="m-0 flex h-12 items-center rounded-md bg-sand px-3.5 text-18 tabular-nums">{anpassungImsakMin}</dd>
          </div>
          <div className="flex flex-col gap-2">
            <dt className="text-16 font-bold">{t('isha')}</dt>
            <dd className="m-0 flex h-12 items-center rounded-md bg-sand px-3.5 text-18 tabular-nums">{anpassungIshaMin}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
