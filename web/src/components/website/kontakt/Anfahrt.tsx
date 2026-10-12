import { Car, Map as MapIcon, Navigation } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { Bildplatzhalter } from '@/components/website/Bildplatzhalter';
import { Text } from '@/components/website/Text';
import type { Locale } from '@/i18n/routing';
import type { SeitenInhalt } from '@/server/queries/seiteninhalte';
import { KarteNachKlick } from './KarteNachKlick';
import { osmEinbettung } from './karte';
import { KNOPF_RAHMEN } from './stil';

/**
 * Anfahrt (design/Contact.dc.html:49–57): drei Wege mit Texten aus dem Seiteninhalt und die Kartenfläche,
 * die erst nach einem Klick lädt. Der Anker #karte bleibt erhalten; der Google-Maps-Knopf der Adresskarte zeigt darauf.
 */
export async function Anfahrt({ kontakt }: { kontakt: SeitenInhalt<'kontakt'> }) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('kontakt');
  // Nächster Schritt ohne Karte: Verweis auf das Nachrichtenformular mit vorhandenem Schlüssel „Schreiben Sie uns“
  const tk = await getTranslations('kontaktformular');
  const wege = [
    { schluessel: 'oeffentlich', Icon: Navigation, feld: kontakt.anfahrtOeffentlich },
    { schluessel: 'auto', Icon: Car, feld: kontakt.anfahrtAuto },
    { schluessel: 'fuss', Icon: MapIcon, feld: kontakt.anfahrtFuss },
  ];
  // Einbettung nur, wenn Koordinaten bestätigt sind (M-010); sonst Platzhalter mit Rahmen und Fuß (H-B10)
  const einbettung = kontakt.koordinaten ? osmEinbettung(kontakt.koordinaten) : undefined;
  return (
    <section id="karte" aria-labelledby="kontakt-anfahrt" className="grid scroll-mt-24 items-start gap-6 lg:grid-cols-5">
      <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
        <h2 id="kontakt-anfahrt" className="text-display-2">
          {t('anfahrt.titel')}
        </h2>
        {wege.map(({ schluessel, Icon, feld }) => (
          <div key={schluessel} className="flex items-start gap-3.5 border-t border-linie py-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-pill bg-gruen-50 text-gruen-800">
              <Icon aria-hidden className="size-5" />
            </span>
            <div className="flex min-w-0 flex-col">
              <h3 className="font-text text-18 font-bold tracking-normal">{t(`anfahrt.${schluessel}`)}</h3>
              <Text feld={feld} sprache={sprache} als="p" className="text-tinte-2" />
            </div>
          </div>
        ))}
      </div>
      {einbettung ? (
        <div className="flex min-w-0 flex-col lg:col-span-3">
          <KarteNachKlick
            einbettung={einbettung}
            texte={{
              platzhalter: t('karte.platzhalter', { adresse: kontakt.adresse }),
              laden: t('karte.laden'),
              hinweis: t('karte.hinweis'),
              iframeTitel: t('karte.iframeTitel', { adresse: kontakt.adresse }),
            }}
          />
        </div>
      ) : (
        <div className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-linie lg:col-span-3">
          <Bildplatzhalter beschriftung={t('karte.platzhalter', { adresse: kontakt.adresse })} className="min-h-75 flex-1" />
          <div className="flex flex-col items-start gap-4 border-t border-linie bg-weiss p-6">
            <p className="max-w-text">{t('karte.ohneKoordinaten')}</p>
            <a href="#nachricht" className={KNOPF_RAHMEN}>
              {tk('titel')}
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
