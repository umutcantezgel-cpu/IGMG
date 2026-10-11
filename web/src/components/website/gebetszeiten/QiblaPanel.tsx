import { Compass } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Text } from '@/components/website/Text';
import type { Mehrsprachig } from '@/lib/db/schema/typen';
import { qiblaRichtung } from '@/lib/gebetszeiten/berechnung';
import type { Sprache } from '@/lib/i18n/inhalt';
import { QiblaInformation } from './QiblaInformation';
import { QiblaKompass, type QiblaKompassTexte } from './QiblaKompass';

export type QiblaPanelProps = {
  sprache: Sprache;
  /** Ortsname aus der Datenbank: Deutsch Pflicht, tr/en mit sichtbarem Rückfall. */
  ort: Mehrsprachig;
  /** Breite und Länge des gewählten Ortes in Grad (Zahl). */
  breite: number;
  laenge: number;
};

/** Zahl mit festen Nachkommastellen in der Sprache der Seite (de/tr: Komma, en: Punkt). */
function zahl(wert: number, sprache: Sprache, nachkommastellen: number): string {
  return new Intl.NumberFormat(sprache, {
    minimumFractionDigits: nachkommastellen,
    maximumFractionDigits: nachkommastellen,
  }).format(wert);
}

/**
 * Tab „Qibla“ (design/PrayerTimes.dc.html, Blatt S02): Die Richtung zur Kaaba wird fest mit qiblaRichtung()
 * berechnet (K-08). Der Kompass hört erst nach einem Klick auf die Lagesensoren. Rechts steht die Karte
 * „Qibla Information“. Die Seite selbst (Kopf, Tabs) setzt A14.
 */
export async function QiblaPanel({ sprache, ort, breite, laenge }: QiblaPanelProps) {
  const t = await getTranslations('gebetszeitenQibla');
  const winkel = qiblaRichtung(breite, laenge);
  const winkelGanz = zahl(Math.round(winkel), sprache, 0);
  const kompass: QiblaKompassTexte = {
    dialAria: t('dial_aria', { winkel: winkelGanz }),
    dialNord: t('dial_nord'),
    winkelKurz: t('winkel_kurz', { winkel: winkelGanz }),
    aktivieren: t('kompass_aktivieren'),
    beenden: t('kompass_beenden'),
    hinweis: t('kompass_hinweis'),
    startet: t('kompass_startet'),
    aktiv: t('kompass_aktiv'),
    verweigert: t('kompass_verweigert'),
    fehlt: t('kompass_fehlt'),
  };
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <section className="flex flex-col items-center gap-4 rounded-lg border border-linie bg-weiss p-6 text-center">
        <div className="flex w-full flex-col gap-2 text-left">
          <h3 className="flex items-center gap-2 text-24 leading-tight">
            <Compass aria-hidden className="size-6 shrink-0 text-gruen-700" />
            {t('titel')}
          </h3>
          <p className="text-16 leading-einleitung text-tinte-2">{t('untertitel')}</p>
        </div>
        <QiblaKompass winkel={winkel} texte={kompass} />
        <p className="text-24 font-bold">{t('winkel_norden', { winkel: winkelGanz })}</p>
        <p className="max-w-text text-tinte-2">
          {t('ort_vor')} <Text feld={ort} sprache={sprache} als="span" /> {t('ort_nach')}
        </p>
      </section>
      <QiblaInformation winkelGenau={zahl(winkel, sprache, 1)} />
    </div>
  );
}
