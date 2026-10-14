import { House, Search, User } from 'lucide-react';
import Image from 'next/image';
import NextLink from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { Link } from '@/i18n/link';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { entscheide } from '@/lib/funktionen';
import { KontoMenue } from './kopf/KontoMenue';
import { KopfMenues } from './kopf/KopfMenues';
import { MobilMenue } from './kopf/MobilMenue';
import { Sprachwahl, type SprachEintrag } from './kopf/Sprachwahl';
import { ladeKopfMenue } from '@/server/queries/menues';
import { baueMenues, menuesAusDb, sprachAdresse, type Bereich, type SprachZiel } from './navigation';

/**
 * Angemeldetes Konto für den Kopf der Konto-Seiten (Sichtabnahme X-1). Nur `KontoHuelle` (dynamische Konto-Seiten)
 * übergibt es; öffentliche Seiten rendern den Kopf ohne und bleiben statisch, ohne Sitzung (K-01).
 */
export type KopfKonto = {
  initiale: string;
  vorname: string;
  /**
   * Abmelden als Formular (Server Action, Zeilenform), gebaut von der Konto-Hülle: So hängt der Kopf öffentlicher Seiten
   * nie an der Aktion und ihren Abhängigkeiten (Auth, Datenbank).
   */
  abmelden: ReactNode;
};

/**
 * Kopfzeile nach design/Header.dc.html (02.1): Logo, Hauptnavigation mit Untermenüs (ab 1240 px),
 * Sprachumschalter, „Anmelden“, darunter Menü-Button mit Schublade.
 * Öffentlich ohne Anmeldezustand (K-01: keine Cookies auf öffentlichen Seiten).
 * „Anmelden“ führt zur Konto-Anmeldung (ADR 0026), solange die Funktion `konten` an ist – sonst wie bisher zur
 * Verwaltung (ADR 0016). Der Kopf ist statisch: Entschieden wird zur Bauzeit allein aus der Umgebung (ADR 0035).
 * Mit `konto` (nur Konto-Seiten) steht statt „Anmelden“ die Kontoschaltfläche mit „Mein Bereich“ und „Abmelden“ –
 * am Desktop als Aufklapp-Menü, im Telefonmenü als Kontokarte.
 */
export async function Header({
  aktiv,
  aktuell,
  sprachZiel,
  konto,
}: {
  aktiv: Bereich;
  aktuell: string;
  sprachZiel: SprachZiel;
  konto?: KopfKonto;
}) {
  const sprache = (await getLocale()) as Locale;
  const anmeldenHref = entscheide('konten', process.env, null) ? pfadFuer('/anmelden', sprache) : '/verwaltung/anmelden';
  const meinBereichHref = pfadFuer('/mein-bereich', sprache);
  const t = await getTranslations('kopf');
  const ts = await getTranslations('sprachwahl');
  const tsu = await getTranslations('suche');
  const bestand = baueMenues(
    (k) => t(k),
    (ziel) => pfadFuer(ziel, sprache),
    { hatim: entscheide('hatim', process.env, null), newsletter: entscheide('newsletter', process.env, null) },
  );
  // Menü aus der Verwaltung (ADR 0032), sonst der Bestand
  const ausDb = await ladeKopfMenue(sprache);
  const menues = ausDb ? menuesAusDb(ausDb, bestand) : bestand;
  const sprachen: SprachEintrag[] = (['de', 'tr', 'en'] as const).map((code) => ({
    code,
    kurz: code.toUpperCase(),
    name: ts(code),
    href: sprachAdresse(sprachZiel, code),
  }));
  return (
    <header className="relative z-(--ebene-kopf) border-b border-linie bg-weiss" style={{ viewTransitionName: 'kopf' }}>
      <div className="mx-auto flex h-18 max-w-(--container-inhalt) items-center gap-3 px-4 sm:gap-4 md:px-8 menu:h-20">
        <Link
          href="/"
          aria-label={t('logoLabel')}
          className="flex min-h-12 shrink-0 items-center gap-3 rounded-md py-1 pr-2 text-gruen-800 no-underline hover:text-gruen-800"
        >
          <Image src="/bilder/logos/logo-igmg-wetzlar.png" alt="" width={40} height={40} className="size-10" priority />
          <span className="font-display text-20 leading-none font-semibold whitespace-nowrap">IGMG Wetzlar</span>
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
          {/* Suche (ADR 0013): Link zur Suchseite, kein Client-JS; Design ohne Suchfeld → A-C01c. Unter 640 px im
              Telefonmenü – Logo, Suche und Menüknopf passen nicht in 358 px (Tor B/C R-BC-D1, Frage 2) */}
          <Link
            href="/suche"
            prefetch={false}
            className="hidden size-12 items-center justify-center rounded-md text-gruen-800 transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-800 active:scale-98 motion-reduce:active:scale-100 sm:inline-flex"
          >
            <Search aria-hidden className="size-6" />
            <span className="sr-only">{tsu('kopfLink')}</span>
          </Link>
          <div className="hidden menu:block">
            <Sprachwahl
              aktuell={sprache}
              sprachen={sprachen}
              texte={{ aendern: ts('aendern'), titel: ts('titel'), titelZweit: ts('titelZweit'), weitere: ts('weitere') }}
            />
          </div>
          {konto ? (
            <div className="hidden menu:block">
              <KontoMenue initiale={konto.initiale} vorname={konto.vorname} label={t('kontoMenue')}>
                <div className="flex items-center gap-3 border-b border-linie px-3 pt-2 pb-3">
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-gruen-700 font-display text-20 leading-none text-weiss"
                  >
                    {konto.initiale}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-16 text-tinte-2">{t('angemeldetAls')}</span>
                    <span className="truncate text-18 font-bold text-tinte">{konto.vorname}</span>
                  </span>
                </div>
                <ul className="flex flex-col gap-1 pt-2">
                  <li>
                    <NextLink
                      href={meinBereichHref}
                      prefetch={false}
                      className="flex min-h-12 items-center gap-3 rounded-md px-3 text-18 font-bold text-tinte no-underline transition duration-(--dauer-rueckmeldung) hover:bg-sand hover:text-tinte"
                    >
                      <House aria-hidden className="size-5 shrink-0" />
                      {t('meinBereich')}
                    </NextLink>
                  </li>
                  <li>{konto.abmelden}</li>
                </ul>
              </KontoMenue>
            </div>
          ) : (
            <NextLink
              href={anmeldenHref}
              prefetch={false}
              className="hidden min-h-12 items-center gap-2 rounded-md border border-gruen-700 bg-weiss px-4 text-18 font-bold whitespace-nowrap text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-800 active:scale-98 motion-reduce:active:scale-100 menu:inline-flex"
            >
              <User aria-hidden className="size-5" />
              <span>{t('anmelden')}</span>
            </NextLink>
          )}
          <MobilMenue
            menues={menues}
            startHref={pfadFuer('/', sprache)}
            gebetszeitenHref={pfadFuer('/gebetszeiten', sprache)}
            sucheHref={pfadFuer('/suche', sprache)}
            anmeldenHref={anmeldenHref}
            konto={
              konto
                ? {
                    initiale: konto.initiale,
                    vorname: konto.vorname,
                    meinBereichHref,
                    angemeldetAls: t('angemeldetAls'),
                    meinBereich: t('meinBereich'),
                    abmelden: konto.abmelden,
                  }
                : undefined
            }
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
              suche: tsu('kopfLink'),
              anmelden: t('anmelden'),
              aktuelleSeite: t('aktuelleSeite'),
            }}
          />
        </div>
      </div>
    </header>
  );
}
