import { ArrowRight, Clock, ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { oeffnungszeitText } from '@/components/website/fuss/zeiten';
import { Text } from '@/components/website/Text';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import type { SeitenInhalt } from '@/server/queries/seiteninhalte';
import { KARTE, KNOPF_RAHMEN, UEBERSCHRIFT } from './stil';

/**
 * Die vier Karten oben (design/Contact.dc.html:22–47): Adresse, Kontaktdaten, Öffnungszeiten, Notfallkontakt.
 * Adresse, Telefon, E-Mail, Webadresse und Notfallnummer kommen aus dem Seiteninhalt (Platzhalter nach G-05).
 */
export async function KontaktKarten({ kontakt }: { kontakt: SeitenInhalt<'kontakt'> }) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('kontakt');
  const tp = await getTranslations('kopf');
  return (
    <div className="grid raster-kacheln gap-6">
      <section aria-labelledby="kontakt-adresse" className={KARTE}>
        <h2 id="kontakt-adresse" className={UEBERSCHRIFT}>
          <MapPin aria-hidden className="size-6 shrink-0 text-gruen-700" />
          {t('adresse.titel')}
        </h2>
        <address className="flex flex-col not-italic">
          <strong>{t('adresse.organisation')}</strong>
          <span>{kontakt.adresse}</span>
          <span>{t('adresse.land')}</span>
        </address>
        <a
          href="#karte"
          aria-label={t('adresse.karteLabel', { adresse: kontakt.adresse })}
          className={cn(KNOPF_RAHMEN, 'mt-auto self-start')}
        >
          {/* Sprung zum Kartenbereich dieser Seite – kein externer Dienst (Tor A SP-A-15, A-S11a) */}
          <MapPin aria-hidden className="size-5" />
          {t('adresse.karte')}
        </a>
      </section>

      <section aria-labelledby="kontakt-daten" className={KARTE}>
        <h2 id="kontakt-daten" className={UEBERSCHRIFT}>
          <Phone aria-hidden className="size-6 shrink-0 text-gruen-700" />
          {t('kontaktdaten.titel')}
        </h2>
        {/* Drei Wege untereinander, durch Linien getrennt; jede Zeile mindestens 48 px hoch (K-11) */}
        <ul className="flex flex-col divide-y divide-linie">
          <li className="flex min-h-12 items-center gap-2.5">
            <Phone aria-hidden className="size-5 shrink-0 text-gruen-700" />
            <span>{kontakt.telefon}</span>
          </li>
          <li>
            <a
              href={`mailto:${kontakt.email}`}
              aria-label={t('kontaktdaten.emailLabel', { email: kontakt.email })}
              className="flex min-h-12 items-center gap-2.5 wrap-anywhere text-gruen-700 underline underline-offset-3"
            >
              <Mail aria-hidden className="size-5 shrink-0" />
              {kontakt.email}
            </a>
          </li>
          <li className="flex min-h-12 items-center gap-2.5">
            <ExternalLink aria-hidden className="size-5 shrink-0 text-gruen-700" />
            <span className="wrap-anywhere">{kontakt.website}</span>
          </li>
        </ul>
      </section>

      <section aria-labelledby="kontakt-oeffnungszeiten" className={cn(KARTE, 'border-2 border-gruen-700')}>
        <h2 id="kontakt-oeffnungszeiten" className={UEBERSCHRIFT}>
          <Clock aria-hidden className="size-6 shrink-0 text-gruen-700" />
          {t('oeffnungszeiten.titel')}
        </h2>
        {/* Gepflegte Öffnungszeiten (Verwaltung › Seiteninhalte › Kontakt, dieselbe Quelle wie die Fußzeile); sonst Design-Texte */}
        {kontakt.oeffnungszeiten.length ? (
          <dl className="flex flex-col">
            {kontakt.oeffnungszeiten.map((z, i) => (
              <div key={i} className="border-b border-linie py-2 last:border-0">
                <dt className="font-bold">
                  <Text feld={z.tage} sprache={sprache} />
                </dt>
                <dd className="text-tinte-2">{oeffnungszeitText(z, sprache)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <dl className="flex flex-col">
            <div className="border-b border-linie py-2">
              <dt className="font-bold">{t('oeffnungszeiten.taeglich')}</dt>
              <dd className="text-tinte-2">{t('oeffnungszeiten.taeglichZeit')}</dd>
            </div>
            <div className="border-b border-linie py-2">
              <dt className="font-bold">{t('oeffnungszeiten.freitag')}</dt>
              <dd className="text-tinte-2">{t('oeffnungszeiten.freitagZeit')}</dd>
            </div>
            <div className="py-2">
              <dt className="font-bold">{t('oeffnungszeiten.buero')}</dt>
              <dd className="text-tinte-2">{t('oeffnungszeiten.bueroZeit')}</dd>
            </div>
          </dl>
        )}
        <Link
          href="/gebetszeiten"
          aria-label={t('oeffnungszeiten.gebetszeitenLabel', { sichtbar: tp('gebetszeiten') })}
          className="mt-auto inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-700 underline underline-offset-4"
        >
          {tp('gebetszeiten')}
          <ArrowRight aria-hidden className="size-5" />
        </Link>
      </section>

      <section aria-labelledby="kontakt-notfall" className="flex flex-col gap-3 rounded-lg bg-fehler-toenung p-6">
        <h2 id="kontakt-notfall" className={UEBERSCHRIFT}>
          <Phone aria-hidden className="size-6 shrink-0 text-fehler" />
          {t('notfall.titel')}
        </h2>
        <Text feld={kontakt.notfalltext} sprache={sprache} als="p" />
        <strong className="text-20 wrap-anywhere text-fehler">{kontakt.notfallTelefon}</strong>
      </section>
    </div>
  );
}
