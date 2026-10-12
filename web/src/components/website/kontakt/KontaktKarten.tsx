import { ArrowRight, Clock, Globe, Mail, MapPin, Phone } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { oeffnungszeitText } from '@/components/website/fuss/zeiten';
import { Text } from '@/components/website/Text';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { telefonHref } from '@/lib/telefon';
import { cn } from '@/lib/utils';
import type { SeitenInhalt } from '@/server/queries/seiteninhalte';
import { KARTE, KNOPF_RAHMEN, UEBERSCHRIFT } from './stil';

/*
 * Die vier Karten der Kontaktseite (design/Contact.dc.html:22–47), je als eigener Baustein, damit die Seite sie
 * im Raster platziert (H-B10). Adresse, Telefon, E-Mail, Webadresse und Notfallnummer kommen aus dem Seiteninhalt
 * (Platzhalter nach G-05).
 */

export async function KarteKontaktdaten({ kontakt }: { kontakt: SeitenInhalt<'kontakt'> }) {
  const t = await getTranslations('kontakt');
  const telefon = telefonHref(kontakt.telefon);
  return (
    <section aria-labelledby="kontakt-daten" className={KARTE}>
      <h2 id="kontakt-daten" className={UEBERSCHRIFT}>
        <Phone aria-hidden className="size-6 shrink-0 text-gruen-700" />
        {t('kontaktdaten.titel')}
      </h2>
      {/* Drei Wege untereinander, durch Linien getrennt; jede Zeile mindestens 48 px hoch (K-11) */}
      <ul className="flex flex-col divide-y divide-linie">
        <li>
          {telefon ? (
            <a href={telefon} className="flex min-h-12 items-center gap-2.5 text-gruen-700 underline underline-offset-3">
              <Phone aria-hidden className="size-5 shrink-0" />
              <span>{kontakt.telefon}</span>
            </a>
          ) : (
            <span className="flex min-h-12 items-center gap-2.5">
              <Phone aria-hidden className="size-5 shrink-0 text-gruen-700" />
              <span>{kontakt.telefon}</span>
            </span>
          )}
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
          <Globe aria-hidden className="size-5 shrink-0 text-gruen-700" />
          <span className="wrap-anywhere">{kontakt.website}</span>
        </li>
      </ul>
    </section>
  );
}

export async function KarteOeffnungszeiten({ kontakt }: { kontakt: SeitenInhalt<'kontakt'> }) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('kontakt');
  const tp = await getTranslations('kopf');
  return (
    <section aria-labelledby="kontakt-oeffnungszeiten" className={KARTE}>
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
  );
}

export async function KarteNotfall({ kontakt }: { kontakt: SeitenInhalt<'kontakt'> }) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('kontakt');
  const notfall = telefonHref(kontakt.notfallTelefon);
  return (
    <section aria-labelledby="kontakt-notfall" className="flex flex-col gap-3 rounded-lg bg-fehler-toenung p-6">
      <h2 id="kontakt-notfall" className={UEBERSCHRIFT}>
        <Phone aria-hidden className="size-6 shrink-0 text-fehler" />
        {t('notfall.titel')}
      </h2>
      <Text feld={kontakt.notfalltext} sprache={sprache} als="p" />
      {notfall ? (
        <a href={notfall} className="flex min-h-12 items-center text-20 font-bold wrap-anywhere text-fehler underline underline-offset-3">
          {kontakt.notfallTelefon}
        </a>
      ) : (
        <strong className="text-20 wrap-anywhere text-fehler">{kontakt.notfallTelefon}</strong>
      )}
    </section>
  );
}

export async function KarteAdresse({ kontakt }: { kontakt: SeitenInhalt<'kontakt'> }) {
  const t = await getTranslations('kontakt');
  return (
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
  );
}
