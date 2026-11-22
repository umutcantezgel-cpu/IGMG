import { Car, Map as MapIcon, Navigation } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { textMitSprache } from '@/components/website/Text';
import type { Locale } from '@/i18n/routing';
import { angabe } from '@/lib/inhalt/platzhalter';
import { cn } from '@/lib/utils';
import type { SeitenInhalt } from '@/server/queries/seiteninhalte';
import { KarteNachKlick } from './KarteNachKlick';
import { osmEinbettung } from './karte';

/**
 * Anfahrt (design/Contact.dc.html:49–57): die Wege mit Texten aus dem Seiteninhalt und die Kartenfläche, die erst nach
 * einem Klick lädt. Der Anker #karte bleibt erhalten; der Knopf „Zur Karte“ der Adresskarte zeigt darauf.
 * Platzhalter der Gemeinde „[…]“ erscheinen nicht: Ein Weg, dessen Text nur aus Platzhaltern besteht (etwa Haltestelle
 * und Linien), entfällt samt Symbol und Überschrift. Ohne bestätigte Koordinaten (M-010) gibt es keine Kartenfläche –
 * die Wege stehen dann nebeneinander über die ganze Breite. Bleibt weder ein Weg noch die Karte, entfällt der Abschnitt.
 */
export async function Anfahrt({ kontakt }: { kontakt: SeitenInhalt<'kontakt'> }) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('kontakt');
  const wege = [
    { schluessel: 'oeffentlich', Icon: Navigation, feld: kontakt.anfahrtOeffentlich },
    { schluessel: 'auto', Icon: Car, feld: kontakt.anfahrtAuto },
    { schluessel: 'fuss', Icon: MapIcon, feld: kontakt.anfahrtFuss },
  ]
    .map((weg) => ({ ...weg, ...textMitSprache(weg.feld, sprache, { platzhalter: true }) }))
    .filter((weg) => weg.text);
  // Einbettung nur, wenn Koordinaten bestätigt sind (M-010)
  const einbettung = kontakt.koordinaten ? osmEinbettung(kontakt.koordinaten) : undefined;
  if (wege.length === 0 && !einbettung) return null;
  const adresse = angabe(kontakt.adresse);
  return (
    <section
      id="karte"
      aria-labelledby="kontakt-anfahrt"
      className={cn('scroll-mt-24', einbettung ? 'grid items-start gap-6 lg:grid-cols-5' : 'flex flex-col gap-4')}
    >
      <div className={cn('flex min-w-0 flex-col gap-4', einbettung && 'lg:col-span-2')}>
        <h2 id="kontakt-anfahrt" className="text-display-2">
          {t('anfahrt.titel')}
        </h2>
        {/* Mit Karte untereinander neben ihr; ohne Karte ab 768 px nebeneinander in gleich breiten Spalten */}
        <div className={cn('flex flex-col', einbettung ? null : 'md:grid md:auto-cols-fr md:grid-flow-col md:gap-x-6')}>
          {wege.map(({ schluessel, Icon, text, lang }) => (
            <div key={schluessel} className="flex items-start gap-2.5 border-t border-linie py-3">
              <Icon aria-hidden className="mt-1 size-5 shrink-0 text-gruen-700" />
              <div className="flex min-w-0 flex-col">
                <h3 className="font-text text-18 font-bold tracking-normal">{t(`anfahrt.${schluessel}`)}</h3>
                <p lang={lang} className="text-tinte-2">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {einbettung ? (
        <div className="flex min-w-0 flex-col lg:col-span-3">
          <KarteNachKlick
            einbettung={einbettung}
            texte={{
              platzhalter: adresse ? t('karte.platzhalter', { adresse }) : t('karte.ohneAdresse'),
              laden: t('karte.laden'),
              hinweis: t('karte.hinweis'),
              iframeTitel: adresse ? t('karte.iframeTitel', { adresse }) : t('karte.ohneAdresse'),
            }}
          />
        </div>
      ) : null}
    </section>
  );
}
