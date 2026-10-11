import { User } from 'lucide-react';
import Image from 'next/image';
import NextLink from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { KopfMenues } from './kopf/KopfMenues';
import { MobilMenue } from './kopf/MobilMenue';
import { Sprachwahl, type SprachEintrag } from './kopf/Sprachwahl';
import { baueMenues, type Bereich, type Ziel } from './navigation';

/**
 * Kopfzeile nach design/Header.dc.html (02.1): Logo, Hauptnavigation mit Untermenüs (ab 1240 px),
 * Sprachumschalter, „Anmelden“ (→ Verwaltung, ADR 0016), darunter Menü-Button mit Schublade.
 * Öffentlich ohne Anmeldezustand (K-01: keine Cookies auf öffentlichen Seiten).
 */
export async function Header({ aktiv, aktuell, sprachZiel }: { aktiv: Bereich; aktuell: string; sprachZiel: Ziel }) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('kopf');
  const ts = await getTranslations('sprachwahl');
  const menues = baueMenues(
    (k) => t(k),
    (ziel) => pfadFuer(ziel, sprache),
  );
  const sprachen: SprachEintrag[] = (['de', 'tr', 'en'] as const).map((code) => ({
    code,
    kurz: code.toUpperCase(),
    name: ts(code),
    href: pfadFuer(sprachZiel, code),
  }));
  return (
    <header className="relative z-50 border-b border-linie bg-weiss">
      <div className="mx-auto flex h-[72px] max-w-(--container-inhalt) items-center gap-4 px-4 md:px-8 menu:h-20">
        <Link
          href="/"
          aria-label={t('logoLabel')}
          className="flex min-h-12 shrink-0 items-center gap-3 rounded-md py-1 pr-2 text-gruen-800 no-underline hover:text-gruen-800"
        >
          <Image src="/bilder/logos/logo-igmg-wetzlar.png" alt="" width={40} height={40} className="size-10" priority />
          <span className="font-display text-[22px] leading-none font-semibold whitespace-nowrap">IGMG Wetzlar</span>
        </Link>
        <KopfMenues
          menues={menues}
          startHref={pfadFuer('/', sprache)}
          startseite={t('startseite')}
          aktiv={aktiv}
          aktuell={aktuell}
          label={t('hauptnavigation')}
          aktuelleSeiteText={t('aktuelleSeite')}
        />
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="hidden menu:block">
            <Sprachwahl
              aktuell={sprache}
              sprachen={sprachen}
              texte={{ aendern: ts('aendern'), titel: ts('titel'), titelZweit: ts('titelZweit'), weitere: ts('weitere') }}
            />
          </div>
          <NextLink
            href="/verwaltung/anmelden"
            prefetch={false}
            className="hidden min-h-12 items-center gap-2 rounded-md border border-gruen-700 bg-weiss px-4 text-18 font-bold whitespace-nowrap text-gruen-800 no-underline transition-colors hover:bg-gruen-50 hover:text-gruen-800 menu:inline-flex"
          >
            <User aria-hidden className="size-5" />
            <span>{t('anmelden')}</span>
          </NextLink>
          <MobilMenue
            menues={menues}
            startHref={pfadFuer('/', sprache)}
            gebetszeitenHref={pfadFuer('/gebetszeiten', sprache)}
            aktiv={aktiv}
            aktuell={aktuell}
            sprache={sprache}
            sprachen={sprachen}
            texte={{
              menue: t('menue'),
              menueOeffnen: t('menueOeffnen'),
              menueSchliessen: t('menueSchliessen'),
              navigation: t('navigation'),
              entdecken: t('entdecken'),
              spracheGruppe: t('spracheGruppe'),
              mobilNavigation: t('mobilNavigation'),
              startseite: t('startseite'),
              gebetszeiten: t('gebetszeiten'),
              anmelden: t('anmelden'),
              aktuelleSeite: t('aktuelleSeite'),
            }}
          />
        </div>
      </div>
    </header>
  );
}
