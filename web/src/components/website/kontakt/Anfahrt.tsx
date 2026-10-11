import { Car, Map as MapIcon, MapPin, Navigation } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { Text } from '@/components/website/Text';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import type { SeitenInhalt } from '@/server/queries/seiteninhalte';
import { KarteNachKlick } from './KarteNachKlick';
import { osmEinbettung } from './karte';
import { KARTE, UEBERSCHRIFT_GROSS } from './stil';

/**
 * Anfahrt (design/Contact.dc.html:49–57): drei Wege mit Texten aus dem Seiteninhalt und die Kartenfläche,
 * die erst nach einem Klick lädt. Der Anker #karte bleibt erhalten; der Google-Maps-Knopf der Adresskarte zeigt darauf.
 */
export async function Anfahrt({ kontakt }: { kontakt: SeitenInhalt<'kontakt'> }) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('kontakt');
  const wege = [
    { schluessel: 'oeffentlich', Icon: Navigation, feld: kontakt.anfahrtOeffentlich },
    { schluessel: 'auto', Icon: Car, feld: kontakt.anfahrtAuto },
    { schluessel: 'fuss', Icon: MapIcon, feld: kontakt.anfahrtFuss },
  ];
  // Einbettung nur, wenn Koordinaten bestätigt sind (M-010); sonst Platzhalter ohne Schaltfläche
  const einbettung = kontakt.koordinaten ? osmEinbettung(kontakt.koordinaten) : undefined;
  return (
    <section id="karte" aria-labelledby="kontakt-anfahrt" className="flex scroll-mt-24 flex-wrap items-stretch gap-6">
      <div className={cn(KARTE, 'flex-[1_1_360px] gap-4')}>
        <h2 id="kontakt-anfahrt" className={UEBERSCHRIFT_GROSS}>
          <MapPin aria-hidden className="size-7 shrink-0 text-gruen-700" />
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
      <div className="flex min-w-0 flex-[2_1_420px] flex-col">
        <KarteNachKlick
          einbettung={einbettung}
          texte={{
            platzhalter: t('karte.platzhalter', { adresse: kontakt.adresse }),
            laden: t('karte.laden'),
            hinweis: t('karte.hinweis'),
            ohneKoordinaten: t('karte.ohneKoordinaten'),
            iframeTitel: t('karte.iframeTitel', { adresse: kontakt.adresse }),
          }}
        />
      </div>
    </section>
  );
}
