import { ArrowRight, Globe, Mail, MapPin, Phone } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { oeffnungszeitText } from '@/components/website/fuss/zeiten';
import { Text } from '@/components/website/Text';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { angabe } from '@/lib/inhalt/platzhalter';
import { telefonHref } from '@/lib/telefon';
import { cn } from '@/lib/utils';
import type { SeitenInhalt } from '@/server/queries/seiteninhalte';
import { KARTE, KNOPF_RAHMEN, TEIL, UEBERSCHRIFT } from './stil';

/*
 * Die vier Karten der Kontaktseite (design/Contact.dc.html:22–47), je als eigener Baustein, damit die Seite sie
 * im Raster platziert (H-B10). Adresse, Telefon, E-Mail, Webadresse und Notfallnummer kommen aus dem Seiteninhalt.
 * Angaben, die noch Platzhalter „[…]“ sind (G-05), erscheinen nicht (`angabe`): Die Telefonzeile entfällt; Notfallkontakt
 * und Adresse gibt es nur mit Wert – die Seite fragt das mit `begleitTeile` ab und richtet die Spalten danach.
 */

/** Welche Teile der Begleitspalte neben den Öffnungszeiten einen Wert haben (Notfallnummer, Adresse). */
export function begleitTeile(kontakt: SeitenInhalt<'kontakt'>): { notfall: boolean; adresse: boolean } {
  return { notfall: angabe(kontakt.notfallTelefon) !== null, adresse: angabe(kontakt.adresse) !== null };
}

export async function KarteKontaktdaten({ kontakt }: { kontakt: SeitenInhalt<'kontakt'> }) {
  const t = await getTranslations('kontakt');
  const nummer = angabe(kontakt.telefon);
  const telefon = telefonHref(nummer);
  const website = angabe(kontakt.website);
  return (
    <section aria-labelledby="kontakt-daten" className={KARTE}>
      <h2 id="kontakt-daten" className={UEBERSCHRIFT}>
        {t('kontaktdaten.titel')}
      </h2>
      {/* Die Wege untereinander, durch Linien getrennt; jede Zeile mindestens 48 px hoch (K-11) */}
      <ul className="flex flex-col divide-y divide-linie">
        {nummer ? (
          <li>
            {telefon ? (
              <a href={telefon} className="flex min-h-12 items-center gap-2.5 text-gruen-700 underline underline-offset-3">
                <Phone aria-hidden className="size-5 shrink-0" />
                <span>{nummer}</span>
              </a>
            ) : (
              <span className="flex min-h-12 items-center gap-2.5">
                <Phone aria-hidden className="size-5 shrink-0 text-gruen-700" />
                <span>{nummer}</span>
              </span>
            )}
          </li>
        ) : null}
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
        {website ? (
          <li className="flex min-h-12 items-center gap-2.5">
            <Globe aria-hidden className="size-5 shrink-0 text-gruen-700" />
            <span className="wrap-anywhere">{website}</span>
          </li>
        ) : null}
      </ul>
    </section>
  );
}

export async function KarteOeffnungszeiten({ kontakt }: { kontakt: SeitenInhalt<'kontakt'> }) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('kontakt');
  const tp = await getTranslations('kopf');
  return (
    <section aria-labelledby="kontakt-oeffnungszeiten" className={TEIL}>
      <h2 id="kontakt-oeffnungszeiten" className={UEBERSCHRIFT}>
        {t('oeffnungszeiten.titel')}
      </h2>
      {/* Gepflegte Öffnungszeiten (Verwaltung › Seiteninhalte › Kontakt, dieselbe Quelle wie die Fußzeile); sonst Design-Texte */}
      {kontakt.oeffnungszeiten.length ? (
        <dl className="flex flex-col">
          {kontakt.oeffnungszeiten.map((z, i) => (
            <div key={i} className="border-b border-linie py-2 last:border-0">
              <dt className="font-bold">
                <Text feld={z.tage} sprache={sprache} platzhalter />
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

/** Notfallkontakt: nur mit Nummer – ohne sie entfällt der ganze Teil (Überschrift und Einleitung allein führen nirgends hin). */
export async function KarteNotfall({ kontakt }: { kontakt: SeitenInhalt<'kontakt'> }) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('kontakt');
  const nummer = angabe(kontakt.notfallTelefon);
  if (!nummer) return null;
  const notfall = telefonHref(nummer);
  return (
    <section aria-labelledby="kontakt-notfall" className={TEIL}>
      <h2 id="kontakt-notfall" className={UEBERSCHRIFT}>
        {t('notfall.titel')}
      </h2>
      <Text feld={kontakt.notfalltext} sprache={sprache} als="p" platzhalter />
      {notfall ? (
        <a
          href={notfall}
          className="flex min-h-12 items-center gap-2.5 text-20 font-bold wrap-anywhere text-fehler underline underline-offset-3"
        >
          <Phone aria-hidden className="size-5 shrink-0" />
          {nummer}
        </a>
      ) : (
        <strong className="flex min-h-12 items-center gap-2.5 text-20 font-bold wrap-anywhere text-fehler">
          <Phone aria-hidden className="size-5 shrink-0" />
          {nummer}
        </strong>
      )}
    </section>
  );
}

/** Adresse: nur mit Wert; der Sprung „Zur Karte“ nur, wenn es die Karte gibt (bestätigte Koordinaten, M-010). */
export async function KarteAdresse({ kontakt }: { kontakt: SeitenInhalt<'kontakt'> }) {
  const t = await getTranslations('kontakt');
  const adresse = angabe(kontakt.adresse);
  if (!adresse) return null;
  return (
    <section aria-labelledby="kontakt-adresse" className={TEIL}>
      <h2 id="kontakt-adresse" className={UEBERSCHRIFT}>
        {t('adresse.titel')}
      </h2>
      <address className="flex flex-col not-italic">
        <strong>{t('adresse.organisation')}</strong>
        <span>{adresse}</span>
        <span>{t('adresse.land')}</span>
      </address>
      {kontakt.koordinaten ? (
        <a href="#karte" aria-label={t('adresse.karteLabel', { adresse })} className={cn(KNOPF_RAHMEN, 'mt-auto self-start')}>
          {/* Sprung zum Kartenbereich dieser Seite – kein externer Dienst (Tor A SP-A-15, A-S11a) */}
          <MapPin aria-hidden className="size-5 shrink-0" />
          {t('adresse.karte')}
        </a>
      ) : null}
    </section>
  );
}
