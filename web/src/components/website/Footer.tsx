import { Building2, Mail, MapPin, Phone } from 'lucide-react';
import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { text } from '@/lib/i18n/inhalt';
import { heuteBerlin } from '@/lib/zeit/heute';
import { ladeSeiteninhalt } from '@/server/queries/seiteninhalte';
import { JetztGeoeffnet } from './fuss/JetztGeoeffnet';
import { oeffnungszeitText } from './fuss/zeiten';
import { Facebook, Instagram, Stern8, Youtube } from './Icons';
import type { Ziel } from './navigation';

/**
 * Footer (02.4, design/Footer.dc.html): Gemeinde, Kontakt, Öffnungszeiten, Schnellzugriff (Laufbuch D-07),
 * Webseite für Ihre Moschee, Rechtslinks. Kontaktdaten aus „Seiteninhalte › Kontaktdaten“ (Platzhalter bis zur Pflege).
 * Social-Media-Links erst, wenn hinterlegt (M-020) – sonst sichtbar als Platzhalter ohne Ziel.
 */
export async function Footer() {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('fuss');
  const kontakt = await ladeSeiteninhalt('kontakt');
  const schnell: { label: string; ziel: Ziel }[] = [
    { label: t('qGebetszeiten'), ziel: '/gebetszeiten' },
    { label: t('qVeranstaltungen'), ziel: '/veranstaltungen' },
    { label: t('qBildung'), ziel: '/bildung/korankurse' },
    { label: t('qSpenden'), ziel: '/projekte' },
    { label: t('qKontakt'), ziel: '/kontakt' },
    { label: t('qUeberUns'), ziel: '/ueber-uns' },
  ];
  const sozial = [
    { netz: 'Facebook', url: kontakt.social.facebook, Icon: Facebook },
    { netz: 'Instagram', url: kontakt.social.instagram, Icon: Instagram },
    { netz: 'YouTube', url: kontakt.social.youtube, Icon: Youtube },
  ];
  const ueberschrift = (titel: string) => (
    <h2 className="flex items-center gap-2 border-b border-gruen-800 pb-2 font-text text-18 font-bold tracking-normal text-wrap">
      <Stern8 className="text-gruen-100" />
      {titel}
    </h2>
  );
  const { jahr } = await heuteBerlin();
  return (
    <footer className="bg-gruen-950 text-weiss">
      {/* Achtstern-Band an der oberen Kante (K-008), hell auf Tiefgrün, dekorativ */}
      <div aria-hidden className="achtstern-band-hell h-5" />
      <div className="mx-auto grid max-w-(--container-inhalt) grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-x-8 gap-y-10 px-4 pt-12 pb-8 md:px-8 md:pt-20 md:pb-12">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Image src="/bilder/logos/logo-igmg-wetzlar.png" alt={t('logoAlt')} width={40} height={40} className="size-10 rounded-sm" />
            <span className="font-display text-24 leading-tight font-semibold">IGMG Wetzlar</span>
          </div>
          <p className="text-16 leading-relaxed text-gruen-100">{t('beschreibung')}</p>
          <ul aria-label={t('sozial')} className="flex gap-2">
            {sozial.map(({ netz, url, Icon }) => (
              <li key={netz}>
                {url ? (
                  <a
                    href={url}
                    rel="noopener noreferrer"
                    aria-label={netz}
                    className="flex size-12 items-center justify-center rounded-md border border-gruen-100 text-weiss hover:bg-gruen-800 hover:text-weiss"
                  >
                    <Icon />
                  </a>
                ) : (
                  <span
                    role="img"
                    aria-label={t('platzhalterLink', { netz })}
                    className="flex size-12 items-center justify-center rounded-md border border-gruen-100 text-weiss"
                  >
                    <Icon />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          {ueberschrift(t('kontakt'))}
          <address className="flex flex-col gap-3 text-16 not-italic">
            <span className="flex items-start gap-2.5 text-gruen-50">
              <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-gruen-100" />
              <span>{kontakt.adresse}</span>
            </span>
            <span className="flex items-center gap-2.5 text-gruen-50">
              <Phone aria-hidden className="size-5 shrink-0 text-gruen-100" />
              <span>{kontakt.telefon}</span>
            </span>
            <a
              href={`mailto:${kontakt.email}`}
              className="flex min-h-11 items-center gap-2.5 text-weiss underline underline-offset-[3px] hover:text-gruen-100"
            >
              <Mail aria-hidden className="size-5 shrink-0 text-gruen-100" />
              <span>{kontakt.email}</span>
            </a>
          </address>
        </div>
        <div className="flex flex-col gap-3">
          {ueberschrift(t('oeffnungszeiten'))}
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-16">
            {kontakt.oeffnungszeiten.map((z) => (
              <div key={z.zeiten + z.tage.de} className="contents">
                <dt className="text-gruen-100">{text(z.tage, sprache)}</dt>
                <dd className="font-bold">{oeffnungszeitText(z, sprache)}</dd>
              </div>
            ))}
            <dt className="border-t border-gruen-800 pt-2 text-gruen-100">{t('jetzt')}</dt>
            <dd className="border-t border-gruen-800 pt-2 font-bold">
              <JetztGeoeffnet
                zeitraeume={kontakt.oeffnungszeiten
                  .filter((z) => z.start && z.ende)
                  .map((z) => ({ tage: z.von, start: z.start, ende: z.ende }))}
                geoeffnet={t('geoeffnet')}
                geschlossen={t('geschlossen')}
              />
            </dd>
          </dl>
        </div>
        <nav aria-label={t('schnellzugriff')} className="flex flex-col gap-3">
          {ueberschrift(t('schnellzugriff'))}
          <ul className="flex flex-col">
            {schnell.map((s) => (
              <li key={s.label}>
                <Link
                  href={s.ziel}
                  className="inline-flex min-h-11 items-center text-16 text-weiss underline decoration-gruen-100 underline-offset-4 hover:text-weiss hover:decoration-2"
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-3">
          {ueberschrift(t('moscheeWebseite'))}
          <p className="text-16 text-gruen-100">{t('moscheeWebseiteText')}</p>
          <Link
            href="/webseite-fuer-moscheen"
            className="inline-flex min-h-12 items-center gap-2 self-start rounded-md bg-weiss px-5 font-bold text-gruen-950 no-underline transition-colors hover:bg-gruen-50 hover:text-gruen-950"
          >
            <Building2 aria-hidden className="size-5" />
            <span>{t('anfragen')}</span>
          </Link>
        </div>
      </div>
      <div className="border-t border-gruen-800">
        <div className="mx-auto flex max-w-(--container-inhalt) flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4 text-16 md:px-8">
          <p className="text-gruen-100">{t('rechte', { jahr })}</p>
          <ul aria-label={t('rechtliches')} className="flex flex-wrap gap-x-4 gap-y-1">
            <li>
              <Link
                href="/datenschutz"
                className="inline-flex min-h-11 items-center text-weiss underline underline-offset-4 hover:text-gruen-100"
              >
                {t('datenschutz')}
              </Link>
            </li>
            <li>
              <Link
                href="/impressum"
                className="inline-flex min-h-11 items-center text-weiss underline underline-offset-4 hover:text-gruen-100"
              >
                {t('impressum')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
